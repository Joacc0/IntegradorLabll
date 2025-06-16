import { Router } from 'express';
import {
  getAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addImageToAlbum,
  deleteImageFromAlbum,
  shareAlbum
} from '../controllers/albumController.js'; // Extensión .js obligatoria
import { protect } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación (middleware protect)
router.use(protect);

// Rutas principales
router.route('/')
  .get(getAlbums)
  .post(createAlbum);

router.route('/:id')
  .get(getAlbum)
  .put(updateAlbum)
  .delete(deleteAlbum);

// Rutas para imágenes
router.route('/:id/images')
  .post(addImageToAlbum);

router.route('/:albumId/images/:imageId')
  .delete(deleteImageFromAlbum);

// Ruta para compartir
router.route('/:id/share')
  .post(shareAlbum);

// Ruta para álbumes de usuario específico
router.get('/user/:userId', getAlbums);

export default router;