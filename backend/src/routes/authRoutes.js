import express from 'express';
import { register, login, logout, getMe, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation, validateRequest } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;