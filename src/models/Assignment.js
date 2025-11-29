// server/src/models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true, trim: true }, // original filename
    fileName: { type: String, required: true, trim: true },     // stored filename on disk
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // bytes
    description: { type: String, default: '', trim: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
  },
  { timestamps: true }
);

// Convenience virtual for download path (relative to API)
assignmentSchema.virtual('downloadUrl').get(function () {
  // files are stored under /uploads/assignments/<fileName>
  return `/uploads/assignments/${this.fileName}`;
});

assignmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
