const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const albumRoutes = require('./albums');
const commentRoutes = require('./comments');
const notificationRoutes = require('./notifications');

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/albums', albumRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;