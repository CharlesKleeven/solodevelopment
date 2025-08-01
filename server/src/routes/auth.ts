import express from 'express';
import rateLimit from 'express-rate-limit';
import passport from '../config/passport';
import { login, logout, loginValidation, me, getProfile, updateProfile, updateProfileValidation, forgotPassword, resetPassword, forgotPasswordValidation, resetPasswordValidation } from '../controllers/authController';
// Use Express Request type with user property added via type declaration
import { authenticateToken } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmailVerificationEmail } from '../services/emailService';

// Auth-specific rate limiter - 20 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        error: 'Too many authentication attempts. Please try again in 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Create router instance
const router = express.Router();

// POST /api/auth/register: body includes { username, email, password }
router.post('/register', authLimiter, [
    body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
        .withMessage('Username must start with a letter and contain only letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
], async (req: express.Request, res: express.Response) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists FIRST (more specific error)
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email or username already exists'
            });
        }

        // Then check validation errors (format issues)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg,
                details: errors.array()
            });
        }

        // Hash password with higher saltRounds for production
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Create user in database
        const user = new User({
            username,
            email,
            password: hashedPassword,
            displayName: username,
            emailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await user.save();

        // Send verification email (but don't block on failure)
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        
        try {
            await sendEmailVerificationEmail({
                to: user.email,
                username: user.displayName || user.username,
                verificationUrl
            });
        } catch (emailError) {
            // Log error but don't fail registration
            console.error('Failed to send verification email:', emailError);
            // Continue with registration anyway
        }

        // Generate JWT and auto-login the user
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
            }
        });

    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({
            error: 'Server error during registration'
        });
    }
});

// POST /api/auth/login: body includes { email, password }
router.post('/login', authLimiter, loginValidation, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me: get current user (protected route)
router.get('/me', authenticateToken, me);

// GET /api/auth/profile: get current user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile: update user profile (protected route)
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);

// POST /api/auth/forgot-password: send password reset email
router.post('/forgot-password', authLimiter, forgotPasswordValidation, forgotPassword);

// POST /api/auth/reset-password: reset password with token
router.post('/reset-password', authLimiter, resetPasswordValidation, resetPassword);

// Email verification validation
const verifyEmailValidation = [
    body('token')
        .notEmpty()
        .withMessage('Verification token is required')
];

const resendVerificationValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];

// POST /api/auth/verify-email: verify email with token
router.post('/verify-email', authLimiter, verifyEmailValidation, async (req: express.Request, res: express.Response) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { token } = req.body;

        // Find user with valid verification token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() } // Token not expired
        });

        if (!user) {
            return res.status(400).json({ 
                error: 'Invalid or expired verification token. Please request a new verification email.' 
            });
        }

        // Update user as verified
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        // Generate JWT token for auto-login after verification
        const jwtToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Set token in cookie
        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ 
            message: 'Email verified successfully! You are now logged in.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Server error during email verification' });
    }
});

// POST /api/auth/resend-verification: resend verification email
router.post('/resend-verification', authLimiter, resendVerificationValidation, async (req: express.Request, res: express.Response) => {
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
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ 
                message: 'If an account with that email exists and is unverified, a new verification email has been sent.' 
            });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({ 
                error: 'This email is already verified. You can log in.' 
            });
        }

        // Check if user is OAuth user
        if (user.provider !== 'local') {
            return res.status(400).json({ 
                error: 'OAuth accounts do not require email verification.' 
            });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Update token and expiration
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        
        try {
            await sendEmailVerificationEmail({
                to: user.email,
                username: user.displayName || user.username,
                verificationUrl
            });
        } catch (emailError) {
            // Reset the token if email fails
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
            
            console.error('Failed to send verification email:', emailError);
            return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
        }

        res.json({ 
            message: 'Verification email has been resent. Please check your inbox.' 
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Server error during resend verification' });
    }
});

