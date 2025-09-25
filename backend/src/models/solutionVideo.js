const mongoose = require('mongoose');
const {Schema} = mongoose;

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    cloudinaryPublicId: {
        type: String,
        required: true,
        unique: true
    },
    secureUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    customThumbnailUrl: {
        type: String // For custom uploaded thumbnails
    },
    duration: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['brute-force', 'optimal'],
        required: true,
        default: 'optimal'
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
},{
    timestamps:true
});

// Compound index to ensure one video per category per problem
videoSchema.index({ problemId: 1, category: 1 }, { unique: true });

const SolutionVideo = mongoose.model("solutionVideo",videoSchema);

module.exports = SolutionVideo;