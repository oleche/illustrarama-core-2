const mongoose = require('mongoose');

const ReferenceSchema = new mongoose.Schema({
  type: String,
  contentId: String,
  url: String,
  description: String,
}, {
  timestamps: true,
});

ReferenceSchema.index({ contentId: 'text' });

module.exports = mongoose.model('References', ReferenceSchema);
