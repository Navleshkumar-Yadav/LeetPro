const UserStreak = require('../models/userStreak.js');

/**
 * Calculate and update user streak based on submission
 * @param {String} userId - User ID
 * @param {Date} submissionDate - Date of submission (optional, defaults to now)
 * @returns {Object} - Streak information
 */
const calculateStreak = async (userId, submissionDate = new Date()) => {
    try {
        // Normalize submission date to start of day in UTC
        const today = new Date(submissionDate);
        today.setUTCHours(0, 0, 0, 0);
        
        // Get or create user streak record
        let userStreak = await UserStreak.findOne({ userId });
        
        if (!userStreak) {
            userStreak = new UserStreak({
                userId,
                currentStreak: 0,
                maxStreak: 0,
                lastSubmissionDate: null,
                streakHistory: []
            });
        }

        // Check if user already submitted today
        const lastSubmissionDate = userStreak.lastSubmissionDate;
        let hasSubmittedToday = false;
        
        if (lastSubmissionDate) {
            const lastSubmissionDay = new Date(lastSubmissionDate);
            lastSubmissionDay.setUTCHours(0, 0, 0, 0);
            hasSubmittedToday = today.getTime() === lastSubmissionDay.getTime();
        }

        // If already submitted today, return current streak without changes
        if (hasSubmittedToday) {
            return {
                currentStreak: userStreak.currentStreak,
                maxStreak: userStreak.maxStreak,
                isNewStreak: false,
                isStreakMaintained: false,
                hasSubmittedToday: true,
                streakIncreased: false
            };
        }

        const previousStreak = userStreak.currentStreak;
        let newStreak = 0;
        let isNewStreak = false;
        let isStreakMaintained = false;

        if (!lastSubmissionDate) {
            // First ever submission
            newStreak = 1;
            isNewStreak = true;
        } else {
            const lastSubmissionDay = new Date(lastSubmissionDate);
            lastSubmissionDay.setUTCHours(0, 0, 0, 0);
            
            const daysDifference = Math.floor((today.getTime() - lastSubmissionDay.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDifference === 1) {
                // Consecutive day - maintain/increase streak
                newStreak = userStreak.currentStreak + 1;
                isStreakMaintained = true;
            } else if (daysDifference > 1) {
                // Missed days - reset streak
                newStreak = 1;
                isNewStreak = true;
            } else {
                // Same day (shouldn't happen due to check above) or future date
                newStreak = userStreak.currentStreak;
            }
        }

        // Update max streak if current streak exceeds it
        const newMaxStreak = Math.max(userStreak.maxStreak, newStreak);
        
        // Update user streak record
        userStreak.currentStreak = newStreak;
        userStreak.maxStreak = newMaxStreak;
        userStreak.lastSubmissionDate = submissionDate;
        
        // Add to streak history
        userStreak.streakHistory.push({
            date: today,
            streakCount: newStreak,
            problemsSolved: 1
        });

        // Keep only last 365 days of history for performance
        if (userStreak.streakHistory.length > 365) {
            userStreak.streakHistory = userStreak.streakHistory.slice(-365);
        }

        await userStreak.save();

        return {
            currentStreak: newStreak,
            maxStreak: newMaxStreak,
            isNewStreak: isNewStreak && newStreak === 1,
            isStreakMaintained: isStreakMaintained,
            hasSubmittedToday: false,
            streakIncreased: newStreak > previousStreak,
            previousStreak
        };

    } catch (error) {
        console.error('Error calculating streak:', error);
        throw error;
    }
};

/**
 * Get user's current streak information
 * @param {String} userId - User ID
 * @returns {Object} - Current streak information
 */
const getUserStreak = async (userId) => {
    try {
        const userStreak = await UserStreak.findOne({ userId });
        
        if (!userStreak) {
            return {
                currentStreak: 0,
                maxStreak: 0,
                lastSubmissionDate: null
            };
        }

        // Check if streak should be reset due to missed days
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        let streakReset = false;
        if (userStreak.lastSubmissionDate) {
            const lastSubmissionDay = new Date(userStreak.lastSubmissionDate);
            lastSubmissionDay.setUTCHours(0, 0, 0, 0);
            
            const daysDifference = Math.floor((today.getTime() - lastSubmissionDay.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDifference > 1) {
                // Streak should be reset
                userStreak.currentStreak = 0;
                streakReset = true;
            }
        }
        if (streakReset) {
            await userStreak.save();
        }
        return {
            currentStreak: userStreak.currentStreak,
            maxStreak: userStreak.maxStreak,
            lastSubmissionDate: userStreak.lastSubmissionDate
        };

    } catch (error) {
        console.error('Error getting user streak:', error);
        throw error;
    }
};

/**
 * Reset user streak (for testing purposes)
 * @param {String} userId - User ID
 */
const resetUserStreak = async (userId) => {
    try {
        await UserStreak.findOneAndUpdate(
            { userId },
            {
                currentStreak: 0,
                lastSubmissionDate: null,
                streakHistory: []
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error resetting user streak:', error);
        throw error;
    }
};

module.exports = {
    calculateStreak,
    getUserStreak,
    resetUserStreak
};