const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemNoteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    title: {
        type: String,
        default: 'My Notes'
    },
    content: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

// Index for efficient queries
problemNoteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const ProblemNote = mongoose.model('problemNote', problemNoteSchema);

module.exports = ProblemNote;