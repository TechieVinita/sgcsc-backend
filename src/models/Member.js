// src/models/Member.js
const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '', trim: true },
    bio: { type: String, default: '' },
    img: { type: String, default: '' }, // public URL
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }, // can hide without deleting
  },
  { timestamps: true }
);

MemberSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Member', MemberSchema);
