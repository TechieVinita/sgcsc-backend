// server/src/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sanitize = (s = '') => s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');

const verifyAdmin = require('../middleware/authMiddleware'); // exported function
const galleryController = require('../controllers/galleryController');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Multer storage: save into src/uploads with sanitized filename
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = sanitize(file.originalname || 'file');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const allowedExt = /\.(jpe?g|png|gif|webp|bmp)$/i;
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname) return cb(new Error('Invalid file'));
    if (!allowedExt.test(file.originalname)) {
      return cb(new Error('Only image files are allowed (jpg/png/gif/webp)'));
    }
    cb(null, true);
  }
});

// PUBLIC: list gallery
router.get('/', async (req, res, next) => {
  try {
    // controller returns { success: true, data }
    return galleryController.getGallery(req, res, next);
  } catch (err) {
    next(err);
  }
});

// ADMIN: add image (multipart field 'image')
router.post('/', verifyAdmin, upload.single('image'), async (req, res, next) => {
  try {
    return galleryController.addGallery(req, res, next);
  } catch (err) {
    next(err);
  }
});

// ADMIN: delete image
router.delete('/:id', verifyAdmin, async (req, res, next) => {
  try {
    return galleryController.deleteGallery(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
