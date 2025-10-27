import { Request, Response } from 'express';
import Streamer, { IStreamer } from '../models/Streamer';
import User from '../models/User';
import { twitchService } from '../services/twitchService';

// Get all active streamers (public)
export const getStreamers = async (req: Request, res: Response) => {
    try {
        const streamers = await Streamer.find({ isActive: true })
            .sort({ order: 1, createdAt: 1 })
            .select('channel title order');

        res.json({ streamers });
    } catch (error) {
        console.error('Error fetching streamers:', error);
        res.status(500).json({ error: 'Failed to fetch streamers' });
    }
};

// Get all streamers including inactive (admin only)
export const getAllStreamers = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const streamers = await Streamer.find()
            .sort({ order: 1, createdAt: 1 });

        res.json({ streamers });
    } catch (error) {
        console.error('Error fetching all streamers:', error);
        res.status(500).json({ error: 'Failed to fetch streamers' });
    }
};

// Add a new streamer (admin only)
export const addStreamer = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;
        const { channel, title, order } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Validate input
        if (!channel || !title) {
            return res.status(400).json({ error: 'Channel and title are required' });
        }

        // Check if streamer already exists
        const existingStreamer = await Streamer.findOne({
            channel: channel.toLowerCase()
        });

        if (existingStreamer) {
            return res.status(409).json({ error: 'Streamer already exists' });
        }

        // Create new streamer
        const streamer = new Streamer({
            channel: channel.toLowerCase(),
            title,
            order: order || 999,
            isActive: true
        });

        await streamer.save();

        res.status(201).json({
            success: true,
            streamer
        });
    } catch (error) {
        console.error('Error adding streamer:', error);
        res.status(500).json({ error: 'Failed to add streamer' });
    }
};

// Update a streamer (admin only)
export const updateStreamer = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;
        const { id } = req.params;
        const { title, order, isActive } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const streamer = await Streamer.findById(id);

        if (!streamer) {
            return res.status(404).json({ error: 'Streamer not found' });
        }

        // Update fields
        if (title !== undefined) streamer.title = title;
        if (order !== undefined) streamer.order = order;
        if (isActive !== undefined) streamer.isActive = isActive;

        await streamer.save();

        res.json({
            success: true,
            streamer
        });
    } catch (error) {
        console.error('Error updating streamer:', error);
        res.status(500).json({ error: 'Failed to update streamer' });
    }
};

// Delete a streamer (admin only)
export const deleteStreamer = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await Streamer.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ error: 'Streamer not found' });
        }

        res.json({
            success: true,
            message: 'Streamer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting streamer:', error);
        res.status(500).json({ error: 'Failed to delete streamer' });
    }
};

// Reorder streamers (admin only)
export const reorderStreamers = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;
        const { streamers } = req.body; // Array of { id, order } objects

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Update order for each streamer
        const updatePromises = streamers.map((item: { id: string, order: number }) =>
            Streamer.findByIdAndUpdate(item.id, { order: item.order })
        );

        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: 'Streamers reordered successfully'
        });
    } catch (error) {
        console.error('Error reordering streamers:', error);
        res.status(500).json({ error: 'Failed to reorder streamers' });
    }
};

// Get live status for active streamers (public)
export const getLiveStatus = async (req: Request, res: Response) => {
    try {
        // Get all active streamers
        const streamers = await Streamer.find({ isActive: true })
            .select('channel');

        const usernames = streamers.map(s => s.channel);

        if (usernames.length === 0) {
            return res.json({ liveStatus: {} });
        }

        // Get live status from Twitch
        const liveStatus = await twitchService.getLiveStatus(usernames);

        res.json({ liveStatus });
    } catch (error) {
        console.error('Error fetching live status:', error);
        // Return empty object on error so frontend can handle gracefully
        res.json({ liveStatus: {} });
    }
};