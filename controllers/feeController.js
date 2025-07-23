const Fee = require('../models/Fee');
const User = require('../models/User');
const Child = require('../models/child');

exports.payFees = async (req, res) => {
  try {
    const { amount, studentId, paymentMethod, academicTerm } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!amount || !studentId || !paymentMethod || !academicTerm) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user is parent of the student or admin
    if (req.user.role === 'parent') {
      const isParent = await Child.findOne({ _id: studentId, parentId: userId });
      if (!isParent) {
        return res.status(403).json({ message: "You can only pay fees for your children" });
      }
    }

    // Generate mock transaction ID (replace with actual payment gateway integration)
    const transactionId = `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create fee record
    const feePayment = new Fee({
      studentId,
      amount,
      paymentMethod,
      transactionId,
      status: 'successful', // In real app, this would update after payment confirmation
      paidBy: userId,
      academicTerm
    });

    await feePayment.save();

    res.status(201).json({
      message: "Payment successful",
      payment: {
        id: feePayment._id,
        amount: feePayment.amount,
        method: feePayment.paymentMethod,
        transactionId: feePayment.transactionId,
        date: feePayment.paymentDate
      }
    });

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
};

exports.getFeeHistory = async (req, res) => {
  try {
    let query = {};

    // Role-based access
    if (req.user.role === 'parent') {
      const children = await Child.find({ parentId: req.user._id });
      query.studentId = { $in: children.map(c => c._id) };
    } else if (req.user.role === 'teacher') {
      return res.status(403).json({ message: "Teachers cannot access fee records" });
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Optional filters
    if (req.query.fromDate || req.query.toDate) {
      query.paymentDate = {};
      if (req.query.fromDate) query.paymentDate.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) query.paymentDate.$lte = new Date(req.query.toDate);
    }

    if (req.query.term) query.academicTerm = req.query.term;
    if (req.query.method) query.paymentMethod = req.query.method;
    if (req.query.status) query.status = req.query.status;

    const fees = await Fee.find(query)
      .populate('studentId', 'name')
      .populate('paidBy', 'name email')
      .sort({ paymentDate: -1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
