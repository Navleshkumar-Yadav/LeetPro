const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware.js");
const checkPremiumAccess = require("../middleware/premiumMiddleware.js");
const {submitCode,runCode} = require("../controllers/userSubmission.js");

submitRouter.post("/submit/:id", userMiddleware, checkPremiumAccess, submitCode);
submitRouter.post("/run/:id", userMiddleware, checkPremiumAccess, runCode);

module.exports = submitRouter;