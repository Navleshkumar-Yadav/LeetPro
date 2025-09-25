import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Edit, 
  Camera, 
  MapPin, 
  Link, 
  Github, 
  Linkedin,
  Calendar,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  ArrowLeft,
  Save,
  X,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import DashboardMultiRingChart from '../components/DashboardMultiRingChart.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileForm, setProfileForm] = useState({
    about: '',
    website: '',
    github: '',
    linkedin: '',
    location: '',
    skills: []
  });
  const [ratingHistory, setRatingHistory] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // Fetch contest rating history
    const fetchRatingHistory = async () => {
      try {
        const res = await axiosClient.get(`/contest/user/${user?._id}/rating`);
        setRatingHistory(res.data.history || []);
      } catch (err) {
        setRatingHistory([]);
      }
    };
    if (user?._id) fetchRatingHistory();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/dashboard/data');
      setDashboardData(response.data);
      setProfileForm({
        about: response.data.profile.about || '',
        website: response.data.profile.website || '',
        github: response.data.profile.github || '',
        linkedin: response.data.profile.linkedin || '',
        location: response.data.profile.location || '',
        skills: response.data.profile.skills || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await axiosClient.put('/dashboard/profile', profileForm);
      await fetchDashboardData();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      
      await axiosClient.post('/dashboard/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await fetchDashboardData();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const generateHeatmapData = () => {
    if (!dashboardData?.activity) return [];
    
    const heatmapData = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Generate all dates for the past year
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const activity = dashboardData.activity.find(a => 
        new Date(a.date).toISOString().split('T')[0] === dateStr
      );
      const count = activity ? activity.count : 0;
      let level = 0;
      if (count === 1) level = 1;
      else if (count >= 2) level = 2;
      heatmapData.push({
        date: new Date(d),
        count,
        level
      });
    }
    
    return heatmapData;
  };

  const getHeatmapColor = (level) => {
    const colors = [
      'bg-gray-800', // 0 submissions
      'bg-green-600', // 1 submission, strong green
      'bg-green-400', // 2-3 submissions, brightest green
      'bg-green-400'  // 4+ submissions, brightest green
    ];
    return colors[level] || colors[0];
  };

  const CircularProgress = ({ value, max, color, size = 120 }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={color}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-400">/{max}</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load dashboard</h2>
          <button 
            onClick={fetchDashboardData}
            className="text-blue-400 hover:text-blue-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const heatmapData = generateHeatmapData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
              </div>
            </div>
            <GlobalNavigation />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Profile */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Card */}
            <AnimatedCard>
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                    {dashboardData.profile.profileImage?.secureUrl ? (
                      <img 
                        src={dashboardData.profile.profileImage.secureUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      dashboardData.user.firstName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 rounded-full p-2 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-xl font-bold text-white mb-1">
                  {dashboardData.user.firstName} {dashboardData.user.lastName}
                </h2>
                <p className="text-gray-400 mb-2">Rank #{dashboardData.stats.rank}</p>
                
                {/* Edit Profile Button */}
                <GradientButton
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="mb-4"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </GradientButton>

                {/* Profile Details */}
                <div className="space-y-3 text-left">
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">About</label>
                        <textarea
                          value={profileForm.about}
                          onChange={(e) => setProfileForm({...profileForm, about: e.target.value})}
                          className="dark-input w-full px-3 py-2 rounded text-sm"
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Location</label>
                        <input
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                          className="dark-input w-full px-3 py-2 rounded text-sm"
                          placeholder="Your location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Website</label>
                        <input
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                          className="dark-input w-full px-3 py-2 rounded text-sm"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">GitHub</label>
                        <input
                          value={profileForm.github}
                          onChange={(e) => setProfileForm({...profileForm, github: e.target.value})}
                          className="dark-input w-full px-3 py-2 rounded text-sm"
                          placeholder="github.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">LinkedIn</label>
                        <input
                          value={profileForm.linkedin}
                          onChange={(e) => setProfileForm({...profileForm, linkedin: e.target.value})}
                          className="dark-input w-full px-3 py-2 rounded text-sm"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <GradientButton size="sm" onClick={handleProfileUpdate}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </GradientButton>
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData.profile.about && (
                        <div>
                          <p className="text-gray-300 text-sm">{dashboardData.profile.about}</p>
                        </div>
                      )}
                      {dashboardData.profile.location && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{dashboardData.profile.location}</span>
                        </div>
                      )}
                      {dashboardData.profile.website && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Link className="w-4 h-4" />
                          <a href={dashboardData.profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                            Website
                          </a>
                        </div>
                      )}
                      {dashboardData.profile.github && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Github className="w-4 h-4" />
                          <a href={`https://${dashboardData.profile.github}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                            GitHub
                          </a>
                        </div>
                      )}
                      {dashboardData.profile.linkedin && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Linkedin className="w-4 h-4" />
                          <a href={`https://${dashboardData.profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                            LinkedIn
                          </a>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Joined {new Date(dashboardData.user.joinedAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Top Stats Row */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedCard className="text-center bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">#{dashboardData.stats.rank}</div>
                <div className="text-sm text-gray-400">Global Rank</div>
              </AnimatedCard>
              
              <AnimatedCard className="text-center bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{dashboardData.stats.problemsSolved.total}</div>
                <div className="text-sm text-gray-400">Problems Solved</div>
              </AnimatedCard>
              
              <AnimatedCard className="text-center bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{dashboardData.stats.streak}</div>
                <div className="text-sm text-gray-400">Current Streak</div>
              </AnimatedCard>
              
              <AnimatedCard className="text-center bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{dashboardData.profile.contestRating}</div>
                <div className="text-sm text-gray-400">Contest Rating</div>
              </AnimatedCard>
            </motion.div>

            {/* Problems Solved Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Problem Solving Progress</h3>
                </div>
                <DashboardMultiRingChart
                  easy={dashboardData.stats.totalProblems.easy}
                  medium={dashboardData.stats.totalProblems.medium}
                  hard={dashboardData.stats.totalProblems.hard}
                  total={dashboardData.stats.totalProblems.easy + dashboardData.stats.totalProblems.medium + dashboardData.stats.totalProblems.hard}
                  solvedEasy={dashboardData.stats.problemsSolved.easy}
                  solvedMedium={dashboardData.stats.problemsSolved.medium}
                  solvedHard={dashboardData.stats.problemsSolved.hard}
                  solvedTotal={dashboardData.stats.problemsSolved.total}
                />
              </AnimatedCard>
            </motion.div>

            {/* Contest Rating Section */}
            {ratingHistory.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Contest Rating Progress</h3>
                  </div>
                  
                  {/* Current Rating Display */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{dashboardData.profile.contestRating}</div>
                      <div className="text-sm text-gray-400">Current Rating</div>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.max(...ratingHistory.map(r => r.newRating))}
                      </div>
                      <div className="text-sm text-gray-400">Peak Rating</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{ratingHistory.length}</div>
                      <div className="text-sm text-gray-400">Contests</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {ratingHistory.filter(r => r.ratingChange > 0).length}
                      </div>
                      <div className="text-sm text-gray-400">Rating Gains</div>
                    </div>
                  </div>
                  
                  {/* Rating Graph */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="w-full h-64 relative">
                      <svg width="100%" height="100%" viewBox="0 0 600 240" className="overflow-visible">
                        <defs>
                          <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        {[0, 60, 120, 180, 240].map(y => (
                          <line key={y} x1="60" y1={y} x2="540" y2={y} stroke="#374151" strokeWidth="1" opacity="0.3" />
                        ))}
                        
                        {/* Y-axis labels */}
                        {(() => {
                          const minRating = Math.min(...ratingHistory.map(r => r.newRating)) - 50;
                          const maxRating = Math.max(...ratingHistory.map(r => r.newRating)) + 50;
                          const ratingRange = maxRating - minRating;
                          const step = Math.ceil(ratingRange / 4 / 50) * 50; // Round to nearest 50
                          const ratings = [];
                          for (let i = 0; i < 5; i++) {
                            ratings.push(Math.round((minRating + (i * step)) / 50) * 50);
                          }
                          return ratings.map((rating, i) => (
                            <text key={rating} x="40" y={240 - i * 60} fontSize="12" fill="#9CA3AF" textAnchor="end">
                              {rating}
                            </text>
                          ));
                        })()}
                        
                        {/* Rating line */}
                        {ratingHistory.length > 1 && (() => {
                          const minRating = Math.min(...ratingHistory.map(r => r.newRating)) - 50;
                          const maxRating = Math.max(...ratingHistory.map(r => r.newRating)) + 50;
                          const ratingRange = maxRating - minRating;
                          
                          return (
                            <polyline
                              fill="none"
                              stroke="url(#ratingGradient)"
                              strokeWidth="3"
                              points={ratingHistory.map((r, i) => 
                                `${60 + (i * 480 / (ratingHistory.length - 1))},${240 - ((r.newRating - minRating) * 240 / ratingRange)}`
                              ).join(' ')}
                            />
                          );
                        })()}
                        
                        {/* Rating points */}
                        {(() => {
                          const minRating = Math.min(...ratingHistory.map(r => r.newRating)) - 50;
                          const maxRating = Math.max(...ratingHistory.map(r => r.newRating)) + 50;
                          const ratingRange = maxRating - minRating;
                          
                          return ratingHistory.map((r, i) => (
                            <g key={i}>
                              <circle
                                cx={60 + (i * 480 / (ratingHistory.length - 1))}
                                cy={240 - ((r.newRating - minRating) * 240 / ratingRange)}
                                r="6"
                                fill={r.ratingChange >= 0 ? "#10b981" : "#ef4444"}
                                stroke="#1F2937"
                                strokeWidth="2"
                                className="hover:r-8 transition-all cursor-pointer"
                              />
                              <text
                                x={60 + (i * 480 / (ratingHistory.length - 1))}
                                y={240 - ((r.newRating - minRating) * 240 / ratingRange) - 10}
                                fontSize="10"
                                fill="#9CA3AF"
                                textAnchor="middle"
                                className="opacity-0 hover:opacity-100 transition-opacity"
                              >
                                {r.newRating}
                              </text>
                            </g>
                          ));
                        })()}
                      </svg>
                    </div>
                  </div>
                  
                  {/* Recent Contest Performance */}
                  {ratingHistory.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Recent Contests</h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {ratingHistory.slice(-5).reverse().map((contest, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div>
                              <div className="font-medium text-white">{contest.contestName}</div>
                              <div className="text-sm text-gray-400">
                                {new Date(contest.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${contest.ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                              </div>
                              <div className="text-sm text-gray-400">{contest.newRating}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Contest Rating</h3>
                  </div>
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">No Contest History</h4>
                    <p className="text-gray-500 mb-6">
                      Participate in contests to track your rating progress
                    </p>
                    <GradientButton onClick={() => navigate('/contest')}>
                      Join Contests
                    </GradientButton>
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Submission Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <AnimatedCard>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {dashboardData.stats.recentSubmissions} submissions in the past one year
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Total active days: {dashboardData.activity.length}</span>
                    <span>Max streak: {dashboardData.stats.streak}</span>
                  </div>
                </div>
                
                {/* Heatmap */}
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Month labels */}
                    <div className="flex mb-2">
                      {months.map((month, index) => (
                        <div key={month} className="flex-1 text-xs text-gray-400 text-center">
                          {index % 2 === 0 ? month : ''}
                        </div>
                      ))}
                    </div>
                    
                    {/* Heatmap grid */}
                    <div className="grid grid-cols-53 gap-1">
                      {heatmapData.map((day, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.level)} hover:ring-2 hover:ring-white/20 transition-all cursor-pointer`}
                          title={`${day.date.toDateString()}: ${day.count} submissions`}
                        />
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-400">Less</span>
                      <div className="flex space-x-1">
                        {[0, 1, 2].map(level => (
                          <div
                            key={level}
                            className={`w-3 h-3 rounded-sm ${getHeatmapColor(level)}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">More</span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>

            {/* Badges Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <AnimatedCard>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Achievements & Badges</h3>
                  </div>
                  <span className="text-sm text-gray-400">{dashboardData.badges.length} earned</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dashboardData.badges.length > 0 ? (
                    dashboardData.badges.map((badge, index) => (
                      <motion.div 
                        key={index} 
                        className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Award className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h4 className="text-sm font-medium text-white">{badge.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-4 text-center py-8">
                      <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-400 mb-2">No badges yet</h4>
                      <p className="text-gray-500">Start solving problems to earn your first badge!</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-6">
                  <GradientButton onClick={() => navigate('/badges')} className="w-full max-w-xs">
                    See All Badges
                  </GradientButton>
                </div>
              </AnimatedCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

            {/* Quick Actions */}
            <motion.div
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  {/* <Code className="w-6 h-6 text-blue-400 mb-2" /> */}
                  <span className="text-sm text-white">Solve Problems</span>
                </button>
                <button
                  onClick={() => navigate('/contest')}
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
                  <span className="text-sm text-white">Join Contest</span>
                </button>
                <button
                  onClick={() => navigate('/assessments')}
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <Target className="w-6 h-6 text-purple-400 mb-2" />
                  <span className="text-sm text-white">Take Assessment</span>
                </button>
                <button
                  onClick={() => navigate('/store')}
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  {/* <Star className="w-6 h-6 text-green-400 mb-2" /> */}
                  <span className="text-sm text-white">Redeem Points</span>
                </button>
              </div>
            </motion.div>