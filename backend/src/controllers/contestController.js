const { Contest, ContestRegistration, ContestSubmission, ContestRating } = require('../models/contest');
const Problem = require('../models/problem');
const User = require('../models/user');
const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility.js");

// Admin functions
const createContest = async (req, res) => {
    try {
        const { name, description, instructions, problems, startTime, endTime, maxParticipants, isPublic } = req.body;
        
        if (!name || !description || !problems || !Array.isArray(problems) || problems.length === 0 || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate problems exist
        const problemIds = problems.map(p => p.problemId);
        const existingProblems = await Problem.find({ _id: { $in: problemIds } });
        
        if (existingProblems.length !== problemIds.length) {
            return res.status(400).json({ message: 'Some problems do not exist' });
        }


        const contest = new Contest({
            name,
            description,
            instructions,
            problems,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            maxParticipants: maxParticipants || 1000,
            isPublic: isPublic !== false,
            status: 'upcoming',
            createdBy: req.result._id
        });

        await contest.save();
        await contest.populate('problems.problemId', 'title difficulty');
        
        res.status(201).json({ 
            message: 'Contest created successfully',
            contest 
        });
    } catch (err) {
        console.error('Create contest error:', err);
        res.status(500).json({ message: 'Failed to create contest', error: err.message });
    }
};

const updateContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const updates = req.body;
        
        const contest = await Contest.findByIdAndUpdate(
            contestId,
            updates,
            { new: true, runValidators: true }
        ).populate('problems.problemId', 'title difficulty');
        
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        res.json({ contest });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update contest', error: err.message });
    }
};

const deleteContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        
        const contest = await Contest.findByIdAndDelete(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        // Clean up related data
        await ContestRegistration.deleteMany({ contestId });
        await ContestSubmission.deleteMany({ contestId });
        await ContestRating.deleteMany({ contestId });
        
        res.json({ message: 'Contest deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete contest', error: err.message });
    }
};

// Public/user functions
const getCurrentContests = async (req, res) => {
    try {
        const userId = req.result?._id;
        const now = new Date();
        const contests = await Contest.find({
            startTime: { $lte: now },
            endTime: { $gte: now },
            isPublic: true
        })
        .populate('problems.problemId', 'title difficulty')
        .populate('createdBy', 'firstName lastName')
        .sort({ startTime: 1 });
        
        // Add registration status for each contest
        const contestsWithRegistration = await Promise.all(
            contests.map(async (contest) => {
                let isRegistered = false;
                let participantCount = 0;
                
                if (userId) {
                    const registration = await ContestRegistration.findOne({ 
                        userId, 
                        contestId: contest._id, 
                        isActive: true 
                    });
                    isRegistered = !!registration;
                }
                
                participantCount = await ContestRegistration.countDocuments({ 
                    contestId: contest._id, 
                    isActive: true 
                });
                
                return {
                    ...contest.toObject(),
                    isRegistered,
                    participantCount
                };
            })
        );
        
        res.json({ contests: contestsWithRegistration });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch current contests', error: err.message });
    }
};

const getUpcomingContests = async (req, res) => {
    try {
        const userId = req.result?._id;
        const now = new Date();
        const contests = await Contest.find({
            startTime: { $gt: now },
            isPublic: true
        })
        .populate('problems.problemId', 'title difficulty')
        .populate('createdBy', 'firstName lastName')
        .sort({ startTime: 1 });
        
        // Add registration status for each contest
        const contestsWithRegistration = await Promise.all(
            contests.map(async (contest) => {
                let isRegistered = false;
                let participantCount = 0;
                
                if (userId) {
                    const registration = await ContestRegistration.findOne({ 
                        userId, 
                        contestId: contest._id, 
                        isActive: true 
                    });
                    isRegistered = !!registration;
                }
                
                participantCount = await ContestRegistration.countDocuments({ 
                    contestId: contest._id, 
                    isActive: true 
                });
                
                return {
                    ...contest.toObject(),
                    isRegistered,
                    participantCount
                };
            })
        );
        
        res.json({ contests: contestsWithRegistration });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch upcoming contests', error: err.message });
    }
};

