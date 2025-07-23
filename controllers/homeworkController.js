const Homework = require('../models/Homework');
const Class = require('../models/class');
const Child = require('../models/child');
const Student = require('../models/Student');

// Assign homework (teacher/admin only)
exports.assignHomework = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers and admins can assign homework' });
    }

    // Verify the teacher is assigned to the class
    if (req.user.role === 'teacher') {
      const classExists = await Class.findOne({ 
        _id: req.body.classId, 
        teacherId: req.user._id 
      });
      if (!classExists) {
        return res.status(403).json({ message: 'You can only assign homework to your classes' });
      }
    }

    const homework = new Homework({
      ...req.body,
      teacherId: req.user._id
    });

    await homework.save();
    res.status(201).json(homework);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error saving homework',
      error: err.message 
    });
  }
};

// Get homework with role-based access
exports.getHomework = async (req, res) => {
  try {
    let query = {};
    let populateFields = [
      { path: 'classId', select: 'name' },
      { path: 'teacherId', select: 'name' }
    ];

    if (req.user.role === 'teacher') {
      // Teachers can see homework for their classes
      const classes = await Class.find({ teacherId: req.user._id });
      query.classId = { $in: classes.map(c => c._id) };
    } else if (req.user.role === 'parent') {
      // Parents can see homework for their children's classes
      const children = await Child.find({ parentId: req.user._id });
      const classes = await Class.find({ 
        students: { $in: children.map(c => c._id) } 
      });
      query.classId = { $in: classes.map(c => c._id) };
    } else if (req.user.role === 'student') {
      // Students can see homework for their classes
      const student = await Student.findById(req.user._id);
      query.classId = { $in: student.classes };
    }

    if (req.params.classId) {
      query.classId = req.params.classId;
    }

    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    if (req.query.upcoming) {
      query.dueDate = { $gte: new Date() };
    }

    const homework = await Homework.find(query)
      .populate(populateFields)
      .sort({ dueDate: 1 });

    res.status(200).json(homework);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching homework',
      error: err.message 
    });
  }
};

// Update homework (teacher/admin only)
exports.updateHomework = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    // Only the original teacher or admin can update
    if (req.user.role !== 'admin' && !homework.teacherId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only update your own homework' });
    }

    const updatedHomework = await Homework.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('classId', 'name');

    res.json(updatedHomework);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error updating homework',
      error: err.message 
    });
  }
};

// Delete homework (teacher/admin only)
exports.deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    // Only the original teacher or admin can delete
    if (req.user.role !== 'admin' && !homework.teacherId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own homework' });
    }

    await Homework.findByIdAndDelete(req.params.id);
    res.json({ message: 'Homework deleted successfully' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error deleting homework',
      error: err.message 
    });
  }
};