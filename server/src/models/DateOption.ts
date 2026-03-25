import mongoose, { Document, Schema } from 'mongoose';

export interface IDateOption extends Document {
    jamId: string;
    startDate: Date;
    endDate: Date;
    suggestedBy: string | null;
    voteCount: number;
    createdAt: Date;
}

const dateOptionSchema = new Schema<IDateOption>({
    jamId: {
        type: String,
        required: true,
        index: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    suggestedBy: {
        type: String,
        default: null
    },
    voteCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

dateOptionSchema.index({ jamId: 1, startDate: 1, endDate: 1 }, { unique: true });

export default mongoose.model<IDateOption>('DateOption', dateOptionSchema);
