const router = require("express").Router();
const { submitQuiz, getUserSubmissions } = require("../controllers/submissionController");
const { verifyToken } = require("../middleware/auth");

router.post("/", verifyToken, submitQuiz);
router.get("/", verifyToken, getUserSubmissions);

module.exports = router;