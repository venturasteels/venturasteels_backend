// server/middleware/monitorForms.js
import { blockIP } from "../tempBlock.js";

export function monitorForms(req, res, next) {
  if (req.method === "POST") {
    const body = req.body;

    // Detect empty submission
    const emptySubmission = Object.values(body).every(val => !val || val.trim() === "");
    // Detect random characters (suspicious payload)
    const randomPayload = Object.values(body).some(val => /[^\w\s@.]/.test(val));

    if (emptySubmission || randomPayload) {
      console.log(`❌ Suspicious submission from IP: ${req.ip}`, body);
      blockIP(req.ip); // temporarily block IP
      return res.status(429).json({
        success: false,
        message: "Suspicious submission detected. Try again later.",
      });
    }
  }
  next();
}
