const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

router.get('/', async (req, res, next) => {
  try {
    const items = await Gallery.find({ category: 'affiliation' })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: items.map(i => ({
        id: i._id,
        name: i.title,
        img: i.image,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
