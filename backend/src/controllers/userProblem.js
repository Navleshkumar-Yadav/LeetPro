const mongoose = require('mongoose');
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility.js");
const Problem = require("../models/problem.js");
const User = require("../models/user.js");
const Submission = require("../models/submission.js");
const SolutionVideo = require("../models/solutionVideo.js");
const Subscription = require("../models/subscription.js");

const createProblem = async (req,res)=>{
   
  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator, isPremium, companies
    } = req.body;

    const validationErrors = [];

    try{
       
      for(const {language,completeCode} of referenceSolution){
         

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);

        const resultToken = submitResult.map((value)=> value.token);

        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       const testResult = await submitToken(resultToken);


       console.log(testResult);

       for(const test of testResult){
        if(test.status_id!=3){
         const errorDetails = {
           language: language,
           status: test.status_id === 4 ? 'Runtime Error' : 
                   test.status_id === 5 ? 'Time Limit Exceeded' :
                   test.status_id === 6 ? 'Compilation Error' :
                   'Wrong Answer',
           stderr: test.stderr || '',
           stdout: test.stdout || '',
           expected_output: test.expected_output || '',
           actual_output: test.stdout || ''
         };
         validationErrors.push(errorDetails);
        }
       }

      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: "Reference solution validation failed",
          errors: validationErrors
        });
      }

      // We can store it in our DB

    const userProblem =  await Problem.create({
        ...req.body,
        problemCreator: req.result._id,
        isPremium: isPremium || false,
        companies: companies || []
      });

      res.status(201).json({
        message: "Problem created successfully!",
        problemId: userProblem._id,
        title: userProblem.title
      });
    }
    catch(err){
        console.error("Problem creation error:", err);
        res.status(500).json({
          message: "Failed to create problem",
          error: err.message
        });
    }
}

const updateProblem = async (req,res)=>{
    
  const {id} = req.params;
  const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, isPremium, companies
   } = req.body;

  try{

     if(!id){
      return res.status(400).send("Missing ID Field");
     }

    const DsaProblem =  await Problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).send("ID is not persent in server");
    }
      
    // Validate reference solutions against test cases
    for(const {language,completeCode} of referenceSolution){
         
      const languageId = getLanguageById(language);
        
      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
          source_code:completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value)=> value.token);
      
     const testResult = await submitToken(resultToken);

     for(const test of testResult){
      if(test.status_id!=3){
       return res.status(400).send("Reference solution validation failed for " + language);
      }
     }
    }

    // Update the problem with new data
    const updatedProblem = await Problem.findByIdAndUpdate(
      id, 
      {
        title,
        description,
        difficulty,
        tags,
        companies: companies || [],
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        companies: companies || [],
        isPremium: isPremium !== undefined ? isPremium : DsaProblem.isPremium,
        problemCreator: DsaProblem.problemCreator // Keep original creator
      }, 
      {
        runValidators: true, 
        new: true
      }
    );
   
    res.status(200).json({
      message: "Problem updated successfully",
      problem: updatedProblem
    });
  }
  catch(err){
      console.error("Update error:", err);
      res.status(500).send("Error: "+err);
  }
}

const deleteProblem = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

   const deletedProblem = await Problem.findByIdAndDelete(id);

   if(!deletedProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send("Successfully Deleted");
  }
  catch(err){
     
    res.status(500).send("Error: "+err);
  }
}


const getProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id)
      .select('_id title description difficulty tags companies visibleTestCases hiddenTestCases startCode referenceSolution isPremium')
      .lean();
   
    if(!getProblem)
      return res.status(404).send("Problem is Missing");

    // Check if user has premium access for premium problems
    let hasAccess = true;
    if (getProblem.isPremium && req.result) {
      const subscription = await Subscription.findOne({
        userId: req.result._id,
        isActive: true,
        endDate: { $gt: new Date() }
      });
      hasAccess = !!subscription;
    }

    // Get video information for both categories
    const videos = await SolutionVideo.find({problemId: id})
      .select('category secureUrl thumbnailUrl customThumbnailUrl duration title description');

    const videoData = {};
    videos.forEach(video => {
      videoData[video.category] = {
        secureUrl: video.secureUrl,
        thumbnailUrl: video.customThumbnailUrl || video.thumbnailUrl,
        duration: video.duration,
        title: video.title,
        description: video.description
      };
    });

    const responseData = {
      ...getProblem,
      hasAccess,
      videos: videoData
    };

    res.status(200).send(responseData);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const getAllProblem = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const search = String(req.query.search || '').trim();
    const difficulty = req.query.difficulty || 'all';
    const tag = req.query.tag || 'all';
    const status = req.query.status || 'all';
    const premiumOnly =
      req.query.premiumOnly === 'true' || req.query.premiumOnly === true;
    const listAll = req.query.listAll === 'true' || req.query.listAll === true;

    const userId = req.result._id;
    let solvedIds = [];

    if (status === 'solved' || status === 'unsolved') {
      const u = await User.findById(userId).select('problemSolved').lean();
      solvedIds = (u?.problemSolved || []).map((id) =>
        id instanceof mongoose.Types.ObjectId
          ? id
          : new mongoose.Types.ObjectId(id)
      );
    }

    const filter = {};
    if (!listAll) {
      filter.isPremium = premiumOnly;
    } else if (premiumOnly) {
      filter.isPremium = true;
    }

    if (difficulty !== 'all') filter.difficulty = difficulty;
    if (tag !== 'all') filter.tags = tag;
    if (search) filter.title = new RegExp(escapeRegex(search), 'i');

    if (status === 'solved') {
      filter._id = { $in: solvedIds };
    } else if (status === 'unsolved' && solvedIds.length > 0) {
      filter._id = { $nin: solvedIds };
    }

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .select('_id title difficulty tags isPremium')
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      problems,
      total,
      page,
      pageSize: limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

const getProblemCatalogStats = async (_req, res) => {
  try {
    const [agg] = await Problem.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          free: { $sum: { $cond: [{ $eq: ['$isPremium', false] }, 1, 0] } },
          premium: { $sum: { $cond: ['$isPremium', 1, 0] } },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } },
        },
      },
    ]);

    const base = agg || {};
    res.status(200).json({
      total: base.total || 0,
      free: base.free || 0,
      premium: base.premium || 0,
      easy: base.easy || 0,
      medium: base.medium || 0,
      hard: base.hard || 0,
    });
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.result._id;

    const user = await User.findById(userId)
      .select('problemSolved')
      .populate({
        path: 'problemSolved',
        select: '_id title difficulty tags companies isPremium',
      })
      .lean();

    res.status(200).json(user?.problemSolved || []);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

const submittedProblem = async(req,res)=>{

  try{
     
    const userId = req.result._id;
    const problemId = req.params.pid;

   const ans = await Submission.find({ userId, problemId }).lean();
  
  if(ans.length==0)
    return res.status(200).send("No Submission is persent");

  return res.status(200).send(ans);

  }
  catch(err){
     res.status(500).send("Internal Server Error");
  }
}



module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  getProblemCatalogStats,
  solvedAllProblembyUser,
  submittedProblem,
};