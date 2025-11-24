// Mark.js
const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rollNo: { type: String, trim: true },
  exam: { type: String, required: true },
  session: { type: String, default: '' }, // academic session
  subject: { type: String, required: true },
  maxMarks: { type: Number, default: 100, min: 0 },
  marksObtained: { type: Number, required: true, min: 0 },
  grade: { type: String, default: '' },
}, {
  timestamps: true
});

// virtual percentage
markSchema.virtual('percentage').get(function(){
  if (!this.maxMarks) return null;
  return (this.marksObtained / this.maxMarks) * 100;
});

module.exports = mongoose.model('Mark', markSchema);
