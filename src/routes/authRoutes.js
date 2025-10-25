const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin login
router.post('/admin-login', authController.adminLogin);


// Student login
router.post('/student-login', authController.studentLogin);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
