import CareerApplication from "../models/Career.js";
import cloudinary from "../config/cloudinaryConfig.js";
import * as emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";
dotenv.config();

/**
 * Submit Career Application Controller
 * Handles resume upload (Cloudinary) + MongoDB save + EmailJS notification
 */
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

    // --- Allowed file types ---
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(resumeFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only PDF, DOC, and DOCX are allowed.",
      });
    }

    // --- Upload Resume to Cloudinary ---
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

    const resumeUrl = uploadResult.secure_url;

    // --- Save Application to MongoDB ---
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resumeUrl, // ✅ Correct field name in schema
    });

    await newApplication.save();

    // --- Send Notification via EmailJS ---
    await emailjs.send(
      process.env.EMAILJS_CAREER_SERVICE_ID,
      process.env.EMAILJS_CAREER_TEMPLATE_ID,
      {
        name,
        email,
        phone,
        position,
        message: message || "No additional message provided.",
        resume_link: resumeUrl,
        submittedAt: new Date().toLocaleString("en-IN"),
      },
      {
        publicKey: process.env.EMAILJS_CAREER_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_CAREER_PRIVATE_KEY, // optional
      }
    );

    // --- Success Response ---
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
