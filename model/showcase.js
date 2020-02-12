const mongoose = require('mongoose');

const ShowcaseSchema = new mongoose.Schema({
  name: String,
  url: String,
  description: String,
  flagged: Boolean,
  tag: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Showcase', ShowcaseSchema);
