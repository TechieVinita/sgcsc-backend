// server/src/routes/franchiseRoutes.js
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

/* ---------- Multer setup ---------- */

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
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max per file
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }
    cb(null, true);
  },
});

const franchiseUploads = upload.fields([
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panImage', maxCount: 1 },
  { name: 'institutePhoto', maxCount: 1 },
  { name: 'ownerSign', maxCount: 1 },
  { name: 'ownerImage', maxCount: 1 },
  { name: 'certificateFile', maxCount: 1 },
]);

/* ---------- Routes (base: /api/franchises) ---------- */

// list
router.get('/', getFranchises);

// username check – DO THIS BEFORE "/:id"
router.get('/check-username', checkUsernameUnique);

// single franchise
router.get('/:id', getFranchise);

// admin-only writes
router.post('/', verifyAdmin, franchiseUploads, createFranchise);
router.put('/:id', verifyAdmin, franchiseUploads, updateFranchise);
router.delete('/:id', verifyAdmin, deleteFranchise);

module.exports = router;
