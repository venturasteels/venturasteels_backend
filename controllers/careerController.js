import CareerApplication from "../models/Career.js";
import path from "path";
import fs from "fs";

export const submitCareerApplication = async (req, res) => {
  try {
    const { position, name, email, phone, message } = req.body;
    const resumeFile = req.file;

    if (!position || !name || !email || !phone || !resumeFile) {
      return res.status(400).json({
        success: false,
        message: "All required fields and resume must be provided.",
      });
    }

    // ✅ Store resume in uploads/resumes folder
    const uploadDir = "uploads/resumes";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}_${resumeFile.originalname}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, resumeFile.buffer);

    // ✅ Save MongoDB record
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resumePath: filePath,
    });

    await newApplication.save();

    // ✅ Generate accessible URL for resume
    const backendURL = process.env.BACKEND_URL || "http://localhost:5000";
    const resumeLink = `${backendURL}/uploads/resumes/${uniqueName}`;

    res.status(201).json({
      success: true,
      message: "Application saved successfully!",
      applicationId: newApplication._id,
      resumeLink, // 👈 frontend will use this
    });
  } catch (error) {
    console.error("❌ Error saving career application:", error);
    res.status(500).json({
      success: false,
      message: "Error saving career application.",
      error: error.message,
    });
  }
};
