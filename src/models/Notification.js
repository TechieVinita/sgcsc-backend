const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: { type: String, enum: ['email', 'sms', 'both', 'site'], default: 'site' },
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // optional
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
