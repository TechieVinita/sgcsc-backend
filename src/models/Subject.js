// server/src/models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    // Reference to Course collection
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    // Subject name (e.g., "Computer Basics")
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Maximum marks for this subject in exam/marksheet
    maxMarks: {
      type: Number,
      default: 0,
    },

    // Minimum passing marks
    minMarks: {
      type: Number,
      default: 0,
    },

    // For soft-hiding without deleting
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
