// Student.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  password: { type: String }, // optional if you don't need student login; hashed if present
  dob: { type: Date },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  semester: { type: Number, default: 1 },
  feesPaid: { type: Boolean, default: false },
  contact: { type: String, trim: true },
  address: { type: String, trim: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// hide password when returning JSON
studentSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

studentSchema.pre('save', async function(next) {
  // only hash when password provided and modified
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// compare candidate password with hash
studentSchema.methods.comparePassword = function(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
