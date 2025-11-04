import CareerApplication from "../models/Career.js";

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

    // ✅ Store file directly in MongoDB
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resume: {
        data: resumeFile.buffer,
        contentType: resumeFile.mimetype,
        fileName: resumeFile.originalname,
      },
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Application saved successfully!",
      applicationId: newApplication._id,
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
