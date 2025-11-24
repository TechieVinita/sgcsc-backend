// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');

// ---------------------------
// Simple disk storage setup
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    // safe-unique filename: timestamp-originalname
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

// basic file filter to allow images and pdfs only (safe default)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

// Public endpoint to upload a single file named "file"
router.post('/', upload.single('file'), uploadController.uploadFile);

// NOTE: You can protect this route by adding your auth middleware:
// const { protect } = require('../middleware/authMiddleware');
// router.post('/', protect, upload.single('file'), uploadController.uploadFile);

module.exports = router;
