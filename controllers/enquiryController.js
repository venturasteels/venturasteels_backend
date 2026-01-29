// controllers/enquiryController.js
import Enquiry from "../models/Enquiry.js";
import { verifyRecaptcha } from "../utils/verifyRecaptcha.js";

export const submitEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyname,
      userType,
      product,
      message,
      grades = [],
      captchaToken, // 🔑 Captcha token from frontend
    } = req.body;

    console.log("📩 Received Enquiry Data:", req.body);

    // 🚫 Check if captcha token exists
    if (!captchaToken) {
      return res.status(400).json({
        message: "Captcha token missing",
      });
    }

    // 🔐 Verify captcha with Google
    const captchaResult = await verifyRecaptcha(captchaToken);

    // 🚫 Failed or bot-like score
    if (
      !captchaResult.success ||
      captchaResult.score < 0.5 ||              // B2B threshold
      captchaResult.action !== "enquiry_submit" // Must match frontend action
    ) {
      return res.status(403).json({
        message: "Suspicious activity detected",
      });
    }

    // ✅ Format grades
    const formattedGrades = Array.isArray(grades)
      ? grades.map((grade) => ({
          gradeName: grade.gradeName,
          shape: grade.shape,
          diameter: grade.diameter || "",
          thickness: grade.thickness || "",
          width: grade.width || "",
          quantity: grade.quantity || "",
        }))
      : [];

    // ✅ Save enquiry to MongoDB
    const newEnquiry = new Enquiry({
      name,
      email,
      phone,
      companyname,
      userType,
      product,
      message,
      grades: formattedGrades,
    });

    await newEnquiry.save();

    res.status(200).json({ message: "✅ Enquiry submitted successfully!" });
  } catch (error) {
    console.error("❌ Backend Error while saving enquiry:", error);
    res.status(500).json({ message: "Failed to save enquiry ❌" });
  }
};
