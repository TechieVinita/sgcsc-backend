// server/src/models/StudyMaterial.js
const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'word', 'ppt', 'link', 'other'],
      default: 'other',
    },
    // If a file is uploaded, we store its filename in /uploads
    fileName: {
      type: String,
      default: '',
    },
    // Optional direct URL instead of uploaded file
    linkUrl: {
      type: String,
      default: '',
      trim: true,
    },
    mimeType: {
      type: String,
      default: '',
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
  },
  { timestamps: true }
);

StudyMaterialSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
