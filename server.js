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

/* ========================================
   TRUST PROXY (Required for Render)
======================================== */
app.set("trust proxy", 1);
app.disable("x-powered-by");

/* ========================================
   CORS (FIRST)
======================================== */
const allowedOrigins = ["https://venturasteels.com", "http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // regex instead of "*"

/* ========================================
   BODY PARSER (MUST COME BEFORE CUSTOM MIDDLEWARE)
======================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ========================================
   SECURITY HEADERS
======================================== */
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP handled on frontend
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use(helmet.noSniff());

// Legacy scanner-required header
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// HSTS for HTTPS (Render compatible)
app.use((req, res, next) => {
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
  next();
});

/* ========================================
   CUSTOM SECURITY MIDDLEWARE
   (NOW SAFE because body parser already runs)
======================================== */
// app.use(checkBlockedIP);
// app.use(monitorForms);

/* ========================================
   RATE LIMITER
======================================== */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ========================================
   STATIC FILES
======================================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadsPath));

/* ========================================
   ROUTES
======================================== */
app.use("/api/enquiry", formLimiter, enquiryRoutes);
app.use("/api/contact", formLimiter, contactRoutes);
app.use("/api/careers", formLimiter, careerRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running 🚀" });
});

/* ========================================
   404 HANDLER
======================================== */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ========================================
   GLOBAL ERROR HANDLER
======================================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

/* ========================================
   START SERVER
======================================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
