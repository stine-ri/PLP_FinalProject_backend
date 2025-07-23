const Result = require('../models/Result');
const Child = require('../models/child');
const Class = require('../models/class');

// Add new result (teacher/admin only)
exports.addResult = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers and admins can add results' });
    }

    const result = new Result({
      ...req.body,
      teacherId: req.user._id
    });

    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error saving result', error: err.message });
  }
};

// Get results with role-based access
exports.getResults = async (req, res) => {
  try {
    let query = {};
    let populateFields = [
      { path: 'studentId', select: 'name' },
      { path: 'teacherId', select: 'name' }
    ];

    if (req.user.role === 'parent') {
      // Parents can only see their children's results
      const children = await Child.find({ parentId: req.user._id });
      query.studentId = { $in: children.map(c => c._id) };
    } else if (req.user.role === 'teacher') {
      // Teachers can see results for their classes
      const classes = await Class.find({ teacherId: req.user._id });
      query.classId = { $in: classes.map(c => c._id) };
      query.teacherId = req.user._id;
    } 
    // Admins can see all results without filters

    if (req.params.classId) {
      query.classId = req.params.classId;
    }

    if (req.query.term) {
      query.term = req.query.term;
    }

    if (req.query.year) {
      query.year = req.query.year;
    }

    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    const results = await Result.find(query)
      .populate(populateFields)
      .sort({ year: -1, term: 1, subject: 1 });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching results', error: err.message });
  }
};

// Update result (teacher/admin only)
exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Only the original teacher or admin can update
    if (req.user.role !== 'admin' && !result.teacherId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only update your own results' });
    }

    const updatedResult = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('studentId', 'name');

    res.json(updatedResult);
  } catch (err) {
    res.status(500).json({ message: 'Error updating result', error: err.message });
  }
};

// Delete result (teacher/admin only)
exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Only the original teacher or admin can delete
    if (req.user.role !== 'admin' && !result.teacherId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own results' });
    }

    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting result', error: err.message });
  }
};
// controllers/resultController.js
const csv = require('csv-parser');
const stream = require('stream');

exports.bulkUploadResults = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers and admins can upload results' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const classId = req.body.classId;
    const results = [];
    const errors = [];

    // Verify teacher has access to this class
    if (req.user.role === 'teacher') {
      const classExists = await Class.findOne({ 
        _id: classId, 
        teacherId: req.user._id 
      });
      if (!classExists) {
        return res.status(403).json({ message: 'You can only upload results for your classes' });
      }
    }

    // Process CSV file
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on('data', (data) => {
          // Validate each row
          if (!data.studentId || !data.subject || !data.marks || !data.term || !data.year) {
            errors.push({ row: data, error: 'Missing required fields' });
            return;
          }

          const marks = parseInt(data.marks);
          if (isNaN(marks)) {
            errors.push({ row: data, error: 'Invalid marks format' });
            return;
          }

          results.push({
            studentId: data.studentId,
            classId,
            subject: data.subject,
            marks: marks,
            term: data.term,
            year: parseInt(data.year),
            teacherId: req.user._id
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert valid results
    if (results.length > 0) {
      await Result.insertMany(results);
    }

    res.json({
      message: 'Bulk upload completed',
      successCount: results.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error processing bulk upload',
      error: err.message 
    });
  }
};