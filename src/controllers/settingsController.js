// src/controllers/settingsController.js
const Settings = require("../models/Settings");
const cloudinary = require("../config/cloudinary");

/**
 * Get settings (public)
 * GET /api/settings
 */
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

/**
 * Update social links (admin only)
 * PUT /api/settings/social
 */
const updateSocialLinks = async (req, res) => {
  try {
    const { socialLinks } = req.body;

    if (!socialLinks || typeof socialLinks !== "object") {
      return res.status(400).json({
        success: false,
        message: "Social links object is required",
      });
    }

    const settings = await Settings.getSettings();

    // Update only the provided fields
    if (socialLinks.instagram !== undefined) {
      settings.socialLinks.instagram = socialLinks.instagram;
    }
    if (socialLinks.twitter !== undefined) {
      settings.socialLinks.twitter = socialLinks.twitter;
    }
    if (socialLinks.facebook !== undefined) {
      settings.socialLinks.facebook = socialLinks.facebook;
    }
    if (socialLinks.youtube !== undefined) {
      settings.socialLinks.youtube = socialLinks.youtube;
    }

    await settings.save();

    res.json({
      success: true,
      message: "Social links updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating social links:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update social links",
    });
  }
};

/**
 * Update credit pricing (admin only)
 * PUT /api/settings/credit-pricing
 */
const updateCreditPricing = async (req, res) => {
  try {
    const { student, course, subject, result, certificate } = req.body;

    // Validate all values are positive numbers
    const pricing = { student, course, subject, result, certificate };
    for (const [key, value] of Object.entries(pricing)) {
      if (value === undefined || value === null) {
        return res.status(400).json({
          success: false,
          message: `${key} pricing is required`,
        });
      }
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({
          success: false,
          message: `${key} pricing must be a positive number`,
        });
      }
    }

    const settings = await Settings.getSettings();

    // Update credit pricing
    settings.creditPricing = {
      student,
      course,
      subject,
      result,
      certificate,
    };

    await settings.save();

    res.json({
      success: true,
      message: "Credit pricing updated successfully",
      data: settings.creditPricing,
    });
  } catch (error) {
    console.error("Error updating credit pricing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update credit pricing",
    });
  }
};

/**
 * Upload QR code image for credit top-up (admin only)
 * POST /api/settings/credit-topup-qr
 */
const uploadCreditTopupQR = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({
        success: false,
        message: "QR code image is required",
      });
    }

    const settings = await Settings.getSettings();

    // Delete old QR code from Cloudinary if exists
    if (settings.creditTopupQR?.publicId) {
      try {
        await cloudinary.uploader.destroy(settings.creditTopupQR.publicId);
      } catch (err) {
        console.warn("Failed to delete old QR code from Cloudinary:", err);
      }
    }

    // Update with new QR code info
    settings.creditTopupQR = {
      url: req.file.path,
      publicId: req.file.filename || req.file.public_id || "",
      uploadedAt: new Date(),
    };

    await settings.save();

    res.json({
      success: true,
      message: "Credit top-up QR code uploaded successfully",
      data: settings.creditTopupQR,
    });
  } catch (error) {
    console.error("Error uploading credit top-up QR code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload QR code",
    });
  }
};

/**
 * Delete QR code from Cloudinary (admin only)
 * DELETE /api/settings/credit-topup-qr
 */
const deleteCreditTopupQR = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // Delete from Cloudinary if publicId exists
    if (settings.creditTopupQR?.publicId) {
      try {
        await cloudinary.uploader.destroy(settings.creditTopupQR.publicId);
      } catch (err) {
        console.warn("Failed to delete QR code from Cloudinary:", err);
      }
    }

    // Clear QR code fields
    settings.creditTopupQR = {
      url: "",
      publicId: "",
      uploadedAt: null,
    };

    await settings.save();

    res.json({
      success: true,
      message: "Credit top-up QR code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting credit top-up QR code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete QR code",
    });
  }
};

/**
 * Update credit top-up instructions (admin only)
 * PUT /api/settings/credit-topup-instructions
 */
const updateCreditTopupInstructions = async (req, res) => {
  try {
    const { instructions } = req.body;

    if (instructions === undefined) {
      return res.status(400).json({
        success: false,
        message: "Instructions are required",
      });
    }

    const settings = await Settings.getSettings();
    settings.creditTopupInstructions = instructions;
    await settings.save();

    res.json({
      success: true,
      message: "Credit top-up instructions updated successfully",
      data: { creditTopupInstructions: settings.creditTopupInstructions },
    });
  } catch (error) {
    console.error("Error updating credit top-up instructions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update instructions",
    });
  }
};

/**
 * Get all credit-related settings (public)
 * GET /api/settings/credit
 */
const getCreditSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.json({
      success: true,
      data: {
        creditPricing: settings.creditPricing,
        creditTopupQR: settings.creditTopupQR,
        creditTopupInstructions: settings.creditTopupInstructions,
      },
    });
  } catch (error) {
    console.error("Error fetching credit settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch credit settings",
    });
  }
};

module.exports = {
  getSettings,
  updateSocialLinks,
  updateCreditPricing,
  uploadCreditTopupQR,
  deleteCreditTopupQR,
  updateCreditTopupInstructions,
  getCreditSettings,
};
