const mongoose = require('mongoose');
const { Schema } = mongoose;

const assessmentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['mcq', 'coding'],
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'company'],
        default: 'general'
    },
    company: {
        type: String,
        enum: ['Google', 'Meta', 'Uber', 'Microsoft'],
        required: function() {
            return this.category === 'company';
        }
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questions: [{
        // For MCQ questions
        question: String,
        options: [String],
        correctAnswer: Number, // index of correct option
        subject: {
            type: String,
            enum: ['OS', 'Networks', 'DBMS', 'DSA']
        },
        
        // For coding questions
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'problem'
        }
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

const Assessment = mongoose.model('assessment', assessmentSchema);

module.exports = Assessment;