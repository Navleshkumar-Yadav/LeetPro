const Problem = require("../models/problem.js");
const Submission = require("../models/submission.js");
const User = require("../models/user.js");
const UserProfile = require('../models/userProfile.js');
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility.js");
const { updateSubmissionActivity } = require("./dashboardController.js");
const { calculateStreak } = require("../utils/streakCalculator.js");

const submitCode = async (req,res)=>{
   
    // 
    try{
      
       const userId = req.result._id;
       const problemId = req.params.id;

       let {code,language} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");
      

      if(language==='cpp')
        language='c++'
      
      console.log(language);
      
    //    Fetch the problem from database
       const problem =  await Problem.findById(problemId);
    //    testcases(Hidden)
    
    //   Kya apne submission store kar du pehle....
    const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'pending',
          testCasesTotal:problem.hiddenTestCases.length
     })

    //    Judge0 code ko submit karna hai
    
    const languageId = getLanguageById(language);
   
    const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));

    
    const submitResult = await submitBatch(submissions);
    
    const resultToken = submitResult.map((value)=> value.token);

    const testResult = await submitToken(resultToken);
    

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;


    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = 'error'
            errorMessage = test.stderr
          }
          else{
            status = 'wrong'
            errorMessage = test.stderr
          }
        }
    }


    // Store the result in Database in Submission
    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    
    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.
    
    // req.result == user Information

    if(!req.result.problemSolved.includes(problemId)){
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    // Update submission activity for dashboard
    await updateSubmissionActivity(userId, problemId, problem.difficulty, status);
    
    // Calculate and update streak for successful submissions
    let streakInfo = null;
    if (status === 'accepted') {
      try {
        streakInfo = await calculateStreak(userId);
        // Award points for daily check-in
        const { awardPoints } = require('../utils/pointSystem');
        await awardPoints(userId, 'Daily Check in', 5);
        // Award streak milestone points
        if (streakInfo.currentStreak === 2) {
          await awardPoints(userId, 'Makes 2 Day Streak', 20);
        } else if (streakInfo.currentStreak === 3) {
          await awardPoints(userId, 'Makes 3 Day Streak', 30);
        } else if (streakInfo.currentStreak === 5) {
          await awardPoints(userId, 'Makes 5 Day Streak', 80);
        }
        // Award streak badges
        const streakBadges = [
          { streak: 1, name: '1 Day Streak', icon: 'streak-1' },
          { streak: 2, name: '2 Day Streak', icon: 'streak-2' },
          { streak: 3, name: '3 Day Streak', icon: 'streak-3' },
          { streak: 5, name: '5 Day Streak', icon: 'streak-5' },
        ];
        for (const badge of streakBadges) {
          if (streakInfo.currentStreak === badge.streak) {
            let userProfile = await UserProfile.findOne({ userId });
            if (!userProfile) {
              userProfile = await UserProfile.create({ userId, badges: [] });
            }
            if (!userProfile.badges.some(b => b.name === badge.name)) {
              userProfile.badges.push({
                name: badge.name,
                description: `Complete a ${badge.streak}-day streak`,
                icon: badge.icon,
                badgeCategory: 'Streak',
                earnedAt: new Date()
              });
              await userProfile.save();
            }
          }
        }
        // Award problem solved badges
        const user = await User.findById(userId);
        const solvedCount = user.problemSolved.length;
        const problemBadges = [
          { count: 1, name: '1 Problem Solved', icon: 'problem-1' },
          { count: 2, name: '2 Problems Solved', icon: 'problem-2' },
          { count: 3, name: '3 Problems Solved', icon: 'problem-3' },
          { count: 5, name: '5 Problems Solved', icon: 'problem-5' },
        ];
        for (const badge of problemBadges) {
          if (solvedCount === badge.count) {
            let userProfile = await UserProfile.findOne({ userId });
            if (!userProfile) {
              userProfile = await UserProfile.create({ userId, badges: [] });
            }
            if (!userProfile.badges.some(b => b.name === badge.name)) {
              userProfile.badges.push({
                name: badge.name,
                description: `Solve ${badge.count} problem${badge.count > 1 ? 's' : ''}`,
                icon: badge.icon,
                badgeCategory: 'Problem Solved',
                earnedAt: new Date()
              });
              await userProfile.save();
            }
          }
        }
      } catch (error) {
        console.error('Error calculating streak:', error);
        // Don't fail the submission if streak calculation fails
        streakInfo = {
          currentStreak: 0,
          maxStreak: 0,
          isNewStreak: false,
          isStreakMaintained: false,
          streakIncreased: false
        };
      }
    }
    
    const accepted = (status == 'accepted')
    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      streak: streakInfo
    });
       
    }
    catch(err){
      res.status(500).send("Internal Server Error "+ err);
    }
}


const runCode = async(req,res)=>{
    try{
      const userId = req.result._id;
      const problemId = req.params.id;
      let {code,language, testCases} = req.body;
      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");
      // Fetch the problem from database
      const problem =  await Problem.findById(problemId);
      if(language==='cpp')
        language='c++'
      const languageId = getLanguageById(language);
      // Support custom test cases
      let submissions;
      if (Array.isArray(testCases) && testCases.length > 0) {
        submissions = testCases.map(tc => ({
          source_code: code,
          language_id: languageId,
          stdin: tc.input,
          expected_output: tc.output || undefined
        }));
      } else {
        submissions = problem.visibleTestCases.map((testcase)=>(
          {
            source_code:code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
          }
        ));
      }
      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value)=> value.token);
      const testResult = await submitToken(resultToken);
      let testCasesPassed = 0;
      let runtime = 0;
      let memory = 0;
      let status = true;
      let errorMessage = null;
      for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = false
            errorMessage = test.stderr
          }
          else{
            status = false
            errorMessage = test.stderr
          }
        }
      }
      res.status(201).json({
        success:status,
        testCases: testResult,
        runtime,
        memory
      });
    }
    catch(err){
      res.status(500).send("Internal Server Error "+ err);
    }
}


module.exports = {submitCode,runCode};



//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',


// User.findByIdUpdate({
// })

//const user =  User.findById(id)
// user.firstName = "Mohit";
// await user.save();