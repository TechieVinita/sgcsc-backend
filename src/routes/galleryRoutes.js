// server/src/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const verifyAdmin = require('../middleware/authMiddleware');
const galleryController = require('../controllers/galleryController');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const sanitize = (s = '') =>
  s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = sanitize(file.originalname || 'file');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const allowedExt = /\.(jpe?g|png|gif|webp|bmp)$/i;

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname) {
      return cb(new Error('Invalid file'));
    }
    if (!allowedExt.test(file.originalname)) {
      return cb(
        new Error(
          'Only image files are allowed (jpg, jpeg, png, gif, webp, bmp)'
        )
      );
    }
    cb(null, true);
  },
});

// PUBLIC: list gallery (+ optional ?category=)
router.get('/', (req, res, next) => {
  galleryController.getGallery(req, res, next);
});

// ADMIN: add image (multipart field 'image' or external url)
router.post(
  '/',
  verifyAdmin,
  upload.single('image'),
  (req, res, next) => {
    galleryController.addGallery(req, res, next);
  }
);

// ADMIN: update name / category
router.put('/:id', verifyAdmin, (req, res, next) => {
  galleryController.updateGallery(req, res, next);
});

// ADMIN: delete image
router.delete('/:id', verifyAdmin, (req, res, next) => {
  galleryController.deleteGallery(req, res, next);
});

module.exports = router;
