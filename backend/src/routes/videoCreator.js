const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware.js');
const videoRouter = express.Router();
const {
  generateUploadSignature,
  generateThumbnailUploadSignature,
  saveVideoMetadata,
  getVideosByProblem,
  deleteVideo
} = require("../controllers/videoSection.js");

videoRouter.get("/create/:problemId", adminMiddleware, generateUploadSignature);
videoRouter.get("/thumbnail/:problemId", adminMiddleware, generateThumbnailUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
videoRouter.get("/problem/:problemId", getVideosByProblem);
videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);

module.exports = videoRouter;