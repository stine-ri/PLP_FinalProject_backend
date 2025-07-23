const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const { addPerformance, getStudentPerformance,getAllPerformance  } = require("../controllers/performanceController");

router.post("/", verifyToken, addPerformance);
router.get("/", verifyToken, getAllPerformance); 
router.get("/:studentId", verifyToken, getStudentPerformance);

module.exports = router;