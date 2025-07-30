import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { VoteBackupService } from '../services/voteBackupService';
import User from '../models/User';
import Jam from '../models/Jam';

const router = express.Router();

// Middleware to check admin status
const requireAdmin = async (req: any, res: any, next: any) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};

// Create manual backup
router.post('/create/:jamId', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
        const { jamId } = req.params;
        const { reason } = req.body;
        const userId = req.user.userId;

        // Verify jam exists
        const jam = await Jam.findOne({ id: jamId });
        if (!jam) {
            return res.status(404).json({ error: 'Jam not found' });
        }

        const backup = await VoteBackupService.createBackup(
            jamId,
            'manual',
            userId,
            reason || 'Manual backup by admin'
        );

        res.json({
            success: true,
            backupId: backup._id,
            voteCount: backup.voteCount,
            themeCount: backup.themeCount,
            timestamp: backup.timestamp
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error creating backup:', error);
        }
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Get all backups for a jam
router.get('/jam/:jamId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { jamId } = req.params;
        
        const backups = await VoteBackupService.getBackupsForJam(jamId);
        
        res.json({ backups });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching backups:', error);
        }
        res.status(500).json({ error: 'Failed to fetch backups' });
    }
});

// Get specific backup details
router.get('/:backupId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { backupId } = req.params;
        
        const backup = await VoteBackupService.getBackupById(backupId);
        if (!backup) {
            return res.status(404).json({ error: 'Backup not found' });
        }
        
        res.json({ backup });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching backup:', error);
        }
        res.status(500).json({ error: 'Failed to fetch backup' });
    }
});

// Restore from backup
router.post('/restore/:backupId', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
        const { backupId } = req.params;
        const userId = req.user.userId;

        const result = await VoteBackupService.restoreFromBackup(backupId, userId);
        
        res.json(result);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error restoring backup:', error);
        }
        res.status(500).json({ error: 'Failed to restore backup' });
    }
});

export default router;