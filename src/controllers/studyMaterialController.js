// server/src/controllers/studyMaterialController.js
const path = require('path');
const fs = require('fs/promises');
const StudyMaterial = require('../models/StudyMaterial');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function filePathFor(filename) {
  if (!filename) return null;
  return path.join(UPLOADS_DIR, filename);
}

/**
 * POST /api/study-material
 * multipart/form-data:
 *  - file (optional)
 *  - name (required)
 *  - description
 *  - type: pdf|word|ppt|link|other
 *  - linkUrl (optional)
 */
exports.createMaterial = async (req, res) => {
  try {
    const { name, description = '', type = 'other', linkUrl = '' } =
      req.body || {};

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' });
    }

    if (!req.file && !linkUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either a file upload or a link URL is required',
      });
    }

    const doc = new StudyMaterial({
      name: name.trim(),
      description: description.trim(),
      type,
      linkUrl: linkUrl.trim(),
      fileName: req.file ? req.file.filename : '',
      mimeType: req.file ? req.file.mimetype : '',
      sizeBytes: req.file ? req.file.size : 0,
      uploadedBy: req.user?._id || null, // if verifyAdmin attaches user
    });

    await doc.save();

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('createMaterial error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while creating material' });
  }
};

/**
 * GET /api/study-material
 * Admin list
 */
exports.listMaterials = async (req, res) => {
  try {
    const items = await StudyMaterial.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('listMaterials error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while listing materials' });
  }
};

/**
 * PUT /api/study-material/:id
 * Update metadata, and optionally replace file
 */
exports.updateMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const existing = await StudyMaterial.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: 'Study material not found' });
    }

    const { name, description, type, linkUrl, isActive } = req.body || {};

    if (name !== undefined && name.trim()) {
      existing.name = name.trim();
    }
    if (description !== undefined) {
      existing.description = String(description || '').trim();
    }
    if (type !== undefined) {
      existing.type = type;
    }
    if (linkUrl !== undefined) {
      existing.linkUrl = String(linkUrl || '').trim();
    }
    if (isActive !== undefined) {
      existing.isActive = !!isActive;
    }

    // If new file uploaded, delete previous (if any) and update fields
    if (req.file) {
      if (existing.fileName && !existing.fileName.startsWith('http')) {
        const fp = filePathFor(existing.fileName);
        try {
          await fs.unlink(fp);
        } catch (err) {
          console.warn(
            'updateMaterial: failed to delete old file:',
            fp,
            err?.message || err
          );
        }
      }

      existing.fileName = req.file.filename;
      existing.mimeType = req.file.mimetype;
      existing.sizeBytes = req.file.size;
    }

    await existing.save();

    return res.json({ success: true, data: existing });
  } catch (err) {
    console.error('updateMaterial error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while updating material' });
  }
};

/**
 * DELETE /api/study-material/:id
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const doc = await StudyMaterial.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Study material not found' });
    }

    if (doc.fileName && !doc.fileName.startsWith('http')) {
      const fp = filePathFor(doc.fileName);
      try {
        await fs.unlink(fp);
      } catch (err) {
        console.warn(
          'deleteMaterial: failed to remove file:',
          fp,
          err?.message || err
        );
      }
    }

    await StudyMaterial.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteMaterial error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while deleting material' });
  }
};

/**
 * GET /api/study-material/:id/download
 * Streams the file as attachment
 */
exports.downloadMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const doc = await StudyMaterial.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Study material not found' });
    }

    if (!doc.fileName) {
      return res
        .status(400)
        .json({ success: false, message: 'No uploaded file for this material' });
    }

    const fp = filePathFor(doc.fileName);
    return res.download(fp, doc.name || 'material');
  } catch (err) {
    console.error('downloadMaterial error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while downloading file' });
  }
};
