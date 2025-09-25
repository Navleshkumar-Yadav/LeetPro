const mongoose = require('mongoose');
const { Schema } = mongoose;

const userProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    profileImage: {
        cloudinaryPublicId: {
            type: String,
            default: null
        },
        secureUrl: {
            type: String,
            default: null
        }
    },
    about: {
        type: String,
        maxLength: 500,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    github: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    skills: [{
        type: String
    }],
    contestRating: {
        type: Number,
        default: 1200
    },
    globalRank: {
        type: Number,
        default: 0
    },
    contestsAttended: {
        type: Number,
        default: 0
    },
    badges: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        badgeCategory: {
            type: String,
            enum: ['Streak', 'Problem Solved', 'Assessment'],
            required: true
        },
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    ratingHistory: [{
        rating: {
            type: Number,
            required: true
        },
        contestName: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const UserProfile = mongoose.model('userProfile', userProfileSchema);

module.exports = UserProfile;