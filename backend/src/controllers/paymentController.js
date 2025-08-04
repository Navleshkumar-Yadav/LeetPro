const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/subscription.js');
const User = require('../models/user.js');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLAN_PRICES = {
    weekly: 99,
    monthly: 299,
    yearly: 2999
};

const PLAN_DURATION = {
    weekly: 7,
    monthly: 30,
    yearly: 365
};

// const createOrder = async (req, res) => {
//     try {
//         const { planType } = req.body;
//         const userId = req.result._id;

//         if (!PLAN_PRICES[planType]) {
//             return res.status(400).json({ error: 'Invalid plan type' });
//         }

//         const amount = PLAN_PRICES[planType] * 100; // Convert to paise

//         const options = {
//             amount,
//             currency: 'INR',
//             receipt: `receipt_${userId}_${Date.now()}`,
//             notes: {
//                 userId: userId.toString(),
//                 planType
//             }
//         };

//         const order = await razorpay.orders.create(options);

//         res.status(200).json({
//             orderId: order.id,
//             amount: order.amount,
//             currency: order.currency,
//             planType,
//             key: process.env.RAZORPAY_KEY_ID
//         });

//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({ error: 'Failed to create order' });
//     }
// };

const createOrder = async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.result._id;

        if (!PLAN_PRICES[planType]) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        const amount = PLAN_PRICES[planType] * 100; // Convert to paise

        const receipt = `rcpt_${userId.toString().slice(-6)}_${Date.now()}`.slice(0, 40);

        const options = {
            amount,
            currency: 'INR',
            receipt, // safe and valid
            notes: {
                userId: userId.toString(),
                planType
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planType,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planType
        } = req.body;

        const userId = req.result._id;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Check if subscription already exists for this order
        const existingSubscription = await Subscription.findOne({
            razorpayOrderId: razorpay_order_id
        });

        if (existingSubscription) {
            return res.status(400).json({ error: 'Payment already processed' });
        }

        // Get current active subscription to handle upgrades
        const currentSubscription = await Subscription.findOne({
            userId,
            isActive: true,
            endDate: { $gt: new Date() }
        });

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        
        // If user has an active subscription, extend from current end date for upgrades
        if (currentSubscription && isUpgrade(currentSubscription.planType, planType)) {
            startDate.setTime(currentSubscription.endDate.getTime());
            endDate.setTime(startDate.getTime());
            endDate.setDate(endDate.getDate() + PLAN_DURATION[planType]);
        } else {
            // For new subscriptions or downgrades, start from now
            endDate.setDate(endDate.getDate() + PLAN_DURATION[planType]);
        }

        // Deactivate existing active subscriptions
        await Subscription.updateMany(
            { userId, isActive: true },
            { isActive: false }
        );

        // Create new subscription
        const subscription = await Subscription.create({
            userId,
            planType,
            startDate,
            endDate,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: PLAN_PRICES[planType],
            isActive: true
        });
        // Award points for buying premium
        const { awardPoints } = require('../utils/pointSystem');
        await awardPoints(userId, 'Buys a Premium', 300);

        res.status(200).json({
            message: 'Payment verified successfully',
            subscription: {
                id: subscription._id,
                planType: subscription.planType,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                isActive: subscription.isActive
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

// Helper function to determine if it's an upgrade
const isUpgrade = (currentPlan, newPlan) => {
    const planHierarchy = { weekly: 1, monthly: 2, yearly: 3 };
    return planHierarchy[newPlan] > planHierarchy[currentPlan];
};

const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.result._id;

        const subscription = await Subscription.findOne({
            userId,
            isActive: true,
            endDate: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.status(200).json({
                hasActiveSubscription: false,
                subscription: null
            });
        }

        res.status(200).json({
            hasActiveSubscription: true,
            subscription: {
                id: subscription._id,
                planType: subscription.planType,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
            }
        });

    } catch (error) {
        console.error('Error getting subscription status:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
};

const getPlanPrices = async (req, res) => {
    try {
        res.status(200).json({
            plans: [
                {
                    type: 'weekly',
                    name: 'Weekly Plan',
                    price: PLAN_PRICES.weekly,
                    duration: '7 days',
                    features: [
                        'Access to all premium problems',
                        'Advanced solution explanations',
                        'Priority support'
                    ]
                },
                {
                    type: 'monthly',
                    name: 'Monthly Plan',
                    price: PLAN_PRICES.monthly,
                    duration: '30 days',
                    features: [
                        'Access to all premium problems',
                        'Advanced solution explanations',
                        'Priority support',
                        'Monthly coding challenges'
                    ],
                    popular: true
                },
                {
                    type: 'yearly',
                    name: 'Yearly Plan',
                    price: PLAN_PRICES.yearly,
                    duration: '365 days',
                    features: [
                        'Access to all premium problems',
                        'Advanced solution explanations',
                        'Priority support',
                        'Monthly coding challenges',
                        'Exclusive webinars',
                        'Best value - Save 67%'
                    ]
                }
            ]
        });
    } catch (error) {
        console.error('Error getting plan prices:', error);
        res.status(500).json({ error: 'Failed to get plan prices' });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    getPlanPrices
};