const mongoose = require('mongoose');

const UserLinkSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  description: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserLink', UserLinkSchema);
