// server/src/routes/affiliationsRoutes.js
const express = require('express');
const router = express.Router();

const Affiliation = require('../models/Affiliation');
const verifyAdmin = require('../middleware/authMiddleware');

// Base URL: /api/affiliations

// PUBLIC – used by public Home page
router.get('/', async (req, res) => {
  try {
    const items = await Affiliation.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(items || []);
  } catch (err) {
    console.error('GET /api/affiliations error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ADMIN – create affiliation (called from admin UploadAffiliation)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, subtitle = '', img, link = '', order = 0 } = req.body || {};

    if (!name || !img) {
      return res
        .status(400)
        .json({ success: false, message: 'name and img are required.' });
    }

    const doc = new Affiliation({ name, subtitle, img, link, order });
    await doc.save();
    res.status(201).json({ success: true, item: doc });
  } catch (err) {
    console.error('POST /api/affiliations error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ADMIN – delete
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Affiliation.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/affiliations error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
