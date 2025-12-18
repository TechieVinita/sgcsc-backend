require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* ===================== DB ===================== */
connectDB();

/* ===================== Security ===================== */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5000",
          "https:",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        connectSrc: ["'self'", "http://localhost:5000", "https:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ===================== Performance ===================== */
app.use(compression());

/* ===================== Body Parsing ===================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===================== Logger ===================== */
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://sgcsc-site.vercel.app",
      "https://sgcsc-admin.vercel.app",
    ],
    credentials: true,
  })
);

/* ===================== Rate Limiting ===================== */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ===================== STATIC FILES (IMPORTANT FIX) ===================== */
/**
 * Multer saves files into:
 *   server/src/uploads
 * So we MUST serve THAT directory
 */
/* ===================== API ROUTES ===================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/members", require("./routes/membersRoutes"));
app.use("/api/affiliations", require("./routes/affiliations"));
app.use("/api/franchises", require("./routes/franchiseRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/admit-cards", require("./routes/admitCardRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/study-materials", require("./routes/studyMaterialRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));


app.use("/api/student-auth", require("./routes/studentAuthRoutes"));
app.use("/api/student-profile", require("./routes/studentProfileRoutes"));

app.use("/api/public/franchise", require("./routes/publicFranchiseRoutes"));


/* ===================== Health Check ===================== */
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    env: NODE_ENV,
    uptime: process.uptime(),
  });
});

/* ===================== 404 ===================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    path: req.originalUrl,
  });
});

/* ===================== Error Handler ===================== */
app.use((err, _req, res, _next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ===================== Start Server ===================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
});
