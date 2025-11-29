// server/src/models/Franchise.js
const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema(
  {
    // Basic IDs
    instituteId: {
      type: String,
      required: true,
      trim: true,
      unique: true, // comment out if this creates trouble with existing data
    },

    // Owner / Institute
    ownerName: { type: String, required: true, trim: true }, // Institute Owner Name
    instituteName: { type: String, required: true, trim: true },
    dob: Date,

    // Identity numbers
    aadharNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },

    // Uploaded files (filenames in /uploads)
    aadharFront: String,
    aadharBack: String,
    panImage: String,
    institutePhoto: String,
    ownerSign: String,
    ownerImage: String,
    certificateFile: String,

    // Infra / Address
    address: String, // full institute address
    state: String,
    district: String,
    operatorsCount: Number, // Number of Computer Operators
    classRooms: Number,
    totalComputers: Number,
    centerSpace: String, // e.g. "500 sq ft"

    // Contact
    whatsapp: String,
    contact: String,
    email: String,

    // Other details
    ownerQualification: String,
    hasReception: { type: Boolean, default: false },
    hasStaffRoom: { type: Boolean, default: false },
    hasWaterSupply: { type: Boolean, default: false },
    hasToilet: { type: Boolean, default: false },

    // Login for franchise
    username: { type: String, trim: true },
    passwordHash: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Franchise', franchiseSchema);
