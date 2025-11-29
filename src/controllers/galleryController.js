// server/src/controllers/galleryController.js
const path = require('path');
const fs = require('fs/promises');
const Gallery = require('../models/Gallery');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function filePathFor(filename) {
  if (!filename) return null;
  return path.join(UPLOADS_DIR, filename);
}

/**
 * POST /api/gallery
 * Admin-only
 * Accepts multipart form-data:
 *  - image (file, optional)
 *  - title (string, required)
 *  - category (string, optional)
 *  - url (string, optional external image URL)
 */
exports.addGallery = async (req, res) => {
  try {
    const body = req.body || {};
    const title = (body.title || body.name || '').trim();
    const category = (body.category || 'gallery').trim();
    const externalUrl = (body.url || '').trim();

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: 'title (name) is required' });
    }

    let storedImage = null;

    if (req.file && req.file.filename) {
      storedImage = req.file.filename; // local upload in /uploads
    } else if (externalUrl) {
      storedImage = externalUrl; // full URL
    }

    if (!storedImage) {
      return res.status(400).json({
        success: false,
        message: 'Image file or external URL is required',
      });
    }

    const doc = await Gallery.create({
      title,
      image: storedImage,
      category,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('galleryController.addGallery error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error adding gallery image',
    });
  }
};

/**
 * GET /api/gallery
 * Public - returns array of gallery items
 * Optional query: ?category=gallery
 */
exports.getGallery = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = String(req.query.category).trim();
    }

    const items = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('galleryController.getGallery error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
    });
  }
};

/**
 * PUT /api/gallery/:id
 * Admin-only
 * Update title / category (no file upload here)
 */
exports.updateGallery = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, name, category } = req.body || {};

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const update = {};
    if (title || name) {
      update.title = (title || name).trim();
    }
    if (category) {
      update.category = String(category).trim();
    }

    const doc = await Gallery.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Gallery item not found' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('galleryController.updateGallery error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error updating gallery image' });
  }
};

/**
 * DELETE /api/gallery/:id
 * Admin-only. Removes DB record and deletes uploaded file from disk if applicable.
 */
exports.deleteGallery = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const doc = await Gallery.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Gallery item not found' });
    }

    // If we stored a local filename, remove it from uploads dir.
    // External URLs (starting with http) are not deleted.
    if (
      doc.image &&
      typeof doc.image === 'string' &&
      !doc.image.startsWith('http')
    ) {
      const fp = filePathFor(doc.image);
      try {
        await fs.unlink(fp);
      } catch (unlinkErr) {
        console.warn(
          'galleryController.deleteGallery: failed to remove file:',
          fp,
          unlinkErr?.message || unlinkErr
        );
      }
    }

    await Gallery.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Gallery image deleted',
    });
  } catch (err) {
    console.error('galleryController.deleteGallery error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error deleting gallery image' });
  }
};
