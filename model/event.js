const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: String,
  url: String,
  description: String,
  startDate: Date,
  endDate: Date,
  image: String,
  published: Boolean,
  tag: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', EventSchema);
