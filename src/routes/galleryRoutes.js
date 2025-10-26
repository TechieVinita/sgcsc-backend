// server/src/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyAdmin = require('../middleware/authMiddleware');
const { addGallery, getGallery, deleteGallery } = require('../controllers/galleryController');

// ✅ Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Public route: Anyone can view gallery
router.get('/', getGallery);

// ✅ Admin-only routes
router.post('/', verifyAdmin, upload.single('image'), addGallery);
router.delete('/:id', verifyAdmin, deleteGallery);

module.exports = router;
