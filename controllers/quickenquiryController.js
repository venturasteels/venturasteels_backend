import QuickEnquiry from "../models/QuickEnquiry.js";

export const createQuickEnquiry = async (req, res) => {
  try {
    const { name, phone, email, company, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and Phone are required",
      });
    }

    const enquiry = await QuickEnquiry.create({
      name,
      phone,
      email,
      company,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Quick Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
