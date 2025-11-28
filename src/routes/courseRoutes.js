// server/src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const verifyAdmin = require('../middleware/authMiddleware');
const {
  addCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

/* ---------- Multer setup for course images ---------- */

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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }
    cb(null, true);
  },
});

/* ---------- Routes (base: /api/courses) ---------- */

// public list
router.get('/', getCourses);

// public single course
router.get('/:id', getCourse);

// admin-only create/update/delete
router.post('/', verifyAdmin, upload.single('image'), addCourse);
router.put('/:id', verifyAdmin, upload.single('image'), updateCourse);
router.delete('/:id', verifyAdmin, deleteCourse);

module.exports = router;
