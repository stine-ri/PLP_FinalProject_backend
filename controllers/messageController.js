const Message = require('../models/Message');
const Parent = require('../models/Parent');
const Teacher = require('../models/Teacher');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

// POST /api/messages/
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id; // teacher ID from token

    // Validate input
    if (!receiverId || !message?.trim()) {
      return res.status(400).json({ error: 'Receiver ID and message content are required.' });
    }

    // Verify receiver exists and is a parent
    const receiver = await Parent.findById(receiverId);
    if (!receiver) {
      throw new NotFoundError('Parent not found');
    }

    // Verify sender exists and is a teacher
    const sender = await Teacher.findById(senderId);
    if (!sender) {
      throw new AuthorizationError('Unauthorized sender');
    }

    // Create and save message
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim(),
      status: 'sent'
    });

    await newMessage.save();

    // Populate sender/receiver details in response
    const populatedMessage = await Message.populate(newMessage, [
      { path: 'senderId', select: 'name email avatar' },
      { path: 'receiverId', select: 'name email avatar' }
    ]);

    // TODO: Emit real-time event via Socket.io here
    // req.io.to(receiverId).emit('newMessage', populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });

  } catch (error) {
    next(error);
  }
};

// GET /api/messages/:receiverId (messages between teacher and parent)
exports.getMessages = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const parentId = req.params.receiverId;

    // Verify parent exists
    const parent = await Parent.findById(parentId);
    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    // Get messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: teacherId, receiverId: parentId },
        { senderId: parentId, receiverId: teacherId },
      ],
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email avatar role')
    .populate('receiverId', 'name email avatar role');

    // Mark received messages as read
    await Message.updateMany(
      { receiverId: teacherId, status: { $ne: 'read' } },
      { $set: { status: 'read', readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    next(error);
  }
};

// GET /api/messages/conversations - List all conversations
exports.getConversations = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    // Get distinct parent conversations with last message
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: teacherId },
            { receiverId: teacherId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", teacherId] },
              "$receiverId",
              "$senderId"
            ]
          },
          parentId: { $first: "$_id.parentId" },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiverId", teacherId] },
                  { $ne: ["$status", "read"] }
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
          from: 'parents',
          localField: '_id',
          foreignField: '_id',
          as: 'parent'
        }
      },
      {
        $unwind: '$parent'
      },
      {
        $project: {
          parent: {
            _id: '$parent._id',
            name: '$parent.name',
            email: '$parent.email',
            avatar: '$parent.avatar'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });

  } catch (error) {
    next(error);
  }
};
// POST /api/chat/start - Start new conversation
exports.startConversation = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content?.trim()) {
      return res.status(400).json({ error: 'Recipient ID and message content are required.' });
    }

    // Verify recipient exists
    const recipient = await Parent.findById(recipientId);
    if (!recipient) {
      const { AppError } = require('../utils/AppError'); 
    }

    // Create and save message
    const newMessage = new Message({
      senderId,
      receiverId: recipientId,
      message: content.trim(),
      status: 'sent'
    });

    await newMessage.save();

    // Populate details
    const populatedMessage = await Message.populate(newMessage, [
      { path: 'senderId', select: 'name email avatar' },
      { path: 'receiverId', select: 'name email avatar' }
    ]);

    res.status(201).json(populatedMessage);
    
  } catch (error) {
    next(error);
  }
};