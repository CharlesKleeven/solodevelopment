import express from 'express';
import { getThemes, voteOnTheme, createThemes, recalculateScores, resetVotes } from '../controllers/themeController';
import { authenticateToken } from '../middleware/auth';
import { votingRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Get themes for a jam (public, but includes user votes if authenticated)
// We'll make this a public route that checks for auth internally
router.get('/jam/:jamId', getThemes);

// Vote on a theme (requires authentication + rate limiting)
router.post('/:themeId/vote', authenticateToken, votingRateLimiter, voteOnTheme);

// Create themes for a jam (admin only)
router.post('/create', authenticateToken, createThemes);

// Recalculate scores for a jam (admin only)
router.post('/recalculate/:jamId', authenticateToken, recalculateScores);

// Reset all votes for a jam (admin only)
router.post('/reset-votes/:jamId', authenticateToken, resetVotes);

export default router;