// src/controllers/settingsController.js
const Settings = require("../models/Settings");

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

module.exports = {
  getSettings,
  updateSocialLinks,
};
