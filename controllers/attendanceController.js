const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/class');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const attendance = new Attendance({ 
      ...req.body, 
      markedBy: req.user.id 
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error saving attendance' });
  }
};

// Get attendance (role-based)
exports.getAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    let query = {};

    // Parents only see their child's attendance
    if (req.user.role === 'parent') {
      const student = await Student.findOne({ parent: req.user.id });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      query.studentId = student._id;
    }

    // Teachers can only see attendance for their classes
    if (req.user.role === 'teacher') {
      const classTaught = await Class.findOne({ 
        _id: classId, 
        teacher: req.user.id 
      });
      if (!classTaught) {
        return res.status(403).json({ message: 'Unauthorized for this class' });
      }
      query.classId = classId;
    }

    // Admins can filter by classId or view all
    if (req.user.role === 'admin') {
      if (classId) {
        query.classId = classId;
      }
    }

    const data = await Attendance.find(query)
      .populate('studentId', 'name')
      .populate('classId', 'name')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

// Admin: get all attendance
exports.getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const data = await Attendance.find()
      .populate('studentId', 'name')
      .populate('classId', 'name')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all attendance' });
  }
};

// Delete attendance (admin only)
exports.deleteAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await Attendance.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting attendance' });
  }
};


// Get student attendance history
exports.getStudentAttendanceHistory = async (req, res) => {
  try {
    console.log('Fetching attendance history for:', req.user.id); // Debug log
    
    let query = {};
    
    // For students
    if (req.user.role === 'student') {
      query.studentId = req.user.studentId || req.user.id;
    }
    // For parents
    else if (req.user.role === 'parent') {
      const students = await Student.find({ parent: req.user.id });
      query.studentId = { $in: students.map(s => s._id) };
    }
    // For teachers/admins
    else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name')
      .populate('classId', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error('Error fetching attendance history:', err);
    res.status(500).json({ message: 'Server error' });
  }
};