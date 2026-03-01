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
