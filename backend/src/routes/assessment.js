const express = require('express');
const assessmentRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const checkPremiumAccess = require('../middleware/premiumMiddleware.js');
const {
    getAllAssessments,
    getAssessmentById,
    startAssessment,
    submitMCQAnswer,
    submitCodingAnswer,
    completeAssessment,
    getAssessmentReport,
    getUserAssessments
} = require('../controllers/assessmentController.js');

// Get all assessments
assessmentRouter.get('/all', userMiddleware, getAllAssessments);

// Get specific assessment
assessmentRouter.get('/:assessmentId', userMiddleware, getAssessmentById);

// Start assessment
assessmentRouter.post('/:assessmentId/start', userMiddleware, startAssessment);

// Submit MCQ answer
assessmentRouter.post('/:assessmentId/mcq-answer', userMiddleware, submitMCQAnswer);

// Submit coding answer
assessmentRouter.post('/:assessmentId/coding-answer', userMiddleware, submitCodingAnswer);

// Complete assessment
assessmentRouter.post('/:assessmentId/complete', userMiddleware, completeAssessment);

// Get assessment report
assessmentRouter.get('/:assessmentId/report/:submissionId', userMiddleware, getAssessmentReport);

// Get user's assessment history
assessmentRouter.get('/user/history', userMiddleware, getUserAssessments);

module.exports = assessmentRouter;