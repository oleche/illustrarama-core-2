const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: String,
  content: String,
  source: String,
  lang: String,
  img: String,
  origin: String,
  published: Date,
  categories: [String],
  keywords: [String],
  keywordsString: String,
}, {
  timestamps: true,
});

NewsSchema.index({ title: 'text', content: 'text', keywordsString: 'text' });

module.exports = mongoose.model('News', NewsSchema);
