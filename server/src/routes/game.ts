import express, { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

// Import models
import User from '../models/User';
import Game, { IGame } from '../models/Game';

// Extend Request interface to include user and game
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username?: string;
        email?: string;
      };
      game?: any;
    }
  }
}

// Import auth middleware
import { authenticateToken as authenticate } from '../middleware/auth';

// Helper to check validation errors
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for creating/updating a game
const gameValidationRules = () => {
  return [
    // Title validation
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-:!?'.,]+$/).withMessage('Title contains invalid characters'),
    
    // Description validation
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters')
      .customSanitizer(value => {
        return value.replace(/<[^>]*>?/gm, '');
      }),
    
    // Short description (optional)
    body('shortDescription')
      .optional()
      .trim()
      .isLength({ max: 160 }).withMessage('Short description cannot exceed 160 characters'),
    
    // URL validations
    body('thumbnailUrl')
      .optional()
      .isURL({ protocols: ['https'], require_protocol: true })
      .withMessage('Thumbnail URL must be a valid HTTPS URL'),
    
    body('screenshots')
      .optional()
      .isArray({ max: 5 }).withMessage('Maximum 5 screenshots allowed')
      .custom((screenshots) => {
        if (!Array.isArray(screenshots)) return true;
        
        for (const url of screenshots) {
          try {
            const urlObj = new URL(url);
            if (urlObj.protocol !== 'https:') {
              throw new Error('All screenshot URLs must use HTTPS');
            }
          } catch (e) {
            throw new Error('Invalid screenshot URL');
          }
        }
        return true;
      }),
    
    body('videoUrl')
      .optional()
      .isURL({ protocols: ['https'], require_protocol: true })
      .withMessage('Video URL must be a valid HTTPS URL')
      .custom((url) => {
        if (!url) return true;
        try {
          const urlObj = new URL(url);
          const allowedHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com'];
          if (!allowedHosts.some(host => urlObj.hostname === host || urlObj.hostname.endsWith('.' + host))) {
            throw new Error('Video URL must be from YouTube or Vimeo');
          }
        } catch (e) {
          throw new Error('Invalid video URL');
        }
        return true;
      }),
    
    body('playUrl')
      .optional()
      .isURL({ protocols: ['https'], require_protocol: true })
      .withMessage('Play URL must be a valid HTTPS URL'),
    
    body('sourceUrl')
      .optional()
      .isURL({ protocols: ['https'], require_protocol: true })
      .withMessage('Source URL must be a valid HTTPS URL'),
    
    body('devlogUrl')
      .optional()
      .isURL({ protocols: ['https'], require_protocol: true })
      .withMessage('Devlog URL must be a valid HTTPS URL'),
    
    // Tags validation
    body('tags')
      .optional()
      .isArray({ max: 5 }).withMessage('Maximum 5 tags allowed')
      .custom((tags) => {
        const allowedTags = [
          'action', 'adventure', 'arcade', 'puzzle', 'platformer', 
          'rpg', 'strategy', 'simulation', 'horror', 'survival',
          'multiplayer', 'singleplayer', 'coop', 'competitive',
          '2d', '3d', 'pixel-art', 'low-poly', 'retro', 'modern',
          'casual', 'hardcore', 'family-friendly', 'mature',
          'jam-game', 'prototype', 'demo', 'full-game'
        ];
        
        if (!Array.isArray(tags)) return true;
        
        for (const tag of tags) {
          if (!allowedTags.includes(tag)) {
            throw new Error(`Invalid tag: ${tag}`);
          }
        }
        return true;
      }),
    
    // Engine validation
    body('engine')
      .optional()
      .isIn(['unity', 'unreal', 'godot', 'gamemaker', 'construct', 'phaser', 'love2d', 'pygame', 'custom', 'other'])
      .withMessage('Invalid engine specified'),
    
    // Platforms validation - now optional with default
    body('platforms')
      .optional()
      .isArray({ max: 10 }).withMessage('Maximum 10 platforms allowed')
      .custom((platforms) => {
        if (!platforms || platforms.length === 0) return true; // Allow empty, will default to 'other'
        
        const allowedPlatforms = [
          'web', 'windows', 'mac', 'linux', 'android', 'ios',
          'playstation', 'xbox', 'nintendo-switch', 'other'
        ];
        
        if (!Array.isArray(platforms)) return false;
        
        for (const platform of platforms) {
          if (!allowedPlatforms.includes(platform)) {
            throw new Error(`Invalid platform: ${platform}`);
          }
        }
        return true;
      }),
    
    // Jam-related fields
    body('jamEntry')
      .optional()
      .isBoolean().withMessage('Jam entry must be true or false'),
    
    body('jamName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Jam name cannot exceed 100 characters'),
    
    body('jamPlacement')
      .optional()
      .isInt({ min: 1, max: 1000 }).withMessage('Placement must be between 1 and 1000'),
    
    // Visibility
    body('visibility')
      .optional()
      .isIn(['public', 'unlisted', 'private'])
      .withMessage('Invalid visibility option')
  ];
};

