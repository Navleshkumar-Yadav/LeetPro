const express = require('express');
const streakRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const { getUserStreak, resetUserStreak } = require('../utils/streakCalculator.js');

// Get user's current streak information
streakRouter.get('/current', userMiddleware, async (req, res) => {
    try {
        const userId = req.result._id;
        const streakInfo = await getUserStreak(userId);
        
        res.status(200).json({
            success: true,
            streak: streakInfo
        });
    } catch (error) {
        console.error('Error fetching user streak:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch streak information'
        });
    }
});

// Reset user streak (for testing purposes)
streakRouter.post('/reset', userMiddleware, async (req, res) => {
    try {
        const userId = req.result._id;
        await resetUserStreak(userId);
        
        res.status(200).json({
            success: true,
            message: 'Streak reset successfully'
        });
    } catch (error) {
        console.error('Error resetting user streak:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset streak'
        });
    }
});

module.exports = streakRouter;