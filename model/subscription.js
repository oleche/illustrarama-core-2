const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  email: String,
  subscribed: Date,
  status: String,
}, {
  timestamps: true,
});

SubscriptionSchema.index({ email: 'text' });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
