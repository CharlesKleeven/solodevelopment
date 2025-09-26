import mongoose, { Document, Schema } from 'mongoose';

export interface IRedirect extends Document {
    slug: string;
    destination: string;
    description?: string;
    clickCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const redirectSchema = new Schema<IRedirect>({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-z0-9-]+$/
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 200
    },
    clickCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster lookups
redirectSchema.index({ slug: 1, isActive: 1 });

export default mongoose.model<IRedirect>('Redirect', redirectSchema);