const mongoose = require('mongoose');

const FacebookTokenSchema = new mongoose.Schema({
  token: String,
  expiration: Date,
  expired: Boolean,
  url: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('FacebookToken', FacebookTokenSchema);