const getPastContests = async (req, res) => {
    try {
        const userId = req.result?._id;
        const now = new Date();
        const contests = await Contest.find({
            endTime: { $lt: now },
            isPublic: true
        })
        .populate('problems.problemId', 'title difficulty')
        .populate('createdBy', 'firstName lastName')
        .sort({ startTime: -1 });
        
        // Add registration status for each contest
        const contestsWithRegistration = await Promise.all(
            contests.map(async (contest) => {
                let isRegistered = false;
                let participantCount = 0;
                
                if (userId) {
                    const registration = await ContestRegistration.findOne({ 
                        userId, 
                        contestId: contest._id, 
                        isActive: true 
                    });
                    isRegistered = !!registration;
                }
                
                participantCount = await ContestRegistration.countDocuments({ 
                    contestId: contest._id, 
                    isActive: true 
                });
                
                return {
                    ...contest.toObject(),
                    isRegistered,
                    participantCount
                };
            })
        );
        
        res.json({ contests: contestsWithRegistration });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch past contests', error: err.message });
    }
};

const getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find({})
            .populate('problems.problemId', 'title difficulty')
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        
        // Add participant count for each contest
        const contestsWithParticipants = await Promise.all(
            contests.map(async (contest) => {
                const participantCount = await ContestRegistration.countDocuments({ 
                    contestId: contest._id, 
                    isActive: true 
                });
                return {
                    ...contest.toObject(),
                    participantCount
                };
            })
        );
        
        res.json({ contests: contestsWithParticipants });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch contests', error: err.message });
    }
};
const getMyContests = async (req, res) => {
    try {
        const userId = req.result?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        const registrations = await ContestRegistration.find({ userId, isActive: true });
        const contestIds = registrations.map(r => r.contestId);
        
        const contests = await Contest.find({ _id: { $in: contestIds } })
            .populate('problems.problemId', 'title difficulty')
            .sort({ startTime: -1 });
            
        // Add registration status and participant count
        const contestsWithData = await Promise.all(
            contests.map(async (contest) => {
                const participantCount = await ContestRegistration.countDocuments({ 
                    contestId: contest._id, 
                    isActive: true 
                });
                
                return {
                    ...contest.toObject(),
                    isRegistered: true, // All contests in this list are registered
                    participantCount
                };
            })
        );
            
        res.json({ contests: contestsWithData });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch my contests', error: err.message });
    }
};

