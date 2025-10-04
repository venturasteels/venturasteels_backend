import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  company: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Contact", contactSchema);
