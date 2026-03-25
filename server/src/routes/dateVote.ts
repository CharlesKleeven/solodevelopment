import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    getDateOptions,
    voteOnDate,
    createDateOptions,
    suggestDate,
    deleteDateOptions
} from '../controllers/dateVoteController';
import { authenticateToken } from '../middleware/auth';
import { votingRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

const adminOperationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many operations. Please wait a few minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/jam/:jamId', getDateOptions);
router.post('/:dateOptionId/vote', votingRateLimiter, voteOnDate);
router.post('/create', authenticateToken, adminOperationLimiter, createDateOptions);
router.post('/suggest', authenticateToken, votingRateLimiter, suggestDate);
router.delete('/jam/:jamId', authenticateToken, adminOperationLimiter, deleteDateOptions);

export default router;
