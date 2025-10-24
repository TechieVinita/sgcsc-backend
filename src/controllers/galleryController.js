const Gallery = require('../models/Gallery');

// Add gallery image (Admin only)
exports.addGallery = async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const newGallery = new Gallery({
      title,
      image: req.file.filename
    });

    await newGallery.save();
    res.status(201).json(newGallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding gallery image' });
  }
};

// Get all gallery images (public)
exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gallery images' });
  }
};

// Delete gallery image (Admin only)
exports.deleteGallery = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery image deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting gallery image' });
  }
};
