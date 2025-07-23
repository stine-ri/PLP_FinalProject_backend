// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { 
  saveMessage, 
  getMessages,
  getConversations,
  startConversation // Make sure this matches your controller export
} = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

const teacherCheck = require('../middleware/teacherCheck');
// Debug middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`Chat route hit: ${req.method} ${req.path}`);
  next();
});

// Correct route definitions
router.post('/start', verifyToken, startConversation); // Note the corrected spelling
router.post('/', verifyToken, saveMessage);
router.get('/conversations', verifyToken, getConversations);
router.get('/:studentId?', verifyToken, getMessages);

module.exports = router;