const User = require('../models/user');
const PointActivity = require('../models/pointActivity');
const { app } = require('../index');

/**
 * Awards points to a user and logs the mission activity.
 * Emits a socket event to the user for real-time notification.
 * @param {String} userId - The user's ObjectId
 * @param {String} mission - The mission name
 * @param {Number} points - Points to award
 * @returns {Promise<void>}
 */
async function awardPoints(userId, mission, points) {
    if (!userId || !mission || typeof points !== 'number' || points <= 0) {
        console.warn('Invalid parameters for awardPoints:', { userId, mission, points });
        return;
    }
    
    try {
    // Update user points
    await User.findByIdAndUpdate(userId, { $inc: { points } });
    // Log the activity
    await PointActivity.create({ userId, mission, points });
    // Emit socket event
    const io = app.get('io');
    if (io) {
        io.to(userId.toString()).emit('point_rewarded', { mission, points });
    }
    } catch (error) {
        console.error('Error awarding points:', error);
    }
}

module.exports = { awardPoints }; 