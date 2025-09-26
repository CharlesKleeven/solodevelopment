import express from 'express';
import {
    getAllRedirects,
    createRedirect,
    updateRedirect,
    deleteRedirect
} from '../controllers/redirectController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Admin routes (all require authentication)
router.get('/all', authenticateToken, getAllRedirects);
router.post('/create', authenticateToken, createRedirect);
router.put('/:slug', authenticateToken, updateRedirect);
router.delete('/:slug', authenticateToken, deleteRedirect);

export default router;