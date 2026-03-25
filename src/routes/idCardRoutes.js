// server/src/routes/idCardRoutes.js
const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/authMiddleware');
const idCardController = require('../controllers/idCardController');

// Create ID card
router.post('/', verifyAdmin, idCardController.createIDCard);

// List ID cards (with optional ?search=…)
router.get('/', verifyAdmin, idCardController.getIDCards);

// Get single ID card by id
router.get('/:id', verifyAdmin, idCardController.getIDCardById);

// Update ID card
router.put('/:id', verifyAdmin, idCardController.updateIDCard);

// Delete ID card
router.delete('/:id', verifyAdmin, idCardController.deleteIDCard);

module.exports = router;