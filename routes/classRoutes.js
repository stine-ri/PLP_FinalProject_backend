const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyToken } = require('../middleware/auth'); // ✅ correct import

// Use verifyToken as middleware
router.get('/', verifyToken, classController.getClasses);
router.put('/:id', verifyToken, classController.updateClass);
router.delete('/:id', verifyToken, classController.deleteClass);

module.exports = router;
