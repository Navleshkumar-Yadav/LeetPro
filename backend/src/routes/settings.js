const express = require('express');
const settingsRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const {
    getSettings,
    updateProfile,
    updatePassword,
    deleteAccount
} = require('../controllers/settingsController.js');

// Get user settings
settingsRouter.get('/', userMiddleware, getSettings);

// Update profile (name)
settingsRouter.put('/profile', userMiddleware, updateProfile);

// Update password
settingsRouter.put('/password', userMiddleware, updatePassword);

// Delete account
settingsRouter.delete('/account', userMiddleware, deleteAccount);

module.exports = settingsRouter;