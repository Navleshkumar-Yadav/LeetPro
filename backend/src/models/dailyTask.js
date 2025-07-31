const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyTaskSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    dueDate: {
        type: Date,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Index for efficient queries
dailyTaskSchema.index({ userId: 1, dueDate: 1 });
dailyTaskSchema.index({ userId: 1, isCompleted: 1 });

const DailyTask = mongoose.model('dailyTask', dailyTaskSchema);

module.exports = DailyTask;