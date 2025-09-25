const Problem = require('../models/problem.js');
const Subscription = require('../models/subscription.js');

const getProblemCompanies = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;

        // Check if user has premium access
        const subscription = await Subscription.findOne({
            userId,
            isActive: true,
            endDate: { $gt: new Date() }
        });

        if (!subscription) {
            return res.status(403).json({ 
                error: 'Premium subscription required',
                isPremium: false,
                hasAccess: false
            });
        }

        // Get problem with companies
        const problem = await Problem.findById(problemId).select('companies title');
        
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.status(200).json({
            companies: problem.companies || [],
            hasAccess: true,
            isPremium: true
        });

    } catch (error) {
        console.error('Error fetching problem companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
};

const checkPremiumStatus = async (req, res) => {
    try {
        const userId = req.result._id;

        const subscription = await Subscription.findOne({
            userId,
            isActive: true,
            endDate: { $gt: new Date() }
        });

        res.status(200).json({
            hasActiveSubscription: !!subscription,
            subscription: subscription ? {
                planType: subscription.planType,
                endDate: subscription.endDate,
                daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
            } : null
        });

    } catch (error) {
        console.error('Error checking premium status:', error);
        res.status(500).json({ error: 'Failed to check premium status' });
    }
};

module.exports = {
    getProblemCompanies,
    checkPremiumStatus
};