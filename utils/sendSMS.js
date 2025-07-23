require("dotenv").config();
const africastalking = require("africastalking")({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});

const sms = africastalking.SMS;

exports.sendSMS = async (to, message) => {
  try {
    const result = await sms.send({
      to: [`+254${to}`], // Kenya numbers, e.g. 712345678
      message,
    });
    console.log("✅ SMS sent:", result);
    return result;
  } catch (error) {
    console.error("❌ SMS failed:", error);
    throw error;
  }
};