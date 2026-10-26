import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshTokenHash: {
        type: String,
        required: true
    },
    userAgent: String,
    ipAddress: String,
    revokedAt: {
        type: Date,
        default: null
    },
    expireAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        expires: 0

    }
}, { timestamps: true });

export const Session = mongoose.model("Session", sessionSchema);