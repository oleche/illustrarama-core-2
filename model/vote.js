const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  type: String,
  url: String,
  value: Number,
  userEmail: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vote', VoteSchema);
