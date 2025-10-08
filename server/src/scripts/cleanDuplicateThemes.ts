import mongoose from 'mongoose';
import Theme from '../models/Theme';
import ThemeVote from '../models/ThemeVote';

async function cleanDuplicateThemes() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solodevelopment';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Find all themes grouped by jamId and name
        const duplicates = await Theme.aggregate([
            {
                $group: {
                    _id: { jamId: '$jamId', name: '$name' },
                    themes: { $push: { id: '$_id', createdAt: '$createdAt', score: '$score' } },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        console.log(`\nFound ${duplicates.length} sets of duplicate themes:`);

        let totalRemoved = 0;

        for (const dup of duplicates) {
            console.log(`\n- "${dup._id.name}" in jam "${dup._id.jamId}" (${dup.count} copies)`);

            // Sort by createdAt to keep the oldest one (which likely has votes)
            // Then by score (highest score)
            const sorted = dup.themes.sort((a: any, b: any) => {
                if (a.createdAt.getTime() !== b.createdAt.getTime()) {
                    return a.createdAt.getTime() - b.createdAt.getTime();
                }
                return b.score - a.score;
            });

            // Keep the first one (oldest), delete the rest
            const toKeep = sorted[0];
            const toDelete = sorted.slice(1);

            console.log(`  Keeping: ${toKeep.id} (created: ${toKeep.createdAt}, score: ${toKeep.score})`);

            for (const theme of toDelete) {
                console.log(`  Deleting: ${theme.id} (created: ${theme.createdAt}, score: ${theme.score})`);

                // Delete votes for this duplicate theme
                const votesDeleted = await ThemeVote.deleteMany({ themeId: theme.id });
                console.log(`    - Deleted ${votesDeleted.deletedCount} votes`);

                // Delete the duplicate theme
                await Theme.deleteOne({ _id: theme.id });
                totalRemoved++;
            }
        }

        console.log(`\n✅ Cleanup complete! Removed ${totalRemoved} duplicate themes.`);

        // Now add unique constraint to prevent future duplicates
        console.log('\nAdding unique constraint...');
        try {
            await Theme.collection.createIndex(
                { jamId: 1, name: 1 },
                { unique: true }
            );
            console.log('✅ Unique constraint added successfully!');
        } catch (error: any) {
            if (error.code === 11000) {
                console.log('⚠️  Unique constraint already exists');
            } else {
                throw error;
            }
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error cleaning duplicates:', error);
        process.exit(1);
    }
}

cleanDuplicateThemes();
