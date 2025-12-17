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
  getRecentStudents,
} = require('../controllers/studentController');

const router = express.Router();

/* ---------- PUBLIC ---------- */
router.get('/recent', getRecentStudents);
router.get('/', getStudents);
router.get('/:id', getStudent);

/* ---------- ADMIN ---------- */
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({ storage });

router.post('/', verifyAdmin, upload.single('photo'), createStudent);
router.put('/:id', verifyAdmin, upload.single('photo'), updateStudent);
router.delete('/:id', verifyAdmin, deleteStudent);

module.exports = router;
