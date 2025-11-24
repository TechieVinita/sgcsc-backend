// server/src/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyAdmin = require('../middleware/authMiddleware');
const { addGallery, getGallery, deleteGallery } = require('../controllers/galleryController');

// multer disk storage (uploads stored in src/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.test(ext));
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// Public: list gallery
router.get('/', getGallery);

// Admin: create (with image) and delete
router.post('/', verifyAdmin, upload.single('image'), addGallery);
router.delete('/:id', verifyAdmin, deleteGallery);

module.exports = router;
