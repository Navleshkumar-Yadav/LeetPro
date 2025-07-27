const express = require('express');
const complexityRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const { analyzeComplexity } = require('../controllers/complexityAnalysis.js');

complexityRouter.post('/analyze', userMiddleware, analyzeComplexity);

module.exports = complexityRouter;