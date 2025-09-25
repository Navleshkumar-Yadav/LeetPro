const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteListSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        maxLength: 500,
        default: ''
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    problems: [{
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'problem',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
favoriteListSchema.index({ userId: 1 });
favoriteListSchema.index({ userId: 1, name: 1 }, { unique: true });

const FavoriteList = mongoose.model('favoriteList', favoriteListSchema);

module.exports = FavoriteList;