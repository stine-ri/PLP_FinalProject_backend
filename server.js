const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Import routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const resultRoutes = require("./routes/resultRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notifyRoutes = require("./routes/notifyRoutes");
const childRoutes = require("./routes/childRoutes");
const feeRoutes = require("./routes/feeRoutes");
const performanceRoutes = require("./routes/Performance");
const quizRoutes = require("./routes/quizzes");
const submissionRoutes = require("./routes/submissions");
const testRoutes = require("./routes/test");
const parentRoutes = require("./routes/parents");
const chatRoutes = require("./routes/chatRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const teacherRoutes = require('./routes/teacherRoutes');
const userRoutes = require('./routes/userRoutes');
const chatSocket = require('./sockets/chatSocket');
// Test route
app.get("/", (req, res) => {
  res.send("🎓 MamaShule API is live!");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notifyRoutes);
app.use("/api/children", childRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/test", testRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/teacher", teacherRoutes);
app.use('/api/users', userRoutes);
// Initialize Socket.io with CORS support
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});


chatSocket(io);  


// Attach Socket.io to all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
