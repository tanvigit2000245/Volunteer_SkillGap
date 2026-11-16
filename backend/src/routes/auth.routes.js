import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/refresh', refreshAccessToken);
router.post('/login', validateLogin, loginUser);
router.post('/logout', logoutUser);

export default router;