// Middleware to check game ownership
const checkGameOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    if (!game.canModify(req.user!.userId)) {
      return res.status(403).json({ error: 'You do not have permission to modify this game' });
    }
    
    req.game = game;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new game (authenticated)
router.post('/', 
  authenticate, 
  gameValidationRules(), 
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Count user's existing games for rate limiting
      const gameCount = await Game.countDocuments({ 
        user: req.user!.userId,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });
      
      if (gameCount >= 5) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. You can only create 5 games per hour.' 
        });
      }
      
      // Create new game
      const gameData = {
        ...req.body,
        user: req.user!.userId,
        // Set default platform if none provided
        platforms: req.body.platforms && req.body.platforms.length > 0 ? req.body.platforms : ['other']
      };
      
      const game = new Game(gameData);
      await game.save();
      
      // Populate user info before sending
      await game.populate('user', 'username displayName');
      
      res.status(201).json(game);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Failed to create game' });
    }
  }
);

// Get a single game (public)
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid game ID'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const game = await Game.findById(req.params.id)
        .populate('user', 'username displayName bio');
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      // Check visibility
      if (game.visibility === 'private' && 
          (!req.user || game.user._id.toString() !== req.user.userId)) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      // Increment view count (don't wait for it)
      game.incrementViews().catch((err: Error) => console.error('Failed to increment views:', err));
      
      res.json(game);
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ error: 'Failed to fetch game' });
    }
  }
);

// Update a game (authenticated, owner only)
router.put('/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid game ID'),
  gameValidationRules(),
  handleValidationErrors,
  checkGameOwnership,
  async (req: Request, res: Response) => {
    try {
      // Update fields
      const allowedUpdates = [
        'title', 'description', 'shortDescription', 'thumbnailUrl',
        'screenshots', 'videoUrl', 'playUrl', 'sourceUrl', 'devlogUrl',
        'tags', 'engine', 'platforms', 'jamEntry', 'jamName', 
        'jamPlacement', 'visibility'
      ];
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          (req.game as any)[field] = req.body[field];
        }
      });

      // Handle optional URL fields - if not provided, explicitly unset them
      const optionalUrlFields = ['thumbnailUrl', 'videoUrl', 'playUrl', 'sourceUrl', 'devlogUrl'];
      optionalUrlFields.forEach(field => {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
          (req.game as any)[field] = undefined;
          req.game!.markModified(field);
        }
      });
      
      await req.game!.save();
      await req.game!.populate('user', 'username displayName');
      
      res.json(req.game);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      console.error('Error updating game:', error);
      res.status(500).json({ error: 'Failed to update game' });
    }
  }
);

// Delete a game (authenticated, owner only)
router.delete('/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid game ID'),
  handleValidationErrors,
  checkGameOwnership,
  async (req: Request, res: Response) => {
    try {
      await req.game!.deleteOne();
      res.json({ message: 'Game deleted successfully' });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({ error: 'Failed to delete game' });
    }
  }
);

// Get user's games (public profile)
router.get('/user/:username',
  param('username').isAlphanumeric().withMessage('Invalid username'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Find user by username
      const user = await User.findOne({ username: req.params.username });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = { user: user._id };
      
      // If not the owner, only show public games
      if (!req.user || req.user.userId !== user._id.toString()) {
        query.visibility = 'public';
      }
      
      // Get games and count
      const [games, total] = await Promise.all([
        Game.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Game.countDocuments(query)
      ]);
      
      res.json({
        games,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        user: {
          username: user.username,
          displayName: user.displayName,
          bio: user.bio
        }
      });
    } catch (error) {
      console.error('Error fetching user games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  }
);

// Search/browse games (public)
router.get('/',
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
  query('tags').optional(),
  query('engine').optional(),
  query('platform').optional(),
  query('search').optional(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = { visibility: 'public' };
      
      // Search by title/description
      if (req.query.search) {
        query.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      // Filter by tags
      if (req.query.tags) {
        const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
        query.tags = { $in: tags };
      }
      
      // Filter by engine
      if (req.query.engine) {
        query.engine = req.query.engine;
      }
      
      // Filter by platform
      if (req.query.platform) {
        query.platforms = req.query.platform;
      }
      
      // Get games and count
      const [games, total] = await Promise.all([
        Game.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'username displayName')
          .select('-__v'),
        Game.countDocuments(query)
      ]);
      
      res.json({
        games,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error searching games:', error);
      res.status(500).json({ error: 'Failed to search games' });
    }
  }
);

// Get user's own games (authenticated)
router.get('/my/games',
  authenticate,
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;
      
      // Get user's games
      const [games, total] = await Promise.all([
        Game.find({ user: req.user!.userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Game.countDocuments({ user: req.user!.userId })
      ]);
      
      res.json({
        games,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching user games:', error);
      res.status(500).json({ error: 'Failed to fetch your games' });
    }
  }
);

export default router;