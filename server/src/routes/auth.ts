import express from 'express';
import { register, login } from '../controllers/authController';

// Create router instance
const router = express.Router();

// POST /api/auth/register: body includes { username, email, password }
router.post('/register', register);

// POST /api/auth/login: body includes { email, password }
router.post('/login', login);

export default router;