const Submission = require("../models/Submission");
const Quiz = require("../models/Quiz");

exports.submitQuiz = async (req, res) => {
  const { quizId, answers } = req.body;

  const quiz = await Quiz.findById(quizId);
  let score = 0;
  const correct = quiz.questions.map((q) => q.correctAnswer);

  correct.forEach((ans, i) => {
    if (ans === answers[i]) score++;
  });

  const feedback =
    score === quiz.questions.length
      ? "Excellent! 🎉"
      : score >= quiz.questions.length / 2
      ? "Good job! Keep improving!"
      : "Needs improvement. Review the material.";

  const submission = await Submission.create({
    studentId: req.user.id,
    quizId,
    answers,
    score,
    feedback
  });

  res.status(201).json({ score, feedback, submission });
};

exports.getUserSubmissions = async (req, res) => {
  const subs = await Submission.find({ studentId: req.user.id }).populate("quizId");
  res.json(subs);
};





