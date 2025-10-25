const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: String, required: true },
  semester: { type: Number, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
