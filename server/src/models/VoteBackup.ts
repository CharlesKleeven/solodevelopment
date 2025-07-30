import mongoose, { Document, Schema } from 'mongoose';

export interface IVoteBackup extends Document {
    jamId: string;
    backupType: 'manual' | 'automatic' | 'pre_update';
    timestamp: Date;
    voteCount: number;
    themeCount: number;
    data: {
        themes: Array<{
            themeId: string;
            name: string;
            score: number;
        }>;
        votes: Array<{
            userId: string;
            themeId: string;
            vote: -1 | 0 | 1;
            timestamp: Date;
        }>;
    };
    metadata: {
        triggeredBy?: string; // userId for manual backups
        reason?: string;
        restoreCount: number;
    };
}

const voteBackupSchema = new Schema<IVoteBackup>({
    jamId: {
        type: String,
        required: true,
        index: true
    },
    backupType: {
        type: String,
        enum: ['manual', 'automatic', 'pre_update'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    voteCount: {
        type: Number,
        required: true
    },
    themeCount: {
        type: Number,
        required: true
    },
    data: {
        themes: [{
            themeId: String,
            name: String,
            score: Number
        }],
        votes: [{
            userId: String,
            themeId: String,
            vote: {
                type: Number,
                enum: [-1, 0, 1]
            },
            timestamp: Date
        }]
    },
    metadata: {
        triggeredBy: String,
        reason: String,
        restoreCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for efficient queries
voteBackupSchema.index({ jamId: 1, timestamp: -1 });

// Keep only last 10 backups per jam to save space
voteBackupSchema.pre('save', async function(next) {
    const VoteBackup = mongoose.model('VoteBackup');
    const backupCount = await VoteBackup.countDocuments({ jamId: this.jamId });
    
    if (backupCount >= 10) {
        // Delete oldest backups
        const oldestBackups = await VoteBackup.find({ jamId: this.jamId })
            .sort({ timestamp: 1 })
            .limit(backupCount - 9);
        
        const idsToDelete = oldestBackups.map(b => b._id);
        await VoteBackup.deleteMany({ _id: { $in: idsToDelete } });
    }
    
    next();
});

export default mongoose.model<IVoteBackup>('VoteBackup', voteBackupSchema);