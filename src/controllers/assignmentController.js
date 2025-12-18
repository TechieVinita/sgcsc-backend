// server/src/controllers/assignmentController.js
const Assignment = require("../models/Assignment");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

/**
 * POST /api/assignments
 * Multipart form-data:
 *  - file (required)
 *  - description (optional)
 */
exports.createAssignment = async (req, res) => {
  try {
    if (!req.file?.path || !req.file?.filename) {
      return res.status(400).json({
        success: false,
        message: 'File is required (field name: "file")',
      });
    }

    const { description = "" } = req.body || {};

    const doc = await Assignment.create({
      originalName: req.file.originalname,
      fileUrl: req.file.path,          // 🔥 Cloudinary URL
      publicId: req.file.filename,     // 🔥 Cloudinary public_id
      mimeType: req.file.mimetype,
      size: req.file.size,
      description: description.trim(),
      uploadedBy: req.user?._id || null,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createAssignment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error creating assignment" });
  }
};

/**
 * GET /api/assignments
 * List assignments
 */
exports.getAssignments = async (req, res) => {
  try {
    const list = await Assignment.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("getAssignments error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching assignments" });
  }
};

/**
 * PUT /api/assignments/:id
 * Update description only
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assignment id" });
    }

    const update = {};
    if (typeof req.body.description === "string") {
      update.description = req.body.description.trim();
    }

    const doc = await Assignment.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateAssignment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error updating assignment" });
  }
};

/**
 * DELETE /api/assignments/:id
 * Deletes DB record AND Cloudinary file
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assignment id" });
    }

    const doc = await Assignment.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    // Delete file from Cloudinary
    if (doc.publicId) {
      try {
        await cloudinary.uploader.destroy(doc.publicId, {
          resource_type: "raw",
        });
      } catch (cloudErr) {
        console.warn(
          "Cloudinary delete failed:",
          cloudErr?.message || cloudErr
        );
      }
    }

    await Assignment.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Assignment deleted",
    });
  } catch (err) {
    console.error("deleteAssignment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting assignment" });
  }
};

/**
 * GET /api/assignments/:id/download
 * Redirects to Cloudinary URL
 */
exports.downloadAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assignment id" });
    }

    const doc = await Assignment.findById(id).lean();
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    // Let browser download directly from Cloudinary
    return res.redirect(doc.fileUrl);
  } catch (err) {
    console.error("downloadAssignment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error downloading assignment" });
  }
};
