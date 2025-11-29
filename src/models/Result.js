// server/src/models/Result.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    enrollmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    // optional extra fields you might want later
    declared: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// convenience for UI
resultSchema.index({ enrollmentNumber: 1, rollNo: 1, course: 1 });

resultSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Result', resultSchema);
