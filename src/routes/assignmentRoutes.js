// server/src/routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const verifyAdmin = require('../middleware/authMiddleware');
const assignmentController = require('../controllers/assignmentController');

const ASSIGNMENTS_DIR = path.join(__dirname, '..', 'uploads', 'assignments');

// Basic filename sanitiser
const sanitize = (s = '') =>
  s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');

// Ensure folder exists (in case it wasn't created yet)
const fs = require('fs');
if (!fs.existsSync(ASSIGNMENTS_DIR)) {
  fs.mkdirSync(ASSIGNMENTS_DIR, { recursive: true });
  console.warn('Created assignments folder at', ASSIGNMENTS_DIR);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ASSIGNMENTS_DIR),
  filename: (req, file, cb) => {
    const safe = sanitize(file.originalname || 'file');
    cb(null, `${Date.now()}-${safe}`);
  },
});

// Allowed extensions: Word, PDF, PowerPoint
const allowedExt = /\.(doc|docx|pdf|ppt|pptx)$/i;

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname)
      return cb(new Error('Invalid file upload'));
    if (!allowedExt.test(file.originalname)) {
      return cb(
        new Error('Only Word, PDF, or PowerPoint files are allowed.')
      );
    }
    cb(null, true);
  },
});

// All routes here are ADMIN-only
// Base URL: /api/assignments

// List
router.get('/', verifyAdmin, assignmentController.getAssignments);

// Create (upload)
router.post(
  '/',
  verifyAdmin,
  upload.single('file'),
  assignmentController.createAssignment
);

// Update description
router.put('/:id', verifyAdmin, assignmentController.updateAssignment);

// Delete
router.delete('/:id', verifyAdmin, assignmentController.deleteAssignment);

// Download
router.get('/:id/download', verifyAdmin, assignmentController.downloadAssignment);

module.exports = router;
