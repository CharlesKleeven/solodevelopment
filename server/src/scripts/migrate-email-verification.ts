import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrateEmailVerification() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Update all existing users to have emailVerified = true
    const result = await User.updateMany(
      { emailVerified: { $exists: false } },
      { $set: { emailVerified: true } }
    );

    console.log(`Updated ${result.modifiedCount} users with emailVerified = true`);

    // Also ensure OAuth users are always verified
    const oauthResult = await User.updateMany(
      { 
        provider: { $in: ['google', 'discord', 'mixed'] },
        emailVerified: false 
      },
      { $set: { emailVerified: true } }
    );

    console.log(`Updated ${oauthResult.modifiedCount} OAuth users to ensure emailVerified = true`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateEmailVerification();