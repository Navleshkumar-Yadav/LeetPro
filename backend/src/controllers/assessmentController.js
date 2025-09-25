const Assessment = require('../models/assessment.js');
const AssessmentSubmission = require('../models/assessmentSubmission.js');
const Problem = require('../models/problem.js');
const Subscription = require('../models/subscription.js');
const UserProfile = require('../models/userProfile.js');
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility.js');

const getAllAssessments = async (req, res) => {
    try {
        const userId = req.result._id;
        
        // Check if user has premium subscription
        const subscription = await Subscription.findOne({
            userId,
            isActive: true,
            endDate: { $gt: new Date() }
        });
        
        const hasActiveSubscription = !!subscription;
        
        const assessments = await Assessment.find({})
            .select('title description type category company isPremium duration totalQuestions difficulty')
            .sort({ createdAt: -1 });
        
        // Add access information to each assessment
        const assessmentsWithAccess = assessments.map(assessment => ({
            ...assessment.toObject(),
            hasAccess: !assessment.isPremium || hasActiveSubscription
        }));
        
        res.status(200).json({
            assessments: assessmentsWithAccess,
            hasActiveSubscription
        });
        
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
};

const getAssessmentById = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const userId = req.result._id;
        
        const assessment = await Assessment.findById(assessmentId)
            .populate('questions.problemId', 'title description difficulty tags visibleTestCases startCode');
        
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        // Check premium access
        if (assessment.isPremium) {
            const subscription = await Subscription.findOne({
                userId,
                isActive: true,
                endDate: { $gt: new Date() }
            });
            
            if (!subscription) {
                return res.status(403).json({ 
                    error: 'Premium subscription required',
                    isPremium: true,
                    hasAccess: false
                });
            }
        }
        
        // Check if user has already started this assessment
        const existingSubmission = await AssessmentSubmission.findOne({
            userId,
            assessmentId,
            status: 'in_progress'
        });
        
        res.status(200).json({
            assessment,
            hasActiveSubmission: !!existingSubmission,
            submissionId: existingSubmission?._id
        });
        
    } catch (error) {
        console.error('Error fetching assessment:', error);
        res.status(500).json({ error: 'Failed to fetch assessment' });
    }
};

const startAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const userId = req.result._id;
        
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        // Check premium access
        if (assessment.isPremium) {
            const subscription = await Subscription.findOne({
                userId,
                isActive: true,
                endDate: { $gt: new Date() }
            });
            
            if (!subscription) {
                return res.status(403).json({ 
                    error: 'Premium subscription required'
                });
            }
        }
        
        // Check if user already has an active submission
        const existingSubmission = await AssessmentSubmission.findOne({
            userId,
            assessmentId,
            status: 'in_progress'
        });
        
        if (existingSubmission) {
            return res.status(400).json({ 
                error: 'Assessment already in progress',
                submissionId: existingSubmission._id
            });
        }
        
        // Create new submission
        const submission = await AssessmentSubmission.create({
            userId,
            assessmentId,
            startTime: new Date(),
            totalScore: assessment.totalQuestions,
            answers: []
        });
        
        res.status(201).json({
            message: 'Assessment started successfully',
            submissionId: submission._id,
            startTime: submission.startTime
        });
        
    } catch (error) {
        console.error('Error starting assessment:', error);
        res.status(500).json({ error: 'Failed to start assessment' });
    }
};

const submitMCQAnswer = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { submissionId, questionIndex, selectedOption } = req.body;
        const userId = req.result._id;
        
        const submission = await AssessmentSubmission.findOne({
            _id: submissionId,
            userId,
            assessmentId,
            status: 'in_progress'
        });
        
        if (!submission) {
            return res.status(404).json({ error: 'Active submission not found' });
        }
        
        const assessment = await Assessment.findById(assessmentId);
        const question = assessment.questions[questionIndex];
        
        if (!question) {
            return res.status(400).json({ error: 'Invalid question index' });
        }
        
        const isCorrect = question.correctAnswer === selectedOption;
        
        // Update or add answer
        const existingAnswerIndex = submission.answers.findIndex(
            answer => answer.questionIndex === questionIndex
        );
        
        const answerData = {
            questionIndex,
            selectedOption,
            isCorrect
        };
        
        if (existingAnswerIndex >= 0) {
            submission.answers[existingAnswerIndex] = answerData;
        } else {
            submission.answers.push(answerData);
        }
        
        await submission.save();
        
        res.status(200).json({
            message: 'Answer submitted successfully',
            isCorrect
        });
        
    } catch (error) {
        console.error('Error submitting MCQ answer:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
};

const submitCodingAnswer = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { submissionId, questionIndex, code, language } = req.body;
        const userId = req.result._id;
        
        const submission = await AssessmentSubmission.findOne({
            _id: submissionId,
            userId,
            assessmentId,
            status: 'in_progress'
        });
        
        if (!submission) {
            return res.status(404).json({ error: 'Active submission not found' });
        }
        
        const assessment = await Assessment.findById(assessmentId);
        const question = assessment.questions[questionIndex];
        
        if (!question || !question.problemId) {
            return res.status(400).json({ error: 'Invalid coding question' });
        }
        
        // Get problem details
        const problem = await Problem.findById(question.problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
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
        
        for (const test of testResult) {
            if (test.status_id === 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            }
        }
        
        // Update or add answer
        const existingAnswerIndex = submission.answers.findIndex(
            answer => answer.questionIndex === questionIndex
        );
        
        const answerData = {
            questionIndex,
            code,
            language,
            testCasesPassed,
            totalTestCases: problem.hiddenTestCases.length,
            runtime,
            memory
        };
        
        if (existingAnswerIndex >= 0) {
            submission.answers[existingAnswerIndex] = answerData;
        } else {
            submission.answers.push(answerData);
        }
        
        await submission.save();
        
        res.status(200).json({
            message: 'Code submitted successfully',
            testCasesPassed,
            totalTestCases: problem.hiddenTestCases.length,
            runtime,
            memory
        });
        
    } catch (error) {
        console.error('Error submitting coding answer:', error);
        res.status(500).json({ error: 'Failed to submit code' });
    }
};

const completeAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { submissionId } = req.body;
        const userId = req.result._id;
        
        const submission = await AssessmentSubmission.findOne({
            _id: submissionId,
            userId,
            assessmentId,
            status: 'in_progress'
        });
        
        if (!submission) {
            return res.status(404).json({ error: 'Active submission not found' });
        }
        
        const assessment = await Assessment.findById(assessmentId);
        
        // Calculate score
        let score = 0;
        
        if (assessment.type === 'mcq') {
            score = submission.answers.filter(answer => answer.isCorrect).length;
        } else if (assessment.type === 'coding') {
            // For coding, score based on test cases passed
            score = submission.answers.reduce((total, answer) => {
                const percentage = answer.testCasesPassed / answer.totalTestCases;
                return total + percentage;
            }, 0);
        }
        
        const percentage = (score / assessment.totalQuestions) * 100;
        
        // Update submission
        submission.endTime = new Date();
        submission.status = 'completed';
        submission.score = score;
        submission.percentage = percentage;
        
        await submission.save();
        // Award points for assessment completion
        const { awardPoints } = require('../utils/pointSystem');
        if (assessment.isPremium) {
            await awardPoints(userId, 'Completes a Premium Assessment', 150);
        } else {
            await awardPoints(userId, 'Completes a free assessment', 100);
        }
        // Award assessment badge for 2 completions
        const completedCount = await AssessmentSubmission.countDocuments({ userId, status: 'completed' });
        if (completedCount === 2) {
            const userProfile = await UserProfile.findOne({ userId });
            if (!userProfile.badges.some(b => b.name === '2 Assessments Completed')) {
                userProfile.badges.push({
                    name: '2 Assessments Completed',
                    description: 'Complete 2 assessments',
                    icon: 'assessment-2',
                    badgeCategory: 'Assessment',
                    earnedAt: new Date()
                });
                await userProfile.save();
            }
        }
        
        res.status(200).json({
            message: 'Assessment completed successfully',
            submissionId: submission._id,
            score,
            totalScore: assessment.totalQuestions,
            percentage
        });
        
    } catch (error) {
        console.error('Error completing assessment:', error);
        res.status(500).json({ error: 'Failed to complete assessment' });
    }
};

const getAssessmentReport = async (req, res) => {
    try {
        const { assessmentId, submissionId } = req.params;
        const userId = req.result._id;
        
        const submission = await AssessmentSubmission.findOne({
            _id: submissionId,
            userId,
            assessmentId,
            status: 'completed'
        });
        
        if (!submission) {
            return res.status(404).json({ error: 'Completed submission not found' });
        }
        
        const assessment = await Assessment.findById(assessmentId)
            .populate('questions.problemId', 'title difficulty');
        
        // Calculate detailed results
        const results = {
            assessment: {
                title: assessment.title,
                type: assessment.type,
                category: assessment.category,
                company: assessment.company,
                duration: assessment.duration,
                totalQuestions: assessment.totalQuestions
            },
            submission: {
                startTime: submission.startTime,
                endTime: submission.endTime,
                timeTaken: Math.round((submission.endTime - submission.startTime) / 1000 / 60), // in minutes
                score: submission.score,
                totalScore: submission.totalScore,
                percentage: submission.percentage
            },
            answers: submission.answers,
            questions: assessment.questions
        };
        
        if (assessment.type === 'mcq') {
            // Add subject-wise breakdown for MCQ
            const subjectBreakdown = {};
            assessment.questions.forEach((question, index) => {
                const subject = question.subject;
                if (!subjectBreakdown[subject]) {
                    subjectBreakdown[subject] = { total: 0, correct: 0 };
                }
                subjectBreakdown[subject].total++;
                
                const answer = submission.answers.find(a => a.questionIndex === index);
                if (answer && answer.isCorrect) {
                    subjectBreakdown[subject].correct++;
                }
            });
            
            results.subjectBreakdown = subjectBreakdown;
        }
        
        res.status(200).json(results);
        
    } catch (error) {
        console.error('Error fetching assessment report:', error);
        res.status(500).json({ error: 'Failed to fetch assessment report' });
    }
};

const getUserAssessments = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const submissions = await AssessmentSubmission.find({ userId })
            .populate('assessmentId', 'title type category company difficulty')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ submissions });
        
    } catch (error) {
        console.error('Error fetching user assessments:', error);
        res.status(500).json({ error: 'Failed to fetch user assessments' });
    }
};

module.exports = {
    getAllAssessments,
    getAssessmentById,
    startAssessment,
    submitMCQAnswer,
    submitCodingAnswer,
    completeAssessment,
    getAssessmentReport,
    getUserAssessments
};