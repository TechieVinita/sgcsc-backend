// sgcsc-backend/src/routes/creditRoutes.js
const express = require('express');
const router = express.Router();

// Middleware
const protect = require('../middleware/authMiddleware');
const franchiseAuthMiddleware = require('../middleware/franchiseAuthMiddleware');

// Admin role authorization
const adminOnly = protect.authorizeRole('admin', 'superadmin');

// Controller functions
const {
  // Admin functions
  addCreditsToFranchise,
  getFranchiseTransactions,
  getAllFranchiseCredits,
  // Franchise functions
  getMyCredits,
  getMyTransactions,
  getCreditPricing,
  getTopupInfo,
} = require('../controllers/creditController');

/**
 * =========================================================
 * ADMIN ROUTES
 * =========================================================
 */

// POST /api/credits/admin/add - Add credits to a franchise (admin only)
router.post('/admin/add', protect, adminOnly, addCreditsToFranchise);

// GET /api/credits/admin/transactions/:franchiseId - Get all transactions for a franchise (admin only)
router.get('/admin/transactions/:franchiseId', protect, adminOnly, getFranchiseTransactions);

// GET /api/credits/admin/franchises - Get credit summary for all franchises (admin only)
router.get('/admin/franchises', protect, adminOnly, getAllFranchiseCredits);

/**
 * =========================================================
 * FRANCHISE ROUTES
 * =========================================================
 */

// GET /api/credits/my-credits - Get current franchise's credit info
router.get('/my-credits', franchiseAuthMiddleware, getMyCredits);

// GET /api/credits/my-transactions - Get current franchise's transaction history
router.get('/my-transactions', franchiseAuthMiddleware, getMyTransactions);

// GET /api/credits/pricing - Get current credit pricing for all features
router.get('/pricing', franchiseAuthMiddleware, getCreditPricing);

// GET /api/credits/topup-info - Get QR code and instructions for credit top-up
router.get('/topup-info', franchiseAuthMiddleware, getTopupInfo);

module.exports = router;
