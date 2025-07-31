const express = require('express');
const paymentRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const {
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    getPlanPrices
} = require('../controllers/paymentController.js');

paymentRouter.post('/create-order', userMiddleware, createOrder);
paymentRouter.post('/verify-payment', userMiddleware, verifyPayment);
paymentRouter.get('/subscription-status', userMiddleware, getSubscriptionStatus);
paymentRouter.get('/plans', getPlanPrices);

module.exports = paymentRouter;