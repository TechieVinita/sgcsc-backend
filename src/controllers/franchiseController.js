const bcrypt = require('bcryptjs');
const Franchise = require('../models/Franchise');
const Student = require('../models/Student');

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeBool = (v) =>
  v === true || ['true', '1', 'yes', 'on'].includes(String(v).toLowerCase());

const hashPassword = async (raw) => {
  if (!raw) return undefined;
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(raw, salt);
};

const fileFrom = (req, field) =>
  req.files?.[field]?.[0]?.filename || null;



exports.createFranchisePublic = async (req, res) => {
  try {
    const files = req.files || {};

    const franchise = await Franchise.create({
      ...req.body,

      // FILES
      aadharFront: files.aadharFront?.[0]?.filename,
      aadharBack: files.aadharBack?.[0]?.filename,
      panImage: files.panImage?.[0]?.filename,
      institutePhoto: files.institutePhoto?.[0]?.filename,
      ownerSign: files.ownerSign?.[0]?.filename,
      ownerImage: files.ownerImage?.[0]?.filename,
      certificateFile: files.certificateFile?.[0]?.filename,

      // IMPORTANT: mark as pending / inactive
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Franchise registration submitted successfully',
      data: franchise,
    });
  } catch (err) {
    console.error('public franchise create error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Franchise registration failed',
    });
  }
};



/* =========================================================
   CREATE FRANCHISE
   ========================================================= */
exports.createFranchise = async (req, res) => {
  try {
    const {
      instituteId,
      ownerName,
      instituteName,
      username,
      password,
      ...rest
    } = req.body;

    if (!instituteId || !ownerName || !instituteName) {
      return res.status(400).json({
        success: false,
        message: 'Institute ID, Owner Name and Institute Name are required',
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const uname = username.trim().toLowerCase();

    // 🔒 Final authority username check
    const [studentExists, franchiseExists] = await Promise.all([
      Student.findOne({ username: uname }),
      Franchise.findOne({ username: uname }),
    ]);

    if (studentExists || franchiseExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }

    const passwordHash = await hashPassword(password);

    const franchise = await Franchise.create({
      instituteId: instituteId.trim(),
      ownerName: ownerName.trim(),
      instituteName: instituteName.trim(),
      username: uname,
      passwordHash,

      ...rest,

      hasReception: normalizeBool(rest.hasReception),
      hasStaffRoom: normalizeBool(rest.hasStaffRoom),
      hasWaterSupply: normalizeBool(rest.hasWaterSupply),
      hasToilet: normalizeBool(rest.hasToilet),

      aadharFront: fileFrom(req, 'aadharFront'),
      aadharBack: fileFrom(req, 'aadharBack'),
      panImage: fileFrom(req, 'panImage'),
      institutePhoto: fileFrom(req, 'institutePhoto'),
      ownerSign: fileFrom(req, 'ownerSign'),
      ownerImage: fileFrom(req, 'ownerImage'),
      certificateFile: fileFrom(req, 'certificateFile'),
    });

    return res.status(201).json({
      success: true,
      data: franchise,
    });
  } catch (err) {
    // 🔥 Mongo duplicate key safety
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate value detected',
        field: Object.keys(err.keyPattern || {}),
      });
    }

    console.error('createFranchise error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create franchise',
    });
  }
};

/* =========================================================
   CHECK USERNAME UNIQUENESS
   ========================================================= */
exports.checkUsernameUnique = async (req, res) => {
  try {
    const username = String(req.query.username || '').trim().toLowerCase();

    if (!username) {
      return res.json({
        success: true,
        exists: false,
      });
    }

    const [student, franchise] = await Promise.all([
      Student.findOne({ username }),
      Franchise.findOne({ username }),
    ]);

    return res.json({
      success: true,
      exists: Boolean(student || franchise),
    });
  } catch (err) {
    console.error('checkUsernameUnique error:', err);
    return res.status(500).json({
      success: false,
      message: 'Username check failed',
    });
  }
};

/* =========================================================
   LIST FRANCHISES
   ========================================================= */
exports.getFranchises = async (_req, res) => {
  try {
    const list = await Franchise.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    console.error('getFranchises error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load franchises',
    });
  }
};

/* =========================================================
   GET SINGLE FRANCHISE
   ========================================================= */
exports.getFranchise = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id).select(
      '-passwordHash'
    );

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    return res.json({
      success: true,
      data: franchise,
    });
  } catch (err) {
    console.error('getFranchise error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load franchise',
    });
  }
};

/* =========================================================
   UPDATE FRANCHISE
   ========================================================= */
exports.updateFranchise = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.password) {
      updates.passwordHash = await hashPassword(updates.password);
      delete updates.password;
    }

    updates.hasReception = normalizeBool(updates.hasReception);
    updates.hasStaffRoom = normalizeBool(updates.hasStaffRoom);
    updates.hasWaterSupply = normalizeBool(updates.hasWaterSupply);
    updates.hasToilet = normalizeBool(updates.hasToilet);

    // overwrite uploaded files only if provided
    [
      'aadharFront',
      'aadharBack',
      'panImage',
      'institutePhoto',
      'ownerSign',
      'ownerImage',
      'certificateFile',
    ].forEach((f) => {
      const file = fileFrom(req, f);
      if (file) updates[f] = file;
    });

    const updated = await Franchise.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-passwordHash');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error('updateFranchise error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update franchise',
    });
  }
};

/* =========================================================
   DELETE FRANCHISE
   ========================================================= */
exports.deleteFranchise = async (req, res) => {
  try {
    const deleted = await Franchise.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    return res.json({
      success: true,
      message: 'Franchise deleted successfully',
    });
  } catch (err) {
    console.error('deleteFranchise error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete franchise',
    });
  }
};
