import mongoose from "mongoose";

const CareerSchema = new mongoose.Schema(
  {
    position: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String },
    resume: {
      fileName: { type: String, required: true },
      fileType: { type: String, required: true },
      fileUrl: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export default mongoose.model("CareerApplication", CareerSchema);
