const Quiz = require("../models/Quiz");

exports.createQuiz = async (req, res) => {
  const { subject, grade, questions } = req.body;
  const quiz = await Quiz.create({
    subject,
    grade,
    questions,
    createdBy: req.user.id
  });
  res.status(201).json(quiz);
};

exports.getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.find();
  res.json(quizzes);
};

exports.getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  res.json(quiz);
};