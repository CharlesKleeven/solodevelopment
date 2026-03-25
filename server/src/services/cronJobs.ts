import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
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

    // Scrape itch.io stats for current jam every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        try {
            const jam = await Jam.findOne({ isCurrent: true });
            if (!jam || !jam.url) return;

            const response = await axios.get(jam.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoloDev-Bot/1.0)' },
                timeout: 10000
            });

            const $ = cheerio.load(response.data as string);
            let updated = false;

            $('.stat_value').each((_, el) => {
                const value = $(el).text().trim();
                const label = $(el).next().text().trim().toLowerCase();
                const num = parseInt(value.replace(/,/g, ''));

                if (!isNaN(num)) {
                    if (label.includes('joined') && jam.participants !== num) {
                        jam.participants = num;
                        updated = true;
                    } else if ((label.includes('entries') || label.includes('submissions')) && jam.submissions !== num) {
                        jam.submissions = num;
                        updated = true;
                    }
                }
            });

            if (updated) {
                await jam.save();
                console.log(`Scraped itch.io stats: ${jam.participants} joined, ${jam.submissions} entries`);
            }
        } catch (error) {
            console.error('Error scraping itch.io stats:', error);
        }
    });

    if (process.env.NODE_ENV !== 'production') {
        console.log('Cron jobs initialized');
    }
}