// server/src/controllers/franchiseController.js
const bcrypt = require('bcryptjs');
const Franchise = require('../models/Franchise');
const Student = require('../models/Student');

function normalizeBool(v) {
  if (v === true || v === false) return v;
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'on';
}

async function maybeHashPassword(raw) {
  if (!raw) return undefined;
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(raw, salt);
}

function fileFrom(req, field) {
  const files = req.files || {};
  if (!files[field] || !files[field][0]) return undefined;
  return files[field][0].filename;
}

/* ---------- POST /api/franchises ---------- */
exports.createFranchise = async (req, res, next) => {
  try {
    const {
      instituteId,
      ownerName,
      instituteName,
      dob,
      aadharNumber,
      panNumber,
      address,
      state,
      district,
      operatorsCount,
      classRooms,
      totalComputers,
      centerSpace,
      whatsapp,
      contact,
      email,
      ownerQualification,
      hasReception,
      hasStaffRoom,
      hasWaterSupply,
      hasToilet,
      username,
      password,
    } = req.body;

    if (!instituteId || !ownerName || !instituteName) {
      return res.status(400).json({
        success: false,
        message:
          'instituteId, ownerName and instituteName are required fields.',
      });
    }

    const passwordHash = await maybeHashPassword(password);

    const franchise = await Franchise.create({
      instituteId: instituteId.trim(),
      ownerName: ownerName.trim(),
      instituteName: instituteName.trim(),
      dob: dob || null,
      aadharNumber,
      panNumber,
      address,
      state,
      district,
      operatorsCount: operatorsCount ? Number(operatorsCount) : undefined,
      classRooms: classRooms ? Number(classRooms) : undefined,
      totalComputers: totalComputers ? Number(totalComputers) : undefined,
      centerSpace,
      whatsapp,
      contact,
      email,
      ownerQualification,
      hasReception: normalizeBool(hasReception),
      hasStaffRoom: normalizeBool(hasStaffRoom),
      hasWaterSupply: normalizeBool(hasWaterSupply),
      hasToilet: normalizeBool(hasToilet),
      username,
      passwordHash,

      aadharFront: fileFrom(req, 'aadharFront'),
      aadharBack: fileFrom(req, 'aadharBack'),
      panImage: fileFrom(req, 'panImage'),
      institutePhoto: fileFrom(req, 'institutePhoto'),
      ownerSign: fileFrom(req, 'ownerSign'),
      ownerImage: fileFrom(req, 'ownerImage'),
      certificateFile: fileFrom(req, 'certificateFile'),
    });

    return res.status(201).json({ success: true, data: franchise });
  } catch (err) {
    console.error('createFranchise error:', err);
    return next(err);
  }
};

/* ---------- GET /api/franchises ---------- */
exports.getFranchises = async (req, res, next) => {
  try {
    const franchises = await Franchise.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: franchises });
  } catch (err) {
    console.error('getFranchises error:', err);
    return next(err);
  }
};

/* ---------- GET /api/franchises/:id ---------- */
exports.getFranchise = async (req, res, next) => {
  try {
    const franchise = await Franchise.findById(req.params.id);
    if (!franchise) {
      return res
        .status(404)
        .json({ success: false, message: 'Franchise not found' });
    }
    return res.json({ success: true, data: franchise });
  } catch (err) {
    console.error('getFranchise error:', err);
    return next(err);
  }
};

/* ---------- PUT /api/franchises/:id ---------- */
exports.updateFranchise = async (req, res, next) => {
  try {
    const {
      instituteId,
      ownerName,
      instituteName,
      dob,
      aadharNumber,
      panNumber,
      address,
      state,
      district,
      operatorsCount,
      classRooms,
      totalComputers,
      centerSpace,
      whatsapp,
      contact,
      email,
      ownerQualification,
      hasReception,
      hasStaffRoom,
      hasWaterSupply,
      hasToilet,
      username,
      password,
    } = req.body;

    const update = {
      instituteId,
      ownerName,
      instituteName,
      dob: dob || null,
      aadharNumber,
      panNumber,
      address,
      state,
      district,
      operatorsCount: operatorsCount ? Number(operatorsCount) : undefined,
      classRooms: classRooms ? Number(classRooms) : undefined,
      totalComputers: totalComputers ? Number(totalComputers) : undefined,
      centerSpace,
      whatsapp,
      contact,
      email,
      ownerQualification,
      hasReception:
        hasReception !== undefined ? normalizeBool(hasReception) : undefined,
      hasStaffRoom:
        hasStaffRoom !== undefined ? normalizeBool(hasStaffRoom) : undefined,
      hasWaterSupply:
        hasWaterSupply !== undefined
          ? normalizeBool(hasWaterSupply)
          : undefined,
      hasToilet:
        hasToilet !== undefined ? normalizeBool(hasToilet) : undefined,
      username,
    };

    if (password) {
      update.passwordHash = await maybeHashPassword(password);
    }

    const maybeFile = fileFrom;
    const af = maybeFile(req, 'aadharFront');
    const ab = maybeFile(req, 'aadharBack');
    const pi = maybeFile(req, 'panImage');
    const ip = maybeFile(req, 'institutePhoto');
    const os = maybeFile(req, 'ownerSign');
    const oi = maybeFile(req, 'ownerImage');
    const cf = maybeFile(req, 'certificateFile');

    if (af) update.aadharFront = af;
    if (ab) update.aadharBack = ab;
    if (pi) update.panImage = pi;
    if (ip) update.institutePhoto = ip;
    if (os) update.ownerSign = os;
    if (oi) update.ownerImage = oi;
    if (cf) update.certificateFile = cf;

    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    const franchise = await Franchise.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!franchise) {
      return res
        .status(404)
        .json({ success: false, message: 'Franchise not found' });
    }

    return res.json({ success: true, data: franchise });
  } catch (err) {
    console.error('updateFranchise error:', err);
    return next(err);
  }
};

/* ---------- GET /api/franchises/check-username ---------- */
exports.checkUsernameUnique = async (req, res, next) => {
  try {
    const username = (req.query.username || '').trim();
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'username query parameter is required',
      });
    }

    const uname = username.toLowerCase();

    const [student, franchise] = await Promise.all([
      // students may or may not have username; this will just return null if field doesn't exist
      Student.findOne({
        username: { $regex: `^${uname}$`, $options: 'i' },
      }),
      Franchise.findOne({
        username: { $regex: `^${uname}$`, $options: 'i' },
      }),
    ]);

    const exists = !!(student || franchise);

    return res.json({ success: true, data: { exists } });
  } catch (err) {
    console.error('checkUsernameUnique error:', err);
    return next(err);
  }
};

/* ---------- DELETE /api/franchises/:id ---------- */
exports.deleteFranchise = async (req, res, next) => {
  try {
    const franchise = await Franchise.findByIdAndDelete(req.params.id);
    if (!franchise) {
      return res
        .status(404)
        .json({ success: false, message: 'Franchise not found' });
    }
    return res.json({ success: true, message: 'Franchise deleted' });
  } catch (err) {
    console.error('deleteFranchise error:', err);
    return next(err);
  }
};
