// server/src/controllers/assignmentController.js
const fs = require('fs/promises');
const path = require('path');
const Assignment = require('../models/Assignment');

const ASSIGNMENTS_DIR = path.join(__dirname, '..', 'uploads', 'assignments');

/**
 * Helper to build full file path for stored filename
 */
function resolveFilePath(fileName) {
  return path.join(ASSIGNMENTS_DIR, fileName);
}

/**
 * POST /api/assignments
 * Multipart form-data: file (field "file"), description
 */
exports.createAssignment = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'File is required (field "file")' });
    }

    const { description = '' } = req.body || {};
    const file = req.file;

    const doc = await Assignment.create({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      description,
      uploadedBy: req.user?._id || null,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('createAssignment error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error creating assignment' });
  }
};

/**
 * GET /api/assignments
 * List all assignments (admin)
 */
exports.getAssignments = async (req, res) => {
  try {
    const list = await Assignment.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('getAssignments error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error fetching assignments' });
  }
};

/**
 * PUT /api/assignments/:id
 * Update description (and optionally file if you extend later)
 */
exports.updateAssignment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid assignment id' });

    const update = {};
    if (typeof req.body.description === 'string') {
      update.description = req.body.description;
    }

    // If later you want to support re-uploading the file, you can handle req.file here

    const doc = await Assignment.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('updateAssignment error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error updating assignment' });
  }
};

/**
 * DELETE /api/assignments/:id
 * Remove assignment record and delete file from disk
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid assignment id' });

    const doc = await Assignment.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });
    }

    // Try to delete the file from disk
    if (doc.fileName) {
      const filePath = resolveFilePath(doc.fileName);
      try {
        await fs.unlink(filePath);
      } catch (e) {
        // Don't blow up if file is already missing
        console.warn(
          'deleteAssignment: failed to unlink file',
          filePath,
          e?.message || e
        );
      }
    }

    await Assignment.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    console.error('deleteAssignment error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error deleting assignment' });
  }
};

/**
 * GET /api/assignments/:id/download
 * Stream file to browser as download
 */
exports.downloadAssignment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid assignment id' });

    const doc = await Assignment.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });
    }

    const filePath = resolveFilePath(doc.fileName);
    return res.download(filePath, doc.originalName || 'assignment');
  } catch (err) {
    console.error('downloadAssignment error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error downloading assignment' });
  }
};
