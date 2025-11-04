import mongoose from "mongoose";

const careerApplicationSchema = new mongoose.Schema(
  {
    position: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 500 },
    resumeUrl: { type: String, required: true, trim: true },
    resumePublicId: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Shortlisted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("CareerApplication", careerApplicationSchema);
