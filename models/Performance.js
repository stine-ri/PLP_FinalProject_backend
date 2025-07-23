const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  subject: String,
  marks: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Performance", performanceSchema);