const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  images: [{
    url: String,
    caption: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, { 
  validate: {
    validator: function() { return this.images.length <= 20; },
    message: 'Un álbum no puede contener más de 20 imágenes'
  }
});

module.exports = mongoose.model('Album', AlbumSchema);