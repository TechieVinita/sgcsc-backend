const express = require("express");
const router = express.Router();
const franchiseAuth = require("../middleware/franchiseAuthMiddleware");
const FranchiseCertificate = require("../models/FranchiseCertificate");
const Franchise = require("../models/Franchise");

// All routes require franchise authentication
router.use(franchiseAuth);

// Get franchise certificates created by this franchise
router.get("/", async (req, res) => {
  try {
    // Find certificates created by this franchise (you might want to add a franchise field to track this)
    // For now, return all franchise certificates since this is franchise-specific content
    const certificates = await FranchiseCertificate.find({}).sort({ createdAt: -1 });
    res.json(certificates);
  } catch (err) {
    console.error("Franchise get franchise certificates error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single franchise certificate
router.get("/:id", async (req, res) => {
  try {
    const certificate = await FranchiseCertificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Franchise certificate not found" });
    }
    res.json(certificate);
  } catch (err) {
    console.error("Franchise get franchise certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create franchise certificate
router.post("/", async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id);
    const certificateData = {
      ...req.body,
      // Optionally track which franchise created it
      // createdByFranchise: req.franchise._id
    };

    const certificate = new FranchiseCertificate(certificateData);
    await certificate.save();

    res.status(201).json(certificate);
  } catch (err) {
    console.error("Franchise create franchise certificate error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Update franchise certificate
router.put("/:id", async (req, res) => {
  try {
    const certificate = await FranchiseCertificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({ message: "Franchise certificate not found" });
    }

    res.json(certificate);
  } catch (err) {
    console.error("Franchise update franchise certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete franchise certificate
router.delete("/:id", async (req, res) => {
  try {
    const certificate = await FranchiseCertificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: "Franchise certificate not found" });
    }

    res.json({ message: "Franchise certificate deleted successfully" });
  } catch (err) {
    console.error("Franchise delete franchise certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;