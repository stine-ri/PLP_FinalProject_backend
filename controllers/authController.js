const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, studentId } = req.body; // ✅ include these!
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      studentId,
    });

    const token = jwt.sign(
  {
    _id: user._id.toString(), // Standardized to _id
    id: user._id.toString(),  // Also include id for compatibility
    email: user.email,
    role: user.role,
    studentId: user.studentId
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.status(201).json({ message: "User registered", user, token, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
  {
    _id: user._id.toString(), // Standardized
    id: user._id.toString(),  // Compatibility
    email: user.email,
    role: user.role,
    studentId: user.studentId
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({ token, role: user.role, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};