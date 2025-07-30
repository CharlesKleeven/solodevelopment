import Theme from '../models/Theme';
import ThemeVote from '../models/ThemeVote';
import VoteBackup from '../models/VoteBackup';
import { Types } from 'mongoose';

export class VoteBackupService {
    /**
     * Create a backup of all votes for a jam
     */
    static async createBackup(
        jamId: string, 
        backupType: 'manual' | 'automatic' | 'pre_update',
        triggeredBy?: string,
        reason?: string
    ) {
        try {
            // Get all themes for this jam
            const themes = await Theme.find({ jamId });
            
            // Get all votes for these themes
            const themeIds = themes.map(t => (t._id as any).toString());
            const votes = await ThemeVote.find({ 
                themeId: { $in: themeIds } 
            });

            // Prepare backup data
            const backupData = {
                jamId,
                backupType,
                timestamp: new Date(),
                voteCount: votes.length,
                themeCount: themes.length,
                data: {
                    themes: themes.map(theme => ({
                        themeId: (theme._id as any).toString(),
                        name: theme.name,
                        score: theme.score
                    })),
                    votes: votes.map(vote => ({
                        userId: vote.userId,
                        themeId: vote.themeId,
                        vote: vote.vote,
                        timestamp: vote.updatedAt
                    }))
                },
                metadata: {
                    triggeredBy,
                    reason,
                    restoreCount: 0
                }
            };

            // Create backup
            const backup = await VoteBackup.create(backupData);
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Vote backup created: ${backup._id} for jam ${jamId}`);
            }
            
            return backup;
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error creating vote backup:', error);
            }
            throw error;
        }
    }

    /**
     * Restore votes from a backup
     */
    static async restoreFromBackup(backupId: string, restoredBy: string) {
        try {
            const backup = await VoteBackup.findById(backupId);
            if (!backup) {
                throw new Error('Backup not found');
            }

            // Start a transaction for safe restore
            const session = await VoteBackup.startSession();
            await session.withTransaction(async () => {
                // First, create a new backup of current state (before restore)
                await this.createBackup(
                    backup.jamId,
                    'pre_update',
                    restoredBy,
                    `Pre-restore backup before restoring from ${backupId}`
                );

                // Delete existing votes for themes in this backup
                const themeIds = backup.data.themes.map(t => t.themeId);
                await ThemeVote.deleteMany({ 
                    themeId: { $in: themeIds } 
                }, { session });

                // Restore themes with their scores
                for (const themeData of backup.data.themes) {
                    await Theme.findByIdAndUpdate(
                        themeData.themeId,
                        { score: themeData.score },
                        { session }
                    );
                }

                // Restore all votes
                if (backup.data.votes.length > 0) {
                    await ThemeVote.insertMany(
                        backup.data.votes.map(vote => ({
                            userId: vote.userId,
                            themeId: vote.themeId,
                            vote: vote.vote,
                            updatedAt: vote.timestamp
                        })),
                        { session }
                    );
                }

                // Update backup metadata
                backup.metadata.restoreCount += 1;
                await backup.save({ session });
            });

            return {
                success: true,
                votesRestored: backup.data.votes.length,
                themesRestored: backup.data.themes.length
            };
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error restoring from backup:', error);
            }
            throw error;
        }
    }

    /**
     * Get all backups for a jam
     */
    static async getBackupsForJam(jamId: string) {
        return VoteBackup.find({ jamId })
            .sort({ timestamp: -1 })
            .select('-data') // Exclude data for listing
            .lean();
    }

    /**
     * Get a specific backup with full data
     */
    static async getBackupById(backupId: string) {
        return VoteBackup.findById(backupId);
    }

    /**
     * Delete old backups (keep only last N days)
     */
    static async cleanupOldBackups(daysToKeep: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await VoteBackup.deleteMany({
            timestamp: { $lt: cutoffDate },
            backupType: 'automatic' // Only delete automatic backups
        });

        return result.deletedCount;
    }
}