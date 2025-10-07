import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  gradeName: { type: String, required: true },
  shape: { type: String, enum: ["Round Bar", "Block"], required: true },
  diameter: { type: String },
  thickness: { type: String },
  width: { type: String },
  quantity: { type: String },
});

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    companyname: { type: String, required: true },
    userType: { type: String, required: true },
    product: { type: String, required: true },
    message: { type: String },
    grades: [gradeSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
