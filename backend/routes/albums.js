const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Album = require('../models/Album');

// Crear nuevo álbum
router.post('/', auth, async (req, res) => {
  try {
    const album = new Album({
      title: req.body.title,
      creator: req.user._id,
      images: req.body.images || []
    });
    
    await album.save();
    res.status(201).send(album);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Obtener álbumes del usuario
router.get('/my-albums', auth, async (req, res) => {
  try {
    const albums = await Album.find({ creator: req.user._id });
    res.send(albums);
  } catch (error) {
    res.status(500).send();
  }
});