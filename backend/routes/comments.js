const express = require('express');
const router = express.Router();
const {
  getCommentsForImage,
  addCommentToImage,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/image/:imageId', protect, getCommentsForImage);
router.post('/image/:imageId', protect, addCommentToImage);
router.delete('/:id', protect, deleteComment);

module.exports = router;