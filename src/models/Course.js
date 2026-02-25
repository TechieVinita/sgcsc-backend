// server/src/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    duration: { type: String, default: '' }, // e.g., "1 Year", "6 Months"
    // image: {
    //   type: String,
    //   default:
    //     '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png', // placeholder / filename
    // },
    // price: { type: Number, default: 0, min: 0 },
    type: {
      type: String,
      enum: ['long', 'short', 'certificate'],
      default: 'long',
    },
    active: { type: Boolean, default: true },
    subjects: [
  {
    name: { type: String, required: true },
    hasPractical: { type: Boolean, default: false }
  }
]

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: readableDuration for UI
courseSchema.virtual('readableDuration').get(function () {
  if (this.duration) return this.duration;
  if (this.type === 'long') return '1 Year';
  if (this.type === 'short') return '6 Months';
  return '3 Months';
});

// Virtual alias "name" -> title (for compatibility)
courseSchema.virtual('name').get(function () {
  return this.title;
});

module.exports = mongoose.model('Course', courseSchema);
