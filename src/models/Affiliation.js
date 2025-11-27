// server/src/models/Affiliation.js
const mongoose = require('mongoose');

const AffiliationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    img: { type: String, required: true },  // public URL of image
    link: { type: String, default: '' },    // optional website link
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AffiliationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Affiliation', AffiliationSchema);
