import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, ArrowLeft, TrendingUp, Target, Zap, Trophy, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const PointActivityPage = () => {
  const [points, setPoints] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const [pointsRes, activityRes] = await Promise.all([
          axiosClient.get('/dashboard/points'),
          axiosClient.get('/dashboard/points/activity'),
        ]);
        setPoints(pointsRes.data.points);
        setActivity(activityRes.data.activity);
      } catch (error) {
        setPoints(0);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const getMissionIcon = (mission) => {
    if (mission.includes('Streak')) return Zap;
    if (mission.includes('Assessment')) return Target;
    if (mission.includes('Premium')) return Star;
    if (mission.includes('Check in')) return Calendar;
    return Gift;
  };

  const getMissionColor = (mission) => {
    if (mission.includes('Streak')) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (mission.includes('Assessment')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (mission.includes('Premium')) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    if (mission.includes('Check in')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };

  const filteredActivity = activity.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'streak' && item.mission.toLowerCase().includes('streak')) return true;
    if (filter === 'assessment' && item.mission.toLowerCase().includes('assessment')) return true;
    if (filter === 'premium' && item.mission.toLowerCase().includes('premium')) return true;
    if (filter === 'daily' && item.mission.toLowerCase().includes('check in')) return true;
    return false;
  });

  const totalPointsEarned = activity.reduce((sum, item) => sum + item.points, 0);
  const averagePointsPerActivity = activity.length > 0 ? Math.round(totalPointsEarned / activity.length) : 0;
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <motion.div
        className="glass-dark border-b border-gray-800 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold gradient-text">Point Activity</h1>
          </div>
          <GlobalNavigation />
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Loading points..." />
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  className="p-4 bg-yellow-500/20 rounded-full border border-yellow-500/30"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Your Point Journey
                </span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Track your achievements and see how you've earned points through various activities
              </p>
            </motion.div>

            {/* Total Points */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <AnimatedCard className="text-center">
                <motion.div
                  className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <div className="text-2xl font-bold text-yellow-300 mb-1">{points}</div>
                <div className="text-sm text-gray-400">Current Points</div>
              </AnimatedCard>
              
              <AnimatedCard className="text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{totalPointsEarned}</div>
                <div className="text-sm text-gray-400">Total Earned</div>
              </AnimatedCard>
              
              <AnimatedCard className="text-center">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{activity.length}</div>
                <div className="text-sm text-gray-400">Activities</div>
              </AnimatedCard>
              
              <AnimatedCard className="text-center">
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{averagePointsPerActivity}</div>
                <div className="text-sm text-gray-400">Avg per Activity</div>
              </AnimatedCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GradientButton onClick={() => navigate('/missions')}>
                <Gift className="w-4 h-4 mr-2" />
                View Missions
              </GradientButton>
              <GradientButton onClick={() => navigate('/store')} variant="secondary">
                <Star className="w-4 h-4 mr-2" />
                Spend Points
              </GradientButton>
            </motion.div>

            {/* Filters */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatedCard>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { id: 'all', label: 'All Activities', count: activity.length },
                    { id: 'streak', label: 'Streak Rewards', count: activity.filter(a => a.mission.toLowerCase().includes('streak')).length },
                    { id: 'assessment', label: 'Assessments', count: activity.filter(a => a.mission.toLowerCase().includes('assessment')).length },
                    { id: 'premium', label: 'Premium', count: activity.filter(a => a.mission.toLowerCase().includes('premium')).length },
                    { id: 'daily', label: 'Daily Check-ins', count: activity.filter(a => a.mission.toLowerCase().includes('check in')).length }
                  ].map((filterOption) => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                        filter === filterOption.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-sm font-medium">{filterOption.label}</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                        {filterOption.count}
                      </span>
                    </button>
                  ))}
                </div>
              </AnimatedCard>
            </motion.div>
            {/* Activity Log */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {filteredActivity.length === 0 ? (
                <AnimatedCard className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No activities found</h3>
                  <p className="text-gray-500">
                    {filter === 'all' ? 'Start completing missions to earn points!' : 'No activities in this category yet.'}
                  </p>
                </AnimatedCard>
              ) : (
                filteredActivity.map((item, index) => {
                  const MissionIcon = getMissionIcon(item.mission);
                  const missionColor = getMissionColor(item.mission);
                  
                  return (
                    <motion.div
                      key={item._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AnimatedCard className="hover:border-yellow-500/30 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <motion.div
                              className={`p-3 rounded-full border ${missionColor}`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <MissionIcon className="w-5 h-5" />
                            </motion.div>
                            <div>
                              <h3 className="font-semibold text-white">{item.mission}</h3>
                              <p className="text-gray-400 text-sm">
                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <motion.div
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-300 font-bold text-lg">+{item.points}</span>
                          </motion.div>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Points Summary */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <AnimatedCard className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-4">Keep Earning Points!</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl mb-2">🔥</div>
                      <h4 className="font-semibold text-white mb-1">Daily Streaks</h4>
                      <p className="text-sm text-gray-400">Solve problems daily for bonus points</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl mb-2">🏆</div>
                      <h4 className="font-semibold text-white mb-1">Assessments</h4>
                      <p className="text-sm text-gray-400">Complete tests to earn big rewards</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl mb-2">👑</div>
                      <h4 className="font-semibold text-white mb-1">Premium Benefits</h4>
                      <p className="text-sm text-gray-400">Get premium for exclusive point opportunities</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <GradientButton onClick={() => navigate('/missions')}>
                      <Gift className="w-4 h-4 mr-2" />
                      View All Missions
                    </GradientButton>
                    <GradientButton onClick={() => navigate('/store')} variant="secondary">
                      <Star className="w-4 h-4 mr-2" />
                      Redeem Points
                    </GradientButton>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default PointActivityPage; 