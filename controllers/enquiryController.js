import Enquiry from "../models/Enquiry.js";

export const submitEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyname,
      userType,
      product,
      message,
      grades = [],
    } = req.body;

    console.log("📩 Received Enquiry Data:", req.body);

    const formattedGrades = Array.isArray(grades)
      ? grades.map((grade) => ({
          gradeName: grade.gradeName,
          shape: grade.shape,
          diameter: grade.diameter || "",
          thickness: grade.thickness || "",
          width: grade.width || "",
          quantity: grade.quantity || "",
        }))
      : [];

    const newEnquiry = new Enquiry({
      name,
      email,
      phone,
      companyname,
      userType,
      product,
      message,
      grades: formattedGrades,
    });

    await newEnquiry.save();

    res.status(200).json({ message: "✅ Enquiry saved successfully!" });
  } catch (error) {
    console.error("❌ Backend Error while saving enquiry:", error);
    res.status(500).json({ message: "Failed to save enquiry ❌" });
  }
};
