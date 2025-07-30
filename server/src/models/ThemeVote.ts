import mongoose, { Document, Schema } from 'mongoose';

export interface IThemeVote extends Document {
    userId: string;
    themeId: string;
    vote: -1 | 0 | 1;
    updatedAt: Date;
}

const themeVoteSchema = new Schema<IThemeVote>({
    userId: {
        type: String,
        required: true
    },
    themeId: {
        type: String,
        required: true
    },
    vote: {
        type: Number,
        required: true,
        enum: [-1, 0, 1]
    }
}, {
    timestamps: true
});

// Compound unique index to ensure one vote per user per theme
themeVoteSchema.index({ userId: 1, themeId: 1 }, { unique: true });

export default mongoose.model<IThemeVote>('ThemeVote', themeVoteSchema);