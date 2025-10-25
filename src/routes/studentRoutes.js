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

// Get all students (Admin only)
router.get('/', verifyAdmin, getStudents);

// Add a new student
router.post('/', verifyAdmin, addStudent);

// Update student details
router.put('/:id', verifyAdmin, updateStudent);

// Delete a student
router.delete('/:id', verifyAdmin, deleteStudent);

module.exports = router;
