// server/src/routes/marksheetRoutes.js
const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middleware/authMiddleware');
const marksheetController = require('../controllers/marksheetController');

// All routes below are admin-protected

// Create marksheet
router.post('/', verifyAdmin, marksheetController.createMarksheet);

// List marksheets (with optional ?search=…)
router.get('/', verifyAdmin, marksheetController.getMarksheets);

// Get student details by enrollment number (for auto-fill)
router.get('/student/:enrollmentNo', verifyAdmin, marksheetController.getStudentByEnrollment);

// Get single marksheet by id
router.get('/:id', verifyAdmin, marksheetController.getMarksheetById);

// Update marksheet
router.put('/:id', verifyAdmin, marksheetController.updateMarksheet);

// Delete marksheet
router.delete('/:id', verifyAdmin, marksheetController.deleteMarksheet);

module.exports = router;
