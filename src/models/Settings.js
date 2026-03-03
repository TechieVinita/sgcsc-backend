// src/models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    socialLinks: {
      instagram: {
        type: String,
        default: "",
        trim: true,
      },
      twitter: {
        type: String,
        default: "",
        trim: true,
      },
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      youtube: {
        type: String,
        default: "",
        trim: true,
      },
    },
    creditPricing: {
      student: {
        type: Number,
        default: 10,
        min: 0,
      },
      course: {
        type: Number,
        default: 20,
        min: 0,
      },
      subject: {
        type: Number,
        default: 5,
        min: 0,
      },
      result: {
        type: Number,
        default: 15,
        min: 0,
      },
      certificate: {
        type: Number,
        default: 25,
        min: 0,
      },
    },
    creditTopupQR: {
      url: {
        type: String,
        default: "",
        trim: true,
      },
      publicId: {
        type: String,
        default: "",
        trim: true,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
    },
    creditTopupInstructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
