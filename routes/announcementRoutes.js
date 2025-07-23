const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { verifyToken, requireRole } = require('../middleware/auth'); // ✅ import both

// Only admins and teachers can post
router.post('/', verifyToken, requireRole(['admin', 'teacher']), createAnnouncement);

// Anyone logged in can view (or make public if needed)
router.get('/', verifyToken, getAnnouncements);

module.exports = router;
