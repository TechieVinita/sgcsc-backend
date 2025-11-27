// src/controllers/memberController.js
const Member = require('../models/Member');

exports.createMember = async (req, res) => {
  try {
    const { name, role, bio, img, order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const doc = await Member.create({ name, role, bio, img, order: order || 0 });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('createMember error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const items = await Member.find().sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getMembers error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Member.findByIdAndUpdate(id, req.body, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('updateMember error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Member.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteMember error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
