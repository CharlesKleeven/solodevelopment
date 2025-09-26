import { Request, Response } from 'express';
import Redirect from '../models/Redirect';
import User from '../models/User';

// Reserved routes that can't be used as slugs
const RESERVED_SLUGS = [
    'admin', 'login', 'register', 'api', 'auth', 'logout',
    'profile', 'games', 'community', 'showcase', 'jams',
    'verify-email', 'reset-password', 'select-username',
    'privacy', 'terms', 'about', 'contact', 'home'
];

// Get all redirects (admin only)
export const getAllRedirects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const redirects = await Redirect.find().sort('-createdAt');
        res.json({ redirects });
    } catch (error) {
        console.error('Error fetching redirects:', error);
        res.status(500).json({ error: 'Failed to fetch redirects' });
    }
};

// Create a new redirect (admin only)
export const createRedirect = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { slug, destination, description } = req.body;

        // Validate slug
        if (!slug || !destination) {
            return res.status(400).json({ error: 'Slug and destination are required' });
        }

        // Check if slug is reserved
        if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
            return res.status(400).json({ error: `The slug "${slug}" is reserved and cannot be used` });
        }

        // Check if slug already exists
        const existing = await Redirect.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'This slug already exists' });
        }

        // Validate destination URL
        try {
            new URL(destination);
        } catch {
            // If not a full URL, check if it starts with /
            if (!destination.startsWith('/')) {
                return res.status(400).json({ error: 'Destination must be a valid URL or start with /' });
            }
        }

        const redirect = await Redirect.create({
            slug: slug.toLowerCase(),
            destination,
            description
        });

        res.json({ success: true, redirect });
    } catch (error) {
        console.error('Error creating redirect:', error);
        res.status(500).json({ error: 'Failed to create redirect' });
    }
};

// Update a redirect (admin only)
export const updateRedirect = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { slug } = req.params;

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const redirect = await Redirect.findOne({ slug });
        if (!redirect) {
            return res.status(404).json({ error: 'Redirect not found' });
        }

        const { destination, description, isActive } = req.body;

        // Validate destination if provided
        if (destination) {
            try {
                new URL(destination);
            } catch {
                if (!destination.startsWith('/')) {
                    return res.status(400).json({ error: 'Destination must be a valid URL or start with /' });
                }
            }
            redirect.destination = destination;
        }

        if (description !== undefined) redirect.description = description;
        if (isActive !== undefined) redirect.isActive = isActive;

        await redirect.save();
        res.json({ success: true, redirect });
    } catch (error) {
        console.error('Error updating redirect:', error);
        res.status(500).json({ error: 'Failed to update redirect' });
    }
};

// Delete a redirect (admin only)
export const deleteRedirect = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { slug } = req.params;

        // Check if user is admin
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const redirect = await Redirect.findOne({ slug });
        if (!redirect) {
            return res.status(404).json({ error: 'Redirect not found' });
        }

        await redirect.deleteOne();
        res.json({ success: true, message: 'Redirect deleted' });
    } catch (error) {
        console.error('Error deleting redirect:', error);
        res.status(500).json({ error: 'Failed to delete redirect' });
    }
};

// Handle the actual redirect (public)
export const handleRedirect = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const redirect = await Redirect.findOne({
            slug: slug.toLowerCase(),
            isActive: true
        });

        if (!redirect) {
            return res.status(404).send('Page not found');
        }

        // Increment click count
        redirect.clickCount++;
        await redirect.save();

        // Perform redirect
        res.redirect(301, redirect.destination);
    } catch (error) {
        console.error('Error handling redirect:', error);
        res.status(500).send('Internal server error');
    }
};

// Get redirect URL as JSON (for frontend in production)
export const getRedirectUrl = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const redirect = await Redirect.findOne({
            slug: slug.toLowerCase(),
            isActive: true
        });

        if (!redirect) {
            return res.status(404).json({ error: 'Redirect not found' });
        }

        // Increment click count
        redirect.clickCount++;
        await redirect.save();

        // Return URL as JSON
        res.json({ url: redirect.destination });
    } catch (error) {
        console.error('Error getting redirect URL:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};