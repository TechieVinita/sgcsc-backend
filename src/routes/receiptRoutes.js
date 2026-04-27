// src/routes/receiptRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const {
  createReceipt,
  getReceipts,
  getReceipt,
  updateReceipt,
  deleteReceipt,
  getStudentReceipts
} = require('../controllers/receiptController');

// All routes require admin authentication
router.use(verifyAdmin);

// Create a new receipt
router.post('/', createReceipt);

// Get all receipts with pagination and filtering
router.get('/', getReceipts);

// Get receipts for a specific student
router.get('/student/:studentId', getStudentReceipts);

// Get a single receipt
router.get('/:id', getReceipt);

// Update a receipt
router.put('/:id', updateReceipt);

// Delete a receipt
router.delete('/:id', deleteReceipt);

module.exports = router;