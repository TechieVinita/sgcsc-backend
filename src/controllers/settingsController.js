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

/**
 * Get certificate template config (public)
 * GET /api/settings/certificate-template
 */
const getCertificateTemplateConfig = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // Default configurations for each template type
    const defaults = {
      typingCertificate: {
        studentName: { x: 50, y: 15, font: "bold 80px serif", color: "#000000", align: "center" },
        fatherHusbandName: { x: 30, y: 22, font: "60px serif", color: "#000000", align: "left" },
        motherName: { x: 70, y: 22, font: "60px serif", color: "#000000", align: "left" },
        enrollmentNumber: { x: 50, y: 29, font: "60px serif", color: "#000000", align: "center" },
        computerTyping: { x: 50, y: 35, font: "60px serif", color: "#000000", align: "center" },
        certificateNo: { x: 30, y: 42, font: "50px serif", color: "#000000", align: "left" },
        dateOfIssue: { x: 70, y: 42, font: "50px serif", color: "#000000", align: "left" },
        sessionFrom: { x: 30, y: 48, font: "50px serif", color: "#000000", align: "left" },
        sessionTo: { x: 70, y: 48, font: "50px serif", color: "#000000", align: "left" },
        grade: { x: 50, y: 54, font: "bold 60px serif", color: "#000000", align: "center" },
        studyCentre: { x: 50, y: 90, font: "50px serif", color: "#000000", align: "center" },
        wordsPerMinute: { x: 50, y: 60, font: "50px serif", color: "#000000", align: "center" },
      },
      franchiseCertificate: {
        trainingCentreName: { x: 50, y: 20, font: "bold 70px serif", color: "#000000", align: "center" },
        applicantName: { x: 50, y: 30, font: "60px serif", color: "#000000", align: "center" },
        atcCode: { x: 50, y: 40, font: "50px serif", color: "#000000", align: "center" },
        atcCode2: { x: 50, y: 45, font: "50px serif", color: "#000000", align: "center" },
        dateOfIssue: { x: 30, y: 50, font: "50px serif", color: "#000000", align: "left" },
        dateOfRenewal: { x: 70, y: 50, font: "50px serif", color: "#000000", align: "left" },
      },
      marksheet: {
        enrollmentNo: { x: 30, y: 15, font: "bold 60px serif", color: "#000000", align: "left" },
        rollNumber: { x: 73, y: 28.5, font: "bold 60px serif", color: "#000000", align: "left" },
        studentName: { x: 30, y: 25.5, font: "bold 60px serif", color: "#000000", align: "left" },
        fatherName: { x: 30, y: 28.4, font: "60px serif", color: "#000000", align: "left" },
        motherName: { x: 30, y: 31.3, font: "60px serif", color: "#000000", align: "left" },
        dob: { x: 73, y: 31.2, font: "60px serif", color: "#000000", align: "left" },
        courseName: { x: 30, y: 37, font: "60px serif", color: "#000000", align: "left" },
        courseDuration: { x: 73, y: 25.5, font: "60px serif", color: "#000000", align: "left" },
        coursePeriodFrom: { x: 30, y: 34, font: "60px serif", color: "#000000", align: "left" },
        coursePeriodTo: { x: 49, y: 34, font: "60px serif", color: "#000000", align: "left" },
        instituteName: { x: 30, y: 39.8, font: "60px serif", color: "#000000", align: "left" },
        totalPercentage: { x: 80, y: 77.7, font: "150px serif", color: "#000000", align: "left" },
        overallGrade: { x: 56, y: 77.7, font: "150px serif", color: "#000000", align: "left" },
        grandTotal: { x: 29, y: 77.7, font: "150px serif", color: "#000000", align: "left" },
        subjectsStartY: 48,
        subjectRowHeight: 15,
      },
    };

    // Merge existing config with defaults
    const existingConfig = settings.certificateTemplateConfig || {};
    const mergedConfig = {
      typingCertificate: { ...defaults.typingCertificate, ...(existingConfig.typingCertificate || {}) },
      franchiseCertificate: { ...defaults.franchiseCertificate, ...(existingConfig.franchiseCertificate || {}) },
      marksheet: { ...defaults.marksheet, ...(existingConfig.marksheet || {}) },
    };

    res.json({
      success: true,
      data: mergedConfig,
    });
  } catch (error) {
    console.error("Error fetching certificate template config:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate template config",
    });
  }
};

/**
 * Update certificate template config (admin only)
 * PUT /api/settings/certificate-template
 */
const updateCertificateTemplateConfig = async (req, res) => {
  try {
    const { templateConfig } = req.body;

    if (!templateConfig || typeof templateConfig !== "object") {
      return res.status(400).json({
        success: false,
        message: "Template config object is required",
      });
    }

    const settings = await Settings.getSettings();

    // Validate and merge each template type
    const validTemplates = ["typingCertificate", "franchiseCertificate", "marksheet"];
    for (const [templateType, fields] of Object.entries(templateConfig)) {
      if (!validTemplates.includes(templateType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid template type: ${templateType}`,
        });
      }
      if (fields && typeof fields === "object") {
        for (const [fieldName, config] of Object.entries(fields)) {
          if (config && typeof config === "object") {
            if (config.x !== undefined && (config.x < 0 || config.x > 100)) {
              return res.status(400).json({
                success: false,
                message: `Invalid x value for ${templateType}.${fieldName}: must be 0-100`,
              });
            }
            if (config.y !== undefined && (config.y < 0 || config.y > 100)) {
              return res.status(400).json({
                success: false,
                message: `Invalid y value for ${templateType}.${fieldName}: must be 0-100`,
              });
            }
          }
        }
      }
    }

    // Merge with existing config
    settings.certificateTemplateConfig = {
      ...settings.certificateTemplateConfig,
      ...templateConfig,
    };

    await settings.save();

    res.json({
      success: true,
      message: "Certificate template config updated successfully",
      data: settings.certificateTemplateConfig,
    });
  } catch (error) {
    console.error("Error updating certificate template config:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update certificate template config",
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
  getCertificateTemplateConfig,
  updateCertificateTemplateConfig,
};
