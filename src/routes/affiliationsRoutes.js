// src/routes/affiliationsRoutes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Try to load Affiliation model if you created one. If not, we'll fall back to an in-memory/sample list.
let Affiliation = null;
try {
  Affiliation = require('../models/Affiliation'); // optional: implement src/models/Affiliation.js (mongoose)
} catch (err) {
  Affiliation = null;
  // no model found -> use fallback
}

// Optional auth middleware placeholder for admin-protected routes
// const { protectAdmin } = require('../middleware/authMiddleware');

/**
 * Helper - sample list (used only if no DB model exists)
 */
const SAMPLE = [
  { id: 'aff1', name: 'ABC Institute', subtitle: 'Partner Institution', img: 'https://picsum.photos/seed/abc/800/600', link: 'https://example.com/abc' },
  { id: 'aff2', name: 'XYZ University', subtitle: 'Accredited University', img: 'https://picsum.photos/seed/xyz/800/600', link: 'https://example.com/xyz' },
  { id: 'aff3', name: 'LMN Education Board', subtitle: 'Affiliated Board', img: 'https://picsum.photos/seed/lmn/800/600', link: 'https://example.com/lmn' },
  { id: 'aff4', name: 'PQR Academy', subtitle: 'Collaborating Academy', img: 'https://picsum.photos/seed/pqr/800/600', link: 'https://example.com/pqr' },
  { id: 'aff5', name: 'EduLink India', subtitle: 'Training Partner', img: 'https://picsum.photos/seed/edulink/800/600', link: 'https://example.com/edulink' },
  { id: 'aff6', name: 'TechBridge Global', subtitle: 'IT Associate', img: 'https://picsum.photos/seed/techbridge/800/600', link: 'https://example.com/techbridge' },
];

/**
 * GET /api/affiliations
 * - returns an array of affiliation objects
 * - if DB model exists, returns DB rows; otherwise returns SAMPLE
 */
router.get('/', async (req, res) => {
  try {
    if (Affiliation) {
      const items = await Affiliation.find().sort({ order: 1, createdAt: -1 }).lean();
      return res.json(items || []);
    } else {
      return res.json(SAMPLE);
    }
  } catch (err) {
    console.error('GET /api/affiliations error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/affiliations
 * - body: { name, subtitle, img, link, order }
 * - creates a new affiliation (DB) or returns 501 if DB not available
 * - protect this route with admin auth in production
 */
router.post('/', /* protectAdmin, */ async (req, res) => {
  try {
    const { name, subtitle = '', img, link = '', order = 0 } = req.body || {};

    if (!name || !img) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name and img are required.' });
    }

    if (!Affiliation) {
      return res.status(501).json({ success: false, message: 'Affiliations persistence not enabled on server. Create Affiliation model to enable.' });
    }

    const doc = new Affiliation({ name, subtitle, img, link, order });
    await doc.save();
    return res.status(201).json({ success: true, item: doc });
  } catch (err) {
    console.error('POST /api/affiliations error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/affiliations/:id
 * - deletes affiliation by id (DB only)
 * - protect with admin auth
 */
router.delete('/:id', /* protectAdmin, */ async (req, res) => {
  try {
    const id = req.params.id;
    if (!Affiliation) return res.status(501).json({ success: false, message: 'Affiliations persistence not enabled' });

    const deleted = await Affiliation.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/affiliations error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
