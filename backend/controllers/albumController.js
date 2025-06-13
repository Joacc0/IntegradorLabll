const Album = require('../models/Album');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtener todos los álbumes del usuario
// @route   GET /api/albums
// @route   GET /api/users/:userId/albums
// @access  Private (o público si el perfil es público)
exports.getAlbums = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  
  // Verificar permisos
  if (userId !== req.user.id) {
    const user = await User.findById(userId);
    if (!user.isPublic && (!req.user || !user.friends.some(f => f._id.equals(req.user.id)))) {
      return next(new ErrorResponse('No autorizado para ver estos álbumes', 401));
    }
  }

  const albums = await Album.find({
    $or: [
      { owner: userId },
      { sharedWith: userId }
    ]
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: albums.length,
    data: albums
  });
});

// @desc    Obtener un álbum
// @route   GET /api/albums/:id
// @access  Private (o público si el álbum es público)
exports.getAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id)
    .populate('owner', 'firstName lastName profileImage')
    .populate('sharedWith', 'firstName lastName profileImage');

  if (!album) {
    return next(new ErrorResponse(`Álbum no encontrado con ID ${req.params.id}`, 404));
  }

  // Verificar permisos
  if (!album.owner._id.equals(req.user.id)) {
    if (!album.isPublic && (!req.user || !album.sharedWith.some(u => u._id.equals(req.user.id)))) {
      return next(new ErrorResponse('No autorizado para ver este álbum', 401));
    }
  }

  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Crear álbum
// @route   POST /api/albums
// @access  Private
exports.createAlbum = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id;
  
  const album = await Album.create(req.body);

  // Si es un álbum automático por aceptar amistad, no notificar
  if (!req.body.isAutoCreated) {
    // Notificar a los usuarios compartidos si hay alguno
    if (req.body.sharedWith && req.body.sharedWith.length > 0) {
      const sharedUsers = await User.find({ _id: { $in: req.body.sharedWith } });
      
      sharedUsers.forEach(user => {
        req.io.to(user._id.toString()).emit('albumShared', {
          albumId: album._id,
          albumTitle: album.title,
          owner: {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            profileImage: req.user.profileImage
          }
        });
      });
    }
  }

  res.status(201).json({
    success: true,
    data: album
  });
});

// @desc    Actualizar álbum
// @route   PUT /api/albums/:id
// @access  Private
exports.updateAlbum = asyncHandler(async (req, res, next) => {
  let album = await Album.findById(req.params.id);

  if (!album) {
    return next(new ErrorResponse(`Álbum no encontrado con ID ${req.params.id}`, 404));
  }

  // Verificar que el usuario es dueño del álbum
  if (!album.owner.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para actualizar este álbum', 401));
  }

  // Actualizar
  album = await Album.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Eliminar álbum
// @route   DELETE /api/albums/:id
// @access  Private
exports.deleteAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id);

  if (!album) {
    return next(new ErrorResponse(`Álbum no encontrado con ID ${req.params.id}`, 404));
  }

  // Verificar que el usuario es dueño del álbum
  if (!album.owner.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para eliminar este álbum', 401));
  }

  await album.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Agregar imagen a álbum
// @route   POST /api/albums/:id/images
// @access  Private
exports.addImageToAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id);

  if (!album) {
    return next(new ErrorResponse(`Álbum no encontrado con ID ${req.params.id}`, 404));
  }

  // Verificar que el usuario es dueño del álbum
  if (!album.owner.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para agregar imágenes a este álbum', 401));
  }

  // Verificar límite de imágenes (20 por álbum)
  if (album.images.length >= 20) {
    return next(new ErrorResponse('El álbum ya tiene el máximo de 20 imágenes', 400));
  }

  // Agregar la imagen
  album.images.push(req.body);
  await album.save();

  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Eliminar imagen de álbum
// @route   DELETE /api/albums/:albumId/images/:imageId
// @access  Private
exports.deleteImageFromAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.albumId);

  if (!album) {
    return next(new ErrorResponse(`Álbum no encontrado con ID ${req.params.albumId}`, 404));
  }

  // Verificar que el usuario es dueño del álbum
  if (!album.owner.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para eliminar imágenes de este álbum', 401));
  }

  // Encontrar y eliminar la imagen
  const imageIndex = album.images.findIndex(
    img => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    return next(new ErrorResponse(`Imagen no encontrada con ID ${req.params.imageId}`, 404));
  }

  album.images.splice(imageIndex, 1);
  await album.save();

  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Compartir álbum con otro usuario
// @route   POST /api/albums/:id/share
// @access  Private
exports.shareAlbum = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const album = await Album.findById(req.params.id);

  if (!album) {
    return next(new ErrorResponse(`Álbum no encontrado con ID ${req.params.id}`, 404));
  }

  // Verificar que el usuario es dueño del álbum
  if (!album.owner.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para compartir este álbum', 401));
  }

  // Verificar que no es el mismo usuario
  if (userId === req.user.id) {
    return next(new ErrorResponse('No puedes compartir el álbum contigo mismo', 400));
  }

  // Verificar que el usuario existe
  const userToShareWith = await User.findById(userId);
  if (!userToShareWith) {
    return next(new ErrorResponse(`Usuario no encontrado con ID ${userId}`, 404));
  }

  // Verificar que no está ya compartido
  if (album.sharedWith.includes(userId)) {
    return next(new ErrorResponse('El álbum ya está compartido con este usuario', 400));
  }

  // Verificar que son amigos
  if (!req.user.friends.includes(userId)) {
    return next(new ErrorResponse('Solo puedes compartir álbumes con amigos', 400));
  }

  // Compartir el álbum
  album.sharedWith.push(userId);
  await album.save();

  // Crear álbum automático en el perfil del amigo
  const friendAlbumTitle = `${req.user.firstName} ${req.user.lastName}`;
  
  let friendAlbum = await Album.findOne({ 
    title: friendAlbumTitle, 
    owner: userId 
  });

  if (!friendAlbum) {
    friendAlbum = new Album({
      title: friendAlbumTitle,
      owner: userId,
      isAutoCreated: true,
      description: `Álbum compartido por ${req.user.firstName} ${req.user.lastName}`
    });
    await friendAlbum.save();
  }

  // Notificar al usuario
  req.io.to(userId).emit('albumShared', {
    albumId: album._id,
    albumTitle: album.title,
    owner: {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profileImage: req.user.profileImage
    }
  });

  res.status(200).json({
    success: true,
    data: album
  });
});