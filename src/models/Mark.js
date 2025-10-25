const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rollNo: String, // duplicate for easy lookup
  exam: String,   // e.g., "Sem 1 2025"
  session: String,
  subject: String,
  maxMarks: Number,
  marksObtained: Number,
  grade: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mark', markSchema);
