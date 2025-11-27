const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getRecentStudentsForHome,
  getCertifiedStudentsForHome,
} = require('../controllers/studentController');

// Base URL: /api/students

// ADMIN routes (protected)
router.get('/', verifyAdmin, getStudents);
router.post('/', verifyAdmin, addStudent);
router.put('/:id', verifyAdmin, updateStudent);
router.delete('/:id', verifyAdmin, deleteStudent);

// PUBLIC routes for the website home page
router.get('/recent-home', getRecentStudentsForHome);
router.get('/certified-home', getCertifiedStudentsForHome);

module.exports = router;
