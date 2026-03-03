// sgcsc-backend/src/controllers/creditController.js
const mongoose = require('mongoose');
const Franchise = require('../models/Franchise');
const CreditTransaction = require('../models/CreditTransaction');
const Settings = require('../models/Settings');

/**
 * =========================================================
 * ADMIN FUNCTIONS
 * =========================================================
 */

/**
 * POST /api/credits/admin/add
 * Add credits to a franchise (admin only)
 * Body: { franchiseId, amount, description }
 */
exports.addCreditsToFranchise = async (req, res) => {
  try {
    const { franchiseId, amount, description } = req.body;

    if (!franchiseId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'franchiseId and amount are required',
      });
    }

    const creditAmount = Number(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    // Find the franchise
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    // Calculate new balance
    const previousBalance = franchise.credits || 0;
    const newBalance = previousBalance + creditAmount;

    // Update franchise credits
    franchise.credits = newBalance;
    await franchise.save();

    // Create top-up transaction record
    const transaction = await CreditTransaction.create({
      franchise: franchiseId,
      type: 'topup',
      amount: creditAmount,
      description: description || 'Credit top-up by admin',
      balanceAfter: newBalance,
      adminId: req.user?._id || req.user?.id,
      status: 'completed',
    });

    return res.status(200).json({
      success: true,
      message: `Successfully added ${creditAmount} credits to ${franchise.instituteName}`,
      data: {
        franchise: {
          _id: franchise._id,
          instituteName: franchise.instituteName,
          instituteId: franchise.instituteId,
          credits: franchise.credits,
        },
        transaction,
      },
    });
  } catch (err) {
    console.error('addCreditsToFranchise error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding credits',
    });
  }
};

/**
 * GET /api/credits/admin/transactions/:franchiseId
 * Get all credit transactions for a specific franchise (admin only)
 * Query params: page, limit
 */
exports.getFranchiseTransactions = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'franchiseId is required',
      });
    }

    // Verify franchise exists
    const franchise = await Franchise.findById(franchiseId).select('instituteName instituteId');
    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      CreditTransaction.find({ franchise: franchiseId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('adminId', 'name email')
        .lean(),
      CreditTransaction.countDocuments({ franchise: franchiseId }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        franchise: {
          _id: franchise._id,
          instituteName: franchise.instituteName,
          instituteId: franchise.instituteId,
        },
        transactions,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      },
    });
  } catch (err) {
    console.error('getFranchiseTransactions error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions',
    });
  }
};

/**
 * GET /api/credits/admin/franchises
 * Get credit summary for all franchises (admin only)
 * Returns: franchise details with current credits and total used
 */
exports.getAllFranchiseCredits = async (req, res) => {
  try {
    const franchises = await Franchise.find()
      .select('_id instituteId instituteName ownerName credits totalCreditsUsed status email contact')
      .sort({ instituteName: 1 })
      .lean();

    // Get transaction counts for each franchise
    const franchiseIds = franchises.map((f) => f._id.toString());
    const transactionCounts = await CreditTransaction.aggregate([
      { $match: { franchise: { $in: franchiseIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$franchise', count: { $sum: 1 } } },
    ]);

    // Create a map for quick lookup
    const countMap = new Map();
    transactionCounts.forEach((tc) => {
      countMap.set(tc._id.toString(), tc.count);
    });

    // Format response
    const data = franchises.map((franchise) => ({
      _id: franchise._id,
      instituteId: franchise.instituteId,
      instituteName: franchise.instituteName,
      ownerName: franchise.ownerName,
      status: franchise.status,
      email: franchise.email,
      contact: franchise.contact,
      credits: franchise.credits || 0,
      totalCreditsUsed: franchise.totalCreditsUsed || 0,
      transactionCount: countMap.get(franchise._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('getAllFranchiseCredits error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching franchise credits',
    });
  }
};

/**
 * =========================================================
 * FRANCHISE FUNCTIONS
 * =========================================================
 */

/**
 * GET /api/credits/my-credits
 * Get current franchise's credit info
 * Returns: credits, totalCreditsUsed
 */
exports.getMyCredits = async (req, res) => {
  try {
    const franchise = req.franchise;

    if (!franchise) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: franchise._id,
        instituteId: franchise.instituteId,
        instituteName: franchise.instituteName,
        credits: franchise.credits || 0,
        totalCreditsUsed: franchise.totalCreditsUsed || 0,
      },
    });
  } catch (err) {
    console.error('getMyCredits error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching credits',
    });
  }
};

/**
 * GET /api/credits/my-transactions
 * Get current franchise's transaction history
 * Query params: page, limit
 */
exports.getMyTransactions = async (req, res) => {
  try {
    const franchise = req.franchise;

    if (!franchise) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      CreditTransaction.find({ franchise: franchise._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CreditTransaction.countDocuments({ franchise: franchise._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      },
    });
  } catch (err) {
    console.error('getMyTransactions error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions',
    });
  }
};

/**
 * GET /api/credits/pricing
 * Get current credit pricing for all features
 * Returns: creditPricing object from Settings
 */
exports.getCreditPricing = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    return res.status(200).json({
      success: true,
      data: settings.creditPricing || {
        student: 10,
        course: 20,
        subject: 5,
        result: 15,
        certificate: 25,
      },
    });
  } catch (err) {
    console.error('getCreditPricing error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching credit pricing',
    });
  }
};

/**
 * GET /api/credits/topup-info
 * Get QR code and instructions for credit top-up
 * Returns: creditTopupQR, creditTopupInstructions from Settings
 */
exports.getTopupInfo = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    return res.status(200).json({
      success: true,
      data: {
        creditTopupQR: settings.creditTopupQR || {
          url: '',
          publicId: '',
          uploadedAt: null,
        },
        creditTopupInstructions: settings.creditTopupInstructions || '',
      },
    });
  } catch (err) {
    console.error('getTopupInfo error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching top-up info',
    });
  }
};
