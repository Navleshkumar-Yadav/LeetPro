import { useParams, useNavigate } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, ArrowLeft, Video, FileVideo, Image, X } from 'lucide-react';
import axios from 'axios';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from './AnimatedCard.jsx';
import GradientButton from './GradientButton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

function AdminUpload() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('optimal');
  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError: setFormError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    try {
      setThumbnailUploading(true);
      setError(null);
      
      // Get upload signature for thumbnail
      const signatureResponse = await axiosClient.get(`/video/thumbnail/${problemId}?category=${selectedCategory}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);
      formData.append('transformation', 'w_400,h_225,c_fill,q_auto');

      // Upload to Cloudinary
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 second timeout
      });

      if (uploadResponse.data && uploadResponse.data.secure_url) {
        setThumbnailUrl(uploadResponse.data.secure_url);
        setCustomThumbnail(file);
      } else {
        throw new Error('Invalid response from image upload service');
      }
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Upload timeout. Please try with a smaller image.');
      } else if (error.response?.status === 400) {
        setError('Invalid image format. Please use JPG, PNG, or WebP.');
      } else {
        setError('Failed to upload thumbnail. Please try again.');
      }
    } finally {
      setThumbnailUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    clearErrors();

    try {
      // Step 1: Get upload signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}?category=${selectedCategory}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
        category: selectedCategory,
        title: data.title || '',
        description: data.description || '',
        customThumbnailUrl: thumbnailUrl
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
      setThumbnailUrl('');
      setCustomThumbnail(null);
      
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 409) {
        setError(`A ${selectedCategory} video already exists for this problem. Please delete it first or choose a different category.`);
      } else {
        setError(err.response?.data?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <motion.div
        className="glass-dark border-b border-gray-800 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/video')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Video className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold gradient-text">Upload Solution Video</h1>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatedCard>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileVideo className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload Video Solution</h2>
                <p className="text-gray-400">
                  Upload a solution video for this problem to help users understand the approach
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Video Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Video Category
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCategory === 'brute-force'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedCategory('brute-force')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Brute Force</div>
                        <div className="text-xs opacity-75">Basic approach solution</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCategory === 'optimal'
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedCategory('optimal')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Optimal</div>
                        <div className="text-xs opacity-75">Optimized solution</div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Video Title and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Video Title (Optional)
                    </label>
                    <input
                      {...register('title')}
                      className="dark-input w-full px-3 py-2 rounded"
                      placeholder={`${selectedCategory === 'brute-force' ? 'Brute Force' : 'Optimal'} Solution`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      {...register('description')}
                      className="dark-input w-full px-3 py-2 rounded"
                      placeholder="Brief description of the approach"
                    />
                  </div>
                </div>

                {/* Custom Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Custom Thumbnail (Optional)
                  </label>
                  <div className="space-y-3">
                    {thumbnailUrl && (
                      <div className="relative inline-block">
                        <img 
                          src={thumbnailUrl} 
                          alt="Custom thumbnail" 
                          className="w-32 h-18 object-cover rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailUrl('');
                            setCustomThumbnail(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 rounded-full p-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleThumbnailUpload}
                        className="file-input file-input-bordered w-full dark-input"
                        disabled={thumbnailUploading}
                      />
                      {thumbnailUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                          <LoadingSpinner size="sm" text="Uploading..." />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload a custom thumbnail image (JPG, PNG, WebP - Max 5MB). If not provided, an auto-generated thumbnail will be used.
                    </p>
                  </div>
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Choose Video File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      {...register('videoFile', {
                        required: 'Please select a video file',
                        validate: {
                          isVideo: (files) => {
                            if (!files || !files[0]) return 'Please select a video file';
                            const file = files[0];
                            return file.type.startsWith('video/') || 'Please select a valid video file';
                          },
                          fileSize: (files) => {
                            if (!files || !files[0]) return true;
                            const file = files[0];
                            const maxSize = 100 * 1024 * 1024; // 100MB
                            return file.size <= maxSize || 'File size must be less than 100MB';
                          }
                        }
                      })}
                      className={`file-input file-input-bordered w-full dark-input ${
                        errors.videoFile ? 'border-red-500' : ''
                      }`}
                      disabled={uploading}
                    />
                  </div>
                  {errors.videoFile && (
                    <p className="text-red-400 text-sm mt-2">{errors.videoFile.message}</p>
                  )}
                </div>

                {/* Selected File Info */}
                {selectedFile && (
                  <motion.div
                    className="glass border border-blue-500/20 rounded-lg p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <FileVideo className="w-8 h-8 text-blue-400" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{selectedFile.name}</h3>
                        <p className="text-sm text-gray-400">
                          Size: {formatFileSize(selectedFile.size)} • Category: {selectedCategory}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Uploading video...</span>
                      <span className="text-blue-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="text-center">
                      <LoadingSpinner size="sm" text="Processing video..." />
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{error}</span>
                  </motion.div>
                )}

                {/* Success Message */}
                {uploadedVideo && (
                  <motion.div
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <h3 className="font-semibold text-green-400">Upload Successful!</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>Category: <span className="capitalize font-medium">{uploadedVideo.category}</span></p>
                      <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
                      <p>Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                      {uploadedVideo.title && <p>Title: {uploadedVideo.title}</p>}
                    </div>
                  </motion.div>
                )}

                {/* Upload Button */}
                <div className="flex space-x-4">
                  <GradientButton
                    type="submit"
                    disabled={uploading || !selectedFile}
                    loading={uploading}
                    className="flex-1"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {uploading ? 'Uploading...' : `Upload ${selectedCategory} Video`}
                  </GradientButton>
                  
                  {uploadedVideo && (
                    <GradientButton
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/admin/video')}
                      className="px-6"
                    >
                      Done
                    </GradientButton>
                  )}
                </div>
              </form>
            </AnimatedCard>
          </motion.div>

          {/* Upload Guidelines */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <AnimatedCard>
              <h3 className="text-lg font-semibold text-white mb-4">Upload Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Maximum file size: 100MB</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Supported formats: MP4, MOV, AVI, WebM</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Recommended resolution: 1080p or higher</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Include clear explanation of the solution approach</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span>Custom thumbnails: JPG, PNG, WebP (Max 5MB)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  <span><strong>Brute Force:</strong> Basic, straightforward solution approach</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span><strong>Optimal:</strong> Most efficient solution with optimizations</span>
                </li>
              </ul>
            </AnimatedCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;