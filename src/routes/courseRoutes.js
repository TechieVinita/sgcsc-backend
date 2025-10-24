const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const { addCourse, getCourses, deleteCourse } = require('../controllers/courseController');

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Public
router.get('/', getCourses);

// Admin routes
router.post('/', auth, upload.single('image'), addCourse);
router.delete('/:id', auth, deleteCourse);

module.exports = router;
