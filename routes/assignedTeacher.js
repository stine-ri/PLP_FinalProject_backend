// routes/teacher.js
const express = require('express');
const router = express.Router();
const { getAssignedTeacher, updateAssignedTeacher } = require('../controllers/assignedTeacher');
const auth = require('../middleware/auth');

router.get('/', getAssignedTeacher);
router.put('/', auth, updateAssignedTeacher);

module.exports = router;