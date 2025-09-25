const express = require('express');
const dashboardRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const {
    getDashboardData,
    getMonthlyCalendar,
    updateProfile,
    uploadProfileImage,
    getUserPoints,
    getUserPointActivity
} = require('../controllers/dashboardController.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

dashboardRouter.get('/data', userMiddleware, getDashboardData);
dashboardRouter.get('/calendar', userMiddleware, getMonthlyCalendar);
dashboardRouter.put('/profile', userMiddleware, updateProfile);
dashboardRouter.post('/profile-image', userMiddleware, upload.single('image'), uploadProfileImage);
dashboardRouter.get('/points', userMiddleware, getUserPoints);
dashboardRouter.get('/points/activity', userMiddleware, getUserPointActivity);

module.exports = dashboardRouter;