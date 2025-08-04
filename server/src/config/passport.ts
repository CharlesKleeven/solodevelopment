import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as DiscordStrategy } from 'passport-discord';
import User from '../models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to normalize Gmail addresses
function normalizeGmailAddress(email: string): string {
  if (!email) return email;
  
  const [localPart, domain] = email.toLowerCase().split('@');
  
  // Only normalize Gmail addresses
  if (domain === 'gmail.com') {
    // Remove dots from local part and ignore everything after +
    const normalizedLocal = localPart.replace(/\./g, '').split('+')[0];
    return `${normalizedLocal}@${domain}`;
  }
  
  // For non-Gmail addresses, just lowercase
  return email.toLowerCase();
}

// Serialize user for session storage
passport.serializeUser((user: any, done) => {
  // Handle temporary OAuth user data
  if (user.isNewUser) {
    done(null, { tempOAuthUser: user });
  } else {
    // Handle regular user objects
    done(null, user._id);
  }
});

// Deserialize user from session
passport.deserializeUser(async (data: any, done) => {
  try {
    // Handle temporary OAuth user data
    if (data && data.tempOAuthUser) {
      done(null, data.tempOAuthUser);
    } else {
      // Handle regular user ID
      const user = await User.findById(data).select('-password');
      done(null, user);
    }
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.solodevelopment.org/api/auth/google/callback'
    : 'http://localhost:3001/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      return done(null, existingUser);
    }

    // Check if user exists with the same email (for account linking)
    const userEmail = profile.emails?.[0]?.value;
    
    // For new users, prepare temporary user data for username selection
    const tempUserData = {
      isNewUser: true,
      provider: 'google',
      googleId: profile.id,
      email: userEmail,
      displayName: profile.displayName || userEmail?.split('@')[0] || 'user',
      suggestedUsername: await generateUniqueUsername(profile.displayName || userEmail?.split('@')[0] || 'user')
    };

    if (!userEmail) {
      return done(null, tempUserData);
    }
    
    const normalizedEmail = normalizeGmailAddress(userEmail);
    
    // Try to find user with both original and normalized email
    const emailUser = await User.findOne({ 
      $or: [
        { email: userEmail },
        { email: normalizedEmail }
      ]
    });
    
    if (emailUser) {
      // Link Google account to existing user
      emailUser.googleId = profile.id;
      emailUser.provider = emailUser.provider === 'local' ? 'mixed' : 'mixed';
      await emailUser.save();
      return done(null, emailUser);
    }

    return done(null, tempUserData);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

// Discord OAuth Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.solodevelopment.org/api/auth/discord/callback'
    : 'http://localhost:3001/api/auth/discord/callback',
  scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Log profile to see what fields are available
    console.log('Discord profile object:', JSON.stringify(profile, null, 2));
    
    // Check if user already exists with this Discord ID
    let existingUser = await User.findOne({ discordId: profile.id });
    
    if (existingUser) {
      return done(null, existingUser);
    }

    // Check if user exists with the same email (for account linking)
    const userEmail = profile.email;
    
    // Check if email is verified - Discord provides this in the profile
    // The 'verified' field should be available if the email scope is granted
    const emailVerified = (profile as any).verified || false;
    
    // For new users, prepare temporary user data for username selection
    const tempUserData = {
      isNewUser: true,
      provider: 'discord',
      discordId: profile.id,
      email: userEmail,
      emailVerified: emailVerified, // Pass the verified status
      displayName: profile.displayName || profile.username || userEmail?.split('@')[0] || 'user',
      suggestedUsername: await generateUniqueUsername(profile.username || userEmail?.split('@')[0] || 'user')
    };

    if (!userEmail) {
      return done(null, tempUserData);
    }
    
    const normalizedEmail = normalizeGmailAddress(userEmail);
    
    // Try to find user with both original and normalized email
    const emailUser = await User.findOne({ 
      $or: [
        { email: userEmail },
        { email: normalizedEmail }
      ]
    });
    
    if (emailUser) {
      // Link Discord account to existing user
      emailUser.discordId = profile.id;
      emailUser.provider = emailUser.provider === 'local' ? 'mixed' : 'mixed';
      await emailUser.save();
      return done(null, emailUser);
    }

    return done(null, tempUserData);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return done(error, false);
  }
}));

// Helper function to generate unique username
async function generateUniqueUsername(baseUsername: string): Promise<string> {
  // Clean the username - only letters, numbers, underscores
  let cleanUsername = baseUsername
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 15); // Limit length

  // Ensure it starts with a letter
  if (!/^[a-z]/.test(cleanUsername)) {
    cleanUsername = 'user' + cleanUsername;
  }

  // Ensure minimum length
  if (cleanUsername.length < 5) {
    cleanUsername = cleanUsername + Math.random().toString(36).substring(2, 7);
  }

  let username = cleanUsername;
  let counter = 1;

  // Check if username exists and increment until unique
  while (await User.findOne({ username })) {
    username = `${cleanUsername}${counter}`;
    counter++;
  }

  return username;
}

export default passport;