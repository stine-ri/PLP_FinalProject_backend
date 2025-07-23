const express = require("express");
const router = express.Router();
const { payFees, getFeeHistory } = require("../controllers/feeController");
const { verifyToken } = require("../middleware/auth");
router.post("/pay", verifyToken, payFees);
router.get("/history", verifyToken, getFeeHistory);

module.exports = router;