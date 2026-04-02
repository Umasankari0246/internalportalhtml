const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['builder', 'upload'], default: 'builder' },
  // Builder fields
  title: String,
  bodyContent: String,
  imageUrl: String,
  buttonText: String,
  buttonLink: String,
  // Final HTML
  html: { type: String, required: true },
  // For uploaded templates
  uploadedImagePath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
