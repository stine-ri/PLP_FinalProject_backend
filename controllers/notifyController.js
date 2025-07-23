const Notification = require('../models/Notification');
const User = require('../models/User');

// Send notification to admin (teachers only)
exports.notifyAdmin = async (req, res) => {
  try {
    // Verify the user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can notify admins' });
    }

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    if (!admins.length) {
      return res.status(404).json({ message: 'No admin users found' });
    }

    const notification = new Notification({
      title: req.body.title || 'Teacher Notification',
      message: req.body.message,
      sender: req.user._id,
      recipients: admins.map(admin => ({
        userId: admin._id,
        role: 'admin'
      })),
      priority: req.body.priority || 'medium',
      category: req.body.category || 'general'
    });

    await notification.save();
    
    // In a real app, you would trigger email/websocket notifications here
    // await sendEmailNotifications(admins, notification);
    // await triggerWebsocketNotifications(admins, notification);

    res.status(201).json({
      message: 'Notification sent to admins successfully',
      notification
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error sending notification',
      error: err.message 
    });
  }
};

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      'recipients.userId': req.user._id
    })
    .populate('sender', 'name role')
    .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching notifications',
      error: err.message 
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        'recipients.userId': req.user._id
      },
      {
        $set: { 'recipients.$.isRead': true }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error updating notification',
      error: err.message 
    });
  }
};