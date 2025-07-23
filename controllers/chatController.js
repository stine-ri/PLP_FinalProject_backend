const Message = require('../models/Message');
const Student = require('../models/Student');
const User = require('../models/User');
const Parent = require('../models/Parent');
const Teacher = require('../models/Teacher');
const mongoose = require('mongoose');
const { AppError } = require('../utils/errors');

exports.saveMessage = async (req, res) => {
  try {
    const { content, receiverId, studentId, attachments } = req.body;

    // Validate the parent-student relationship
    if (req.user.role === 'parent') {
      const isParent = await Student.exists({ 
        _id: studentId, 
        parentId: req.user._id 
      });
      if (!isParent) {
        return res.status(403).json({ error: 'You can only message about your own children' });
      }
    }

    // Validate the teacher-student relationship
    if (req.user.role === 'teacher') {
      const isTeacher = await Student.exists({ 
        _id: studentId, 
        teacherId: req.user._id 
      });
      if (!isTeacher) {
        return res.status(403).json({ error: 'You can only message about your own students' });
      }
    }

    const message = new Message({ 
      sender: req.user._id,
      receiver: receiverId,
      student: studentId,
      content,
      attachments: attachments || []
    });

    await message.save();
    
    // Populate sender details for real-time emission
    const populatedMessage = await Message.populate(message, [
      { path: 'sender', select: 'name role avatar' },
      { path: 'receiver', select: 'name role avatar' },
      { path: 'student', select: 'name classLevel' }
    ]);

    // Emit the message via Socket.io
    req.io.to(receiverId.toString()).emit('newMessage', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate student relationship
    let student;
    if (studentId) {
      student = await Student.findOne({ _id: studentId });
      
      if (req.user.role === 'parent' && !student.parentId.equals(req.user._id)) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
      
      if (req.user.role === 'teacher' && !student.teacherId.equals(req.user._id)) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ],
      ...(studentId && { student: studentId })
    })
    .populate('sender', 'name role avatar')
    .populate('receiver', 'name role avatar')
    .populate('student', 'name classLevel')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    // Get all unique users the current user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          studentId: { $first: '$student' },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiver', req.user._id] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $unwind: '$student'
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            role: '$user.role',
            avatar: '$user.avatar'
          },
          student: {
            _id: '$student._id',
            name: '$student.name',
            classLevel: '$student.classLevel'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.startConversation = async (req, res) => {
  console.log('Start conversation endpoint hit!');
  try {
    
    const { recipientId, content } = req.body;
    const senderId = req.user.id;
   
    if (!recipientId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Recipient and message content are required.'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(recipientId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);
    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    // ✅ Updated: Use User collection to check for teacher
   const teacher = await User.findOne({ 
      _id: recipientId, 
      role: 'teacher',
      isAvailable: true // Add this field to your User model
    }).lean();

    if (!teacher) {
      const availableTeachers = await User.find({ 
        role: 'teacher',
        isAvailable: true 
      }, '_id name email').lean();

      return res.status(423).json({ // 423 Locked might be more appropriate
        success: false,
        error: availableTeachers.length > 0 
          ? 'Selected teacher is not available' 
          : 'No teachers available',
        code: availableTeachers.length > 0 ? 'TEACHER_UNAVAILABLE' : 'NO_TEACHERS',
        suggestion: availableTeachers.length > 0
          ? 'Please select from available teachers'
          : 'Please contact administration',
        availableTeachers
      });
    }

    // ✅ Also updated to use User model for parent check
    const parent = await User.findOne({ _id: senderObjectId, role: 'parent' });
    if (!parent) {
      return res.status(403).json({
        success: false,
        error: 'Parent not found or unauthorized'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newMessage = new Message({
        sender: parent._id,
        receiver: teacher._id,
        content: content.trim(),
        status: 'sent'
      });

      await newMessage.save({ session });

      const populatedMessage = await Message.populate(newMessage, [
        { path: 'sender', select: 'name email avatar' },
        { path: 'receiver', select: 'name email avatar' }
      ]);

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: 'Conversation started successfully',
        data: populatedMessage
      });
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Please try again later'
    });
  }
};
