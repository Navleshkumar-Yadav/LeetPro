const express = require('express');
const companyRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const {
    getProblemCompanies,
    checkPremiumStatus
} = require('../controllers/companyController.js');

companyRouter.get('/problems/:problemId/companies', userMiddleware, getProblemCompanies);
companyRouter.get('/users/check-premium-status', userMiddleware, checkPremiumStatus);

module.exports = companyRouter;