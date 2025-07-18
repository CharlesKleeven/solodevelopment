import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';  // Import auth routes
import jamRoutes from './routes/jam';
import contactRoutes from './routes/contact';

// Load environment variables
dotenv.config();

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

// Rate limiter temporarily removed for debugging

// CORS configuration - MUST be before routes
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://solodevelopment-frontend.onrender.com', 'https://solodevelopment.org']
        : ['http://localhost:3000'],
    credentials: true // Allow cookies
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/jam', jamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// Connect to MongoDB with longer timeout for Render
mongoose
    .connect(process.env.MONGO_URI!, {
        serverSelectionTimeoutMS: 30000, // 30 seconds to connect
        socketTimeoutMS: 45000, // 45 seconds for socket operations
        connectTimeoutMS: 30000, // 30 seconds to establish connection
        maxPoolSize: 10, // Connection pool size
        minPoolSize: 1,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Disable Mongoose buffering globally
mongoose.set('bufferCommands', false);

// Auth routes now mounted above with other routes

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
