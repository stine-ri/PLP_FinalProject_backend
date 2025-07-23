// middleware/teacherCheck.js
const Teacher = require('../models/Teacher');

module.exports = async (req, res, next) => {
  try {
    const teacherCount = await Teacher.countDocuments();
    
    if (teacherCount === 0) {
      return res.status(503).json({
        success: false,
        error: 'No teachers available',
        code: 'NO_TEACHERS',
        suggestion: 'Please contact administration'
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};