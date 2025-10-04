import Enquiry from "../models/ContactUs.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, mobile, company, message } = req.body;

    // Save to MongoDB
    const enquiry = new Enquiry({ name, email, mobile, company, message });
    await enquiry.save();

    res.status(200).json({ message: "Contact form saved to MongoDB ✅" });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ message: "Failed to save to MongoDB ❌" });
  }
};
