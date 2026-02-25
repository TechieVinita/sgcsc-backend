// server/src/controllers/galleryController.js

const Gallery = require("../models/Gallery");

/* =====================================================
   POST /api/gallery
   Create new gallery image
   ===================================================== */
exports.addGallery = async (req, res) => {
  try {
    const { title, category = "gallery" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!req.file?.path) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const doc = await Gallery.create({
      title: title.trim(),
      category: category.trim(),
      image: req.file.path, // Cloudinary or upload path
    });

    return res.status(201).json({
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("addGallery error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create gallery item",
    });
  }
};

/* =====================================================
   GET /api/gallery
   Get all gallery images (optional category filter)
   ===================================================== */
exports.getGallery = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

    const items = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: items,
    });
  } catch (err) {
    console.error("getGallery error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery",
    });
  }
};

/* =====================================================
   GET /api/gallery/:id
   Get single gallery image (EDIT PRELOAD)
   ===================================================== */
exports.getGalleryById = async (req, res) => {
  try {
    const doc = await Gallery.findById(req.params.id).lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("getGalleryById error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load image details",
    });
  }
};

/* =====================================================
   PUT /api/gallery/:id
   Update gallery image (title/category/image optional)
   ===================================================== */
exports.updateGallery = async (req, res) => {
  try {
    const { title, category } = req.body;

    const update = {};

    if (title !== undefined) update.title = title.trim();
    if (category !== undefined) update.category = category.trim();

    // Only update image if a new file is uploaded
    if (req.file?.path) {
      update.image = req.file.path;
    }

    const doc = await Gallery.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("updateGallery error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update gallery image",
    });
  }
};

/* =====================================================
   DELETE /api/gallery/:id
   Delete gallery image
   ===================================================== */
exports.deleteGallery = async (req, res) => {
  try {
    const doc = await Gallery.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    return res.json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (err) {
    console.error("deleteGallery error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
    });
  }
};
