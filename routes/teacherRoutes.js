const express = require('express');
const {
  registerTeacher,
  loginTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
} = require('../controllers/teacherController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public
router.post('/register', registerTeacher);
router.post('/login', loginTeacher);

// Protected
router.get('/', verifyToken, getAllTeachers);
router.get('/:id', verifyToken, getTeacherById);
router.put('/:id', verifyToken, updateTeacher);
router.delete('/:id', verifyToken, deleteTeacher);

module.exports = router;
