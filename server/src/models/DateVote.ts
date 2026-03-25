import mongoose, { Document, Schema } from 'mongoose';

export interface IDateVote extends Document {
    userId: string;
    dateOptionId: string;
    vote: boolean;
    updatedAt: Date;
}

const dateVoteSchema = new Schema<IDateVote>({
    userId: {
        type: String,
        required: true
    },
    dateOptionId: {
        type: String,
        required: true
    },
    vote: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

dateVoteSchema.index({ userId: 1, dateOptionId: 1 }, { unique: true });

export default mongoose.model<IDateVote>('DateVote', dateVoteSchema);
