const mongoose = require('mongoose');
const { Schema } = mongoose;

const assessmentSubmissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    assessmentId: {
        type: Schema.Types.ObjectId,
        ref: 'assessment',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },
    answers: [{
        questionIndex: Number,
        // For MCQ
        selectedOption: Number,
        isCorrect: Boolean,
        
        // For coding
        code: String,
        language: String,
        testCasesPassed: Number,
        totalTestCases: Number,
        runtime: Number,
        memory: Number
    }],
    score: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
assessmentSubmissionSchema.index({ userId: 1, assessmentId: 1 });

const AssessmentSubmission = mongoose.model('assessmentSubmission', assessmentSubmissionSchema);

module.exports = AssessmentSubmission;