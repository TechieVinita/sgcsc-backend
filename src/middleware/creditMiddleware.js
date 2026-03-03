const Franchise = require('../models/Franchise');
const CreditTransaction = require('../models/CreditTransaction');
const Settings = require('../models/Settings');

/**
 * Helper function to get the cost for a specific feature from Settings
 * @param {string} feature - Feature name ('student', 'course', 'subject', 'result', 'certificate')
 * @returns {Promise<number>} - The cost for the feature
 */
const getFeatureCost = async (feature) => {
  const settings = await Settings.getSettings();
  
  // Default costs if not configured in settings
  const defaultCosts = {
    student: 1,
    course: 1,
    subject: 1,
    result: 1,
    certificate: 1,
  };

  // Check if creditPricing exists in settings
  if (settings.creditPricing && typeof settings.creditPricing === 'object') {
    return settings.creditPricing[feature] ?? defaultCosts[feature] ?? 1;
  }

  return defaultCosts[feature] ?? 1;
};

/**
 * Middleware factory to check if franchise has sufficient credits
 * @param {string} feature - Feature name ('student', 'course', 'subject', 'result', 'certificate')
 * @returns {Function} Express middleware
 */
const checkCredits = (feature) => {
  return async (req, res, next) => {
    try {
      // Get franchise from request (set by franchiseAuthMiddleware)
      const franchise = req.franchise;

      if (!franchise) {
        return res.status(401).json({
          success: false,
          message: 'Franchise not authenticated',
        });
      }

      // Get the cost for this feature
      const cost = await getFeatureCost(feature);

      // Check if franchise has sufficient credits
      const availableCredits = franchise.credits || 0;

      if (availableCredits < cost) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient credits',
          required: cost,
          available: availableCredits,
          feature,
        });
      }

      // Attach cost to request for later use
      req.creditCost = cost;

      next();
    } catch (error) {
      console.error('[checkCredits] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking credits',
        error: error.message,
      });
    }
  };
};

/**
 * Middleware factory to deduct credits after successful operation
 * @param {string} feature - Feature name ('student', 'course', 'subject', 'result', 'certificate')
 * @param {string} referenceModel - Reference model name ('Student', 'Course', 'Subject', 'Result', 'Certificate')
 * @param {Function} getReferenceIdFn - Function to extract reference ID from req (receives req, returns ObjectId or string)
 * @returns {Function} Express middleware
 */
const deductCredits = (feature, referenceModel, getReferenceIdFn) => {
  return async (req, res, next) => {
    try {
      // Get franchise from request (set by franchiseAuthMiddleware)
      const franchise = req.franchise;

      if (!franchise) {
        return res.status(401).json({
          success: false,
          message: 'Franchise not authenticated',
        });
      }

      // Get the cost (either from previous checkCredits middleware or fetch it)
      const cost = req.creditCost || (await getFeatureCost(feature));

      // Get reference ID using the provided function
      const referenceId = getReferenceIdFn ? getReferenceIdFn(req) : null;

      // Calculate new balance
      const currentCredits = franchise.credits || 0;
      const newBalance = Math.max(0, currentCredits - cost);
      const currentTotalUsed = franchise.totalCreditsUsed || 0;

      // Update franchise credits
      const updatedFranchise = await Franchise.findByIdAndUpdate(
        franchise._id,
        {
          $set: {
            credits: newBalance,
            totalCreditsUsed: currentTotalUsed + cost,
          },
        },
        { new: true }
      );

      // Create credit transaction record
      const transaction = await CreditTransaction.create({
        franchise: franchise._id,
        type: 'deduction',
        amount: cost,
        feature,
        description: `${feature} creation - ${cost} credits deducted`,
        balanceAfter: newBalance,
        referenceId: referenceId || undefined,
        referenceModel: referenceId ? referenceModel : undefined,
        status: 'completed',
      });

      // Attach transaction info to request
      req.creditTransaction = {
        transactionId: transaction._id,
        amount: cost,
        balanceAfter: newBalance,
        feature,
        referenceModel: referenceId ? referenceModel : undefined,
        referenceId: referenceId || undefined,
      };

      // Update req.franchise with new values for subsequent middleware
      req.franchise = updatedFranchise;

      next();
    } catch (error) {
      console.error('[deductCredits] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deducting credits',
        error: error.message,
      });
    }
  };
};

module.exports = {
  checkCredits,
  deductCredits,
  getFeatureCost,
};
