import mongoose, { Document, Schema } from 'mongoose';

export interface IStreamer extends Document {
    channel: string;  // Twitch username
    title: string;    // Display name for the streamer
    isActive: boolean;
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