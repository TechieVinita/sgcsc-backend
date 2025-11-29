// server/src/models/Gallery.js
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    // `image` can be either:
    // - uploaded filename (stored in /uploads folder)
    // - full external URL (https://...)
    image: { type: String, trim: true, required: true },
    // Simple string category: e.g. 'gallery', 'affiliation', 'event'
    category: { type: String, trim: true, default: 'gallery' },
    altText: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

gallerySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Gallery', gallerySchema);
