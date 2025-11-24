// Gallery.js
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, trim: true, default: 'Untitled' },
  url: { type: String, required: true }, // full URL or uploads/<filename>
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  altText: { type: String, default: '' }
}, {
  timestamps: true
});

// convenience virtual for thumbnail (you can change logic if you migrate to cloudinary)
gallerySchema.virtual('thumbnail').get(function(){
  return this.url; // if using cloud provider you'd return a resized URL
});

module.exports = mongoose.model('Gallery', gallerySchema);
