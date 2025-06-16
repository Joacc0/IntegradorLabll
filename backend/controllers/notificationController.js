import Notification from '../models/Notification.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Obtener notificaciones del usuario
export const getNotifications = asyncHandler(async (req, res, next) => {
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
export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notificación no encontrada con ID ${req.params.id}`, 404));
  }

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
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notificación no encontrada con ID ${req.params.id}`, 404));
  }

  if (!notification.recipient.equals(req.user.id)) {
    return next(new ErrorResponse('No autorizado para eliminar esta notificación', 401));
  }

  await notification.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});