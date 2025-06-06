const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  url: { type: String, required: true },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);