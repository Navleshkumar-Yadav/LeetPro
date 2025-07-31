const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem.js");
const User = require("../models/user.js");
const SolutionVideo = require("../models/solutionVideo.js");
const { sanitizeFilter } = require('mongoose');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { category = 'optimal' } = req.query;
    
    const userId = req.result._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${category}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};

const generateThumbnailUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { category = 'optimal' } = req.query;
    
    const userId = req.result._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the thumbnail
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-thumbnails/${problemId}/${category}/${userId}_${timestamp}`;
    
    // Upload parameters for image
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
      transformation: 'w_400,h_225,c_fill,q_auto'
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });

  } catch (error) {
    console.error('Error generating thumbnail upload signature:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail upload credentials' });
  }
};

const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
      category = 'optimal',
      title = '',
      description = '',
      customThumbnailUrl = ''
    } = req.body;

    const userId = req.result._id;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    // Generate auto thumbnail URL from video
    const autoThumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 400, height: 225, crop: 'fill' },
        { quality: 'auto' },
        { start_offset: 'auto' }
      ]
    });

    // Check if video already exists for this problem, category and user
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      category,
      userId
    });

    if (existingVideo) {
      // Delete old custom thumbnail if it exists and we're updating with a new one
      if (existingVideo.customThumbnailUrl && customThumbnailUrl && 
          existingVideo.customThumbnailUrl !== customThumbnailUrl) {
        try {
          const oldPublicId = existingVideo.customThumbnailUrl.split('/upload/')[1].split('.')[0];
          await cloudinary.uploader.destroy(oldPublicId, { 
            resource_type: 'image', 
            invalidate: true 
          });
        } catch (error) {
          console.warn('Failed to delete old custom thumbnail:', error);
        }
      }
      
      // Update existing video
      existingVideo.cloudinaryPublicId = cloudinaryPublicId;
      existingVideo.secureUrl = secureUrl;
      existingVideo.duration = cloudinaryResource.duration || duration;
      existingVideo.thumbnailUrl = autoThumbnailUrl;
      existingVideo.customThumbnailUrl = customThumbnailUrl;
      existingVideo.title = title;
      existingVideo.description = description;
      
      await existingVideo.save();
      
      return res.status(200).json({
        message: 'Video updated successfully',
        videoSolution: {
          id: existingVideo._id,
          category: existingVideo.category,
          thumbnailUrl: existingVideo.customThumbnailUrl || existingVideo.thumbnailUrl,
          duration: existingVideo.duration,
          title: existingVideo.title,
          description: existingVideo.description,
          uploadedAt: existingVideo.updatedAt
        }
      });
    }

    // Create new video solution record
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl: autoThumbnailUrl,
      customThumbnailUrl,
      category,
      title,
      description
    });

    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        category: videoSolution.category,
        thumbnailUrl: videoSolution.customThumbnailUrl || videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        title: videoSolution.title,
        description: videoSolution.description,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: `A ${req.body.category} video already exists for this problem` });
    }
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};

const getVideosByProblem = async (req, res) => {
  try {
    const { problemId } = req.params;

    const videos = await SolutionVideo.find({ problemId })
      .select('category secureUrl thumbnailUrl customThumbnailUrl duration title description createdAt')
      .sort({ category: 1 }); // brute-force first, then optimal

    const videoData = {};
    videos.forEach(video => {
      videoData[video.category] = {
        secureUrl: video.secureUrl,
        thumbnailUrl: video.customThumbnailUrl || video.thumbnailUrl,
        duration: video.duration,
        title: video.title,
        description: video.description,
        uploadedAt: video.createdAt
      };
    });

    res.status(200).json({ videos: videoData });

  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { category = 'optimal' } = req.query;
    const userId = req.result._id;

    const video = await SolutionVideo.findOneAndDelete({
      problemId: problemId,
      category: category,
      userId: userId
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { 
      resource_type: 'video', 
      invalidate: true 
    });

    // Delete custom thumbnail if exists
    if (video.customThumbnailUrl) {
      try {
        const publicId = video.customThumbnailUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { 
          resource_type: 'image', 
          invalidate: true 
        });
      } catch (thumbnailError) {
        console.warn('Failed to delete custom thumbnail:', thumbnailError);
      }
    }

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

module.exports = {
  generateUploadSignature,
  generateThumbnailUploadSignature,
  saveVideoMetadata,
  getVideosByProblem,
  deleteVideo
};