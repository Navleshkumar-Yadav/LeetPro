const Subscription = require('../models/subscription.js');
const Problem = require('../models/problem.js');

const checkPremiumAccess = async (req, res, next) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id || req.params.problemId;

        // Check if problem is premium
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // If problem is not premium, allow access
        if (!problem.isPremium) {
            return next();
        }

        // Check if user has active subscription
        const subscription = await Subscription.findOne({
            userId,
            isActive: true,
            endDate: { $gt: new Date() }
        });

        if (!subscription) {
            return res.status(403).json({ 
                error: 'Premium subscription required',
                isPremium: true,
                hasAccess: false
            });
        }

        // User has premium access
        req.hasPremiumAccess = true;
        next();

    } catch (error) {
        console.error('Error checking premium access:', error);
        res.status(500).json({ error: 'Failed to check premium access' });
    }
};

module.exports = checkPremiumAccess;