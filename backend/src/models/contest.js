// Contest model
const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String },
    problems: [{
        problemId: { type: Schema.Types.ObjectId, ref: 'problem', required: true },
        marks: { type: Number, required: true }
    }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    maxParticipants: { type: Number, default: 1000 },
    isPublic: { type: Boolean, default: true },
    status: { 
        type: String, 
        enum: ['draft', 'upcoming', 'live', 'completed'], 
        default: 'draft' 
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'user', required: true }
}, { timestamps: true });

// ContestRegistration model
const contestRegistrationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'contest', required: true },
    registeredAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

contestRegistrationSchema.index({ userId: 1, contestId: 1 }, { unique: true });

const ContestRegistration = mongoose.model('contestRegistration', contestRegistrationSchema);

// ContestSubmission model
const contestSubmissionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'contest', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'problem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'wrong', 'error'], default: 'pending' },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    errorMessage: { type: String, default: '' },
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal: { type: Number, default: 0 },
    marksAwarded: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

contestSubmissionSchema.index({ userId: 1, contestId: 1, problemId: 1 }, { unique: true });

const ContestSubmission = mongoose.model('contestSubmission', contestSubmissionSchema);

// Contest Rating model for tracking user ratings
const contestRatingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'contest', required: true },
    oldRating: { type: Number, required: true },
    newRating: { type: Number, required: true },
    ratingChange: { type: Number, required: true },
    rank: { type: Number, required: true },
    totalParticipants: { type: Number, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true }
}, { timestamps: true });

const Contest = mongoose.model('contest', contestSchema);
const ContestRating = mongoose.model('contestRating', contestRatingSchema);

module.exports = {
    Contest,
    ContestRegistration,
    ContestSubmission,
    ContestRating
};