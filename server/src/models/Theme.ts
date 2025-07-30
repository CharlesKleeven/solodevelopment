import mongoose, { Document, Schema } from 'mongoose';

export interface ITheme extends Document {
    jamId: string;
    name: string;
    score: number;
    createdAt: Date;
}

const themeSchema = new Schema<ITheme>({
    jamId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient queries
themeSchema.index({ jamId: 1, name: 1 });

export default mongoose.model<ITheme>('Theme', themeSchema);