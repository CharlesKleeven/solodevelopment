import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User';
import { sendPasswordResetEmail } from '../services/emailService';
import { validateLink } from '../utils/linkValidator';
// Use Express Request type with user property added via type declaration

export const loginValidation = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
export const updateProfileValidation = [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Display name must be between 1 and 20 characters'),
  body('bio')
    .optional()
    .isLength({ max: 280 })
    .withMessage('Bio must be 280 characters or less'),
  body('profileVisibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Profile visibility must be either public or private'),
  body('links')
    .optional()
    .isArray({ max: 4 })
    .withMessage('Maximum 4 links allowed')
    .custom((links) => {
      if (links && Array.isArray(links)) {
        for (const link of links) {
          if (link && link.trim() !== '') {
            // Use the link validator
            const validation = validateLink(link);
            if (!validation.isValid) {
              throw new Error(validation.error || `"${link}" is not a valid URL`);
            }
          }
        }
      }
      return true;
    }),
];

// Password reset validation rules
export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

// Login existing user
export const login = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { emailOrUsername, password } = req.body;

    // Find user by email OR username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user has a password (local users only)
    if (!user.password) {
      return res.status(400).json({ error: 'Invalid credentials. Please use OAuth to login.' });
    }

    // Check if password matches the hashed password in database
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send success response
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        links: user.links,
        profileVisibility: user.profileVisibility,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin || false,
        emailVerified: user.emailVerified || false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}

// Get current user
export const me = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req.user as any)?.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        links: user.links,
        profileVisibility: user.profileVisibility,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin || false,
        emailVerified: user.emailVerified || false
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user profile (with bio and links)
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req.user as any)?.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio || '',
        links: user.links || [],
        profileVisibility: user.profileVisibility,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isAdmin: user.isAdmin || false,
        emailVerified: user.emailVerified || false
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { displayName, bio, profileVisibility, links } = req.body;

    // Find and update user
    const user = await User.findById((req.user as any)?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (displayName !== undefined) {
      user.displayName = displayName.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profileVisibility !== undefined) {
      user.profileVisibility = profileVisibility;
    }

    if (links !== undefined) {
      // Process links to store both display text and full URL
      user.links = links
        .filter((link: string) => link && link.trim() !== '')
        .map((link: string) => {
          const displayText = link.trim();
          let fullUrl = displayText;

          // Auto-add https:// for linking but keep original for display
          if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            fullUrl = 'https://' + fullUrl;
          }

          // Store as JSON string with both values
          return JSON.stringify({ display: displayText, url: fullUrl });
        });
    }

    await user.save();

    // Return updated user data
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio || '',
        links: user.links || [],
        profileVisibility: user.profileVisibility,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isAdmin: user.isAdmin || false,
        emailVerified: user.emailVerified || false
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};

// Forgot password - send reset email
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set token and expiration (15 minutes)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      await user.save();

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Send email
      try {
        await sendPasswordResetEmail({
          to: user.email,
          username: user.displayName || user.username,
          resetUrl
        });
      } catch (emailError) {
        // Clear the reset token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
      }
    }

    // Always return success message (security best practice)
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();


    res.json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};