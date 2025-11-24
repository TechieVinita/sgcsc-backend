// Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  duration: { type: String, default: '' }, // e.g., "1 Year", "6 Months"
  image: { type: String, default: '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png' }, // can be filename or absolute URL
  price: { type: Number, default: 0, min: 0 },
  type: { type: String, enum: ['long','short','certificate'], default: 'long' },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Add a small virtual useful on UI: readableDuration
courseSchema.virtual('readableDuration').get(function() {
  return this.duration || (this.type === 'long' ? '1 Year' : this.type === 'short' ? '6 Months' : '3 Months');
});

module.exports = mongoose.model('Course', courseSchema);
