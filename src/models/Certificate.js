// server/src/models/Certificate.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    enrollmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster lookups
certificateSchema.index({ enrollmentNumber: 1 });

certificateSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Certificate', certificateSchema);
