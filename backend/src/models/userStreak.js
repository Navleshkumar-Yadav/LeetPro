const mongoose = require('mongoose');
const { Schema } = mongoose;

const userStreakSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    maxStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastSubmissionDate: {
        type: Date,
        default: null
    },
    streakHistory: [{
        date: {
            type: Date,
            required: true
        },
        streakCount: {
            type: Number,
            required: true
        },
        problemsSolved: {
            type: Number,
            default: 1
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
userStreakSchema.index({ userId: 1 });
userStreakSchema.index({ lastSubmissionDate: 1 });

const UserStreak = mongoose.model('userStreak', userStreakSchema);

module.exports = UserStreak;