const Class = require('../models/class');
const User = require('../models/User');
const Child = require('../models/child');

// Get classes based on role
exports.getClasses = async (req, res) => {
  try {
    let classes;

    if (req.user.role === 'admin') {
      // Admin can view all classes
      classes = await Class.find().populate('teacherId', 'name email');
    } else if (req.user.role === 'teacher') {
      // Teacher can view their own classes and enrolled students
      classes = await Class.find({ teacherId: req.user._id })
        .populate('students', 'name age')
        .populate('teacherId', 'name email');
    } else if (req.user.role === 'parent') {
      // Parent views classes of their children
      const children = await Child.find({ parentId: req.user._id }).select('_id');
      const childIds = children.map(child => child._id);

      classes = await Class.find({ students: { $in: childIds } })
        .populate('teacherId', 'name email')
        .populate('students', 'name age');
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update class (teacher for their own classes, or admin)
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingClass = await Class.findById(id);
    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Only admin or assigned teacher can update
    if (
      req.user.role === 'teacher' &&
      !existingClass.teacherId.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'You can only update your own classes' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedClass = await Class.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Delete class (admin only)
exports.deleteClass = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete classes' });
    }

    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
