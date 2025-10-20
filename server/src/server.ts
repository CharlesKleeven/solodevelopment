import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth';  // Import auth routes
import itchioAuthRoutes from './routes/itchioAuth';  // Import itch.io auth routes
import jamRoutes from './routes/jam';
import contactRoutes from './routes/contact';
import gameRoutes from './routes/game';
import userSearchRoutes from './routes/userSearch';
import themeRoutes from './routes/theme';
import jamManagementRoutes from './routes/jamManagement';
import backupRoutes from './routes/backup';
import redirectRoutes from './routes/redirect';
import { handleRedirect } from './controllers/redirectController';
import { initializeCronJobs } from './services/cronJobs';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI', 'FRONTEND_URL', 'RESEND_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Render deployment
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet()); // Security headers

// Rate limiting - 200 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        error: 'Rate limit exceeded. Please wait 15 minutes before making more requests.',
        retryAfter: '15 minutes'
    }
});
app.use(limiter);

// CORS configuration - MUST be before routes
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? [process.env.FRONTEND_URL || 'https://solodevelopment.org']
            : ['http://localhost:3000', 'http://127.0.0.1:3000'];
            
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200 // For legacy browser support
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Session middleware for OAuth
app.use(session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/jam', jamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth/itchio', itchioAuthRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userSearchRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/jam-management', jamManagementRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/redirects', redirectRoutes);

// Connect to MongoDB with longer timeout for Render
mongoose
    .connect(process.env.MONGO_URI!, {
        serverSelectionTimeoutMS: 30000, // 30 seconds to connect
        socketTimeoutMS: 45000, // 45 seconds for socket operations
        connectTimeoutMS: 30000, // 30 seconds to establish connection
        maxPoolSize: 10, // Connection pool size
        minPoolSize: 1,
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Disable Mongoose buffering globally
mongoose.set('bufferCommands', false);

// Auth routes now mounted above with other routes

// Basic routes
app.get('/', (req, res) => {
    res.json({ message: 'SoloDevelopment API is running!' });
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/test', (req, res) => {
    res.json({
        message: 'API endpoint working!',
        timestamp: new Date().toISOString(),
        database: 'Connected to MongoDB Atlas',
    });
});

// Redirect handler - MUST be last route before 404 handler
// This catches any slug that doesn't match existing routes
app.get('/:slug', handleRedirect);

// Start server
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check available at: http://localhost:${PORT}/health`);
    
    // Initialize cron jobs after server starts
    initializeCronJobs();
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close((err) => {
        if (err) {
            console.error('❌ Error during server shutdown:', err);
            process.exit(1);
        }
        
        console.log('✅ HTTP server closed.');
        
        // Close database connection
        mongoose.connection.close().then(() => {
            console.log('✅ MongoDB connection closed.');
            console.log('✅ Graceful shutdown completed.');
            process.exit(0);
        }).catch((err) => {
            console.error('❌ Error closing MongoDB connection:', err);
            process.exit(1);
        });
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't crash the server in production
    if (process.env.NODE_ENV === 'production') {
        console.error('Continuing despite unhandled rejection...');
    } else {
        // In development, optionally exit
        console.error('Exiting due to unhandled rejection in development mode');
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Try to gracefully shutdown
    console.error('Server will attempt graceful shutdown...');
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});
