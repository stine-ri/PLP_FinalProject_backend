const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["parent", "teacher", "admin"], default: "parent" },
  phone: String, 
   studentId: {
    type: String,  // Changed from ObjectId to String
    required: function() { return this.role === 'parent'; }
  }
});

module.exports = mongoose.model("User", userSchema);