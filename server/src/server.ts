import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';  // Import auth routes

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);

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
