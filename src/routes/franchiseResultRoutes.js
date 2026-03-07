const express = require("express");
const router = express.Router();
const franchiseAuth = require("../middleware/franchiseAuthMiddleware");
const Result = require("../models/Result");
const Franchise = require("../models/Franchise");
const Settings = require("../models/Settings");
const CreditTransaction = require("../models/CreditTransaction");

// All routes require franchise authentication
router.use(franchiseAuth);

// Helper function to deduct credits
async function deductCredits(franchiseId, amount, description) {
  const franchise = await Franchise.findById(franchiseId);
  const currentCredits = franchise.credits || 0;
  
  if (currentCredits >= amount) {
    franchise.credits = currentCredits - amount;
    franchise.totalCreditsUsed = (franchise.totalCreditsUsed || 0) + amount;
    await franchise.save();

    await CreditTransaction.create({
      franchise: franchiseId,
      type: 'deduction',
      amount: amount,
      description: description,
      balanceAfter: franchise.credits,
    });
    return true;
  }
  return false;
}

// Get results for this franchise's students
router.get("/", async (req, res) => {
  try {
    // Get franchise's institute name
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    // Find results for students from this franchise
    const results = await Result.find({ centerName }).lean();
    res.json(results);
  } catch (err) {
    console.error("Franchise get results error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single result
router.get("/:id", async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    const result = await Result.findOne({
      _id: req.params.id,
      centerName: centerName
    }).lean();
    
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    
    res.json(result);
  } catch (err) {
    console.error("Franchise get result error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create result for this franchise - DEDUCT 15 CREDITS
router.post("/", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const creditPricing = settings.creditPricing || {};
    const resultCost = creditPricing.result || 15;

    // Check if franchise has enough credits
    const franchise = await Franchise.findById(req.franchise._id);
    if ((franchise.credits || 0) < resultCost) {
      return res.status(400).json({ 
        message: `Insufficient credits. You need ${resultCost} credits to add a result.` 
      });
    }

    const resultData = {
      ...req.body,
      centerName: franchise.instituteName,
    };

    const result = new Result(resultData);
    await result.save();

    // Deduct credits
    await deductCredits(
      req.franchise._id, 
      resultCost, 
      `Result added for: ${resultData.studentName || resultData.rollNumber}`
    );

    res.status(201).json(result);
  } catch (err) {
    console.error("Franchise create result error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Update result
router.put("/:id", async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    const result = await Result.findOneAndUpdate(
      { 
        _id: req.params.id,
        centerName: centerName
      },
      req.body,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (err) {
    console.error("Franchise update result error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete result
router.delete("/:id", async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    const result = await Result.findOneAndDelete({
      _id: req.params.id,
      centerName: centerName
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    console.error("Franchise delete result error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
