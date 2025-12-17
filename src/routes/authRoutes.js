// server/src/routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const verifyAdmin = require("../middleware/authMiddleware");
const verifyStudent = require("../middleware/verifyStudent");

const router = express.Router();

/* ================= ADMIN ================= */

// Admin login
router.post("/admin-login", authController.adminLogin);

// Admin profile
router.get("/me", verifyAdmin, (req, res) => {
  return res.json({
    success: true,
    data: req.user,
  });
});

/* ================= STUDENT ================= */

// Student login
router.post("/student-login", authController.studentLogin);

// Student profile
router.get("/student-me", verifyStudent, (req, res) => {
  return res.json({
    success: true,
    data: req.student,
  });
});

module.exports = router;
