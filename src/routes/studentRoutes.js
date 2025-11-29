// server/src/routes/studentRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const verifyAdmin = require('../middleware/authMiddleware');
const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const router = express.Router();

/* ---------- Multer setup (reuse global /uploads) ---------- */

const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = (file.originalname || 'file')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for student photo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed for photo'));
    }
    cb(null, true);
  },
});

/* ---------- Routes (base: /api/students) ---------- */

// public / basic admin list
router.get('/', getStudents);
router.get('/:id', getStudent);

// admin-only writes, with optional photo upload
router.post('/', verifyAdmin, upload.single('photo'), createStudent);
router.put('/:id', verifyAdmin, upload.single('photo'), updateStudent);
router.delete('/:id', verifyAdmin, deleteStudent);

module.exports = router;
