const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

// Add new result
router.post('/add', authMiddleware, resultController.AddResults);

// Get all results
router.get('/', authMiddleware, resultController.getResults);

module.exports = router;
