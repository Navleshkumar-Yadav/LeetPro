const User = require('../models/user.js');
const UserProfile = require('../models/userProfile.js');
const Submission = require('../models/submission.js');
const SubmissionActivity = require('../models/submissionActivity.js');
const Problem = require('../models/problem.js');
const cloudinary = require('cloudinary').v2;
const PointActivity = require('../models/pointActivity');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getDashboardData = async (req, res) => {
    try {
        const userId = req.result._id;
        
        // Get or create user profile
        let userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            userProfile = await UserProfile.create({ userId });
        }

        // Get user data
        const user = await User.findById(userId).populate('problemSolved');
        
        // Calculate problem stats
        const totalSolved = user.problemSolved.length;
        const easySolved = user.problemSolved.filter(p => p.difficulty === 'easy').length;
        const mediumSolved = user.problemSolved.filter(p => p.difficulty === 'medium').length;
        const hardSolved = user.problemSolved.filter(p => p.difficulty === 'hard').length;

        // Get total problems count
        const totalProblems = await Problem.countDocuments();
        const totalEasy = await Problem.countDocuments({ difficulty: 'easy' });
        const totalMedium = await Problem.countDocuments({ difficulty: 'medium' });
        const totalHard = await Problem.countDocuments({ difficulty: 'hard' });

        // Get recent submissions for activity
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const submissionActivity = await SubmissionActivity.find({
            userId,
            date: { $gte: oneYearAgo }
        }).sort({ date: 1 });

        // Get recent submissions count
        const recentSubmissions = await Submission.countDocuments({
            userId,
            createdAt: { $gte: oneYearAgo }
        });

        // Calculate streak
        const streak = await calculateStreak(userId);

        // Get community stats
        const totalUsers = await User.countDocuments();
        const userRank = await calculateUserRank(userId, totalSolved);

        const ALL_BADGES = [
          // Streak badges
          { name: '1 Day Streak', description: 'Complete a 1-day streak', icon: 'streak-1', badgeCategory: 'Streak' },
          { name: '2 Day Streak', description: 'Complete a 2-day streak', icon: 'streak-2', badgeCategory: 'Streak' },
          { name: '3 Day Streak', description: 'Complete a 3-day streak', icon: 'streak-3', badgeCategory: 'Streak' },
          { name: '5 Day Streak', description: 'Complete a 5-day streak', icon: 'streak-5', badgeCategory: 'Streak' },
          // Problem Solved badges
          { name: '1 Problem Solved', description: 'Solve your first problem', icon: 'problem-1', badgeCategory: 'Problem Solved' },
          { name: '2 Problems Solved', description: 'Solve 2 problems', icon: 'problem-2', badgeCategory: 'Problem Solved' },
          { name: '3 Problems Solved', description: 'Solve 3 problems', icon: 'problem-3', badgeCategory: 'Problem Solved' },
          { name: '5 Problems Solved', description: 'Solve 5 problems', icon: 'problem-5', badgeCategory: 'Problem Solved' },
          // Assessment badges
          { name: '2 Assessments Completed', description: 'Complete 2 assessments', icon: 'assessment-2', badgeCategory: 'Assessment' },
        ];

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                joinedAt: user.createdAt
            },
            profile: userProfile,
            stats: {
                problemsSolved: {
                    total: totalSolved,
                    easy: easySolved,
                    medium: mediumSolved,
                    hard: hardSolved
                },
                totalProblems: {
                    total: totalProblems,
                    easy: totalEasy,
                    medium: totalMedium,
                    hard: totalHard
                },
                recentSubmissions,
                streak,
                rank: userRank,
                totalUsers
            },
            activity: submissionActivity,
            ratingHistory: userProfile.ratingHistory || [],
            badges: userProfile.badges || [],
            allBadges: ALL_BADGES
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

