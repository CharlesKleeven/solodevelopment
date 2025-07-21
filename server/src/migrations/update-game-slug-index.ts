import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateGameSlugIndex() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const gamesCollection = db.collection('games');

    // Step 1: Drop the old unique index on slug if it exists
    try {
      await gamesCollection.dropIndex('slug_1');
      console.log('Dropped old unique index on slug');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('Old slug index does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Step 2: Create the new compound unique index on user + slug
    await gamesCollection.createIndex(
      { user: 1, slug: 1 },
      { unique: true }
    );
    console.log('Created new compound unique index on user + slug');

    // Step 3: Check for any existing duplicate slugs per user and fix them
    const pipeline = [
      {
        $group: {
          _id: { user: '$user', slug: '$slug' },
          count: { $sum: 1 },
          games: { $push: { _id: '$_id', title: '$title', createdAt: '$createdAt' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ];

    const duplicates = await gamesCollection.aggregate(pipeline).toArray();

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate slug(s) per user. Fixing...`);

      for (const duplicate of duplicates) {
        // Sort games by creation date, keep the oldest one with original slug
        const games = duplicate.games.sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Update all except the first one
        for (let i = 1; i < games.length; i++) {
          const newSlug = `${duplicate._id.slug}-${i}`;
          await gamesCollection.updateOne(
            { _id: games[i]._id },
            { $set: { slug: newSlug } }
          );
          console.log(`Updated game ${games[i]._id} with new slug: ${newSlug}`);
        }
      }
    } else {
      console.log('No duplicate slugs found per user');
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateGameSlugIndex();