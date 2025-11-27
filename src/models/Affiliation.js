// src/models/Affiliation.js
const mongoose = require('mongoose');

const AffiliationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  subtitle: { type: String, default: '', trim: true, maxlength: 250 },
  img: { type: String, required: true, trim: true }, // absolute URL (http(s)://...)
  link: { type: String, default: '', trim: true },
  order: { type: Number, default: 0, index: true },
}, {
  timestamps: true,
  versionKey: false,
});

// toJSON / toObject transform: return id instead of _id, remove internal fields
AffiliationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    // keep only consumer-friendly fields
    return ret;
  }
});

// optional static helper to reorder items (call when you implement admin ordering)
AffiliationSchema.statics.reorder = async function (orderedIds = []) {
  // orderedIds: array of affiliation IDs in desired order
  if (!Array.isArray(orderedIds)) return;
  const bulk = orderedIds.map((id, idx) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order: idx } } }
  }));
  if (bulk.length) await this.bulkWrite(bulk);
};

module.exports = mongoose.model('Affiliation', AffiliationSchema);
