import CareerApplication from "../models/Career.js";
import { verifyRecaptcha } from "../utils/verifyRecaptcha.js";
import { uploadBufferToCloudinary } from "../utils/uploadedToCloudinary.js";

export const submitCareerApplication = async (req, res) => {
  try {
    const { position, name, email, phone, message, recaptchaToken } = req.body;
    const resumeFile = req.file;

    /* ===============================
       1️⃣ Verify reCAPTCHA v3
    =============================== */
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA token missing ❌",
      });
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA verification failed ❌",
        score: recaptchaResult.score,
      });
    }

    /* ===============================
       2️⃣ Validate required fields
    =============================== */
    if (!position || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Position, name, email, and phone are required.",
      });
    }

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    /* ===============================
    3️⃣ Resume Upload (Cloudinary)
    =============================== */
    let savedResume = null;
    let resumeLink = null;

    if (resumeFile) {
      const result = await uploadBufferToCloudinary(
        resumeFile.buffer,
        resumeFile.originalname,
      );

      savedResume = {
        fileName: resumeFile.originalname,
        filePath: result.secure_url,
        contentType: resumeFile.mimetype,
        publicId: result.public_id, // useful if you ever want to delete it later
      };

      resumeLink = result.secure_url;
    }

    /* ===============================
       4️⃣ Save to MongoDB
    =============================== */
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resume: savedResume,
      recaptchaScore: recaptchaResult.score, // optional but useful
    });

    await newApplication.save();

    /* ===============================
       5️⃣ Success Response
    =============================== */
    res.status(201).json({
      success: true,
      message: "Career application submitted successfully ✅",
      applicationId: newApplication._id,
      resumeLink,
    });
  } catch (error) {
    console.error("❌ Career application error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting career application",
    });
  }
};
