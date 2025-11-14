import CareerApplication from "../models/Career.js";
import path from "path";
import fs from "fs";

export const submitCareerApplication = async (req, res) => {
  try {
    const { position, name, email, phone, message } = req.body;
    const resumeFile = req.file;

    // Validate required fields
    if (!position || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Position, name, email, and phone are required.",
      });
    }

    let savedResume = null;
    let resumeLink = null;

    if (resumeFile) {
      const uploadDir = path.join(process.cwd(), "uploads", "resumes");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueName = `${Date.now()}_${resumeFile.originalname}`;
      const filePath = path.join(uploadDir, uniqueName);

      fs.writeFileSync(filePath, resumeFile.buffer);

      savedResume = {
        fileName: resumeFile.originalname,
        filePath: `uploads/resumes/${uniqueName}`,
        contentType: resumeFile.mimetype,
      };

      const backendURL =
        process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;

      resumeLink = `${backendURL}/uploads/resumes/${uniqueName}`;
    }

    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resume: savedResume,
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Application saved successfully!",
      applicationId: newApplication._id,
      resumeLink,
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
