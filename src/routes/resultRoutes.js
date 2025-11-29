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
} = require('../controllers/resultController');

// Base path: /api/results

// Create result
router.post('/', verifyAdmin, addResult);

// List results (optional ?search= query)
router.get('/', verifyAdmin, getResults);

// Single result
router.get('/:id', verifyAdmin, getResult);

// Update result
router.put('/:id', verifyAdmin, updateResult);

// Delete result
router.delete('/:id', verifyAdmin, deleteResult);

module.exports = router;
