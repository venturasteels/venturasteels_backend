import CareerApplication from "../models/Career.js";
import cloudinary from "../config/cloudinaryConfig.js";
import dotenv from "dotenv";
dotenv.config();

export const submitCareerApplication = async (req, res) => {
  try {
    const { position, name, email, phone, message } = req.body;
    const resumeFile = req.file;

    // --- Basic Validation ---
    if (!position || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    // --- Validate File Type ---
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(resumeFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only PDF, DOC, DOCX are allowed.",
      });
    }

    // --- Upload to Cloudinary from buffer ---
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ventura_resumes",
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(resumeFile.buffer);
    });

    // --- Save application with resume object ---
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resume: {
        fileName: resumeFile.originalname,
        fileType: resumeFile.mimetype,
        fileUrl: uploadResult.secure_url,
        uploadedAt: new Date(),
      },
    });

    await newApplication.save();

    return res.status(201).json({
      success: true,
      message: "✅ Application submitted successfully!",
      data: newApplication,
    });
  } catch (error) {
    console.error("❌ Error submitting career application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit application. Please try again later.",
      error: error.message,
    });
  }
};
