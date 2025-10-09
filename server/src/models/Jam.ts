import mongoose, { Document, Schema } from 'mongoose';

export interface IJam extends Document {
    id: string;
    title: string;
    theme: string;
    description: string;
    url: string;
    startDate: Date;
    endDate: Date;
    participants: number;
    submissions: number;
    isCurrent: boolean;
    isVotingOpen: boolean;
    votingRoundName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const jamSchema = new Schema<IJam>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        default: 'TBD'
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    participants: {
        type: Number,
        default: 0
    },
    submissions: {
        type: Number,
        default: 0
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    isVotingOpen: {
        type: Boolean,
        default: true
    },
    votingRoundName: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure only one jam can be current
jamSchema.pre('save', async function(next) {
    if (this.isCurrent) {
        await mongoose.model('Jam').updateMany(
            { _id: { $ne: this._id } },
            { isCurrent: false }
        );
    }
    next();
});

export default mongoose.model<IJam>('Jam', jamSchema);