const Child = require('../models/child');
const User = require('../models/User');
const mongoose = require('mongoose');
exports.getChildren = async (req, res) => {
  try {
    console.log('Incoming user:', req.user);
    
    if (!req.user || !req.user._id) {
      console.error('No user in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    let children;
    const parentId = req.user._id.toString(); // Standardized to use _id

    if (req.user.role === 'parent') {
      children = await Child.find({
        $or: [
          { parentId: new mongoose.Types.ObjectId(parentId) },
          { parentId: parentId } // String comparison
        ]
      });
    } 
    else if (req.user.role === 'teacher' || req.user.role === 'admin') {
      children = await Child.find().populate('parentId', 'name email');
    } 
    else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(children);
  } catch (error) {
    console.error('Error in getChildren:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Check access: parent can only see their own child
    if (req.user.role === 'parent' && !child.parentId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Teachers and admins can see all children
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};