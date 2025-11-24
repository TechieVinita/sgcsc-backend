// server/src/controllers/galleryController.js
const path = require('path');
const fs = require('fs/promises');
const Gallery = require('../models/Gallery');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Helper to build absolute file path for a stored filename
 */
function filePathFor(filename) {
  if (!filename) return null;
  return path.join(UPLOADS_DIR, filename);
}

/**
 * POST /api/gallery
 * Admin-only. Accepts multipart form-data with field `image` (file) and optional `title`.
 * Stores DB record with filename and returns the created document.
 */
exports.addGallery = async (req, res) => {
  try {
    const title = (req.body?.title || '').trim();

    // Accept either uploaded file or an external url (optional)
    if (!req.file && !req.body?.url) {
      return res.status(400).json({ success: false, message: 'Image file (field "image") or url required' });
    }

    const galleryDoc = new Gallery({
      title: title || undefined,
      // store filename if file uploaded, otherwise store url string
      image: req.file ? req.file.filename : req.body.url
    });

    await galleryDoc.save();

    return res.status(201).json({ success: true, data: galleryDoc });
  } catch (err) {
    console.error('galleryController.addGallery error:', err);
    return res.status(500).json({ success: false, message: 'Error adding gallery image' });
  }
};

/**
 * GET /api/gallery
 * Public - returns array of gallery items, newest first.
 */
exports.getGallery = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('galleryController.getGallery error:', err);
    return res.status(500).json({ success: false, message: 'Error fetching gallery images' });
  }
};

/**
 * DELETE /api/gallery/:id
 * Admin-only. Removes DB record and deletes uploaded file from disk if applicable.
 */
exports.deleteGallery = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid id' });

    const doc = await Gallery.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Gallery item not found' });

    // If we stored a filename (not a full URL), remove it from uploads dir
    if (doc.image && typeof doc.image === 'string' && !doc.image.startsWith('http')) {
      const fp = filePathFor(doc.image);
      try {
        await fs.unlink(fp);
        // eslint-disable-next-line no-empty
      } catch (unlinkErr) {
        // don't fail if file missing; just log
        console.warn('galleryController.deleteGallery: failed to remove file:', fp, unlinkErr?.message || unlinkErr);
      }
    }

    await Gallery.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Gallery image deleted' });
  } catch (err) {
    console.error('galleryController.deleteGallery error:', err);
    return res.status(500).json({ success: false, message: 'Error deleting gallery image' });
  }
};
