// server/src/controllers/memberController.js
const Member = require('../models/Member');

// GET /api/members
exports.getMembers = async (req, res, next) => {
  try {
    const members = await Member.find({}).sort({ order: 1, createdAt: -1 });
    return res.json({ success: true, data: members });
  } catch (err) {
    console.error('getMembers error:', err);
    return next(err);
  }
};

// POST /api/members
exports.createMember = async (req, res, next) => {
  try {
    const { name, role, bio, img, order, isActive } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' });
    }

    const member = await Member.create({
      name: name.trim(),
      role: role || '',
      bio: bio || '',
      img: img || '',
      order: Number(order) || 0,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    return res.status(201).json({ success: true, data: member });
  } catch (err) {
    console.error('createMember error:', err);
    return next(err);
  }
};

// PUT /api/members/:id
exports.updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, bio, img, order, isActive } = req.body;

    const update = {
      name: name !== undefined ? name.trim() : undefined,
      role,
      bio,
      img,
      order: order !== undefined ? Number(order) : undefined,
      isActive:
        isActive !== undefined ? !!isActive : undefined,
    };

    // drop undefined fields
    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    const member = await Member.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: 'Member not found' });
    }

    return res.json({ success: true, data: member });
  } catch (err) {
    console.error('updateMember error:', err);
    return next(err);
  }
};

// DELETE /api/members/:id
exports.deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: 'Member not found' });
    }
    return res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    console.error('deleteMember error:', err);
    return next(err);
  }
};
