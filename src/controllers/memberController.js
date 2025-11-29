// server/src/controllers/memberController.js
const Member = require('../models/Member');

// GET /api/members  (optional ?search= and ?active=true/false)
exports.listMembers = async (req, res, next) => {
  try {
    const { search, active } = req.query;
    const query = {};

    if (typeof active !== 'undefined') {
      if (active === 'true') query.isActive = true;
      if (active === 'false') query.isActive = false;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { designation: { $regex: term, $options: 'i' } },
      ];
    }

    const members = await Member.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: members });
  } catch (err) {
    console.error('listMembers error:', err);
    return next(err);
  }
};

// GET /api/members/:id
exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: 'Member not found' });
    }
    return res.json({ success: true, data: member });
  } catch (err) {
    console.error('getMember error:', err);
    return next(err);
  }
};

// POST /api/members
exports.createMember = async (req, res, next) => {
  try {
    const { name, designation, photoUrl, order, isActive } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' });
    }

    const member = await Member.create({
      name: name.trim(),
      designation: (designation || '').trim(),
      photoUrl: (photoUrl || '').trim(),
      order: typeof order === 'number' ? order : Number(order) || 0,
      isActive:
        typeof isActive === 'boolean'
          ? isActive
          : isActive === 'false'
          ? false
          : true,
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
    const { name, designation, photoUrl, order, isActive } = req.body;

    const update = {};
    if (typeof name !== 'undefined') update.name = name.trim();
    if (typeof designation !== 'undefined')
      update.designation = (designation || '').trim();
    if (typeof photoUrl !== 'undefined')
      update.photoUrl = (photoUrl || '').trim();
    if (typeof order !== 'undefined')
      update.order = Number(order) || 0;
    if (typeof isActive !== 'undefined') {
      update.isActive =
        typeof isActive === 'boolean'
          ? isActive
          : isActive === 'false'
          ? false
          : true;
    }

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

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
    const member = await Member.findByIdAndDelete(req.params.id);
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
