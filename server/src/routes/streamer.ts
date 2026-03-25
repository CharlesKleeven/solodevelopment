import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getStreamers,
    getAllStreamers,
    addStreamer,
    updateStreamer,
    deleteStreamer,
    reorderStreamers,
    getLiveStatus,
    submitStreamer,
    reviewStreamer
} from '../controllers/streamerController';

const router = express.Router();

// Public routes
router.get('/', getStreamers);
router.get('/live-status', getLiveStatus);

// User routes
router.post('/submit', authenticateToken, submitStreamer);

// Admin routes
router.get('/all', authenticateToken, getAllStreamers);
router.post('/add', authenticateToken, addStreamer);
router.post('/:id/review', authenticateToken, reviewStreamer);
router.put('/:id', authenticateToken, updateStreamer);
router.delete('/:id', authenticateToken, deleteStreamer);
router.post('/reorder', authenticateToken, reorderStreamers);

export default router;