const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  goodie: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    description: { type: String },
    category: { type: String, default: 'merchandise' }
  },
  address: {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  pointsSpent: {
    type: Number,
    required: true
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  estimatedDelivery: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Index for efficient queries
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('order', orderSchema);
module.exports = Order;