// controllers/teacherController.js
const Teacher = require('../models/AssignedTeacher');

// Get assigned teacher
exports.getAssignedTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({});
    res.json(teacher || { name: 'No teacher assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update assigned teacher (admin/teacher only)
exports.updateAssignedTeacher = async (req, res) => {
  try {
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name } = req.body;
    let teacher = await Teacher.findOne({});
    
    if (!teacher) {
      teacher = new Teacher({ name });
    } else {
      teacher.name = name;
    }

    await teacher.save();
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};