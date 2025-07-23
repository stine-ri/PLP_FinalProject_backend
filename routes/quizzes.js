const router = require("express").Router();
const { createQuiz, getAllQuizzes, getQuizById } = require("../controllers/quizController");
const { verifyToken } = require("../middleware/auth");

router.post("/", verifyToken, createQuiz);
router.get("/", getAllQuizzes);
router.get("/:id", getQuizById);

module.exports = router;