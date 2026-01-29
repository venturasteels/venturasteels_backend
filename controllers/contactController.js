import Enquiry from "../models/ContactUs.js";
import { verifyRecaptcha } from "../utils/verifyRecaptcha.js"; 

export const submitContact = async (req, res) => {
  try {
    const { name, email, mobile, company, message, recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({ message: "reCAPTCHA token missing" });
    }

    // ✅ Verify token
    const recaptchaRes = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaRes.success) {
      return res.status(403).json({ message: "reCAPTCHA failed" });
    }

    if (recaptchaRes.score < 0.6) {
      return res.status(403).json({ message: "Low reCAPTCHA score, suspicious activity" });
    }

    if (recaptchaRes.action !== "contact_submit") {
      return res.status(403).json({ message: "Invalid reCAPTCHA action" });
    }

    // ✅ Save to MongoDB
    const enquiry = new Enquiry({ name, email, mobile, company, message });
    await enquiry.save();

    res.status(200).json({ message: "Contact form saved to MongoDB ✅" });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ message: "Failed to save to MongoDB ❌" });
  }
};
