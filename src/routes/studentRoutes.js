// server/src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

// Base URL: /api/students

router.get('/', verifyAdmin, getStudents);
router.post('/', verifyAdmin, addStudent);
router.put('/:id', verifyAdmin, updateStudent);
router.delete('/:id', verifyAdmin, deleteStudent);

module.exports = router;
