// server/src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
let multer;
try { multer = require('multer'); } catch (e) { multer = null; }

const uploadsDir = path.join(__dirname, '..', 'uploads');

// Require auth middleware (may be undefined if file wrong)
let verifyAdmin;
try {
  verifyAdmin = require('../middleware/authMiddleware');
} catch (err) {
  console.error('courseRoutes: could not require authMiddleware:', err && err.message);
  verifyAdmin = null;
}

// Require controller safely
let courseController;
try {
  courseController = require('../controllers/courseController');
} catch (err) {
  console.error('courseRoutes: could not require courseController:', err && err.message);
  courseController = null;
}

/* ---------- Safe multer setup (if multer available) ---------- */
let upload = {
  // fallback noop single middleware
  single: () => (req, res, next) => next()
};

if (multer) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      // basic sanitization
      const safe = (file.originalname || 'file').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
      cb(null, `${Date.now()}-${safe}`);
    }
  });

  upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files allowed'));
      }
      cb(null, true);
    }
  });
}

/* ---------- Helpers to replace missing pieces with safe fallbacks ---------- */
const mkMiddleware = (maybeFn, name) => {
  if (typeof maybeFn === 'function') return maybeFn;
  console.warn(`courseRoutes: ${name} is not a function (type=${typeof maybeFn}). Using fallback middleware.`);
  return (req, res, next) => {
    res.status(500).json({ success: false, message: `Server misconfiguration: middleware "${name}" not available` });
  };
};

const mkHandler = (maybeFn, name) => {
  if (typeof maybeFn === 'function') return maybeFn;
  console.warn(`courseRoutes: handler "${name}" is not a function (type=${typeof maybeFn}). Using fallback handler.`);
  return (req, res) => {
    res.status(500).json({ success: false, message: `Server misconfiguration: handler "${name}" not available` });
  };
};

/* ---------- Wrap/convert items to safe functions ---------- */
const safeVerifyAdmin = mkMiddleware(verifyAdmin, 'verifyAdmin');
const safeUploadSingle = (fieldName) => {
  try {
    const u = upload && upload.single ? upload.single(fieldName) : null;
    if (typeof u === 'function') return u;
  } catch (err) {
    console.error('courseRoutes: upload.single threw:', err && err.message);
  }
  // fallback noop middleware if multer missing or failed
  return (req, res, next) => next();
};

/* ---------- Safe controller handlers ---------- */
const safeGetCourses = mkHandler(courseController?.getCourses, 'getCourses');
const safeGetCourse = mkHandler(courseController?.getCourse, 'getCourse');
const safeAddCourse = mkHandler(courseController?.addCourse, 'addCourse');
const safeUpdateCourse = mkHandler(courseController?.updateCourse, 'updateCourse');
const safeDeleteCourse = mkHandler(courseController?.deleteCourse, 'deleteCourse');

/* ---------- Routes (base: /api/courses) ---------- */
// Public
router.get('/', safeGetCourses);

// single (optional)
router.get('/:id', safeGetCourse);

// Admin-only routes (protected)
router.post('/', safeVerifyAdmin, safeUploadSingle('image'), safeAddCourse);
router.put('/:id', safeVerifyAdmin, safeUploadSingle('image'), safeUpdateCourse);
router.delete('/:id', safeVerifyAdmin, safeDeleteCourse);

/* ---------- Export ---------- */
module.exports = router;
