import express, { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

// Import models
import User from '../models/User';
import Game, { IGame } from '../models/Game';

// Game type interfaces  
interface GameRequest extends express.Request {
  game?: any;
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
const checkGameOwnership = async (req: any, res: Response, next: NextFunction) => {
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
  async (req: any, res: Response) => {
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
      
      // Handle duplicate key error (this shouldn't happen with our new logic, but just in case)
      if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
        return res.status(400).json({ 
          error: 'A game with this title already exists in your collection. Please choose a different title.' 
        });
      }
      
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Failed to create game' });
    }
  }
);

// Get community games (public)
router.get('/community',
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
  query('engine').optional().isIn(['unity', 'unreal', 'godot', 'gamemaker', 'construct', 'phaser', 'love2d', 'pygame', 'custom', 'other']).withMessage('Invalid engine'),
  query('tag').optional().matches(/^[a-z0-9\-]+$/).withMessage('Invalid tag format'),
  query('sort').optional().isIn(['newest', 'random', 'updated']).withMessage('Invalid sort option'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search query too long'),
  handleValidationErrors,
  async (req: any, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;
      const engineFilter = req.query.engine as string | undefined;
      const tagFilter = req.query.tag as string | undefined;
      const sortOption = req.query.sort as string || 'newest';
      const searchQuery = req.query.search as string | undefined;
      
      // Build query
      const query: any = { 
        visibility: 'public',
        ...(engineFilter && { engine: engineFilter }),
        ...(tagFilter && { tags: tagFilter })
      };
      
      // Build sort
      const sortMap: Record<string, any> = {
        'updated': { updatedAt: -1 },
        'newest': { createdAt: -1 }
      };
      const sort = sortMap[sortOption] || sortMap.newest;
      
      // Get games with user info
      let games;
      let total;
      
      // Use aggregation if we need to search by developer name or random sort
      if (searchQuery || sortOption === 'random') {
        const pipeline: any[] = [];
        
        // First match basic query conditions
        const matchStage: any = { visibility: 'public' };
        if (engineFilter) matchStage.engine = engineFilter;
        if (tagFilter) matchStage.tags = tagFilter;
        
        pipeline.push({ $match: matchStage });
        
        // Join with users collection
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        });
        pipeline.push({ $unwind: '$userInfo' });
        
        // Apply search filter after join if searching
        if (searchQuery) {
          pipeline.push({
            $match: {
              $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { 'userInfo.username': { $regex: searchQuery, $options: 'i' } },
                { 'userInfo.displayName': { $regex: searchQuery, $options: 'i' } }
              ]
            }
          });
        }
        
        // Count total before pagination
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await Game.aggregate(countPipeline);
        total = countResult[0]?.total || 0;
        
        // Apply sorting
        if (sortOption === 'random') {
          pipeline.push({ $sample: { size: limit } });
        } else {
          pipeline.push({ $sort: sort });
          pipeline.push({ $skip: skip });
          pipeline.push({ $limit: limit });
        }
        
        // Project final shape
        pipeline.push({
          $project: {
            title: 1,
            slug: 1,
            description: 1,
            thumbnailUrl: 1,
            tags: 1,
            engine: 1,
            platforms: 1,
            playUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            user: {
              _id: '$userInfo._id',
              username: '$userInfo.username',
              displayName: '$userInfo.displayName'
            }
          }
        });
        
        games = await Game.aggregate(pipeline);
      } else {
        // Regular query with populate (no search)
        [games, total] = await Promise.all([
          Game.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('user', 'username displayName')
            .select('title slug description thumbnailUrl tags engine platforms playUrl createdAt updatedAt user'),
          Game.countDocuments(query)
        ]);
      }
      
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
      console.error('Error fetching community games:', error);
      res.status(500).json({ error: 'Failed to fetch community games' });
    }
  }
);

// Get a single game (public)
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid game ID'),
  handleValidationErrors,
  async (req: any, res: Response) => {
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
  async (req: any, res: Response) => {
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
      
      // Handle duplicate key error
      if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
        return res.status(400).json({ 
          error: 'You already have another game with this title. Please choose a different title.' 
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
  async (req: any, res: Response) => {
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
  async (req: any, res: Response) => {
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
  async (req: any, res: Response) => {
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
  async (req: any, res: Response) => {
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

// Report a game
router.post('/:id/report',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const gameId = req.params.id;
      
      // Find the game
      const game = await Game.findById(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      // Don't allow users to report their own games
      if (game.user.toString() === (req.user as any).userId) {
        return res.status(400).json({ error: 'You cannot report your own game' });
      }
      
      // Update report fields
      game.reported = true;
      game.reportCount = (game.reportCount || 0) + 1;
      await game.save();
      
      res.json({ 
        message: 'Thank you for your report. We will review this content.',
        reported: true 
      });
    } catch (error) {
      console.error('Error reporting game:', error);
      res.status(500).json({ error: 'Failed to report game' });
    }
  }
);

// Admin middleware - copied from backup.ts
const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = await User.findById(userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// Get reported games (admin only)
router.get('/reported/list',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Get all games with reports
      const reportedGames = await Game.find({ 
        reportCount: { $gt: 0 } 
      })
      .populate('user', 'username displayName')
      .sort({ reportCount: -1 })
      .select('title thumbnailUrl user reportCount isAdult createdAt');
      
      res.json({
        games: reportedGames,
        total: reportedGames.length
      });
    } catch (error) {
      console.error('Error fetching reported games:', error);
      res.status(500).json({ error: 'Failed to fetch reported games' });
    }
  }
);

// Clear reports for a game (admin only)
router.put('/:id/clear-reports',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      game.reported = false;
      game.reportCount = 0;
      await game.save();
      
      res.json({ 
        message: 'Reports cleared successfully',
        game: game 
      });
    } catch (error) {
      console.error('Error clearing reports:', error);
      res.status(500).json({ error: 'Failed to clear reports' });
    }
  }
);

// Remove thumbnail (admin only)
router.put('/:id/remove-thumbnail',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      game.thumbnailUrl = undefined;
      game.markModified('thumbnailUrl');
      await game.save();
      
      res.json({ 
        message: 'Thumbnail removed successfully',
        game: game 
      });
    } catch (error) {
      console.error('Error removing thumbnail:', error);
      res.status(500).json({ error: 'Failed to remove thumbnail' });
    }
  }
);

export default router;