const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const verifyAdmin = require('../middleware/authMiddleware');
const {
  createFranchise,
  getFranchises,
  getFranchise,
  updateFranchise,
  deleteFranchise,
  checkUsernameUnique,
} = require('../controllers/franchiseController');

const router = express.Router();

/* =========================================================
   UPLOADS SETUP
   ========================================================= */

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Safe filename helper
const sanitizeFilename = (name = 'file') =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '');

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safe = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${safe}`);
  },
});

// Accept images + PDFs only
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      return cb(null, true);
    }
    cb(new Error('Only image or PDF files are allowed'));
  },
});

// Named upload fields
const franchiseUploads = upload.fields([
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panImage', maxCount: 1 },
  { name: 'institutePhoto', maxCount: 1 },
  { name: 'ownerSign', maxCount: 1 },
  { name: 'ownerImage', maxCount: 1 },
  { name: 'certificateFile', maxCount: 1 },
]);

/* =========================================================
   ROUTES
   Base: /api/franchises
   ========================================================= */

/**
 * 🔍 Username uniqueness check
 * IMPORTANT: must be BEFORE "/:id"
 */
router.get('/check-username', checkUsernameUnique);

/**
 * 📄 List all franchises (admin)
 */
router.get('/', verifyAdmin, getFranchises);

/**
 * 📄 Get single franchise
 */
router.get('/:id', verifyAdmin, getFranchise);

/**
 * ➕ Create franchise (admin only)
 */
router.post('/', verifyAdmin, franchiseUploads, createFranchise);

/**
 * ✏️ Update franchise
 */
router.put('/:id', verifyAdmin, franchiseUploads, updateFranchise);

/**
 * ❌ Delete franchise
 */
router.delete('/:id', verifyAdmin, deleteFranchise);

/* =========================================================
   GLOBAL ERROR HANDLER (multer-safe)
   ========================================================= */

router.use((err, _req, res, _next) => {
  console.error('Franchise route error:', err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // File filter / validation errors
  if (err.message?.includes('Only image')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Franchise request failed',
  });
});

module.exports = router;
