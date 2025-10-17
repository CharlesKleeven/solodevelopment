import express from 'express';
import rateLimit from 'express-rate-limit';
import passport from '../config/passport';
import { login, logout, loginValidation, me, getProfile, updateProfile, updateProfileValidation, forgotPassword, resetPassword, forgotPasswordValidation, resetPasswordValidation, unlinkProvider } from '../controllers/authController';
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

// POST /api/auth/change-email: request email change (requires auth)
router.post('/change-email', authenticateToken, authLimiter, async (req: express.Request, res: express.Response) => {
    try {
        const { newEmail } = req.body;
        const userId = (req as any).user?.userId;

        if (!newEmail) {
            return res.status(400).json({ error: 'New email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Prevent changing to placeholder emails
        if (newEmail.toLowerCase().includes('@oauth.local')) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Check if email is already in use (silently fail to prevent enumeration)
        const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
        if (existingUser) {
            // Don't reveal that email exists - send success message
            return res.json({ message: 'Verification email sent to new address' });
        }

        // Get current user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if trying to change to the same email
        if (user.email.toLowerCase() === newEmail.toLowerCase()) {
            return res.status(400).json({ error: 'This is already your current email address' });
        }

        // Check if user already has a pending email change
        if (user.pendingEmail && user.pendingEmailExpires && user.pendingEmailExpires > new Date()) {
            return res.status(400).json({
                error: 'You already have a pending email change. Please wait for it to expire or complete the verification.'
            });
        }

        // Generate verification token for new email
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store pending email change in user document
        user.pendingEmail = newEmail.toLowerCase();
        user.pendingEmailToken = verificationToken;
        user.pendingEmailExpires = verificationExpires;
        await user.save();

        // Send verification email to NEW address
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email-change?token=${verificationToken}`;

        try {
            await sendEmailVerificationEmail({
                to: newEmail,
                username: user.username,
                verificationUrl
            });
            res.json({ message: 'Verification email sent to new address' });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Clear pending email data if sending fails
            user.pendingEmail = undefined;
            user.pendingEmailToken = undefined;
            user.pendingEmailExpires = undefined;
            await user.save();
            res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
        }
    } catch (error) {
        console.error('Change email error:', error);
        res.status(500).json({ error: 'Server error during email change' });
    }
});

// POST /api/auth/verify-email-change: verify new email with token
router.post('/verify-email-change', authLimiter, async (req: express.Request, res: express.Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        // Find user with valid token
        const user = await User.findOne({
            pendingEmailToken: token,
            pendingEmailExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        // Update email and clear pending fields
        user.email = user.pendingEmail!;
        user.emailVerified = true;
        user.pendingEmail = undefined;
        user.pendingEmailToken = undefined;
        user.pendingEmailExpires = undefined;
        await user.save();

        res.json({
            message: 'Email successfully changed and verified',
            email: user.email
        });
    } catch (error) {
        console.error('Verify email change error:', error);
        res.status(500).json({ error: 'Server error during email verification' });
    }
});

// POST /api/auth/set-email-and-verify: set or update email for unverified users and send verification
router.post('/set-email-and-verify', authenticateToken, authLimiter, async (req: express.Request, res: express.Response) => {
    try {
        const userId = (req as any).user.userId;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Check if user's email is already verified with a real email
        if (user.emailVerified && !user.email?.includes('@oauth.local')) {
            return res.status(400).json({
                error: 'Your email is already verified. Use profile settings to change it.'
            });
        }

        // Check if email is already taken
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({
                error: 'This email address is already in use by another account'
            });
        }

        // Update user's email
        user.email = email;
        user.emailVerified = false;

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
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
            message: `Email ${user.email?.includes('@oauth.local') ? 'set' : 'updated'}! Verification email has been sent to ${email}`,
            email: email
        });

    } catch (error) {
        console.error('Set email and verify error:', error);
        res.status(500).json({ error: 'Server error during email update' });
    }
});

// POST /api/auth/resend-verification-authenticated: resend verification email for logged-in user
router.post('/resend-verification-authenticated', authenticateToken, authLimiter, async (req: express.Request, res: express.Response) => {
    try {
        const userId = (req as any).user.userId;

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({
                error: 'Your email is already verified.'
            });
        }

        // Check if user has an email
        if (!user.email || user.email.includes('@oauth.local')) {
            return res.status(400).json({
                error: 'Please set an email address in your profile first.'
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
            message: 'Verification email has been sent to ' + user.email
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Server error during resend verification' });
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

        // Check if user is OAuth-only user (not mixed provider)
        // Mixed provider users still need email verification for voting
        if (user.provider !== 'local' && user.provider !== 'mixed' && !user.password) {
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
const handleOAuthCallback = async (req: express.Request, res: express.Response) => {
    try {
        const user = req.user as any;
        const session = (req as any).session;

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        // Check if this is an account linking operation
        if (session?.linkingAccount && session?.linkingUserId) {
            const linkingProvider = session.linkingProvider;
            const linkingUserId = session.linkingUserId;

            // Clear the session flags
            delete session.linkingAccount;
            delete session.linkingProvider;
            delete session.linkingUserId;

            // Find the logged-in user who initiated the linking
            const currentUser = await User.findById(linkingUserId);
            if (!currentUser) {
                return res.redirect(`${process.env.FRONTEND_URL}/profile?error=link_failed`);
            }

            // Link the OAuth account to the current user
            const oauthUser = await User.findById(user._id);
            if (!oauthUser) {
                return res.redirect(`${process.env.FRONTEND_URL}/profile?error=link_failed`);
            }

            // SECURITY CHECK: If the OAuth user is different from current user,
            // that means this OAuth account is already linked to another user
            if (oauthUser._id.toString() !== currentUser._id.toString()) {
                // Check if this is a newly created temp user or an existing user
                const oauthCreatedRecently =
                    oauthUser.createdAt &&
                    (Date.now() - oauthUser.createdAt.getTime()) < 60000; // Created within last minute

                if (!oauthCreatedRecently) {
                    // This OAuth account belongs to another existing user
                    return res.redirect(`${process.env.FRONTEND_URL}/profile?error=already_linked`);
                }

                // It's a newly created temp user, safe to link
                // Update the current user with the OAuth provider ID
                switch(linkingProvider) {
                    case 'google':
                        if (oauthUser.googleId) {
                            currentUser.googleId = oauthUser.googleId;
                        }
                        break;
                    case 'discord':
                        if (oauthUser.discordId) {
                            currentUser.discordId = oauthUser.discordId;
                        }
                        break;
                    case 'itchio':
                        if (oauthUser.itchioId) {
                            currentUser.itchioId = oauthUser.itchioId;
                        }
                        break;
                }
            } else {
                // User is trying to link an OAuth account they already have linked
                return res.redirect(`${process.env.FRONTEND_URL}/profile?error=already_yours`);
            }

            // Update provider field to 'mixed' if they have multiple providers
            const hasMultipleProviders = [
                !!currentUser.googleId,
                !!currentUser.discordId,
                !!currentUser.itchioId,
                !!currentUser.password
            ].filter(Boolean).length > 1;

            if (hasMultipleProviders) {
                currentUser.provider = 'mixed';
            }

            await currentUser.save();

            // Delete the temporary OAuth user if it's different from the current user
            if (oauthUser._id.toString() !== currentUser._id.toString()) {
                await User.deleteOne({ _id: oauthUser._id });
            }

            // Redirect back to profile with success message
            return res.redirect(`${process.env.FRONTEND_URL}/profile?linked=${linkingProvider}`);
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

// Account linking middleware to track linking state
const setLinkingState = (provider: string) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((req as any).user) {
        // User is logged in, so this is a linking operation
        (req as any).session.linkingAccount = true;
        (req as any).session.linkingProvider = provider;
        (req as any).session.linkingUserId = (req as any).user.userId;
    }
    next();
};

// Google OAuth routes
// GET /api/auth/google: initiate Google OAuth
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// GET /api/auth/link/google: link Google account (requires auth)
router.get('/link/google',
    authenticateToken,
    setLinkingState('google'),
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

// GET /api/auth/link/discord: link Discord account (requires auth)
router.get('/link/discord',
    authenticateToken,
    setLinkingState('discord'),
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

// Itch.io OAuth is handled via implicit flow - frontend redirects to itch.io
// The callback is handled in separate itchioAuth.ts router

// GET /api/auth/link/itchio: initiate itch.io account linking
router.get('/link/itchio', authenticateToken, (req: express.Request, res: express.Response) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
        return res.redirect(`${process.env.FRONTEND_URL}/profile?error=auth_required`);
    }

    // Generate a state token for linking
    const linkingState = jwt.sign(
        { userId, linking: true },
        process.env.JWT_SECRET!,
        { expiresIn: '10m' }
    );

    // Redirect to itch.io OAuth with state parameter
    const clientId = process.env.ITCHIO_CLIENT_ID || 'f6842af5baa31d79729430996467e151';
    const redirectUri = encodeURIComponent(`${process.env.FRONTEND_URL}/itchio-callback`);
    const itchioAuthUrl = `https://itch.io/user/oauth?client_id=${clientId}&scope=profile%3Ame&response_type=token&redirect_uri=${redirectUri}&state=${linkingState}`;

    res.redirect(itchioAuthUrl);
});

// DELETE /api/auth/oauth/conflict/:accountId: delete conflicting OAuth account for merge
router.delete('/oauth/conflict/:accountId', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        const { accountId } = req.params;
        const currentUserId = (req as any).user.userId;

        // Find the conflicting account
        const conflictingAccount = await User.findById(accountId);

        if (!conflictingAccount) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Verify this is a "dummy" OAuth-only account
        const isDummyAccount =
            !conflictingAccount.password &&
            [conflictingAccount.googleId, conflictingAccount.discordId, conflictingAccount.itchioId]
                .filter(Boolean).length === 1;

        if (!isDummyAccount) {
            return res.status(400).json({
                error: 'Cannot delete account: Account has multiple authentication methods or is not an OAuth-only account'
            });
        }

        // Store the OAuth IDs before deletion (for re-linking)
        const oauthIds = {
            googleId: conflictingAccount.googleId,
            discordId: conflictingAccount.discordId,
            itchioId: conflictingAccount.itchioId
        };

        // Delete the conflicting account
        await User.deleteOne({ _id: accountId });

        res.json({
            success: true,
            message: 'Conflicting account deleted. You can now retry linking.',
            deletedOAuthIds: oauthIds
        });
    } catch (error) {
        console.error('Error deleting conflicting account:', error);
        res.status(500).json({ error: 'Failed to delete conflicting account' });
    }
});

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
                // For Discord, use the verified status from Discord; for Google/Itch.io, assume verified
                emailVerified: tempUser.provider === 'discord' ? (tempUser.emailVerified || false) : true,
                ...(tempUser.googleId && { googleId: tempUser.googleId }),
                ...(tempUser.discordId && { discordId: tempUser.discordId }),
                ...(tempUser.itchioId && { itchioId: tempUser.itchioId })
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

// DELETE /api/auth/provider/:provider - unlink OAuth provider
router.delete('/provider/:provider', authenticateToken, unlinkProvider);

export default router;