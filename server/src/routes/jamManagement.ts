import express from 'express';
import {
    getAllJams,
    createJam,
    updateJam,
    setCurrentJam,
    deleteJam,
    toggleVoting
} from '../controllers/jamManagementController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all jams (admin only)
router.get('/all', authenticateToken, getAllJams);

// Create a new jam (admin only)
router.post('/create', authenticateToken, createJam);

// Update a jam (admin only)
router.put('/:jamId', authenticateToken, updateJam);

// Set current jam (admin only)
router.post('/:jamId/set-current', authenticateToken, setCurrentJam);

// Delete a jam (admin only)
router.delete('/:jamId', authenticateToken, deleteJam);

// Toggle voting for current jam (admin only)
router.post('/toggle-voting', authenticateToken, toggleVoting);

export default router;