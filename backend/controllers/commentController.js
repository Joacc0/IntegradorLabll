import Comment from '../models/Comment.js';
import Album from '../models/Album.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Obtener comentarios de una imagen
// @route   GET /api/comments/image/:imageId
// @access  Private (o público si el álbum es público)
export const getCommentsForImage = asyncHandler(async (req, res, next) => {
  const album = await Album.findOne({ 'images._id': req.params.imageId });
  
  if (!album) {
    return next(new ErrorResponse(`Imagen no encontrada con ID ${req.params.imageId}`, 404));
  }

  if (!album.owner.equals(req.user.id)) {
    if (!album.isPublic && (!req.user || !album.sharedWith.some(u => u.equals(req.user.id)))) {
      return next(new ErrorResponse('No autorizado para ver comentarios de esta imagen', 401));
    }
  }

  const comments = await Comment.find({ image: req.params.imageId })
    .populate('author', 'firstName lastName profileImage')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments
  });
});

// @desc    Agregar comentario a imagen
// @route   POST /api/comments/image/:imageId
// @access  Private
export const addCommentToImage = asyncHandler(async (req, res, next) => {
  const album = await Album.findOne({ 'images._id': req.params.imageId });
  
  if (!album) {
    return next(new ErrorResponse(`Imagen no encontrada con ID ${req.params.imageId}`, 404));
  }

  if (!album.owner.equals(req.user.id)) {
    if (!album.isPublic && (!req.user || !album.sharedWith.some(u => u.equals(req.user.id)))) {
      return next(new ErrorResponse('No autorizado para comentar esta imagen', 401));
    }
  }

  const comment = await Comment.create({
    content: req.body.content,
    author: req.user.id,
    image: req.params.imageId,
    album: album._id
  });

  await comment.populate('author', 'firstName lastName profileImage');

  if (!album.owner.equals(req.user.id)) {
    const notification = await Notification.create({
      recipient: album.owner,
      sender: req.user.id,
      type: 'comment',
      content: `comentó tu imagen: "${req.body.content.substring(0, 30)}${req.body.content.length > 30 ? '...' : ''}"`,
      relatedEntity: comment._id
    });

    req.io.to(album.owner.toString()).emit('newComment', {
      commentId: comment._id,
      imageId: req.params.imageId,
      commenter: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profileImage: req.user.profileImage
      },
      commentPreview: req.body.content.substring(0, 30) + (req.body.content.length > 30 ? '...' : ''),
      albumId: album._id
    });
  }

  res.status(201).json({
    success: true,
    data: comment
  });
});

// @desc    Eliminar comentario
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse(`Comentario no encontrado con ID ${req.params.id}`, 404));
  }

  const album = await Album.findOne({ 'images._id': comment.image });
  
  if (!comment.author.equals(req.user.id) && (!album || !album.owner.equals(req.user.id))) {
    return next(new ErrorResponse('No autorizado para eliminar este comentario', 401));
  }

  await comment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});