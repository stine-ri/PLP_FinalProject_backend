const Student = require("../models/Student"); const Teacher = require("../models/Teacher"); const Result = require("../models/Result"); const Attendance = require("../models/Attendance");

exports.getParentDashboard = async (req, res) => { try { const student = await Student.findOne({ parentId: req.user.id }).populate("teacherId"); res.json(student); } catch (err) { res.status(500).json({ error: err.message }); } };

exports.getResults = async (req, res) => { try { const results = await Result.find({ studentId: req.params.studentId }); res.json(results); } catch (err) { res.status(500).json({ error: err.message }); } };

exports.getAttendance = async (req, res) => { try { const attendance = await Attendance.find({ studentId: req.params.studentId }); res.json(attendance); } catch (err) { res.status(500).json({ error: err.message }); } };
