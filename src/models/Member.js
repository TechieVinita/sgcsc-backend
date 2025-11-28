// server/src/models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    img: {
      // can be full URL or filename stored in /uploads
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Member', memberSchema);