const getMonthlyCalendar = async (req, res) => {
    try {
        const userId = req.result._id;
        const { year, month } = req.query;
        
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month) - 1 : new Date().getMonth(); // 0-indexed
        
        // Get first and last day of the month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Get submission activity for the month
        const monthlyActivity = await SubmissionActivity.find({
            userId,
            date: {
                $gte: firstDay,
                $lte: lastDay
            }
        }).sort({ date: 1 });

        // Get user's solved problems to calculate daily solved count
        const user = await User.findById(userId).populate('problemSolved');
        const solvedProblems = user.problemSolved;

        // Get all submissions for the month to track when problems were solved
        const monthlySubmissions = await Submission.find({
            userId,
            status: 'accepted',
            createdAt: {
                $gte: firstDay,
                $lte: lastDay
            }
        }).populate('problemId').sort({ createdAt: 1 });

        // Create calendar data
        const calendarData = [];
        const daysInMonth = lastDay.getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(currentYear, currentMonth, day);
            const nextDate = new Date(currentYear, currentMonth, day + 1);
            
            const activity = monthlyActivity.find(a => 
                new Date(a.date).getDate() === day
            );

            // Count unique problems solved on this day
            const dailySubmissions = monthlySubmissions.filter(submission => {
                const submissionDate = new Date(submission.createdAt);
                return submissionDate >= currentDate && submissionDate < nextDate;
            });

            // Get unique problems solved on this day
            const uniqueProblemsToday = new Set();
            dailySubmissions.forEach(submission => {
                if (submission.problemId) {
                    uniqueProblemsToday.add(submission.problemId._id.toString());
                }
            });

            const problemsSolved = uniqueProblemsToday.size;
            
            calendarData.push({
                date: currentDate,
                day: day,
                hasActivity: problemsSolved > 0,
                submissionCount: activity ? activity.count : 0,
                problemsSolved: problemsSolved,
                problems: activity ? activity.problems : []
            });
        }

        // Calculate monthly stats  
        const totalSubmissions = monthlyActivity.reduce((sum, activity) => sum + activity.count, 0);
        // Fix: Count unique problems solved in the month
        const uniqueProblemsThisMonth = new Set();
        monthlySubmissions.forEach(submission => {
            if (submission.problemId) {
                uniqueProblemsThisMonth.add(submission.problemId._id.toString());
            }
        });
        const totalProblemsSolved = uniqueProblemsThisMonth.size;
        const activeDays = monthlyActivity.length;
        const streak = await calculateMonthlyStreak(userId, currentYear, currentMonth);

        res.status(200).json({
            year: currentYear,
            month: currentMonth + 1, // Return 1-indexed month
            monthName: new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }),
            calendarData,
            stats: {
                totalSubmissions,
                totalProblemsSolved,
                activeDays,
                streak,
                daysInMonth
            }
        });

    } catch (error) {
        console.error('Error fetching monthly calendar:', error);
        res.status(500).json({ error: 'Failed to fetch monthly calendar' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        const { about, website, github, linkedin, location, skills } = req.body;

        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId },
            {
                about,
                website,
                github,
                linkedin,
                location,
                skills: skills || []
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.result._id;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile-images',
            public_id: `profile_${userId}`,
            overwrite: true,
            transformation: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                { quality: 'auto' }
            ]
        });

        // Update user profile
        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId },
            {
                profileImage: {
                    cloudinaryPublicId: result.public_id,
                    secureUrl: result.secure_url
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Profile image uploaded successfully',
            profileImage: updatedProfile.profileImage
        });

    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ error: 'Failed to upload profile image' });
    }
};

const calculateStreak = async (userId) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        let currentDate = new Date(today);
        let streak = 0;
        
        // Check if user solved any problem today
        const todayActivity = await SubmissionActivity.findOne({
            userId,
            date: today
        });
        
        if (!todayActivity) {
            // If no activity today, start checking from yesterday
            currentDate.setUTCDate(currentDate.getUTCDate() - 1);
        }
        
        // Count consecutive days with activity
        while (true) {
            const activity = await SubmissionActivity.findOne({
                userId,
                date: currentDate
            });
            
            if (activity && activity.count > 0) {
                streak++;
                currentDate.setUTCDate(currentDate.getUTCDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    } catch (error) {
        console.error('Error calculating streak:', error);
        return 0;
    }
};

const calculateMonthlyStreak = async (userId, year, month) => {
    try {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const monthlyActivity = await SubmissionActivity.find({
            userId,
            date: {
                $gte: firstDay,
                $lte: lastDay
            }
        }).sort({ date: -1 });

        let maxStreak = 0;
        let currentStreak = 0;
        let lastDate = null;

        for (const activity of monthlyActivity) {
            const activityDate = new Date(activity.date);
            
            if (lastDate === null) {
                currentStreak = 1;
            } else {
                const dayDiff = Math.floor((lastDate - activityDate) / (1000 * 60 * 60 * 24));
                if (dayDiff === 1) {
                    currentStreak++;
                } else {
                    maxStreak = Math.max(maxStreak, currentStreak);
                    currentStreak = 1;
                }
            }
            
            lastDate = activityDate;
        }
        
        return Math.max(maxStreak, currentStreak);
    } catch (error) {
        console.error('Error calculating monthly streak:', error);
        return 0;
    }
};

const calculateUserRank = async (userId, userSolvedCount) => {
    try {
        const usersWithMoreSolved = await User.aggregate([
            {
                $project: {
                    problemsSolvedCount: { $size: '$problemSolved' }
                }
            },
            {
                $match: {
                    problemsSolvedCount: { $gt: userSolvedCount }
                }
            },
            {
                $count: 'count'
            }
        ]);
        
        return (usersWithMoreSolved[0]?.count || 0) + 1;
    } catch (error) {
        console.error('Error calculating user rank:', error);
        return 0;
    }
};

// Update submission activity when a submission is made
const updateSubmissionActivity = async (userId, problemId, difficulty, status) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        await SubmissionActivity.findOneAndUpdate(
            { userId, date: today },
            {
                $inc: { count: 1 },
                $push: {
                    problems: {
                        problemId,
                        difficulty,
                        status
                    }
                }
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error updating submission activity:', error);
    }
};

// Get user's total points
const getUserPoints = async (req, res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId);
        res.status(200).json({ points: user.points });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user points' });
    }
};

// Get user's point activity log
const getUserPointActivity = async (req, res) => {
    try {
        const userId = req.result._id;
        const activity = await PointActivity.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ activity });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch point activity' });
    }
};

module.exports = {
    getDashboardData,
    getMonthlyCalendar,
    updateProfile,
    uploadProfileImage,
    updateSubmissionActivity,
    getUserPoints,
    getUserPointActivity
};