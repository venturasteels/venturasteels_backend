import express from "express";
import multer from "multer";
import { submitCareerApplication } from "../controllers/careerController.js";

const router = express.Router();

// Use memory storage (file stored in buffer for Cloudinary upload)
const storage = multer.memoryStorage();

// File validation (PDF, DOC, DOCX only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only PDF, DOC, DOCX allowed."));
};

// Multer setup
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Route
router.post("/apply", upload.single("resume"), submitCareerApplication);

export default router;
