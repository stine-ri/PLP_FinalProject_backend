const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    results: [
      {
        term: String,
        subject: String,
        score: Number,
      },
    ],
    attendance: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["Present", "Absent", "Late"],
        },
      },
    ],
    feeStatus: {
      paid: {
        type: Boolean,
        default: false,
      },
      amountDue: {
        type: Number,
        default: 0,
      },
      paymentHistory: [
        {
          amount: Number,
          method: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    announcements: [
      {
        title: String,
        message: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);