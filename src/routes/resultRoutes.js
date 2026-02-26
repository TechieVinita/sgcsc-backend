// server/src/routes/resultRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const {
  addResult,
  getResults,
  getResult,
  updateResult,
  deleteResult,
  getResultByRoll,
} = require('../controllers/resultController');

// Base path: /api/results

// Create result
router.post('/', verifyAdmin, addResult);

// List results (optional ?search=, ?studentId=, ?courseId= query)
router.get('/', verifyAdmin, getResults);

// Get result by roll number (public verification)
router.get('/by-roll/:rollNumber', getResultByRoll);

// Single result by ID
router.get('/:id', verifyAdmin, getResult);

// Update result
router.put('/:id', verifyAdmin, updateResult);

// Delete result
router.delete('/:id', verifyAdmin, deleteResult);

module.exports = router;
