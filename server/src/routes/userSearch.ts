import express, { Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User';

const router = express.Router();

import Game from '../models/Game';

// Helper to check validation errors
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Search users by username or display name
router.get('/search',
  query('q')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_.]+$/)
    .withMessage('Search query contains invalid characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid page number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Invalid limit'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;

      // Build search query - search in username and displayName, only public profiles
      const searchRegex = new RegExp(searchQuery, 'i'); // Case insensitive
      const query = {
        $and: [
          { profileVisibility: 'public' },
          {
            $or: [
              { username: searchRegex },
              { displayName: searchRegex }
            ]
          }
        ]
      };

      // Get users and count
      const [users, total] = await Promise.all([
        User.find(query)
          .select('username displayName bio createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query)
      ]);

      // Get game counts for each user
      const usersWithGameCounts = await Promise.all(
        users.map(async (user) => {
          const gameCount = await Game.countDocuments({ 
            user: user._id, 
            visibility: 'public' 
          });
          
          return {
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            gameCount,
            joinedAt: user.createdAt
          };
        })
      );

      res.json({
        users: usersWithGameCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        searchQuery
      });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
);

// Get community members (only users with games for featured section)
router.get('/featured',
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Invalid limit'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      // Get all public users
      const allUsers = await User.find({ 
        profileVisibility: 'public'
      })
        .select('username displayName bio createdAt')
        .sort({ createdAt: -1 }) // Most recent users first
        .limit(limit * 3) // Get more users to filter from
        .lean();

      // Get game counts for each user
      const communityUsers = await Promise.all(
        allUsers.map(async (user) => {
          const gameCount = await Game.countDocuments({ 
            user: user._id, 
            visibility: 'public' 
          });
          
          return {
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            gameCount,
            joinedAt: user.createdAt
          };
        })
      );

      // Filter to only users with games, sort by game count (desc) then by join date (desc)
      const sortedUsers = communityUsers
        .filter(user => user.gameCount > 0) // Only show users with games in featured
        .sort((a, b) => {
          // First sort by game count (users with more games first)
          if (a.gameCount !== b.gameCount) {
            return b.gameCount - a.gameCount;
          }
          // Then by join date (newest first)
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        })
        .slice(0, limit);

      res.json(sortedUsers);
    } catch (error) {
      console.error('Error fetching community users:', error);
      res.status(500).json({ error: 'Failed to fetch community members' });
    }
  }
);

// Get user stats (public profile info)
router.get('/:username/stats',
  async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      // Find user
      const user = await User.findOne({ username })
        .select('username displayName bio createdAt profileVisibility links')
        .lean();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Private profiles are accessible via direct link but show limited info
      if (user.profileVisibility === 'private') {
        return res.json({
          user: {
            username: user.username,
            displayName: user.displayName,
            bio: '',
            joinedAt: user.createdAt,
            isPrivate: true
          },
          stats: {
            gameCount: 0,
            totalViews: 0
          },
          recentGames: []
        });
      }

      // Get game stats for public profiles
      const [gameCount, totalViews, recentGames] = await Promise.all([
        Game.countDocuments({ user: user._id, visibility: 'public' }),
        Game.aggregate([
          { $match: { user: user._id, visibility: 'public' } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]).then((result: any[]) => result[0]?.totalViews || 0),
        Game.find({ user: user._id, visibility: 'public' })
          .select('title slug thumbnailUrl createdAt views description tags playUrl')
          .sort({ createdAt: -1 })
          .limit(3)
          .lean()
      ]);

      res.json({
        user: {
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          joinedAt: user.createdAt,
          isPrivate: false,
          links: user.links
        },
        stats: {
          gameCount,
          totalViews
        },
        recentGames
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  }
);

export default router;