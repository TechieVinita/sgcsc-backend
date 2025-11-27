// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyAdmin = require('../middleware/authMiddleware'); // CommonJS export

// Admin login
router.post('/admin-login', authController.adminLogin);

// Student login
router.post('/student-login', authController.studentLogin);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

/**
 * GET /api/auth/me
 * - Protected route that returns the authenticated admin profile.
 * - Response shape: { success: true, data: <user object> }
 */
router.get('/me', verifyAdmin, (req, res) => {
  // verifyAdmin attaches req.user (safely sanitized if model found)
  if (!req.user) return res.status(404).json({ success: false, message: 'Not found' });
  return res.json({ success: true, data: req.user });
});

module.exports = router;
