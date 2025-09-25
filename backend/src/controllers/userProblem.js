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

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags companies visibleTestCases hiddenTestCases startCode referenceSolution isPremium');
   
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
      ...getProblem.toObject(),
      hasAccess,
      videos: videoData
    };

    res.status(200).send(responseData);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async(req,res)=>{

  try{
     
    const getProblem = await Problem.find({}).select('_id title difficulty tags isPremium');

   if(getProblem.length==0)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}


const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags companies isPremium"
      });
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const submittedProblem = async(req,res)=>{

  try{
     
    const userId = req.result._id;
    const problemId = req.params.pid;

   const ans = await Submission.find({userId,problemId});
  
  if(ans.length==0)
    res.status(200).send("No Submission is persent");

  res.status(200).send(ans);

  }
  catch(err){
     res.status(500).send("Internal Server Error");
  }
}



module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};