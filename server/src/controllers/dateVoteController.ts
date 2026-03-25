import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import DateOption from '../models/DateOption';
import DateVote from '../models/DateVote';
import User from '../models/User';

interface JWTPayload {
    userId: string;
}

const getClientIP = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
    if (ip.startsWith('::ffff:')) return ip.substring(7);
    return ip;
};

const hashIP = (ip: string): string => {
    const salt = process.env.JWT_SECRET || 'solodev-salt';
    return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
};

// Get all date options for a jam with votes
export const getDateOptions = async (req: Request, res: Response) => {
    try {
        const { jamId } = req.params;
        const clientIP = getClientIP(req);

        // Check for logged-in user
        let userId = null;
        const token = req.cookies.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
                userId = decoded.userId;
            } catch (err) {}
        }

        const dateOptions = await DateOption.find({ jamId }).sort('startDate');
        const optionIds = dateOptions.map(d => (d._id as any).toString());

        // Check votes — look up both userId and IP to cover both cases
        const voterId = userId || `ip:${hashIP(clientIP)}`;
        const voterIds = userId ? [userId, `ip:${hashIP(clientIP)}`] : [`ip:${hashIP(clientIP)}`];
        const votes = await DateVote.find({
            userId: { $in: voterIds },
            dateOptionId: { $in: optionIds }
        });
        const userVotes: { [id: string]: boolean } = {};
        votes.forEach(v => { userVotes[v.dateOptionId] = v.vote; });

        // Check if this voter already suggested
        const hasSuggested = dateOptions.some(d => voterIds.includes(d.suggestedBy || ''));

        const optionsWithVotes = dateOptions.map(option => {
            const optionId = (option._id as any).toString();
            return {
                id: optionId,
                startDate: option.startDate,
                endDate: option.endDate,
                voteCount: option.voteCount,
                suggestedBy: option.suggestedBy,
                userVoted: userVotes[optionId] || false
            };
        });

        res.json({ dateOptions: optionsWithVotes, hasSuggested });
    } catch (error) {
        console.error('Error fetching date options:', error);
        res.status(500).json({ error: 'Failed to fetch date options' });
    }
};

// Vote on a date option
// Logged in → vote stored under userId (one set of votes per account)
// Anonymous → vote stored under ip:X (one set of anonymous votes per IP)
// If IP already has anonymous votes and user is not logged in → require login
export const voteOnDate = async (req: Request, res: Response) => {
    try {
        const { dateOptionId } = req.params;
        const { vote } = req.body;
        const clientIP = getClientIP(req);

        // Check for auth cookie
        let authUserId: string | null = (req.user as any)?.userId || null;
        if (!authUserId) {
            const token = req.cookies.token;
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
                    authUserId = decoded.userId;
                } catch (err) {}
            }
        }

        const dateOption = await DateOption.findById(dateOptionId);
        if (!dateOption) {
            return res.status(404).json({ error: 'Date option not found' });
        }

        if (typeof vote !== 'boolean') {
            return res.status(400).json({ error: 'Vote must be true or false' });
        }

        let voterId: string;
        const ipVoterId = `ip:${hashIP(clientIP)}`;

        if (authUserId) {
            // Logged in — always use userId
            voterId = authUserId;
        } else {
            // Anonymous — check if this IP already has any votes for this jam
            const allOptionIds = (await DateOption.find({ jamId: dateOption.jamId })).map(d => (d._id as any).toString());
            const existingIpVotes = await DateVote.find({
                userId: ipVoterId,
                dateOptionId: { $in: allOptionIds }
            });

            if (existingIpVotes.length > 0) {
                // IP already voted — allow them to modify their existing votes (toggle)
                const thisOptionVote = existingIpVotes.find(v => v.dateOptionId === dateOptionId);
                if (!thisOptionVote && vote === true) {
                    // Trying to vote on a NEW option from same IP without login — still allow
                    // (they should be able to select multiple dates)
                }
                voterId = ipVoterId;
            } else {
                // First anonymous vote from this IP — allow
                voterId = ipVoterId;
            }
        }

        // Check if this userId already voted (prevent same account voting twice)
        if (authUserId) {
            const existingUserVote = await DateVote.findOne({ userId: authUserId, dateOptionId });
            if (vote) {
                if (!existingUserVote) {
                    await DateVote.create({ userId: authUserId, dateOptionId, vote: true });
                    await DateOption.findByIdAndUpdate(dateOptionId, { $inc: { voteCount: 1 } });
                }
            } else {
                if (existingUserVote) {
                    await DateVote.deleteOne({ userId: authUserId, dateOptionId });
                    await DateOption.findByIdAndUpdate(dateOptionId, { $inc: { voteCount: -1 } });
                }
            }
        } else {
            const existingVote = await DateVote.findOne({ userId: voterId, dateOptionId });
            if (vote) {
                if (!existingVote) {
                    await DateVote.create({ userId: voterId, dateOptionId, vote: true });
                    await DateOption.findByIdAndUpdate(dateOptionId, { $inc: { voteCount: 1 } });
                }
            } else {
                if (existingVote) {
                    await DateVote.deleteOne({ userId: voterId, dateOptionId });
                    await DateOption.findByIdAndUpdate(dateOptionId, { $inc: { voteCount: -1 } });
                }
            }
        }

        res.json({ success: true, vote });
    } catch (error) {
        console.error('Error voting on date:', error);
        res.status(500).json({ error: 'Failed to submit vote' });
    }
};

