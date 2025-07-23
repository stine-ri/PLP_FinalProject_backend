// controllers/announcementController.js
const Announcement = require('../models/Announcement');

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    // Verify user role
    const user = await User.findById(req.user.id);
    if (!['teacher', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized to create announcements' });
    }

    const { title, content, priority } = req.body;
    const announcement = new Announcement({
      title,
      content,
      priority,
      author: req.user.id
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Get all announcements (accessible to parents, teachers, admin)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('author', 'fullName role');
    res.status(200).json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
