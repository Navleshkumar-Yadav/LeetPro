import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Trash2, Search, Filter, ArrowLeft, Play, Eye } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from './AnimatedCard.jsx';
import GradientButton from './GradientButton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const AdminVideo = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [error, setError] = useState(null);
  const [videoData, setVideoData] = useState({});

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchTerm, difficultyFilter]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
      
      // Fetch video data for each problem
      const videoPromises = data.map(async (problem) => {
        try {
          const videoResponse = await axiosClient.get(`/video/problem/${problem._id}`);
          return { problemId: problem._id, videos: videoResponse.data.videos };
        } catch (error) {
          return { problemId: problem._id, videos: {} };
        }
      });
      
      const videoResults = await Promise.all(videoPromises);
      const videoMap = {};
      videoResults.forEach(result => {
        videoMap[result.problemId] = result.videos;
      });
      setVideoData(videoMap);
      setError(null);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (searchTerm) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(problem => problem.difficulty === difficultyFilter);
    }

    setFilteredProblems(filtered);
  };

  const handleDeleteVideo = async (problemId, category) => {
    if (!window.confirm(`Are you sure you want to delete the ${category} video?`)) return;
    
    try {
      setDeleting(`${problemId}-${category}`);
      await axiosClient.delete(`/video/delete/${problemId}?category=${category}`);
      
      // Update video data
      setVideoData(prev => ({
        ...prev,
        [problemId]: {
          ...prev[problemId],
          [category]: undefined
        }
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete video');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTagColor = (tag) => {
    const colors = {
      array: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      linkedList: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      graph: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
      dp: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    };
    return colors[tag] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading problems..." />
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Video className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl font-bold gradient-text">Video Management</h1>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {filteredProblems.length} of {problems.length} problems
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatedCard>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems for video management..."
                  className="dark-input w-full pl-10 pr-4 py-3 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  className="dark-input px-4 py-3 rounded-lg min-w-[140px]"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Problems List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredProblems.map((problem, index) => {
              const problemVideos = videoData[problem._id] || {};
              const hasBruteForce = problemVideos['brute-force'];
              const hasOptimal = problemVideos['optimal'];
              
              return (
                <motion.div
                  key={problem._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AnimatedCard className="hover:border-purple-500/30 transition-colors duration-300">
                    <div className="space-y-4">
                      {/* Problem Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-gray-400 font-mono text-sm min-w-[60px]">
                            #{index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {problem.title}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTagColor(problem.tags)}`}>
                                {problem.tags === 'linkedList' ? 'Linked List' : 
                                 problem.tags === 'dp' ? 'DP' : 
                                 problem.tags.charAt(0).toUpperCase() + problem.tags.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <NavLink to={`/admin/upload/${problem._id}`}>
                            <GradientButton size="sm" className="bg-blue-600 hover:bg-blue-500">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </GradientButton>
                          </NavLink>
                        </div>
                      </div>

                      {/* Video Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Brute Force Video */}
                        <div className={`p-4 rounded-lg border ${
                          hasBruteForce 
                            ? 'border-orange-500/30 bg-orange-500/5' 
                            : 'border-gray-600 bg-gray-700/30'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                hasBruteForce ? 'bg-orange-400' : 'bg-gray-500'
                              }`} />
                              <span className="font-medium text-white">Brute Force</span>
                            </div>
                            {hasBruteForce && (
                              <div className="flex items-center space-x-2">
                                {hasBruteForce.thumbnailUrl && (
                                  <img 
                                    src={hasBruteForce.thumbnailUrl} 
                                    alt="Thumbnail" 
                                    className="w-8 h-5 object-cover rounded border border-gray-600"
                                  />
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatDuration(hasBruteForce.duration)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {hasBruteForce ? (
                            <div className="space-y-2">
                              {hasBruteForce.title && (
                                <p className="text-sm text-gray-300">{hasBruteForce.title}</p>
                              )}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => window.open(hasBruteForce.secureUrl, '_blank')}
                                  className="flex items-center space-x-1 px-2 py-1 bg-orange-600/20 hover:bg-orange-600/30 rounded text-xs text-orange-400 transition-colors"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(problem._id, 'brute-force')}
                                  disabled={deleting === `${problem._id}-brute-force`}
                                  className="flex items-center space-x-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 rounded text-xs text-red-400 transition-colors disabled:opacity-50"
                                >
                                  {deleting === `${problem._id}-brute-force` ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No brute force video uploaded</p>
                          )}
                        </div>

                        {/* Optimal Video */}
                        <div className={`p-4 rounded-lg border ${
                          hasOptimal 
                            ? 'border-green-500/30 bg-green-500/5' 
                            : 'border-gray-600 bg-gray-700/30'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                hasOptimal ? 'bg-green-400' : 'bg-gray-500'
                              }`} />
                              <span className="font-medium text-white">Optimal</span>
                            </div>
                            {hasOptimal && (
                              <div className="flex items-center space-x-2">
                                {hasOptimal.thumbnailUrl && (
                                  <img 
                                    src={hasOptimal.thumbnailUrl} 
                                    alt="Thumbnail" 
                                    className="w-8 h-5 object-cover rounded border border-gray-600"
                                  />
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatDuration(hasOptimal.duration)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {hasOptimal ? (
                            <div className="space-y-2">
                              {hasOptimal.title && (
                                <p className="text-sm text-gray-300">{hasOptimal.title}</p>
                              )}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => window.open(hasOptimal.secureUrl, '_blank')}
                                  className="flex items-center space-x-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 rounded text-xs text-green-400 transition-colors"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(problem._id, 'optimal')}
                                  disabled={deleting === `${problem._id}-optimal`}
                                  className="flex items-center space-x-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 rounded text-xs text-red-400 transition-colors disabled:opacity-50"
                                >
                                  {deleting === `${problem._id}-optimal` ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No optimal video uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredProblems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No problems found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AnimatedCard className="text-center">
            <Video className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{problems.length}</div>
            <div className="text-sm text-gray-400">Total Problems</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <div className="w-8 h-8 bg-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-black font-bold text-sm">BF</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {Object.values(videoData).filter(videos => videos['brute-force']).length}
            </div>
            <div className="text-sm text-gray-400">Brute Force Videos</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <div className="w-8 h-8 bg-green-400 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-black font-bold text-sm">OP</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {Object.values(videoData).filter(videos => videos['optimal']).length}
            </div>
            <div className="text-sm text-gray-400">Optimal Videos</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">Ready</div>
            <div className="text-sm text-gray-400">For Upload</div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminVideo;