const mongoose = require('mongoose');

const ProvidersSchema = new mongoose.Schema({
  name: String,
  url: String,
  description: String,
  tag: String,
  country: String,
  logo: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Providers', ProvidersSchema);
