// server/middleware/monitorForms.js
import { blockIP } from "../tempBlock.js";

export function monitorForms(req, res, next) {
  try {
    if (req.method !== "POST") {
      return next();
    }

    // If body missing, skip
    if (!req.body || typeof req.body !== "object") {
      return next();
    }

    const values = Object.values(req.body);

    if (!values.length) {
      return next();
    }

    // Detect empty submission safely
    const emptySubmission = values.every((val) => {
      if (val === null || val === undefined) return true;

      if (typeof val === "string") {
        return val.trim() === "";
      }

      if (Array.isArray(val)) {
        return val.length === 0;
      }

      return false;
    });

    // Detect suspicious payload safely
    const randomPayload = values.some((val) => {
      if (typeof val !== "string") return false;
      return /[^\w\s@.,-]/.test(val);
    });

    if (emptySubmission || randomPayload) {
      console.log(`❌ Suspicious submission from IP: ${req.ip}`, req.body);

      blockIP(req.ip);

      return res.status(429).json({
        success: false,
        message: "Suspicious submission detected. Try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("MonitorForms Error:", error);
    next(); // never crash server
  }
}
