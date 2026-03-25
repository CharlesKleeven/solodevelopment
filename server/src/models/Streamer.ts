import mongoose, { Document, Schema } from 'mongoose';

export interface IStreamer extends Document {
    channel: string;  // Twitch username
    title: string;    // Display name for the streamer
    isActive: boolean;
    status: 'pending' | 'approved' | 'rejected';
    submittedBy: string | null;  // userId of who submitted, null = admin-added
    order: number;    // Display order (lower numbers show first)
    createdAt: Date;
    updatedAt: Date;
}

const streamerSchema = new Schema<IStreamer>({
    channel: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    submittedBy: {
        type: String,
        default: null
    },
    order: {
        type: Number,
        default: 999
    }
}, {
    timestamps: true
});

// Index for sorting
streamerSchema.index({ isActive: -1, order: 1 });

export default mongoose.model<IStreamer>('Streamer', streamerSchema);