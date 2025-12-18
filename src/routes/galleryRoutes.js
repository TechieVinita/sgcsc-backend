const express = require("express");
const router = express.Router();

const verifyAdmin = require("../middleware/authMiddleware");
const {uploadImage} = require("../middleware/upload");
const galleryController = require("../controllers/galleryController");

/* PUBLIC */
router.get("/", galleryController.getGallery);

/* ADMIN */
router.post(
  "/",
  verifyAdmin,
  uploadImage.single("image"), // Cloudinary
  galleryController.addGallery
);

router.put("/:id", verifyAdmin, galleryController.updateGallery);
router.delete("/:id", verifyAdmin, galleryController.deleteGallery);

module.exports = router;
