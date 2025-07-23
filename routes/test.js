const express = require("express");
const { sendSMS } = require("../utils/sendSMS");
const router = express.Router();

router.post("/test-sms", async (req, res) => {
  const { phone, message } = req.body;

  try {
    const result = await sendSMS(phone, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "SMS failed", details: err });
  }
});

module.exports = router;