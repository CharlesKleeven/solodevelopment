import express from 'express';
import { register, login, logout, registerValidation, loginValidation, me, getProfile, updateProfile, updateProfileValidation, forgotPassword, resetPassword, forgotPasswordValidation, resetPasswordValidation } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

// Create router instance
const router = express.Router();

// POST /api/auth/register: body includes { username, email, password }
router.post('/register', registerValidation, register);

// POST /api/auth/login: body includes { email, password }
router.post('/login', loginValidation, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me: get current user (protected route)
router.get('/me', authenticateToken, me);

// GET /api/auth/profile: get current user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile: update user profile (protected route)
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);

// POST /api/auth/forgot-password: send password reset email
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

// POST /api/auth/reset-password: reset password with token
router.post('/reset-password', resetPasswordValidation, resetPassword);

export default router;