// OAuth helper function to handle JWT generation and redirection
const handleOAuthCallback = (req: express.Request, res: express.Response) => {
    try {
        const user = req.user as any;
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        // Check if this is a new user who needs to select username
        if (user.isNewUser) {
            // Temporary user data is already in session via Passport serialization
            return res.redirect(`${process.env.FRONTEND_URL}/select-username`);
        }

        // Existing user - generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect to OAuth callback page to refresh auth state
        res.redirect(`${process.env.FRONTEND_URL}/oauth-callback`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
    }
};

// Google OAuth routes
// GET /api/auth/google: initiate Google OAuth
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

// GET /api/auth/google/callback: handle Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` 
    }),
    handleOAuthCallback
);

// Discord OAuth routes
// GET /api/auth/discord: initiate Discord OAuth
router.get('/discord',
    passport.authenticate('discord', {
        scope: ['identify', 'email']
    })
);

// GET /api/auth/discord/callback: handle Discord OAuth callback
router.get('/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=discord_auth_failed`
    }),
    handleOAuthCallback
);

// Username selection endpoints for OAuth users
// GET /api/auth/oauth/user-data: get temporary OAuth user data
router.get('/oauth/user-data', (req: express.Request, res: express.Response) => {
    const tempUser = req.user as any;
    if (!tempUser || !tempUser.isNewUser) {
        return res.status(404).json({ error: 'No OAuth registration in progress' });
    }

    const { provider, email, displayName, suggestedUsername } = tempUser;
    
    res.json({
        provider,
        email,
        displayName,
        suggestedUsername
    });
});

// POST /api/auth/oauth/complete: complete OAuth registration with chosen username
router.post('/oauth/complete', 
    authLimiter,
    async (req: express.Request, res: express.Response) => {
        try {
            const { username } = req.body;
            const tempUser = req.user as any;

            if (!tempUser || !tempUser.isNewUser) {
                return res.status(404).json({ error: 'No OAuth registration in progress' });
            }

            // Check if username is available FIRST (more specific error)
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Username is already taken' });
            }

            // Then check format validation manually
            if (!username || username.length < 3 || username.length > 20) {
                return res.status(400).json({ 
                    error: 'Username must be between 3 and 20 characters'
                });
            }

            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
                return res.status(400).json({ 
                    error: 'Username must start with a letter and contain only letters, numbers, and underscores'
                });
            }

            // Create the new user
            const newUser = new User({
                username,
                email: tempUser.email,
                displayName: tempUser.displayName,
                provider: tempUser.provider,
                // For Discord, use the verified status from Discord; for Google, assume verified
                emailVerified: tempUser.provider === 'discord' ? (tempUser.emailVerified || false) : true,
                ...(tempUser.googleId && { googleId: tempUser.googleId }),
                ...(tempUser.discordId && { discordId: tempUser.discordId })
            });

            await newUser.save();

            // Clear temporary data by logging out from Passport session
            req.logout((err) => {
                if (err) console.error('Logout error:', err);
            });

            // Generate JWT token
            const token = jwt.sign(
                { userId: newUser._id },
                process.env.JWT_SECRET!,
                { expiresIn: '7d' }
            );

            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({ 
                message: 'Registration completed successfully',
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    displayName: newUser.displayName,
                    provider: newUser.provider
                }
            });

        } catch (error) {
            console.error('OAuth registration completion error:', error);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
);

// POST /api/auth/oauth/check-username: check if username is available
router.post('/oauth/check-username',
    authLimiter,
    async (req: express.Request, res: express.Response) => {
        try {
            const { username } = req.body;

            // Check if username is taken FIRST (more specific error)
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.json({ 
                    available: false, 
                    error: 'Username is already taken' 
                });
            }

            // Then check format validation
            if (!username || username.length < 3 || username.length > 20) {
                return res.json({ 
                    available: false, 
                    error: 'Username must be between 3 and 20 characters' 
                });
            }

            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
                return res.json({ 
                    available: false, 
                    error: 'Username must start with a letter and contain only letters, numbers, and underscores' 
                });
            }

            res.json({ 
                available: true,
                error: null
            });

        } catch (error) {
            console.error('Username check error:', error);
            res.status(500).json({ available: false, error: 'Server error' });
        }
    }
);

export default router;