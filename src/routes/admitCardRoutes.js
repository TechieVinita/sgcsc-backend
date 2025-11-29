// server/src/routes/admitCardRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const admitCardController = require('../controllers/admitCardController');

// All routes below are admin-protected

// Create admit card
router.post('/', verifyAdmin, admitCardController.createAdmitCard);

// List admit cards (with optional ?search=…)
router.get('/', verifyAdmin, admitCardController.getAdmitCards);

// Get single admit card by id
router.get('/:id', verifyAdmin, admitCardController.getAdmitCardById);

// Update admit card
router.put('/:id', verifyAdmin, admitCardController.updateAdmitCard);

// Delete admit card
router.delete('/:id', verifyAdmin, admitCardController.deleteAdmitCard);

module.exports = router;
