// server/src/controllers/studyMaterialController.js
const path = require('path');
const fs = require('fs/promises');
const StudyMaterial = require('../models/StudyMaterial');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function filePathFor(filename) {
  if (!filename) return null;
  return path.join(UPLOADS_DIR, filename);
}

/* ================= CREATE ================= */
exports.createMaterial = async (req, res) => {
  try {
    const { name, description = '', type = 'other', linkUrl = '' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!req.file && !linkUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either file upload or link URL is required',
      });
    }

    const doc = await StudyMaterial.create({
      name: name.trim(),
      description: description.trim(),
      type,
      linkUrl: linkUrl.trim(),
      fileName: req.file ? req.file.filename : '',
      mimeType: req.file ? req.file.mimetype : '',
      sizeBytes: req.file ? req.file.size : 0,
      uploadedBy: req.user?._id || null,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('createMaterial:', err);
    res.status(500).json({ success: false, message: 'Create failed' });
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
    console.error('listMaterials:', err);
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
};

/* ================= UPDATE (🔥 MISSING BEFORE) ================= */
exports.updateMaterial = async (req, res) => {
  try {
    const doc = await StudyMaterial.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const { name, description, type, linkUrl, isActive } = req.body;

    if (name !== undefined) doc.name = name.trim();
    if (description !== undefined) doc.description = description.trim();
    if (type !== undefined) doc.type = type;
    if (linkUrl !== undefined) doc.linkUrl = linkUrl.trim();
    if (isActive !== undefined) doc.isActive = !!isActive;

    if (req.file) {
      if (doc.fileName) {
        try {
          await fs.unlink(filePathFor(doc.fileName));
        } catch {}
      }

      doc.fileName = req.file.filename;
      doc.mimeType = req.file.mimetype;
      doc.sizeBytes = req.file.size;
    }

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('updateMaterial:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

/* ================= DELETE ================= */
exports.deleteMaterial = async (req, res) => {
  try {
    const doc = await StudyMaterial.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    if (doc.fileName) {
      try {
        await fs.unlink(filePathFor(doc.fileName));
      } catch {}
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteMaterial:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

/* ================= DOWNLOAD (FIXED) ================= */
exports.downloadMaterial = async (req, res) => {
  try {
    const doc = await StudyMaterial.findById(req.params.id);
    if (!doc || !doc.fileName) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = filePathFor(doc.fileName);

    res.download(
      filePath,
      doc.fileName,
      { headers: { 'Content-Type': doc.mimeType } }
    );
  } catch (err) {
    console.error('downloadMaterial:', err);
    res.status(500).json({ success: false, message: 'Download failed' });
  }
};
