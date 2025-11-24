// server/src/models/Franchise.js
const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
  ownerName: String,
  instituteName: String,
  dob: Date,
  aadharFront: String,
  aadharBack: String,
  institutePhoto: String,
  ownerSign: String,
  ownerImage: String,
  address: String,
  state: String,
  district: String,
  teachersCount: Number,
  classRooms: Number,
  computers: Number,
  whatsapp: String,
  contact: String,
  email: String,
  ownerQualification: String,
  staffRoom: Boolean,
  waterSupply: Boolean,
  toilet: Boolean,
  username: String,
  passwordHash: String // store hashed password if needed
}, { timestamps: true });

module.exports = mongoose.model('Franchise', franchiseSchema);
