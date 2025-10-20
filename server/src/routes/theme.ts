import express from 'express';
import rateLimit from 'express-rate-limit';
import { getThemes, voteOnTheme, createThemes, recalculateScores, resetVotes } from '../controllers/themeController';
import { authenticateToken } from '../middleware/auth';
import { votingRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Rate limiter for admin operations (theme creation/update)
const adminOperationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // 5 operations per window
    message: 'Too many theme update operations. Please wait a few minutes before trying again.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Get themes for a jam (public, but includes user votes if authenticated)
// We'll make this a public route that checks for auth internally
router.get('/jam/:jamId', getThemes);

// Vote on a theme (requires authentication + rate limiting)
router.post('/:themeId/vote', authenticateToken, votingRateLimiter, voteOnTheme);

// Create themes for a jam (admin only + rate limiting)
router.post('/create', authenticateToken, adminOperationLimiter, createThemes);

// Recalculate scores for a jam (admin only + rate limiting)
router.post('/recalculate/:jamId', authenticateToken, adminOperationLimiter, recalculateScores);

// Reset all votes for a jam (admin only + rate limiting)
router.post('/reset-votes/:jamId', authenticateToken, adminOperationLimiter, resetVotes);

export default router;