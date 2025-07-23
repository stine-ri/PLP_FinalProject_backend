const Performance = require("../models/Performance");
const Student = require("../models/Student");
const { sendSMS } = require("../utils/sendSMS");
const User = require("../models/User");

exports.addPerformance = async (req, res) => {
  try {
    const { studentId, subject, marks: studentMarks, comment } = req.body;

    const performance = await Performance.create({
      studentId,
      subject,
      marks: studentMarks,
      comment,
    });

    const student = await Student.findById(studentId).populate("parentId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const parentPhone = student.parentId?.phone || "700000000"; // no +254, sendSMS adds it

    const message = `New performance update: ${student.name} got ${studentMarks} in ${subject}.`;

    await sendSMS(parentPhone, message); // ✅ Await here

    res.status(201).json(performance);
  } catch (error) {
    console.error("❌ Error adding performance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await Performance.find({ studentId }).populate("studentId", "name");
    const formatted = data.map(p => ({
      studentName: p.studentId?.name || "Unknown",
      subject: p.subject,
      score: p.marks,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching performance:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.recordPerformance = async (req, res) => {
  try {
    const { studentId, subject, marks } = req.body;

    const student = await User.findById(studentId).populate("parent");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const phone = student.parent?.phone;

    if (phone) {
      const msg = `MamaShule Update: ${student.name} scored ${marks} in ${subject}. Keep supporting them! 📚`;
      await sendSMS(phone, msg);
    }

    res.status(201).json({ message: "Performance recorded & SMS sent." });
  } catch (error) {
    console.error("❌ Error recording performance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllPerformance = async (req, res) => {
  try {
    const all = await Performance.find().populate("studentId", "name");
    const formatted = all.map(p => ({
      studentName: p.studentId?.name || "Unknown",
      subject: p.subject,
      score: p.marks,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching all performance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

