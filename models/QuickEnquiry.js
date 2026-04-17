import mongoose from "mongoose";

const quickEnquirySchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  company: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("QuickEnquiry", quickEnquirySchema);
