import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  sendFriendRequest,
  respondFriendRequest
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.post('/:id/friend-request', protect, sendFriendRequest);
router.post('/:id/respond-friend-request', protect, respondFriendRequest);

export default router;