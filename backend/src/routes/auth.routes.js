import express from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getAllUsers,
  updateUserRole,
} from '../controllers/auth.controller.js';
import {
  validateRegister,
  validateLogin,
  protect,
  restrictTo,
} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/refresh', refreshAccessToken);
router.post('/login', validateLogin, loginUser);
router.post('/logout', logoutUser);

// Admin-only user & role management
router.get('/users', protect, restrictTo('admin'), getAllUsers);
router.put('/users/:id/role', protect, restrictTo('admin'), updateUserRole);

export default router;