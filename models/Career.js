import mongoose from "mongoose";

const CareerSchema = new mongoose.Schema({
  position: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String },
  resume: {
    fileName: String,
    filePath: String,
    contentType: String,
    publicId: String, // ✅ add this
  },
  recaptchaScore: { type: Number }, // ✅ add this
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CareerApplication", CareerSchema);
