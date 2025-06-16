import express from 'express';
import {
  getCommentsForImage,
  addCommentToImage,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/image/:imageId', protect, getCommentsForImage);
router.post('/image/:imageId', protect, addCommentToImage);
router.delete('/:id', protect, deleteComment);

export default router;