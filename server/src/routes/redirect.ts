import express from 'express';
import {
    getAllRedirects,
    createRedirect,
    updateRedirect,
    deleteRedirect,
    getRedirectUrl
} from '../controllers/redirectController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Admin routes (all require authentication) - specific routes first
router.get('/all', authenticateToken, getAllRedirects);
router.post('/create', authenticateToken, createRedirect);

// Public route to get redirect URL (for frontend)
router.get('/:slug', getRedirectUrl);

// Admin routes that use :slug parameter
router.put('/:slug', authenticateToken, updateRedirect);
router.delete('/:slug', authenticateToken, deleteRedirect);

export default router;