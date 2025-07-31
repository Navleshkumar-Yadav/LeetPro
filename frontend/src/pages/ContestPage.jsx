import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Target,
  ArrowLeft,
  Play,
  CheckCircle,
  Star,
  Zap,
  Crown,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const tabOptions = [
  { key: 'current', label: 'Live Contests', icon: Play, color: 'text-green-400' },
  { key: 'upcoming', label: 'Upcoming', icon: Calendar, color: 'text-blue-400' },
  { key: 'past', label: 'Past Contests', icon: Trophy, color: 'text-purple-400' },
  { key: 'my', label: 'My Contests', icon: Star, color: 'text-yellow-400' },
];

function ContestPage() {
  const [tab, setTab] = useState('current');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(1200);
  const [ratingHistory, setRatingHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
    fetchUserRating();
  }, [tab]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      let url = `/contest/${tab}`;
      
      const res = await axiosClient.get(url);
      let contestsData = res.data.contests || [];

      // --- START: THE FIX ---
      // If the tab is 'current' or 'upcoming', we must ensure the `isRegistered` flag is accurate.
      // We do this by fetching the user's registered contests and merging that information.
      if (tab === 'current' || tab === 'upcoming') {
        // 1. Fetch the list of contests the user has registered for.
        const myContestsRes = await axiosClient.get('/contest/my');
        
        // 2. Create a Set of registered contest IDs for efficient O(1) lookups.
        const myContestIds = new Set(
          (myContestsRes.data.contests || []).map(c => c._id)
        );

        // 3. Map over the fetched contests and update the `isRegistered` property.
        contestsData = contestsData.map(contest => ({
          ...contest,
          isRegistered: myContestIds.has(contest._id),
        }));
      }
      // --- END: THE FIX ---

      setContests(contestsData);
    } catch (err) {
      console.error(`Error fetching contests for tab: ${tab}`, err);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRating = async () => {
    try {
      // Get current user ID from auth state or localStorage
      const userRes = await axiosClient.get('/user/check');
      const userId = userRes.data.user._id;
      
      const ratingRes = await axiosClient.get(`/contest/user/${userId}/rating`);
      setRatingHistory(ratingRes.data.history || []);
      
      if (ratingRes.data.history.length > 0) {
        const latestRating = ratingRes.data.history[ratingRes.data.history.length - 1];
        setUserRating(latestRating.newRating);
      }
    } catch (err) {
      console.error('Error fetching user rating:', err);
    }
  };

  const getTimer = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    let diff = 0;
    let label = '';
    let isUrgent = false;
    
    if (tab === 'current') {
      diff = end - now;
      label = 'Ends in';
      isUrgent = diff < 3600000; // Less than 1 hour
    } else if (tab === 'upcoming') {
      diff = start - now;
      label = 'Starts in';
      isUrgent = diff < 3600000; // Less than 1 hour
    } else if (tab === 'my') {
      if (now < start) {
        diff = start - now;
        label = 'Starts in';
        isUrgent = diff < 3600000;
      } else if (now >= start && now <= end) {
        diff = end - now;
        label = 'Ends in';
        isUrgent = diff < 3600000;
      } else {
        return 'Completed';
      }
    } else {
      return 'Completed';
    }
    
    if (diff < 0) return 'Completed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeString = '';
    if (days > 0) timeString += `${days}d `;
    if (hours > 0) timeString += `${hours}h `;
    timeString += `${minutes}m`;
    
    return { label, time: timeString, isUrgent };
  };

  const getContestAction = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    // Check if contest is currently live
    const isLive = now >= start && now <= end;
    
    if (isLive) {
      // Contest is live - allow entry regardless of tab
      if (contest.isRegistered) {
        return { text: 'Enter Contest', action: () => navigate(`/contest/${contest._id}/live`), variant: 'primary' };
      } else {
        return { text: 'Register & Enter', action: () => handleRegisterAndEnter(contest._id), variant: 'primary' };
      }
    } else if (tab === 'upcoming' || (tab === 'current' && now < start)) {
      // Contest is upcoming
      if (contest.isRegistered) {
        // If contest is about to start (within 1 hour), show "Ready to Enter"
        const timeToStart = start - now;
        if (timeToStart <= 3600000) { // 1 hour in milliseconds
          return { text: 'Ready to Enter', action: () => navigate(`/contest/${contest._id}/register`), variant: 'success' };
        }
        return { text: 'Registered ✓', action: () => navigate(`/contest/${contest._id}/register`), variant: 'success' };
      } else {
        return { text: 'Register Now', action: () => navigate(`/contest/${contest._id}/register`), variant: 'primary' };
      }
    } else if (tab === 'past') {
      return { text: 'View Results', action: () => navigate(`/contest/${contest._id}/report`), variant: 'secondary' };
    } else if (tab === 'my') {
      if (now > end) {
        return { text: 'View Report', action: () => navigate(`/contest/${contest._id}/report`), variant: 'secondary' };
      } else if (isLive) {
        return { text: 'Enter Contest', action: () => navigate(`/contest/${contest._id}/live`), variant: 'primary' };
      } else {
        // Contest is upcoming in "My Contests"
        const timeToStart = start - now;
        if (timeToStart <= 3600000) { // 1 hour in milliseconds
          return { text: 'Ready to Enter', action: () => navigate(`/contest/${contest._id}/register`), variant: 'success' };
        }
        return { text: 'Registered', action: null, variant: 'success' };
      }
    }
    
    return { text: 'View Details', action: () => navigate(`/contest/${contest._id}/register`), variant: 'secondary' };
  };

  const handleRegisterAndEnter = async (contestId) => {
    try {
      // First register for the contest
      await axiosClient.post(`/contest/${contestId}/register`);
      
      // Then navigate to live contest
      navigate(`/contest/${contestId}/live`);
    } catch (err) {
      console.error('Error registering for contest:', err);
      // If registration fails, navigate to registration page
      navigate(`/contest/${contestId}/register`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };
  // Enhanced animations for contest cards
  const getContestCardAnimation = (index) => ({
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    transition: { duration: 0.4, delay: index * 0.1 }
  });

  const getTimerAnimation = (isUrgent) => ({
    animate: isUrgent ? { 
      scale: [1, 1.05, 1],
      color: ['#ef4444', '#fbbf24', '#ef4444']
    } : {},
    transition: { duration: 1, repeat: Infinity }
  });

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
                <Trophy className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold gradient-text">Contests</h1>
              </div>
            </div>
            
            {/* User Rating Display */}
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="w-5 h-5 text-yellow-400" />
                </motion.div>
                <div className="text-center">
                  <motion.div 
                    className="text-lg font-bold text-yellow-300"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {userRating}
                  </motion.div>
                  <div className="text-xs text-yellow-400">Rating</div>
                </div>
              </motion.div>
              <span className="text-sm text-gray-400">{contests.length} contests</span>
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Competitive Programming
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Challenge yourself in timed coding contests and climb the leaderboard
          </p>
        </motion.div>

        {/* Rating History Graph */}
        {ratingHistory.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatedCard>
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Rating Progress</h3>
              </div>
              
              <div className="h-64 relative">
                <svg width="100%" height="100%" viewBox="0 0 800 200" className="overflow-visible">
                  {/* Grid lines */}
                  {[0, 50, 100, 150, 200].map(y => (
                    <line key={y} x1="60" y1={y} x2="740" y2={y} stroke="#374151" strokeWidth="1" opacity="0.3" />
                  ))}
                  
                  {/* Y-axis labels */}
                  {[1000, 1200, 1400, 1600, 1800].map((rating, i) => (
                    <text key={rating} x="40" y={200 - i * 50} fontSize="12" fill="#9CA3AF" textAnchor="end">
                      {rating}
                    </text>
                  ))}
                  
                  {/* Rating line */}
                  {ratingHistory.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      points={ratingHistory.map((r, i) => 
                        `${60 + (i * 680 / (ratingHistory.length - 1))},${200 - ((r.newRating - 1000) * 200 / 800)}`
                      ).join(' ')}
                    />
                  )}
                  
                  {/* Rating points */}
                  {ratingHistory.map((r, i) => (
                    <g key={i}>
                      <circle
                        cx={60 + (i * 680 / (ratingHistory.length - 1))}
                        cy={200 - ((r.newRating - 1000) * 200 / 800)}
                        r="6"
                        fill="#8B5CF6"
                        stroke="#1F2937"
                        strokeWidth="2"
                      />
                      <text
                        x={60 + (i * 680 / (ratingHistory.length - 1))}
                        y={220}
                        fontSize="10"
                        fill="#9CA3AF"
                        textAnchor="middle"
                      >
                        {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">{userRating}</div>
                  <div className="text-xs text-gray-400">Current Rating</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">
                    {Math.max(...ratingHistory.map(r => r.newRating))}
                  </div>
                  <div className="text-xs text-gray-400">Peak Rating</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{ratingHistory.length}</div>
                  <div className="text-xs text-gray-400">Contests Attended</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-400">
                    {ratingHistory.filter(r => r.ratingChange > 0).length}
                  </div>
                  <div className="text-xs text-gray-400">Rating Increases</div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
            {tabOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setTab(option.key)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-medium ${
                    tab === option.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Contests Grid */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" text="Loading contests..." />
            </div>
          ) : contests.length === 0 ? (
            <AnimatedCard className="text-center py-16">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {tab === 'my' ? 'No registered contests' : 'No contests found'}
              </h3>
              <p className="text-gray-500">
                {tab === 'my' 
                  ? 'Register for upcoming contests to see them here' 
                  : 'Check back later for new contests'
                }
              </p>
            </AnimatedCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {contests.map((contest, index) => {
                  const timer = getTimer(contest);
                  const action = getContestAction(contest);
                  
                  return (
                    <motion.div
                      key={contest._id}
                      {...getContestCardAnimation(index)}
                      className="group"
                    >
                      <AnimatedCard className="h-full relative overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                        {/* Live Badge */}
                        {tab === 'current' && (
                          <div className="absolute top-4 right-4 z-10">
                            <motion.div 
                              className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <motion.div 
                                className="w-2 h-2 bg-red-400 rounded-full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                              <span className="text-xs text-red-400 font-medium">LIVE</span>
                            </motion.div>
                          </div>
                        )}

                        <div className="space-y-4">
                          {/* Contest Header */}
                          <div>
                            <motion.h3 
                              className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors"
                              whileHover={{ scale: 1.02 }}
                            >
                              {contest.name}
                            </motion.h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {contest.description}
                            </p>
                          </div>

                          {/* Contest Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                              className="text-center p-3 bg-gray-800/50 rounded-lg"
                              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                              transition={{ duration: 0.2 }}
                            >
                              <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                              <div className="text-lg font-bold text-white">
                                {contest.problems?.length || 0}
                              </div>
                              <div className="text-xs text-gray-400">Problems</div>
                            </motion.div>
                            <motion.div 
                              className="text-center p-3 bg-gray-800/50 rounded-lg"
                              whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                              transition={{ duration: 0.2 }}
                            >
                              <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                              <div className="text-lg font-bold text-white">
                                {contest.participantCount || 0}
                              </div>
                              <div className="text-xs text-gray-400">Participants</div>
                            </motion.div>
                          </div>

                          {/* Problems Preview */}
                          {contest.problems && contest.problems.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Problems:</h4>
                              <div className="space-y-2">
                                {contest.problems.slice(0, 3).map((problem, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300 truncate">
                                      {problem.problemId?.title || `Problem ${idx + 1}`}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(problem.problemId?.difficulty)}`}>
                                        {problem.problemId?.difficulty || 'Unknown'}
                                      </span>
                                      <span className="text-yellow-400 font-medium">{problem.marks}pts</span>
                                    </div>
                                  </div>
                                ))}
                                {contest.problems.length > 3 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{contest.problems.length - 3} more problems
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Timing */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-300 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>
                                {new Date(contest.startTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {typeof timer === 'object' && (
                              <motion.div 
                                className={`flex items-center space-x-2 text-sm font-mono ${
                                timer.isUrgent ? 'text-red-400' : 'text-blue-400'
                                }`}
                                {...getTimerAnimation(timer.isUrgent)}
                              >
                                <Clock className="w-4 h-4" />
                                <span>{timer.label}: {timer.time}</span>
                                {timer.isUrgent && (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                  >
                                    <Zap className="w-4 h-4" />
                                  </motion.div>
                                )}
                              </motion.div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-2">
                            {action.action ? (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <GradientButton
                                onClick={action.action}
                                className={`w-full justify-center ${
                                  action.variant === 'success' 
                                    ? 'bg-green-600 hover:bg-green-500' 
                                    : action.variant === 'secondary'
                                    ? 'bg-gray-600 hover:bg-gray-500'
                                    : ''
                                }`}
                                disabled={action.variant === 'disabled'}
                                >
                                {action.variant === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                                {action.variant === 'primary' && tab === 'current' && <Play className="w-4 h-4 mr-2" />}
                                {action.text}
                                </GradientButton>
                              </motion.div>
                            ) : (
                              <div className={`w-full text-center py-3 rounded-lg border ${
                                action.variant === 'success' 
                                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                  : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                              }`}>
                                {action.variant === 'success' && <CheckCircle className="w-4 h-4 inline mr-2" />}
                                {action.text}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </AnimatedCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ContestPage;