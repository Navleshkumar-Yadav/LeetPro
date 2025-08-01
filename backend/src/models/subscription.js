const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    planType: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        required: true
    },
    razorpaySignature: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    }
}, {
    timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, isActive: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('subscription', subscriptionSchema);

module.exports = Subscription;