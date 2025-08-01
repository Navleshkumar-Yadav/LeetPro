const User = require('../models/user.js');
const UserProfile = require('../models/userProfile.js');
const bcrypt = require('bcryptjs');
const { updateSubmissionActivity } = require('./dashboardController.js');

const getSettings = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId).select('-password');
        const userProfile = await UserProfile.findOne({ userId });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                role: user.role,
                createdAt: user.createdAt,
                points: user.points,
                contestRating: user.contestRating
            },
            profile: userProfile || {}
        });

    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        const { firstName, lastName } = req.body;

        // Validate input
        if (!firstName || firstName.trim().length < 3) {
            return res.status(400).json({ error: 'First name must be at least 3 characters long' });
        }

        if (lastName && lastName.trim().length < 3) {
            return res.status(400).json({ error: 'Last name must be at least 3 characters long' });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                firstName: firstName.trim(),
                lastName: lastName ? lastName.trim() : ''
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                emailId: updatedUser.emailId,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                points: updatedUser.points,
                contestRating: updatedUser.contestRating
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const userId = req.result._id;
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        // Get user with password
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

        res.status(200).json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.result._id;
        const { password, confirmText } = req.body;

        // Validate confirmation text
        if (confirmText !== 'DELETE MY ACCOUNT') {
            return res.status(400).json({ error: 'Please type "DELETE MY ACCOUNT" to confirm' });
        }

        // Get user with password
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Password is incorrect' });
        }

        // Delete user and related data
        await Promise.all([
            User.findByIdAndDelete(userId),
            UserProfile.findOneAndDelete({ userId }),
            // Note: Submissions are already handled by the User model's post middleware
        ]);

        // Clear the authentication cookie
        res.cookie("token", null, { expires: new Date(Date.now()) });

        res.status(200).json({
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

module.exports = {
    getSettings,
    updateProfile,
    updatePassword,
    deleteAccount
};