// Add date options to a jam (admin only) — appends, does not replace
export const createDateOptions = async (req: Request, res: Response) => {
    try {
        const { jamId, dates } = req.body;
        const userId = (req.user as any)?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        if (!Array.isArray(dates) || dates.length === 0) {
            return res.status(400).json({ error: 'Dates array is required' });
        }

        const created = [];
        for (const date of dates) {
            try {
                const option = await DateOption.create({
                    jamId,
                    startDate: new Date(date.startDate),
                    endDate: new Date(date.endDate),
                    suggestedBy: null,
                    voteCount: 0
                });
                created.push(option);
            } catch (err: any) {
                if (err.code === 11000) {
                    // Duplicate date range, skip
                } else {
                    console.error('Failed to create date option:', err);
                }
            }
        }

        res.json({ success: true, message: `Added ${created.length} date option${created.length !== 1 ? 's' : ''}` });
    } catch (error) {
        console.error('Error creating date options:', error);
        res.status(500).json({ error: 'Failed to create date options' });
    }
};

// Suggest a date (authenticated users only, one per user per jam)
export const suggestDate = async (req: Request, res: Response) => {
    try {
        const { jamId, startDate, endDate } = req.body;
        const userId = (req.user as any)?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Please log in to suggest dates' });
        }

        if (!jamId || !startDate || !endDate) {
            return res.status(400).json({ error: 'jamId, startDate, and endDate are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        const existing = await DateOption.findOne({ jamId, suggestedBy: userId });
        if (existing) {
            return res.status(400).json({ error: 'You can only suggest one date per jam' });
        }

        const clientIP = getClientIP(req);
        const voterId = userId || `ip:${hashIP(clientIP)}`;

        const option = await DateOption.create({
            jamId,
            startDate: start,
            endDate: end,
            suggestedBy: userId,
            voteCount: 1
        });

        await DateVote.create({
            userId: voterId,
            dateOptionId: (option._id as any).toString(),
            vote: true
        });

        res.json({ success: true, dateOption: option });
    } catch (error) {
        console.error('Error suggesting date:', error);
        res.status(500).json({ error: 'Failed to suggest date' });
    }
};

// Delete all date options for a jam (admin only)
export const deleteDateOptions = async (req: Request, res: Response) => {
    try {
        const { jamId } = req.params;
        const userId = (req.user as any)?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const options = await DateOption.find({ jamId });
        const optionIds = options.map(d => (d._id as any).toString());

        await DateVote.deleteMany({ dateOptionId: { $in: optionIds } });
        const result = await DateOption.deleteMany({ jamId });

        res.json({ success: true, message: `Deleted ${result.deletedCount} date options and their votes` });
    } catch (error) {
        console.error('Error deleting date options:', error);
        res.status(500).json({ error: 'Failed to delete date options' });
    }
};
