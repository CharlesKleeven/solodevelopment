import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User';

const router = express.Router();

// Rate limiter for OAuth callback
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/itchio/callback
// This will receive the access token from the frontend after implicit OAuth flow
router.post('/callback', oauthLimiter, async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token required' });
    }

    // Verify the token with itch.io API
    let response;
    try {
      response = await axios.get<any>('https://api.itch.io/profile', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
    } catch (verifyError: any) {
      if (verifyError.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Connection to itch.io timed out. Please try again.' });
      }
      if (verifyError.response?.status === 401) {
        return res.status(401).json({ error: 'Invalid or expired itch.io token' });
      }
      throw verifyError; // Re-throw for general error handling
    }

    if (!response.data || !response.data.user) {
      return res.status(401).json({ error: 'Invalid token - no user data received' });
    }

    const itchioUser = response.data.user;

    // Validate required user data
    if (!itchioUser.id) {
      return res.status(400).json({ error: 'Invalid user data from itch.io' });
    }

    // Check if user already exists
    let user = await User.findOne({ itchioId: itchioUser.id });

    if (!user) {
      // Check if email exists (for account linking)
      if (itchioUser.email) {
        user = await User.findOne({ email: itchioUser.email });
        if (user) {
          // Link itch.io account to existing user
          user.itchioId = itchioUser.id;
          user.provider = user.provider === 'local' ? 'mixed' : 'mixed';
          await user.save();
        }
      }

      // If still no user, create new one
      if (!user) {
        // Generate a unique username
        let username = itchioUser.username || `itchio_${itchioUser.id}`;
        let counter = 1;
        while (await User.findOne({ username })) {
          username = `${itchioUser.username || 'itchio'}_${counter}`;
          counter++;
        }

        // For users without email, we'll need to collect it later
        // Use a placeholder that won't conflict with real emails
        const email = itchioUser.email || `pending_${itchioUser.id}@oauth.local`;

        user = new User({
          username,
          email,
          displayName: itchioUser.display_name || itchioUser.username || username,
          provider: 'itchio',
          itchioId: itchioUser.id,
          emailVerified: !!itchioUser.email // Only verified if itch.io provided email
        });

        await user.save();

        // Flag if email needs to be collected
        if (!itchioUser.email) {
          (user as any).needsEmail = true;
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set cookie like other auth methods do
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Return user info (token is in httpOnly cookie)
    res.json({
      message: 'Authentication successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    });

  } catch (error: any) {
    // Log errors only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Itch.io auth error:', error.message);
    }

    // Check if it's an axios error from itch.io API
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid or expired itch.io token'
      });
    }

    res.status(500).json({
      error: 'Failed to authenticate with itch.io'
    });
  }
});

export default router;