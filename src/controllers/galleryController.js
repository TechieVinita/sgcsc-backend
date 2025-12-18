const Gallery = require("../models/Gallery");

/* ---------- POST /api/gallery ---------- */
exports.addGallery = async (req, res) => {
  try {
    const { title, category = "gallery" } = req.body;

    if (!title || !req.file?.path) {
      return res.status(400).json({
        success: false,
        message: "title and image are required",
      });
    }

    const doc = await Gallery.create({
      title: title.trim(),
      category: category.trim(),
      image: req.file.path, // Cloudinary URL
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("addGallery error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- GET /api/gallery ---------- */
exports.getGallery = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

    const items = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    console.error("getGallery error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- PUT /api/gallery/:id ---------- */
exports.updateGallery = async (req, res) => {
  try {
    const doc = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateGallery error:", err);
    res.status(500).json({ success: false });
  }
};

/* ---------- DELETE /api/gallery/:id ---------- */
exports.deleteGallery = async (req, res) => {
  try {
    const doc = await Gallery.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Gallery item deleted" });
  } catch (err) {
    console.error("deleteGallery error:", err);
    res.status(500).json({ success: false });
  }
};
