const express = require('express');
const router = express.Router();
const { 
  assignHomework, 
  getHomework,
  updateHomework,
  deleteHomework
} = require('../controllers/homeworkController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, assignHomework);
router.get('/', verifyToken, getHomework); // No classId
router.get('/:classId', verifyToken, getHomework); // With classId
router.put('/:id', verifyToken, updateHomework);
router.delete('/:id', verifyToken, deleteHomework);

module.exports = router;