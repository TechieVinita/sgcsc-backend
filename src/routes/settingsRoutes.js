// src/routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSocialLinks,
  updateCreditPricing,
  uploadCreditTopupQR,
  deleteCreditTopupQR,
  updateCreditTopupInstructions,
  getCreditSettings,
} = require("../controllers/settingsController");
const verifyAdmin = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/upload");

// Public route - get settings
router.get("/", getSettings);

// Public route - get credit settings
router.get("/credit", getCreditSettings);

// Protected route - update social links (admin only)
router.put(
  "/social",
  verifyAdmin,
  verifyAdmin.authorizeRole("superadmin", "admin"),
  updateSocialLinks
);

// Protected route - update credit pricing (admin only)
router.put(
  "/credit-pricing",
  verifyAdmin,
  verifyAdmin.authorizeRole("superadmin", "admin"),
  updateCreditPricing
);

// Protected route - upload credit top-up QR code (admin only)
router.post(
  "/credit-topup-qr",
  verifyAdmin,
  verifyAdmin.authorizeRole("superadmin", "admin"),
  uploadImage.single("qrCode"),
  uploadCreditTopupQR
);

// Protected route - delete credit top-up QR code (admin only)
router.delete(
  "/credit-topup-qr",
  verifyAdmin,
  verifyAdmin.authorizeRole("superadmin", "admin"),
  deleteCreditTopupQR
);

// Protected route - update credit top-up instructions (admin only)
router.put(
  "/credit-topup-instructions",
  verifyAdmin,
  verifyAdmin.authorizeRole("superadmin", "admin"),
  updateCreditTopupInstructions
);

module.exports = router;
