import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';  // Import auth routes
import jamRoutes from './routes/jam';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

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

// Rate limiting for auth endpoints - 15 attempts per 10 minutes
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 15,
    message: {
        error: 'Too many login attempts. Please wait 10 minutes before trying again.',
        retryAfter: '10 minutes'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

// For jam fresh updates
app.use('/api/jam', jamRoutes);

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://solodevelopment.org']
        : ['http://localhost:3000'],
    credentials: true // Allow cookies
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
if (process.env.NODE_ENV === 'production') {
    app.use('/api/auth', authLimiter, authRoutes);
} else {
    app.use('/api/auth', authRoutes);
}

// Basic routes
app.get('/', (req, res) => {
    res.json({ message: 'SoloDevelopment API is running!' });
});

app.get('/api/test', (req, res) => {
    res.json({
        message: 'API endpoint working!',
        timestamp: new Date().toISOString(),
        database: 'Connected to MongoDB Atlas',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
    console.log(`Auth endpoints: http://localhost:${PORT}/api/auth/register & /api/auth/login`);
});