const getContestDetails = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.result?._id;
        
        const contest = await Contest.findById(contestId)
            .populate('problems.problemId', 'title difficulty')
            .populate('createdBy', 'firstName lastName');
            
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Check if user is registered
        let isRegistered = false;
        if (userId) {
            const registration = await ContestRegistration.findOne({ userId, contestId, isActive: true });
            isRegistered = !!registration;
        }

        // Get participant count
        const participantCount = await ContestRegistration.countDocuments({ contestId, isActive: true });

        res.json({ 
            contest: {
                ...contest.toObject(),
                participantCount,
                isRegistered
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch contest details', error: err.message });
    }
};

const registerForContest = async (req, res) => {
    try {
        const userId = req.result._id;
        const { contestId } = req.params;
        
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Check if contest has already ended
        const now = new Date();
        if (now > contest.endTime) {
            return res.status(400).json({ message: 'Contest has already ended' });
        }

        // Check if contest is full
        const participantCount = await ContestRegistration.countDocuments({ contestId, isActive: true });
        if (participantCount >= contest.maxParticipants) {
            return res.status(400).json({ message: 'Contest is full' });
        }

        // Check if already registered
        const existingRegistration = await ContestRegistration.findOne({ userId, contestId });
        if (existingRegistration) {
            if (existingRegistration.isActive) {
                return res.status(400).json({ message: 'Already registered for this contest' });
            } else {
                // Reactivate registration
                existingRegistration.isActive = true;
                await existingRegistration.save();
                return res.status(200).json({ message: 'Registration reactivated successfully' });
            }
        }

        const registration = new ContestRegistration({ userId, contestId });
        await registration.save();
        
        res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to register for contest', error: err.message });
    }
};

const unregisterFromContest = async (req, res) => {
    try {
        const userId = req.result._id;
        const { contestId } = req.params;
        
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Don't allow unregistration if contest has ended
        const now = new Date();
        if (now >= contest.endTime) {
            return res.status(400).json({ message: 'Cannot unregister after contest has ended' });
        }

        const result = await ContestRegistration.findOneAndUpdate(
            { userId, contestId },
            { isActive: false },
            { new: true }
        );
        
        if (!result) {
            return res.status(404).json({ message: 'Not registered for this contest' });
        }
        
        res.json({ message: 'Unregistered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to unregister from contest', error: err.message });
    }
};

// Contest participation
const getContestProblems = async (req, res) => {
    try {
        const userId = req.result._id;
        const { contestId } = req.params;
        
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        // Check if user is registered
        const registration = await ContestRegistration.findOne({ userId, contestId, isActive: true });
        if (!registration) {
            return res.status(403).json({ message: 'Not registered for this contest' });
        }
        
        // Check if contest is live
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(403).json({ message: 'Contest is not live' });
        }
        
        // Populate problems with full details
        const problems = await Promise.all(
            contest.problems.map(async (p) => {
                const problem = await Problem.findById(p.problemId);
                if (!problem) return null;
                
                // Check if user has submitted for this problem
                const submission = await ContestSubmission.findOne({
                    userId,
                    contestId,
                    problemId: p.problemId
                });
                
                return {
                    problemId: p.problemId,
                    marks: p.marks,
                    title: problem.title,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    tags: problem.tags,
                    visibleTestCases: problem.visibleTestCases,
                    startCode: problem.startCode,
                    hasSubmission: !!submission,
                    submissionStatus: submission?.status || null,
                    marksAwarded: submission?.marksAwarded || 0,
                    testCasesPassed: submission?.testCasesPassed || 0,
                    totalTestCases: submission?.testCasesTotal || 0
                };
            })
        );
        
        res.json({ 
            problems: problems.filter(Boolean),
            contest: {
                name: contest.name,
                startTime: contest.startTime,
                endTime: contest.endTime
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch contest problems', error: err.message });
    }
};

const submitSolution = async (req, res) => {
    try {
        const userId = req.result._id;
        const { contestId } = req.params;
        const { problemId, code, language } = req.body;
        
        if (!problemId || !code || !language) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        // Check if user is registered
        const registration = await ContestRegistration.findOne({ userId, contestId, isActive: true });
        if (!registration) {
            return res.status(403).json({ message: 'Not registered for this contest' });
        }
        
        // Check if contest is live
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(403).json({ message: 'Contest is not live' });
        }

        // Get problem details
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Execute code against test cases
        let normalizedLanguage = language;
        if (language === 'cpp') normalizedLanguage = 'c++';
        
        const languageId = getLanguageById(normalizedLanguage);
        
        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
        
        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);
        
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;
        
        for (const test of testResult) {
            if (test.status_id === 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                if (test.status_id === 4) {
                    status = 'error';
                    errorMessage = test.stderr;
                } else {
                    status = 'wrong';
                    errorMessage = test.stderr;
                }
            }
        }

        // Calculate marks awarded
        const contestProblem = contest.problems.find(p => p.problemId.toString() === problemId);
        const marksAwarded = status === 'accepted' ? contestProblem.marks : 0;
        
        // Upsert submission
        const submission = await ContestSubmission.findOneAndUpdate(
            { userId, contestId, problemId },
            { 
                code, 
                language, 
                status,
                runtime,
                memory,
                errorMessage,
                testCasesPassed,
                testCasesTotal: problem.hiddenTestCases.length,
                marksAwarded,
                submittedAt: new Date() 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        res.status(201).json({ 
            message: 'Submission received', 
            submission: {
                status,
                testCasesPassed,
                totalTestCases: problem.hiddenTestCases.length,
                marksAwarded,
                runtime,
                memory
            }
        });
    } catch (err) {
        console.error('Submit solution error:', err);
        res.status(500).json({ message: 'Failed to submit solution', error: err.message });
    }
};

const getContestReport = async (req, res) => {
    try {
        const userId = req.result._id;
        const { contestId } = req.params;
        
        const contest = await Contest.findById(contestId).populate('problems.problemId', 'title difficulty');
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        // Only allow after contest ends
        const now = new Date();
        if (now < contest.endTime) {
            return res.status(403).json({ message: 'Contest is not over yet' });
        }
        
        // Check if user was registered for this contest
        const registration = await ContestRegistration.findOne({ userId, contestId, isActive: true });
        if (!registration) {
            return res.status(403).json({ message: 'You were not registered for this contest' });
        }
        
        // Fetch all submissions for this user in this contest
        const submissions = await ContestSubmission.find({ userId, contestId })
            .populate('problemId', 'title difficulty');
        
        // Calculate total score
        const totalScore = submissions.reduce((sum, sub) => sum + sub.marksAwarded, 0);
        const maxScore = contest.problems.reduce((sum, p) => sum + p.marks, 0);
        
        // Get user's current rating
        const user = await User.findById(userId);
        const oldRating = user.contestRating || 1200;
        
        // Check if rating has already been calculated for this contest
        let existingRating = await ContestRating.findOne({ userId, contestId });
        let newRating = oldRating;
        let rank = 1;
        let totalParticipants = 1;
        
        if (!existingRating) {
            // Calculate new rating and rank only if not already calculated
            const ratingData = await calculateRatingChange(
                userId, contestId, totalScore, maxScore, oldRating
            );
            newRating = ratingData.newRating;
            rank = ratingData.rank;
            totalParticipants = ratingData.totalParticipants;
            
            // Update user's contest rating
            await User.findByIdAndUpdate(userId, { contestRating: newRating });
            
            // Save rating history
            existingRating = await ContestRating.create({
                userId,
                contestId,
                oldRating,
                newRating,
                ratingChange: newRating - oldRating,
                rank,
                totalParticipants,
                score: totalScore,
                maxScore
            });
        } else {
            // Use existing rating data
            newRating = existingRating.newRating;
            rank = existingRating.rank;
            totalParticipants = existingRating.totalParticipants;
        }

        const results = submissions.map(sub => ({
            problemId: sub.problemId._id,
            problemTitle: sub.problemId.title,
            difficulty: sub.problemId.difficulty,
            status: sub.status,
            marksAwarded: sub.marksAwarded,
            maxMarks: contest.problems.find(p => p.problemId.toString() === sub.problemId._id.toString())?.marks || 0,
            testCasesPassed: sub.testCasesPassed,
            totalTestCases: sub.testCasesTotal,
            runtime: sub.runtime,
            memory: sub.memory,
            submittedAt: sub.submittedAt
        }));
        
        res.json({
            contest: {
                name: contest.name,
                description: contest.description
            },
            performance: {
                totalScore,
                maxScore,
                percentage: (totalScore / maxScore) * 100,
                rank,
                totalParticipants
            },
            rating: {
                old: oldRating,
                new: newRating,
                change: existingRating ? existingRating.ratingChange : 0
            },
            results
        });
    } catch (err) {
        console.error('Contest report error:', err);
        res.status(500).json({ message: 'Failed to fetch contest report', error: err.message });
    }
};

// Helper function to calculate rating change
const calculateRatingChange = async (userId, contestId, score, maxScore, oldRating) => {
    try {
        // Get all registered participants and their scores
        const registeredUsers = await ContestRegistration.find({ contestId, isActive: true }).select('userId');
        const registeredUserIds = registeredUsers.map(reg => reg.userId);
        
        const allSubmissions = await ContestSubmission.aggregate([
            { $match: { contestId: contestId } },
            { $match: { userId: { $in: registeredUserIds } } },
            { 
                $group: { 
                    _id: '$userId', 
                    totalScore: { $sum: '$marksAwarded' } 
                } 
            },
            { $sort: { totalScore: -1 } }
        ]);
        
        const totalParticipants = allSubmissions.length;
        const userRank = allSubmissions.findIndex(sub => sub._id.toString() === userId.toString()) + 1;
        
        // Simple rating calculation based on performance and rank
        const performanceRatio = score / maxScore;
        const rankRatio = (totalParticipants - userRank + 1) / totalParticipants;
        
        // Base rating change calculation
        let ratingChange = 0;
        
        if (performanceRatio >= 0.8 && rankRatio >= 0.8) {
            ratingChange = 100; // Top performer
        } else if (performanceRatio >= 0.6 && rankRatio >= 0.6) {
            ratingChange = 50; // Good performance
        } else if (performanceRatio >= 0.4) {
            ratingChange = 20; // Average performance
        } else if (performanceRatio >= 0.2) {
            ratingChange = -10; // Below average
        } else {
            ratingChange = -30; // Poor performance
        }
        
        // Adjust based on current rating (higher rated players gain/lose less)
        const ratingFactor = Math.max(0.5, 1 - (oldRating - 1200) / 1000);
        ratingChange = Math.round(ratingChange * ratingFactor);
        
        const newRating = Math.max(800, oldRating + ratingChange); // Minimum rating of 800
        
        return {
            newRating,
            rank: userRank,
            totalParticipants
        };
    } catch (error) {
        console.error('Rating calculation error:', error);
        return {
            newRating: oldRating,
            rank: 1,
            totalParticipants: 1
        };
    }
};

// User rating history
const getUserContestRatingHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const ratingHistory = await ContestRating.find({ userId })
            .populate('contestId', 'name endTime')
            .sort({ createdAt: 1 });
        
        const history = ratingHistory.map(rating => ({
            contestId: rating.contestId._id,
            contestName: rating.contestId.name,
            date: rating.contestId.endTime,
            oldRating: rating.oldRating,
            newRating: rating.newRating,
            ratingChange: rating.ratingChange,
            rank: rating.rank,
            totalParticipants: rating.totalParticipants,
            score: rating.score,
            maxScore: rating.maxScore
        }));
        
        res.json({ history });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch rating history', error: err.message });
    }
};

// Get contest leaderboard
const getContestLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;
        
        const leaderboard = await ContestSubmission.aggregate([
            { $match: { contestId: contestId } },
            { 
                $group: { 
                    _id: '$userId', 
                    totalScore: { $sum: '$marksAwarded' },
                    totalRuntime: { $sum: '$runtime' },
                    submissions: { $sum: 1 }
                } 
            },
            { $sort: { totalScore: -1, totalRuntime: 1 } },
            { $limit: 100 }
        ]);
        
        // Populate user details
        const populatedLeaderboard = await User.populate(leaderboard, {
            path: '_id',
            select: 'firstName lastName contestRating'
        });
        
        const formattedLeaderboard = populatedLeaderboard.map((entry, index) => ({
            rank: index + 1,
            userId: entry._id._id,
            name: `${entry._id.firstName} ${entry._id.lastName}`,
            rating: entry._id.contestRating || 1200,
            score: entry.totalScore,
            runtime: entry.totalRuntime,
            submissions: entry.submissions
        }));
        
        res.json({ leaderboard: formattedLeaderboard });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch leaderboard', error: err.message });
    }
};

module.exports = {
    createContest,
    updateContest,
    deleteContest,
    getCurrentContests,
    getUpcomingContests,
    getPastContests,
    getAllContests,
    getMyContests,
    getContestDetails,
    registerForContest,
    unregisterFromContest,
    getContestProblems,
    submitSolution,
    getContestReport,
    getUserContestRatingHistory,
    getContestLeaderboard
};