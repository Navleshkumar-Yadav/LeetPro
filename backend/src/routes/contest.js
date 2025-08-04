const express = require('express');
const router = express.Router();

const contestController = require('../controllers/contestController');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

// Admin routes
router.post('/create', adminMiddleware, contestController.createContest);
router.put('/:contestId', adminMiddleware, contestController.updateContest);
router.delete('/:contestId', adminMiddleware, contestController.deleteContest);
router.get('/admin/all', adminMiddleware, contestController.getAllContests);

// Public/user routes
router.get('/current', contestController.getCurrentContests);
router.get('/upcoming', contestController.getUpcomingContests);
router.get('/past', contestController.getPastContests);
router.get('/my', userMiddleware, contestController.getMyContests);
router.get('/:contestId', contestController.getContestDetails);
router.get('/:contestId/leaderboard', contestController.getContestLeaderboard);

router.post('/:contestId/register', userMiddleware, contestController.registerForContest);
router.post('/:contestId/unregister', userMiddleware, contestController.unregisterFromContest);

// Contest participation
router.get('/:contestId/problems', userMiddleware, contestController.getContestProblems);
router.post('/:contestId/submit', userMiddleware, contestController.submitSolution);
router.get('/:contestId/report', userMiddleware, contestController.getContestReport);

// User rating
router.get('/user/:userId/rating', contestController.getUserContestRatingHistory);

module.exports = router;