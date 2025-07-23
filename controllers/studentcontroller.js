const Student = require("../models/Student");
const User = require('../models/User'); 

exports.addStudent = async (req, res) => {
  try {
    // Verify the user is a teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers and admins can add students' });
    }

    const { name, classLevel, parentId } = req.body;
    
    // Validate inputs
    if (!name || !classLevel || !parentId) {
      return res.status(400).json({ error: 'Name, class level, and parent ID are required' });
    }

    const student = await Student.create({
      name,
      classLevel,
      parentId,
      teacherId: req.user.role === 'teacher' ? req.user.id : req.body.teacherId || req.user.id
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getStudentsByTeacher = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can access this resource' });
    }

    const students = await Student.find({ teacherId: req.user.id })
      .populate("parentId", "name email phone")
      .populate("teacherId", "name email")
      .sort({ classLevel: 1, name: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const mongoose = require('mongoose');

exports.getStudentsByParent = async (req, res) => {
  try {
    console.log('=== DEBUG START ===');
    console.log('Request received from parent ID:', req.user.id);
    console.log('JWT Payload:', req.user);
    console.log('Parent ID type:', typeof req.user.id);
    console.log('Parent ID length:', req.user.id?.length);
    
    // Check if the parent ID is a valid ObjectId format
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.user.id);
    console.log('Is valid ObjectId format:', isValidObjectId);
    
    if (!isValidObjectId) {
      console.log('Invalid ObjectId format!');
      return res.status(400).json({ error: 'Invalid parent ID format' });
    }
    
    // Check if parent user exists
    console.log('--- Checking if parent user exists ---');
    const parentUser = await mongoose.model('User').findById(req.user.id);
    console.log('Parent user exists:', !!parentUser);
    if (parentUser) {
      console.log('Parent user details:', {
        _id: parentUser._id,
        email: parentUser.email,
        role: parentUser.role
      });
    } else {
      console.log('ERROR: Parent user not found in database!');
      return res.status(404).json({ error: 'Parent user not found' });
    }
    
    // Check what students exist in the database (first 10)
    console.log('--- Checking existing students ---');
    const allStudents = await Student.find({}).limit(10).lean();
    console.log(`Total students in database sample: ${allStudents.length}`);
    
    if (allStudents.length === 0) {
      console.log('No students found in database at all!');
      return res.json([]);
    }
    
    allStudents.forEach((student, index) => {
      console.log(`Student ${index + 1}:`, {
        _id: student._id,
        name: student.name,
        classLevel: student.classLevel,
        parentId: student.parentId,
        parentIdType: typeof student.parentId,
        parentIdString: student.parentId?.toString(),
        teacherId: student.teacherId,
        matchesRequestId: student.parentId?.toString() === req.user.id
      });
    });
    
    // Check total count of students
    const totalStudentCount = await Student.countDocuments({});
    console.log('Total students in database:', totalStudentCount);
    
    // Try different query variations
    console.log('--- Trying different queries ---');
    
    const parentIdAsObjectId = new mongoose.Types.ObjectId(req.user.id);
    const parentIdAsString = req.user.id;
    
    // Query 1: parentId as ObjectId
    console.log('Query 1 - parentId as ObjectId:', { parentId: parentIdAsObjectId });
    const students1 = await Student.find({ parentId: parentIdAsObjectId }).lean();
    console.log('Query 1 results:', students1.length);
    
    // Query 2: parentId as String (in case data is corrupted)
    console.log('Query 2 - parentId as String:', { parentId: parentIdAsString });
    const students2 = await Student.find({ parentId: parentIdAsString }).lean();
    console.log('Query 2 results:', students2.length);
    
    // Query 3: Check if parentId field exists at all
    console.log('Query 3 - Students with parentId field');
    const studentsWithParentId = await Student.find({ parentId: { $exists: true } }).limit(5).lean();
    console.log('Students with parentId field:', studentsWithParentId.length);
    
    // Query 4: Find any students that might have this ID in any field
    console.log('Query 4 - Searching for ID in any field');
    const anyMatch = await Student.find({
      $or: [
        { parentId: parentIdAsObjectId },
        { teacherId: parentIdAsObjectId },
        { _id: parentIdAsObjectId }
      ]
    }).lean();
    console.log('Any field match:', anyMatch.length);
    if (anyMatch.length > 0) {
      console.log('Matches found:', anyMatch.map(s => ({
        _id: s._id,
        name: s.name,
        parentId: s.parentId?.toString(),
        teacherId: s.teacherId?.toString()
      })));
    }
    
    // Use the successful query
    let finalStudents = students1.length > 0 ? students1 : students2;
    
    if (finalStudents.length > 0) {
      console.log('--- Found students, populating teacher data ---');
      finalStudents = await Student.find({ 
        parentId: finalStudents[0].parentId 
      })
      .populate('teacherId', 'name email')
      .lean();
      
      console.log('Final students with teacher data:', finalStudents.map(s => ({
        _id: s._id,
        name: s.name,
        parentId: s.parentId?.toString(),
        teacher: s.teacherId
      })));
    } else {
      console.log('No students found for this parent ID');
      
      // Let's check if there are students with similar IDs (typos, etc.)
      console.log('--- Checking for similar parent IDs ---');
      const similarStudents = await Student.aggregate([
        {
          $addFields: {
            parentIdStr: { $toString: "$parentId" }
          }
        },
        {
          $match: {
            parentIdStr: { $regex: req.user.id.substring(0, 10), $options: 'i' }
          }
        },
        { $limit: 5 }
      ]);
      
      console.log('Students with similar parent IDs:', similarStudents.map(s => ({
        _id: s._id,
        name: s.name,
        parentIdStr: s.parentIdStr
      })));
    }
    
    console.log('=== DEBUG END ===');
    
    res.json(finalStudents);
  } catch (err) {
    console.error('Full error stack:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : undefined
    });
  }
};

// New endpoint for admins to get all students
exports.getAllStudents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access this resource' });
    }

    const students = await Student.find()
      .populate("teacherId", "name email")
      .populate("parentId", "name email")
      .sort({ classLevel: 1, name: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const csv = require('csv-parser');
const stream = require('stream');

exports.bulkImportStudents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can perform bulk imports' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const students = [];
    const errors = [];
    let processedCount = 0;

    // Process CSV file
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Validate required fields
            if (!row.name || !row.classLevel || !row.parentEmail) {
              errors.push({ row, error: 'Missing required fields' });
              return;
            }

            students.push({
              name: row.name,
              classLevel: row.classLevel,
              parentEmail: row.parentEmail,
              teacherId: row.teacherId || req.user.id
            });

            processedCount++;
          } catch (err) {
            errors.push({ row, error: err.message });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Find or create parents and create students
    const createdStudents = [];
    for (const student of students) {
      try {
        // In a real app, you would find or create the parent first
        // const parent = await findOrCreateParent(student.parentEmail);
        
        const newStudent = await Student.create({
          name: student.name,
          classLevel: student.classLevel,
          parentId: 'temp-parent-id', // Replace with actual parent ID
          teacherId: student.teacherId
        });

        createdStudents.push(newStudent);
      } catch (err) {
        errors.push({ student, error: err.message });
      }
    }

    res.json({
      message: 'Bulk import completed',
      importedCount: createdStudents.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Error processing bulk import',
      details: err.message 
    });
  }
};
exports.getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Adjust this if you're using a custom `studentId` field.
    const student = await Student.findById(studentId)
      .populate("parentId", "name email")
      .populate("teacherId", "name email");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
