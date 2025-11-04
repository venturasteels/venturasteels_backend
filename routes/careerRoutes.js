import express from "express";
import multer from "multer";
import { submitCareerApplication } from "../controllers/careerController.js";

const router = express.Router();

// Multer memory storage (for Cloudinary)
const storage = multer.memoryStorage();

// File type validation (PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, DOC, and DOCX files are allowed.")
    );
  }
};

// Upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// POST Route: Apply for Career
router.post("/apply", upload.single("resume"), submitCareerApplication);

export default router;
