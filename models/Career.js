import mongoose from "mongoose";

const CareerSchema = new mongoose.Schema({
  position: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String },
  resume: {
    data: Buffer,
    contentType: String,
    fileName: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CareerApplication", CareerSchema);
