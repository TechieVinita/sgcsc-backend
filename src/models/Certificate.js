// server/src/models/Certificate.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    sessionFrom: {
      type: Number,
      required: true,
    },
    sessionTo: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    enrollmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    certificateNumber: {
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
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ name: 1 });
certificateSchema.index({ courseName: 1 });

certificateSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Certificate', certificateSchema);
