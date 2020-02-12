const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  fbId: String,
  token: String,
  displayName: String,
  bio: String,
  shortDescription: String,
  enabled: Boolean,
  image: String,
}, {
  timestamps: true,
});

UserSchema.index({ displayName: 'text' });

module.exports = mongoose.model('User', UserSchema);
