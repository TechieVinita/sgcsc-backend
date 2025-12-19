const express = require("express");
const router = express.Router();

const {
  adminLogin,
  studentLogin,
  franchiseLogin,
} = require("../controllers/authController");


/* ================= ADMIN LOGIN ================= */
router.post("/admin-login", adminLogin);

/* ================= STUDENT LOGIN ================= */
router.post("/student-login", studentLogin);

/* ================= FRANCHISE LOGIN ================= */
router.post("/franchise-login", franchiseLogin);


module.exports = router;
