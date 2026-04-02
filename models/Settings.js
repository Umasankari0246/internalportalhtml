const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'smtp', unique: true },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  senderEmail: { type: String, default: '' },
  senderName: { type: String, default: 'SHOWBAY Events' },
  appPassword: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
