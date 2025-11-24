// Result.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  semester: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 0, max: 100 },
  exam: { type: String, default: '' }, // e.g., "Midterm 2025"
  grade: { type: String, default: '' },
  declared: { type: Boolean, default: false }, // show on public site only if declared
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, {
  timestamps: true
});

// helper: compute percentage or grade logic can be added here or in service
resultSchema.methods.getPercentage = function() {
  // If max marks ever needed, change model to store maxMarks; for now marks are percent-like
  return this.marks;
};

module.exports = mongoose.model('Result', resultSchema);
