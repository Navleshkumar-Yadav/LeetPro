const mongoose = require('mongoose');
const { Schema } = mongoose;

const pointActivitySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    mission: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const PointActivity = mongoose.model('pointActivity', pointActivitySchema);

module.exports = PointActivity; 