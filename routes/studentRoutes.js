const router = require("express").Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const Student = require("../models/Student");
const upload = multer({ storage: multer.memoryStorage() });
const { 
  addStudent, 
  getStudentsByTeacher, 
  getStudentsByParent,
  getAllStudents,
  bulkImportStudents,
  getStudentById
} = require("../controllers/studentcontroller");
const { verifyToken } = require("../middleware/auth");

// Rate limiting configuration
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});

// ==================== PROTECTED ROUTES ====================
// All these routes require authentication via verifyToken middleware

// Add a new student
router.post("/", verifyToken, addStudent);

// Bulk import students
router.post("/import", verifyToken, upload.single('file'), bulkImportStudents);

// Get students by teacher
router.get("/teacher", verifyToken, getStudentsByTeacher);

// Get students by parent
router.get("/parent", verifyToken, getStudentsByParent);

// Get all students (protected version)
router.get("/protected", verifyToken, getAllStudents);

// Get specific student by ID
router.get('/:studentId', verifyToken, getStudentById);

// ==================== PUBLIC ROUTES ====================
// These routes don't require authentication

// Get public student list for dropdowns (rate limited)
router.get("/public/list", publicLimiter, async (req, res) => {
  try {
    // Only return active students with name and ID
    const students = await Student.find({}, 'name _id').sort({ name: 1 }); // Sort alphabetically by name
    
    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    console.error("Public student list error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch student list"
    });
  }
});



module.exports = router;