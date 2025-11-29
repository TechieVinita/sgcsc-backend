// server/src/models/AdmitCard.js
const mongoose = require('mongoose');

const admitCardSchema = new mongoose.Schema(
  {
    enrollmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional link to Student if you ever want it
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    // Optional reference to Course + courseName string for display
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    courseName: {
      type: String,
      trim: true,
      default: '',
    },
    examCenter: {
      type: String,
      trim: true,
      default: '',
    },
    examDate: {
      type: Date,
      required: true,
    },
    // Keep as plain string (e.g. "10:00 AM – 12:00 PM")
    examTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Quick lookup by enrollment / roll
admitCardSchema.index({ enrollmentNumber: 1 });
admitCardSchema.index({ rollNumber: 1 });

admitCardSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('AdmitCard', admitCardSchema);
