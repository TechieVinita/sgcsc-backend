// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads dir exists
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (err) {
  console.error('Could not create uploads directory', err);
}

// simple sanitizer for filenames (keeps alphanumerics, dash, underscore, dot)
const sanitize = (name) => name.replace(/[^a-zA-Z0-9-_\.]/g, '-').replace(/-+/g, '-');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);
    const safeBase = sanitize(base).toLowerCase();
    const filename = `${Date.now()}-${safeBase}${ext}`;
    cb(null, filename);
  }
});

// Accept only image files by default (jpg/png/webp/gif). Adjust if PDFs needed.
const allowedExt = /.(jpg|jpeg|png|webp|gif)$/i;
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (allowedExt.test(ext)) return cb(null, true);
  return cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif)'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6 MB
  fileFilter,
});

// Optional: protect this route with your auth middleware
// const { protectAdmin } = require('../middleware/authMiddleware');
// router.post('/', protectAdmin, upload.single('file'), handler);

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Use form field "file".' });
    }

    // SERVER_URL should be set in environment (e.g., https://sgcsc-backend.onrender.com)
    const serverUrl = (process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const fileUrl = `${serverUrl}/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
});

// Optional: delete uploaded file (admin only). Example:
// router.delete('/:filename', protectAdmin, (req, res) => { ... });

module.exports = router;
