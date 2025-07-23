const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getAllAttendance,
  deleteAttendance,
  getStudentAttendanceHistory
} = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/auth');

// Student history route - placed FIRST to avoid conflicts
router.get('/student/history', verifyToken, getStudentAttendanceHistory);

// Other routes
router.post('/', verifyToken, markAttendance);
router.get('/all', verifyToken, getAllAttendance);
router.get('/class/:classId', verifyToken, getAttendance);
router.delete('/:id', verifyToken, deleteAttendance);

module.exports = router;