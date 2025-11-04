import CareerApplication from "../models/Career.js";
import cloudinary from "../config/cloudinaryConfig.js";
import * as emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";
dotenv.config();

// Submit Career Application Controller
export const submitCareerApplication = async (req, res) => {
  try {
    const { position, name, email, phone, message } = req.body;
    const resumeFile = req.file;

    // Basic validation
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

    // Upload Resume to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ventura_resumes", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(resumeFile.buffer);
    });

    const resumeUrl = uploadResult.secure_url;

    // Save to MongoDB
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resume: resumeUrl,
    });
    await newApplication.save();

    // Send email via EmailJS
    await emailjs.send(
      process.env.EMAILJS_CAREER_SERVICE_ID,
      process.env.EMAILJS_CAREER_TEMPLATE_ID,
      {
        name,
        email,
        phone,
        position,
        message,
        resume_link: resumeUrl,
        submittedAt: new Date().toLocaleString(),
      },
      { publicKey: process.env.EMAILJS_CAREER_PUBLIC_KEY }
    );

    // Success Response
    res.status(201).json({
      success: true,
      message: "✅ Application submitted successfully!",
      data: newApplication,
    });
  } catch (error) {
    console.error("❌ Error submitting career application:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting application.",
      error: error.message,
    });
  }
};
