import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
// import careerRoutes from "./routes/careerRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
// app.use("/uploads", express.static("uploads")); 

// Routes
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/contact", contactRoutes);
// app.use("/api/careers", careerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
