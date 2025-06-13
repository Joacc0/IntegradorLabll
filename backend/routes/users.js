const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  sendFriendRequest,
  respondFriendRequest
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.post('/:id/friend-request', protect, sendFriendRequest);
router.post('/:id/respond-friend-request', protect, respondFriendRequest);

module.exports = router;