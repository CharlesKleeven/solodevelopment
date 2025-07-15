import express from 'express';
import { register, login, logout, registerValidation, loginValidation, me } from '../controllers/authController';
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

export default router;