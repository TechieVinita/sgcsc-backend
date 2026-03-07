const express = require("express");
const router = express.Router();
const franchiseAuth = require("../middleware/franchiseAuthMiddleware");
const Certificate = require("../models/Certificate");
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

// Get certificates for this franchise's students
router.get("/", async (req, res) => {
  try {
    // Get franchise's institute name
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    // Find certificates for students from this franchise
    const certificates = await Certificate.find({ centerName }).lean();
    res.json(certificates);
  } catch (err) {
    console.error("Franchise get certificates error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single certificate
router.get("/:id", async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      centerName: centerName
    }).lean();
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    res.json(certificate);
  } catch (err) {
    console.error("Franchise get certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create certificate for this franchise - DEDUCT 25 CREDITS
router.post("/", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const creditPricing = settings.creditPricing || {};
    const certificateCost = creditPricing.certificate || 25;

    // Check if franchise has enough credits
    const franchise = await Franchise.findById(req.franchise._id);
    if ((franchise.credits || 0) < certificateCost) {
      return res.status(400).json({ 
        message: `Insufficient credits. You need ${certificateCost} credits to create a certificate.` 
      });
    }

    const certificateData = {
      ...req.body,
      centerName: franchise.instituteName,
    };

    const certificate = new Certificate(certificateData);
    await certificate.save();

    // Deduct credits
    await deductCredits(
      req.franchise._id, 
      certificateCost, 
      `Certificate created for: ${certificateData.studentName || certificateData.rollNumber}`
    );

    res.status(201).json(certificate);
  } catch (err) {
    console.error("Franchise create certificate error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Update certificate
router.put("/:id", async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    const certificate = await Certificate.findOneAndUpdate(
      { 
        _id: req.params.id,
        centerName: centerName
      },
      req.body,
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json(certificate);
  } catch (err) {
    console.error("Franchise update certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete certificate
router.delete("/:id", async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id);
    const centerName = franchise.instituteName;
    
    const certificate = await Certificate.findOneAndDelete({
      _id: req.params.id,
      centerName: centerName
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({ message: "Certificate deleted successfully" });
  } catch (err) {
    console.error("Franchise delete certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
