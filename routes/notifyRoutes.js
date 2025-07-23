const express = require('express');
const router = express.Router();
const notifyController = require('../controllers/notifyController');
const { verifyToken } = require('../middleware/auth');


// Correct usage: specify the actual method (not the whole object)
router.post('/send', verifyToken, notifyController.notifyAdmin);
router.get('/', verifyToken, notifyController.getNotifications);
router.patch('/:id/read', verifyToken, notifyController.markAsRead);

module.exports = router;
