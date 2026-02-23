// server/middleware/monitorForms.js
import { blockIP } from "../tempBlock.js";

/**
 * Middleware to monitor suspicious POST submissions.
 * Flags empty or potentially malicious payloads.
 */
export function monitorForms(req, res, next) {
  try {
    // Only POST requests are monitored
    if (req.method !== "POST") return next();

    const body = req.body;

    // Skip if body is missing or not an object
    if (!body || typeof body !== "object") return next();

    const values = Object.values(body);

    // Skip if body has no values
    if (!values.length) return next();

    // Detect empty submission (all fields empty or arrays empty)
    const emptySubmission = values.every((val) => {
      if (val === null || val === undefined) return true;
      if (typeof val === "string") return val.trim() === "";
      if (Array.isArray(val)) return val.length === 0;
      if (typeof val === "object") return Object.keys(val).length === 0;
      return false;
    });

    // Detect suspicious payload (non-standard characters in strings)
    const randomPayload = values.some((val) => {
      if (typeof val !== "string") return false;

      const lower = val.toLowerCase();

      return (
        lower.includes("<script") ||
        lower.includes("</script>") ||
        lower.includes("drop table") ||
        lower.includes("select *") ||
        lower.includes("--") ||
        lower.includes("insert into")
      );
    });

    // if (emptySubmission || randomPayload) {
    if (emptySubmission) {
      console.log(`⚠️ Empty submission from IP: ${req.ip}`, body);

      return res.status(400).json({
        success: false,
        message: "Invalid form submission.",
      });
    }

    next(); // all good, continue
  } catch (error) {
    console.error("⚠️ monitorForms Error:", error);
    next(); // never crash server
  }
}
