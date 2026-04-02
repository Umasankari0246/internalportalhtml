const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  status: { type: String, enum: ['draft', 'sent', 'sending', 'failed'], default: 'draft' },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  totalContacts: { type: Number, default: 0 },
  errors: [String],
  sentAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
