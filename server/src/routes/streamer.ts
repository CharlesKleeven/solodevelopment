import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getStreamers,
    getAllStreamers,
    addStreamer,
    updateStreamer,
    deleteStreamer,
    reorderStreamers,
    getLiveStatus
} from '../controllers/streamerController';

const router = express.Router();

// Public routes
router.get('/', getStreamers); // Get active streamers
router.get('/live-status', getLiveStatus); // Get live status for active streamers

// Admin routes (require authentication)
router.get('/all', authenticateToken, getAllStreamers); // Get all streamers including inactive
router.post('/add', authenticateToken, addStreamer);
router.put('/:id', authenticateToken, updateStreamer);
router.delete('/:id', authenticateToken, deleteStreamer);
router.post('/reorder', authenticateToken, reorderStreamers);

export default router;