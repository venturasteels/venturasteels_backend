import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import enquiryRoutes from "./routes/enquiryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";

import { checkBlockedIP } from "./tempBlock.js";
import { monitorForms } from "./middleware/monitorForms.js";

dotenv.config();
connectDB();

const app = express();

// Apply globally to monitor all POST requests to forms
app.use(checkBlockedIP);
app.use(monitorForms);

// Helmet - enhanced security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        frameSrc: ["'self'", "https://www.google.com"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    permissionsPolicy: {
      features: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
      },
    },
  }),
);

// Limit requests to forms to prevent bots
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

app.use("/api/enquiry", formLimiter, enquiryRoutes);
app.use("/api/contact", formLimiter, contactRoutes);
app.use("/api/careers", formLimiter, careerRoutes);

app.get("/", (req, res) => {
  res.send("✅ Ventura Steels Backend is running...");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
