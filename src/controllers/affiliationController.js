// src/controllers/affiliationController.js
const Affiliation = require('../models/Affiliation');

/**
 * Create affiliation
 * Expects body: { name, subtitle, link, img } where img is a public URL (returned by /api/uploads)
 */
exports.createAffiliation = async (req, res) => {
  try {
    const { name, subtitle, link, img, order } = req.body || {};
    if (!name || !img) return res.status(400).json({ success: false, message: 'name and img are required' });

    const doc = await Affiliation.create({ name, subtitle, img, link, order: order || 0 });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('createAffiliation error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAffiliations = async (req, res) => {
  try {
    const items = await Affiliation.find().sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getAffiliations error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateAffiliation = async (req, res) => {
  try {
    const id = req.params.id;
    const update = req.body || {};
    const doc = await Affiliation.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('updateAffiliation error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteAffiliation = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Affiliation.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteAffiliation error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
