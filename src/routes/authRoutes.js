const express = require("express");
const router = express.Router();

const {
  adminLogin,
  studentLogin,
} = require("../controllers/authController");

/* ================= ADMIN LOGIN ================= */
router.post("/admin-login", adminLogin);

/* ================= STUDENT LOGIN ================= */
router.post("/student-login", studentLogin);

module.exports = router;
