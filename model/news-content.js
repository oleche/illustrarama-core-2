const mongoose = require('mongoose');

const NewsContentSchema = new mongoose.Schema({
  newsId: String,
  content: String,
  type: String,
  source: String,
  url: String,
  index: Number,
}, {
  timestamps: true,
});

module.exports = mongoose.model('NewsContent', NewsContentSchema);
