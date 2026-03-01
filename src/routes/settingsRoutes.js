// src/routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSocialLinks,
} = require("../controllers/settingsController");
const verifyAdmin = require("../middleware/authMiddleware");

// Public route - get settings
router.get("/", getSettings);

// Protected route - update social links (admin only)
router.put(
  "/social",
  verifyAdmin,
  verifyAdmin.authorizeRole("superadmin", "admin"),
  updateSocialLinks
);

module.exports = router;
