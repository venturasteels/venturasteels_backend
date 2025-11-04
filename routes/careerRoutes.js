import express from "express";
import multer from "multer";
import { submitCareerApplication } from "../controllers/careerController.js";

const router = express.Router();

// Use memory storage so file is held in buffer for MongoDB
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only PDF, DOC, DOCX allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, 
});

router.post("/apply", upload.single("resume"), submitCareerApplication);

export default router;
