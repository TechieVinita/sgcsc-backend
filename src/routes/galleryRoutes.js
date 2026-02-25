// server/src/routes/galleryRoutes.js

const express = require("express");
const router = express.Router();

const verifyAdmin = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/upload");
const galleryController = require("../controllers/galleryController");

/* =====================================================
   PUBLIC ROUTES
   ===================================================== */

/**
 * GET /api/gallery
 * Get all gallery images
 * Optional query: ?category=gallery | affiliation
 */
router.get("/", galleryController.getGallery);

/**
 * GET /api/gallery/:id
 * Get SINGLE gallery image by ID
 * 🔴 REQUIRED for edit page preload
 */
router.get("/:id", galleryController.getGalleryById);


/* =====================================================
   ADMIN ROUTES
   ===================================================== */

/**
 * POST /api/gallery
 * Add new gallery image
 */
router.post(
  "/",
  verifyAdmin,
  uploadImage.single("image"),
  galleryController.addGallery
);

/**
 * PUT /api/gallery/:id
 * Update gallery image details (title/category/image)
 */
router.put(
  "/:id",
  verifyAdmin,
  uploadImage.single("image"), // allow image replacement
  galleryController.updateGallery
);

/**
 * DELETE /api/gallery/:id
 * Delete gallery image
 */
router.delete(
  "/:id",
  verifyAdmin,
  galleryController.deleteGallery
);

module.exports = router;
