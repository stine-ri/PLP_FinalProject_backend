const express = require('express');
const router = express.Router();
const childController = require('../controllers/childController');
const { verifyToken } = require('../middleware/auth'); 

// This route handles all roles (parent, teacher, admin) inside the controller logic
router.get('/', verifyToken, childController.getChildren);

router.get('/my-children', verifyToken, (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ message: 'Parent access required' });
  }
  next();
}, childController.getChildren);

router.get('/:id', verifyToken, childController.getChildById);

module.exports = router;
