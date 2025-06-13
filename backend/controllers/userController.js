const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ isPublic: true })
    .select('firstName lastName profileImage bio')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Obtener un usuario
// @route   GET /api/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('firstName lastName profileImage bio interests isPublic')
    .populate('friends', 'firstName lastName profileImage');

  if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con ID ${req.params.id}`, 404));
  }

  // Verificar si el perfil es público o si el solicitante es amigo
  if (!user.isPublic && (!req.user || !user.friends.some(f => f._id.equals(req.user.id)))) {
    return next(new ErrorResponse('No autorizado para ver este perfil', 401));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Verificar que el usuario es dueño del perfil
  if (req.params.id !== req.user.id) {
    return next(new ErrorResponse('No autorizado para actualizar este perfil', 401));
  }

  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio,
    interests: req.body.interests,
    isPublic: req.body.isPublic
  };

  if (req.body.profileImage) {
    fieldsToUpdate.profileImage = req.body.profileImage;
  }

  const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Enviar solicitud de amistad
// @route   POST /api/users/:id/friend-request
// @access  Private
exports.sendFriendRequest = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse('No puedes enviarte una solicitud a ti mismo', 400));
  }

  const recipient = await User.findById(req.params.id);
  if (!recipient) {
    return next(new ErrorResponse(`Usuario no encontrado con ID ${req.params.id}`, 404));
  }

  // Verificar si ya son amigos o si ya hay una solicitud pendiente
  const sender = await User.findById(req.user.id);
  
  if (sender.friends.includes(recipient._id)) {
    return next(new ErrorResponse('Ya son amigos', 400));
  }

  if (sender.friendRequests.includes(recipient._id)) {
    return next(new ErrorResponse('Ya hay una solicitud pendiente de este usuario', 400));
  }

  if (recipient.friendRequests.includes(sender._id)) {
    return next(new ErrorResponse('Ya le has enviado una solicitud a este usuario', 400));
  }

  // Agregar la solicitud
  recipient.friendRequests.push(sender._id);
  await recipient.save();

  // Emitir notificación en tiempo real
  req.io.to(recipient._id.toString()).emit('newFriendRequest', {
    sender: {
      id: sender._id,
      firstName: sender.firstName,
      lastName: sender.lastName,
      profileImage: sender.profileImage
    }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Responder a solicitud de amistad
// @route   POST /api/users/:id/respond-friend-request
// @access  Private
exports.respondFriendRequest = asyncHandler(async (req, res, next) => {
  const { action } = req.body; // 'accept' o 'reject'

  const requester = await User.findById(req.params.id);
  if (!requester) {
    return next(new ErrorResponse(`Usuario no encontrado con ID ${req.params.id}`, 404));
  }

  const recipient = await User.findById(req.user.id);

  // Verificar si existe la solicitud
  if (!recipient.friendRequests.includes(requester._id)) {
    return next(new ErrorResponse('No hay solicitud pendiente de este usuario', 400));
  }

  // Eliminar la solicitud
  recipient.friendRequests = recipient.friendRequests.filter(
    id => !id.equals(requester._id)
  );

  if (action === 'accept') {
    // Agregar como amigos (relación unidireccional)
    recipient.friends.push(requester._id);
    
    // Notificar al solicitante
    req.io.to(requester._id.toString()).emit('friendRequestAccepted', {
      recipient: {
        id: recipient._id,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        profileImage: recipient.profileImage
      }
    });
  }

  await recipient.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});