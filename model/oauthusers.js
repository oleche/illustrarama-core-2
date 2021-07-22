const mongoose = require('mongoose');

const OauthUserSchema = new mongoose.Schema({
  email: String,
  firstname: String,
  lastname: String,
  password: String,
  username: String,
  role: String
});

module.exports = mongoose.model('oauthusers', OauthUserSchema);
