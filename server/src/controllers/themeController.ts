import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Theme, { ITheme } from '../models/Theme';
import ThemeVote, { IThemeVote } from '../models/ThemeVote';
import User from '../models/User';
import { VoteBackupService } from '../services/voteBackupService';

// AuthRequest type is no longer needed as we extend Express Request globally

// JWT payload type
interface JWTPayload {
    userId: string;
}

// Get all themes for a jam with user's votes
export const getThemes = async (req: Request, res: Response) => {
    try {
        const { jamId } = req.params;
        
        // Check if user is authenticated by looking for cookie
        let userId = null;
        const token = req.cookies.token;
        if (token) {
            // Try to decode token but don't fail if it's invalid
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
                userId = decoded.userId;
            } catch (err) {
                // Invalid token, continue as unauthenticated
            }
        }

        // Get all themes for this jam
        const themes = await Theme.find({ jamId }).sort('name');

        // If user is authenticated and verified, get their votes
        let userVotes: { [themeId: string]: number } = {};
        if (userId) {
            // Check if user is verified
            const user = await User.findById(userId);
            if (user && user.emailVerified) {
                // Get theme IDs for this jam to filter votes
                const themeIds = themes.map(t => (t._id as any).toString());
                const votes = await ThemeVote.find({ 
                    userId,
                    themeId: { $in: themeIds }
                });
                votes.forEach(vote => {
                    userVotes[vote.themeId] = vote.vote;
                });
            }
        }

        // Combine themes with user votes
        const themesWithVotes = themes.map(theme => {
            const themeId = (theme._id as any).toString();
            const userVote = userVotes[themeId] !== undefined ? userVotes[themeId] : 0;
            
            return {
                id: themeId,
                name: theme.name,
                score: theme.score,
                userVote: userVote
            };
        });

        res.json({ themes: themesWithVotes });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching themes:', error);
        }
        res.status(500).json({ error: 'Failed to fetch themes' });
    }
};

// Submit or update a vote
export const voteOnTheme = async (req: Request, res: Response) => {
    try {
        const { themeId } = req.params;
        const { vote } = req.body;
        const userId = (req.user as any)?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify user exists and is verified (email verification)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if user has verified email
        if (!user.emailVerified) {
            return res.status(403).json({ error: 'Please verify your email to vote on themes' });
        }

        // Validate vote value
        if (![-1, 0, 1].includes(vote)) {
            return res.status(400).json({ error: 'Invalid vote value' });
        }

        // Get the theme to ensure it exists
        const theme = await Theme.findById(themeId);
        if (!theme) {
            return res.status(404).json({ error: 'Theme not found' });
        }

        // Use findOneAndUpdate for atomic operation
        const existingVote = await ThemeVote.findOneAndUpdate(
            { userId, themeId },
            { vote },
            { 
                upsert: true, 
                new: false, // Return the old document to calculate score diff
                setDefaultsOnInsert: true
            }
        );
        
        const oldVote = existingVote?.vote || 0;
        const scoreDiff = vote - oldVote;
        
        // Update theme score atomically
        if (scoreDiff !== 0) {
            await Theme.findByIdAndUpdate(
                themeId,
                { $inc: { score: scoreDiff } }
            );
        }

        res.json({ success: true, vote });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error voting on theme:', error);
        }
        res.status(500).json({ error: 'Failed to submit vote' });
    }
};

// Recalculate theme scores based on votes (admin only)
export const recalculateScores = async (req: Request, res: Response) => {
    try {
        const { jamId } = req.params;
        const userId = (req.user as any)?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Get all themes for this jam
        const themes = await Theme.find({ jamId });
        
        // Recalculate each theme's score
        for (const theme of themes) {
            const votes = await ThemeVote.find({ themeId: theme._id });
            const score = votes.reduce((sum, vote) => sum + vote.vote, 0);
            
            // Update theme score if different
            if (theme.score !== score) {
                await Theme.findByIdAndUpdate(theme._id, { score });
            }
        }

        res.json({ success: true, message: 'Theme scores recalculated' });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error recalculating scores:', error);
        }
        res.status(500).json({ error: 'Failed to recalculate scores' });
    }
};

// Create themes for a jam (admin only)
export const createThemes = async (req: Request, res: Response) => {
    try {
        const { jamId, themes } = req.body;
        const userId = (req.user as any)?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // For now, you can manually set admin status in MongoDB
        // Add isAdmin: true to a user document to make them admin
        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Get existing themes
        const existingThemes = await Theme.find({ jamId });
        
        // Create backup before making changes
        await VoteBackupService.createBackup(
            jamId,
            'pre_update',
            userId,
            'Backup before theme update'
        );

        // Normalize for case-insensitive comparison
        const existingThemeMap = new Map(existingThemes.map(t => [t.name.toLowerCase(), t]));
        const newThemesLower = themes.map((name: string) => name.toLowerCase());
        
        // Find themes to keep, add, and remove (case-insensitive)
        const themesToKeep: ITheme[] = [];
        const themesToAdd: string[] = [];
        
        themes.forEach((name: string) => {
            const existing = existingThemeMap.get(name.toLowerCase());
            if (existing) {
                themesToKeep.push(existing);
            } else {
                themesToAdd.push(name);
            }
        });
        
        const themesToRemove = existingThemes.filter(t => 
            !newThemesLower.includes(t.name.toLowerCase())
        );
        
        // Delete only themes that are being removed (and their votes)
        if (themesToRemove.length > 0) {
            const removeIds = themesToRemove.map(t => t._id);
            await ThemeVote.deleteMany({ themeId: { $in: removeIds } });
            await Theme.deleteMany({ _id: { $in: removeIds } });
        }
        
        // Add only new themes
        if (themesToAdd.length > 0) {
            const themePromises = themesToAdd.map((themeName: string) => 
                Theme.create({
                    jamId,
                    name: themeName,
                    score: 0
                })
            );
            await Promise.all(themePromises);
        }

        res.json({ 
            success: true, 
            message: `Updated themes (case-insensitive): ${themesToKeep.length} kept, ${themesToAdd.length} added, ${themesToRemove.length} removed` 
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error creating themes:', error);
        }
        res.status(500).json({ error: 'Failed to create themes' });
    }
};