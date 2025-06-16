import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import albumRoutes from './albums.js';
import commentRoutes from './comments.js';
import notificationRoutes from './notifications.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/albums', albumRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);

export default router;