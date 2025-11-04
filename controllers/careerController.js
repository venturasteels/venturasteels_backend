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

    // ✅ Ensure uploads folder exists
    const uploadDir = "uploads/resumes";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Generate unique name and save file
    const uniqueName = `${Date.now()}_${resumeFile.originalname}`;
    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, resumeFile.buffer);

    // ✅ Construct resume object as per schema
    const resumeData = {
      fileName: resumeFile.originalname,
      filePath: filePath,
      contentType: resumeFile.mimetype,
    };

    // ✅ Save record to MongoDB
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resume: resumeData,
    });

    await newApplication.save();

    // ✅ Return public URL (for email & frontend)
    const backendURL = process.env.BACKEND_URL || "http://localhost:5000";
    const resumeLink = `${backendURL}/uploads/resumes/${uniqueName}`;

    res.status(201).json({
      success: true,
      message: "Application saved successfully!",
      applicationId: newApplication._id,
      resumeLink, // 👈 frontend uses this in emailjs
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
