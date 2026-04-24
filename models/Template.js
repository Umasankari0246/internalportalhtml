const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['builder', 'upload'], default: 'builder' },
  // Legacy builder fields
  title: String,
  bodyContent: String,
  imageUrl: String,
  buttonText: String,
  buttonLink: String,
  // Visual builder fields
  builderElements: [mongoose.Schema.Types.Mixed],
  builderBackground: String,
  // Final HTML
  html: { type: String, required: true },
  // For uploaded templates
  uploadedImagePath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
