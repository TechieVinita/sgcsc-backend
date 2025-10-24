const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const { addGallery, getGallery, deleteGallery } = require('../controllers/galleryController');

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Public route
router.get('/', getGallery);

// Admin routes
router.post('/', auth, upload.single('image'), addGallery);
router.delete('/:id', auth, deleteGallery);

module.exports = router;
