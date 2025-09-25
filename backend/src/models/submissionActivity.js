const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionActivitySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    problems: [{
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'problem'
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        status: {
            type: String,
            enum: ['accepted', 'wrong', 'error']
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
submissionActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const SubmissionActivity = mongoose.model('submissionActivity', submissionActivitySchema);

module.exports = SubmissionActivity;