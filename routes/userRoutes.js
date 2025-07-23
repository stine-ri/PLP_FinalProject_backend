// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getTeachers } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.get('/teachers', verifyToken, getTeachers);

module.exports = router;