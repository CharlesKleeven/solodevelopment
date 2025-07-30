import cron from 'node-cron';
import { VoteBackupService } from './voteBackupService';
import Jam from '../models/Jam';

export function initializeCronJobs() {
    // Run automatic backup every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        try {
            // Find all jams with voting open
            const activeJams = await Jam.find({ 
                isVotingOpen: true 
            });

            for (const jam of activeJams) {
                await VoteBackupService.createBackup(
                    jam.id,
                    'automatic',
                    undefined,
                    'Scheduled automatic backup'
                );
            }

            if (process.env.NODE_ENV !== 'production') {
                console.log(`Automatic backup completed for ${activeJams.length} jams`);
            }
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error in automatic backup cron job:', error);
            }
        }
    });

    // Clean up old backups once a day at 3 AM
    cron.schedule('0 3 * * *', async () => {
        try {
            const deletedCount = await VoteBackupService.cleanupOldBackups(30); // Keep 30 days
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Cleaned up ${deletedCount} old backups`);
            }
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error in backup cleanup cron job:', error);
            }
        }
    });

    if (process.env.NODE_ENV !== 'production') {
        console.log('Cron jobs initialized');
    }
}