const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtener notificaciones del usuario
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'firstName lastName profileImage')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Marcar notificación como leída
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notificación no encontrada con ID ${req.params.id}`, 404));
  }

  // Verificar que la notificación pertenece al usuario
  if (!notification.recipient.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para marcar esta notificación', 401));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Eliminar notificación
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notificación no encontrada con ID ${req.params.id}`, 404));
  }

  // Verificar que la notificación pertenece al usuario
  if (!notification.recipient.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para eliminar esta notificación', 401));
  }

  await notification.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});