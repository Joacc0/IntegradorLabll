const express = require('express');
const router = express.Router();
const {
  getAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addImageToAlbum,
  deleteImageFromAlbum,
  shareAlbum
} = require('../controllers/albumController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAlbums);
router.get('/:id', protect, getAlbum);
router.post('/', protect, createAlbum);
router.put('/:id', protect, updateAlbum);
router.delete('/:id', protect, deleteAlbum);
router.post('/:id/images', protect, addImageToAlbum);
router.delete('/:albumId/images/:imageId', protect, deleteImageFromAlbum);
router.post('/:id/share', protect, shareAlbum);

// Ruta para obtener álbumes de un usuario específico
router.get('/user/:userId', protect, getAlbums);

module.exports = router;