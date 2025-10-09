import { Request, Response } from 'express';
import Jam from '../models/Jam';
import Theme from '../models/Theme';
import User from '../models/User';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Get all jams
export const getAllJams = async (req: Request, res: Response) => {
    try {
        const jams = await Jam.find().sort('-createdAt');
        const currentTime = new Date();
        
        // Calculate status for each jam
        const jamsWithStatus = jams.map(jam => ({
            ...jam.toObject(),
            status: getJamStatus(currentTime, jam.startDate, jam.endDate)
        }));
        
        res.json({ jams: jamsWithStatus });
    } catch (error) {
        console.error('Error fetching jams:', error);
        res.status(500).json({ error: 'Failed to fetch jams' });
    }
};

// Get current jam (replaces the config file approach)
export const getCurrentJamFromDB = async (req: Request, res: Response) => {
    try {
        const jam = await Jam.findOne({ isCurrent: true });
        
        if (!jam) {
            return res.status(404).json({ error: 'No current jam set' });
        }

        // Calculate dynamic values
        const currentTime = new Date();
        const timeLeft = calculateTimeLeft(currentTime, jam.startDate, jam.endDate);
        const autoStatus = getJamStatus(currentTime, jam.startDate, jam.endDate);
        
        // Try to scrape participant count from itch.io
        let participants = jam.participants;
        try {
            const response = await axios.get(jam.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoloDev-Bot/1.0)' },
                timeout: 5000
            });
            
            const $ = cheerio.load(response.data as string);
            const statElements = $('.stat_value');
            
            statElements.each((_, el) => {
                const nextElement = $(el).next();
                const value = $(el).text().trim();
                const label = nextElement.text().trim().toLowerCase();
                
                if (label.includes('joined')) {
                    const num = parseInt(value);
                    if (!isNaN(num)) {
                        participants = num;
                        // Update the database with scraped value
                        jam.participants = num;
                        jam.save().catch(console.error);
                        return false;
                    }
                }
            });
        } catch (error) {
            console.error('Failed to scrape participants:', error);
        }

        const jamData = {
            id: jam.id,
            title: jam.title,
            theme: jam.theme,
            description: jam.description,
            url: jam.url,
            startDate: jam.startDate.toISOString(),
            endDate: jam.endDate.toISOString(),
            participants,
            submissions: jam.submissions,
            timeLeft,
            status: autoStatus,
            isVotingOpen: jam.isVotingOpen,
            votingRoundName: jam.votingRoundName
        };

        res.json(jamData);
    } catch (error) {
        console.error('Error fetching current jam:', error);
        res.status(500).json({ error: 'Failed to fetch current jam' });
    }
};

// Create a new jam
export const createJam = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        
        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const jamData = req.body;
        const jam = await Jam.create(jamData);

        res.json({ success: true, jam });
    } catch (error) {
        console.error('Error creating jam:', error);
        res.status(500).json({ error: 'Failed to create jam' });
    }
};

// Update a jam
export const updateJam = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { jamId } = req.params;
        
        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const jam = await Jam.findOne({ id: jamId });
        if (!jam) {
            return res.status(404).json({ error: 'Jam not found' });
        }

        // Update fields
        Object.assign(jam, req.body);
        await jam.save();

        res.json({ success: true, jam });
    } catch (error) {
        console.error('Error updating jam:', error);
        res.status(500).json({ error: 'Failed to update jam' });
    }
};

// Set current jam
export const setCurrentJam = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { jamId } = req.params;
        
        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Set all jams to not current
        await Jam.updateMany({}, { isCurrent: false });
        
        // Set the specified jam as current
        const jam = await Jam.findOne({ id: jamId });
        if (!jam) {
            return res.status(404).json({ error: 'Jam not found' });
        }

        jam.isCurrent = true;
        await jam.save();

        res.json({ success: true, message: 'Current jam updated' });
    } catch (error) {
        console.error('Error setting current jam:', error);
        res.status(500).json({ error: 'Failed to set current jam' });
    }
};

// Delete a jam
export const deleteJam = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { jamId } = req.params;
        
        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const jam = await Jam.findOne({ id: jamId });
        if (!jam) {
            return res.status(404).json({ error: 'Jam not found' });
        }

        // Also delete associated themes
        await Theme.deleteMany({ jamId });
        
        await jam.deleteOne();

        res.json({ success: true, message: 'Jam deleted' });
    } catch (error) {
        console.error('Error deleting jam:', error);
        res.status(500).json({ error: 'Failed to delete jam' });
    }
};

// Helper functions (same as before)
function calculateTimeLeft(now: Date, startDate: Date, endDate: Date): string {
    const nowTime = now.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    if (nowTime < startTime) {
        const diff = startTime - nowTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `Starts in ${days} day${days === 1 ? '' : 's'}`;
        if (hours > 0) return `Starts in ${hours} hour${hours === 1 ? '' : 's'}`;
        return "Starting soon";
    }

    if (nowTime >= startTime && nowTime <= endTime) {
        const diff = endTime - nowTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;
        if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} left`;
        return "Less than 1 hour left";
    }

    return "Jam ended";
}

function getJamStatus(now: Date, startDate: Date, endDate: Date): 'upcoming' | 'active' | 'ended' {
    const nowTime = now.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    if (nowTime < startTime) return 'upcoming';
    if (nowTime >= startTime && nowTime <= endTime) return 'active';
    return 'ended';
}

// Toggle voting status for current jam
export const toggleVoting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Find current jam
        const currentJam = await Jam.findOne({ isCurrent: true });
        if (!currentJam) {
            return res.status(404).json({ error: 'No current jam found' });
        }

        // Toggle voting status
        currentJam.isVotingOpen = !currentJam.isVotingOpen;
        await currentJam.save();

        res.json({ 
            success: true, 
            isVotingOpen: currentJam.isVotingOpen,
            message: `Voting is now ${currentJam.isVotingOpen ? 'open' : 'closed'}`
        });
    } catch (error) {
        console.error('Error toggling voting:', error);
        res.status(500).json({ error: 'Failed to toggle voting status' });
    }
};