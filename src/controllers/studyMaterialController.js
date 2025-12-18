// server/src/controllers/studyMaterialController.js
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const StudyMaterial = require("../models/StudyMaterial");

/* ================= CREATE ================= */
/**
 * POST /api/study-materials
 * Multipart form-data:
 *  - file (optional)
 *  - linkUrl (optional)
 *  - name (required)
 *  - description (optional)
 *  - type (optional)
 */
exports.createMaterial = async (req, res) => {
  try {
    const { name, description = "", type = "other", linkUrl = "" } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    if (!req.file?.path && !linkUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Either file upload or link URL is required",
      });
    }

    const doc = await StudyMaterial.create({
      name: name.trim(),
      description: description.trim(),
      type,
      linkUrl: linkUrl.trim(),

      // 🔥 Cloudinary fields (only if file uploaded)
      fileUrl: req.file?.path || "",
      publicId: req.file?.filename || "",
      mimeType: req.file?.mimetype || "",
      sizeBytes: req.file?.size || 0,

      uploadedBy: req.user?._id || null,
      isActive: true,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createMaterial error:", err);
    res.status(500).json({ success: false, message: "Create failed" });
  }
};

/* ================= LIST ================= */
exports.listMaterials = async (_req, res) => {
  try {
    const items = await StudyMaterial.find({})
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    console.error("listMaterials error:", err);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

/* ================= UPDATE ================= */
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id" });
    }

    const doc = await StudyMaterial.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }

    const { name, description, type, linkUrl, isActive } = req.body;

    if (name !== undefined) doc.name = name.trim();
    if (description !== undefined) doc.description = description.trim();
    if (type !== undefined) doc.type = type;
    if (linkUrl !== undefined) doc.linkUrl = linkUrl.trim();
    if (isActive !== undefined) doc.isActive = !!isActive;

    // 🔥 If new file uploaded → delete old Cloudinary file
    if (req.file?.path && req.file?.filename) {
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

      doc.fileUrl = req.file.path;
      doc.publicId = req.file.filename;
      doc.mimeType = req.file.mimetype;
      doc.sizeBytes = req.file.size;
    }

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateMaterial error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

/* ================= DELETE ================= */
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id" });
    }

    const doc = await StudyMaterial.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }

    // 🔥 Delete file from Cloudinary
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

    await doc.deleteOne();

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteMaterial error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

/* ================= DOWNLOAD ================= */
/**
 * GET /api/study-materials/:id/download
 * Redirects to Cloudinary file
 */
exports.downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id" });
    }

    const doc = await StudyMaterial.findById(id).lean();
    if (!doc || !doc.fileUrl) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // Let browser handle download
    return res.redirect(doc.fileUrl);
  } catch (err) {
    console.error("downloadMaterial error:", err);
    res.status(500).json({ success: false, message: "Download failed" });
  }
};
