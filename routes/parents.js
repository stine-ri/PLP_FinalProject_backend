const express = require("express");
const router = express.Router();
const { getParentDashboard, getResults, getAttendance } = require("../controllers/parentController");
const { verifyToken } = require("../middleware/auth");

// Use verifyToken instead of auth
router.get("/dashboard", verifyToken, getParentDashboard);
router.get("/results/:studentId", verifyToken, getResults);
router.get("/attendance/:studentId", verifyToken, getAttendance);

module.exports = router;
