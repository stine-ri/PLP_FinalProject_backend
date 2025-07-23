const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { 
  addResult, 
  getResults,
  updateResult,
  deleteResult,
  bulkUploadResults
} = require('../controllers/resultController');
const { verifyToken } = require('../middleware/auth');

// Route setup
router.post('/', verifyToken, addResult);
router.post('/bulk', verifyToken, upload.single('file'), bulkUploadResults);

// FIXED: split the classId optional route into two clean ones
router.get('/', verifyToken, getResults); // No classId (query only)
router.get('/class/:classId', verifyToken, getResults); // Specific class

router.put('/:id', verifyToken, updateResult);
router.delete('/:id', verifyToken, deleteResult);

module.exports = router;
