import QuickEnquiry from "../models/QuickEnquiry.js";
import { verifyRecaptcha } from "../utils/verifyRecaptcha.js";

export const createQuickEnquiry = async (req, res) => {
  try {
    const { name, phone, email, company, message, recaptchaToken } = req.body;

    // 🔴 Basic validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and Phone are required",
      });
    }

    // 🔴 Check recaptcha token
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA token missing",
      });
    }

    // ✅ Verify recaptcha
    const recaptchaRes = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaRes.success) {
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA verification failed",
      });
    }

    // 🔒 Score check (bot protection)
    if (recaptchaRes.score < 0.6) {
      return res.status(403).json({
        success: false,
        message: "Suspicious activity detected (low score)",
      });
    }

    // 🎯 Action check (IMPORTANT)
    if (recaptchaRes.action !== "quick_enquiry") {
      return res.status(403).json({
        success: false,
        message: "Invalid reCAPTCHA action",
      });
    }

    // ✅ Save to MongoDB
    const enquiry = await QuickEnquiry.create({
      name,
      phone,
      email,
      company,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Quick Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    console.error("❌ Quick Enquiry Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
