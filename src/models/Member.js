// src/models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    // Required name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Designation / role, optional
    designation: {
      type: String,
      trim: true,
      default: '',
    },

    // Old fields kept for compatibility with existing code / site
    // (we simply don't use them on the admin UI anymore)
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },

    order: {
      type: Number,
      default: 0,
    },

    // Whether to show on the public site
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Member', memberSchema);
