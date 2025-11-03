import CareerApplication from "../models/Career.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const submitCareerApplication = async (req, res) => {
  try {
    const { position, name, email, phone, message } = req.body;
    const resumePath = req.file ? req.file.path : null;

    // Basic validation
    if (!position || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Save to MongoDB 
    const newApplication = new CareerApplication({
      position,
      name,
      email,
      phone,
      message,
      resume: resumePath,
    });
    await newApplication.save();

    // Send success response immediately
    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
    });

    // Configure Nodemailer (Gmail or SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Compose the styled email
    const mailOptions = {
      from: `"Ventura Steels Careers" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `New Career Application - ${position}`,
      html: `
        <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f6f8; padding:30px;">
          <div style="max-width:650px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">

            <div style="background:#273F4F; padding:20px 25px; text-align:center;">
              <h2 style="color:#ffffff; margin:0; font-weight:600;">New Career Application Received</h2>
            </div>

            <div style="padding:25px;">
              <p style="color:#666; margin:0 0 15px;">Submitted via <b>Ventura Steels Career Portal</b></p>
              <hr style="border:none; border-top:3px solid #FE7743; margin-bottom:25px;">

              <table style="width:100%; border-collapse:collapse; font-size:15px;">
                <tr>
                  <td style="padding:10px 0; font-weight:600; color:#273F4F;">Position:</td>
                  <td style="padding:10px 0; color:#333;">${position}</td>
                </tr>
                <tr style="background-color:#f9fafb;">
                  <td style="padding:10px 0; font-weight:600; color:#273F4F;">Name:</td>
                  <td style="padding:10px 0; color:#333;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0; font-weight:600; color:#273F4F;">Email:</td>
                  <td style="padding:10px 0;">
                    <a href="mailto:${email}" style="color:#007bff; text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr style="background-color:#f9fafb;">
                  <td style="padding:10px 0; font-weight:600; color:#273F4F;">Phone:</td>
                  <td style="padding:10px 0; color:#333;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0; font-weight:600; color:#273F4F;">Message:</td>
                  <td style="padding:10px 0; color:#333;">${
                    message || "N/A"
                  }</td>
                </tr>
                ${
                  resumePath
                    ? `
                <tr style="background-color:#f9fafb;">
                  <td style="padding:10px 0; font-weight:600; color:#273F4F;">Resume:</td>
                  <td style="padding:15px 0;">
                    <a href="#" style="display:inline-block; background-color:#FE7743; color:#fff; padding:8px 15px; border-radius:5px; text-decoration:none; font-size:14px; font-weight:500;">
                      📎 View Attached Resume
                    </a>
                  </td>
                </tr>`
                    : ""
                }
              </table>
            </div>

            <div style="background:#f8f9fa; text-align:center; padding:15px; border-top:1px solid #eee;">
              <p style="margin:0; color:#999; font-size:13px;">© ${new Date().getFullYear()} Ventura Steels Pvt. Ltd.</p>
            </div>

          </div>
        </div>
      `,
      attachments: [
        ...(resumePath
          ? [
              {
                filename: req.file.originalname,
                path: resumePath,
              },
            ]
          : []),
      ],
    };

    // Send mail asynchronously (no blocking)
    transporter
      .sendMail(mailOptions)
      .then(() => console.log("✅ Career email sent successfully"))
      .catch((err) => console.error("❌ Failed to send email:", err.message));
  } catch (error) {
    console.error("❌ Error submitting career application:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while submitting application.",
      error: error.message,
    });
  }
};
