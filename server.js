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

// REQUIRED for Render / proxies
app.set("trust proxy", 1);

// Apply globally to monitor all POST requests to forms
app.use(checkBlockedIP);
app.use(monitorForms);

app.disable("x-powered-by");

app.use(helmet.noSniff());

app.use(
  helmet({
    contentSecurityPolicy: false, // ❗ Disable CSP on backend
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

// Legacy but scanner-required
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// HSTS fix for proxy environments
app.use((req, res, next) => {
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
  next();
});

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

const corsOptions = {
  origin: "https://venturasteels.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

app.use("/api/enquiry", formLimiter, enquiryRoutes);
app.use("/api/contact", formLimiter, contactRoutes);
app.use("/api/careers", formLimiter, careerRoutes);

// app.get("/", (req, res) => {
//   res.send("✅ Ventura Steels Backend is running...");
// });

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running 🚀" });
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
