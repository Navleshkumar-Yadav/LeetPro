import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalNavigation from '../components/GlobalNavigation.jsx';
import { 
  Award, 
  ArrowLeft, 
  Trophy, 
  Star, 
  Crown, 
  Target,
  Zap,
  Shield,
  Flame,
  Sparkles,
  Lock,
  CheckCircle,
  Calendar,
  Code,
  TrendingUp
} from 'lucide-react';
import GradientButton from '../components/GradientButton.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import axiosClient from '../utils/axiosClient';

const BADGE_ICONS = {
  'First Problem': Code,
  'Problem Solver': Target,
  'Streak Master': Flame,
  'Assessment Pro': Trophy,
  'Premium Member': Crown,
  'Contest Warrior': Shield,
  'Speed Demon': Zap,
  'Consistency King': Calendar,
  'Rising Star': Star,
  'Elite Coder': Sparkles,
  'default': Award
};

const BADGE_COLORS = {
  'Problem Solving': 'from-blue-500 to-cyan-500',
  'Streaks': 'from-orange-500 to-red-500',
  'Assessments': 'from-purple-500 to-pink-500',
  'Premium': 'from-yellow-500 to-orange-500',
  'Contests': 'from-green-500 to-emerald-500',
  'Special': 'from-indigo-500 to-purple-500',
  'default': 'from-gray-500 to-gray-600'
};

const groupByCategory = (badges) => {
  const grouped = {};
  badges.forEach(badge => {
    const category = badge.badgeCategory || 'Other';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(badge);
  });
  return grouped;
};

const BadgesPage = () => {
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/dashboard/data');
        setAllBadges(res.data.allBadges || []);
        setEarnedBadges(res.data.badges || []);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedNames = new Set(earnedBadges.map(b => b.name));
  const grouped = groupByCategory(allBadges);
  const categories = Object.keys(grouped);

  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : grouped[selectedCategory] || [];

  const getBadgeIcon = (badgeName) => {
    const IconComponent = BADGE_ICONS[badgeName] || BADGE_ICONS.default;
    return IconComponent;
  };

  const getCategoryColor = (category) => {
    return BADGE_COLORS[category] || BADGE_COLORS.default;
  };

  const getProgressPercentage = () => {
    return Math.round((earnedBadges.length / allBadges.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading badges..." />
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
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <h1 className="text-2xl font-bold gradient-text">Achievement Badges</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {earnedBadges.length} of {allBadges.length} earned
              </div>
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
          <div className="flex items-center justify-center mb-6">
            <motion.div
              className="relative"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="p-6 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                <Award className="w-12 h-12 text-yellow-400" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
            </motion.div>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Your Achievement Journey
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock badges by completing challenges, maintaining streaks, and reaching milestones
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatedCard className="text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{earnedBadges.length}</div>
            <div className="text-sm text-gray-400">Badges Earned</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{allBadges.length}</div>
            <div className="text-sm text-gray-400">Total Available</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{getProgressPercentage()}%</div>
            <div className="text-sm text-gray-400">Completion</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{categories.length}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </AnimatedCard>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatedCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
              <span className="text-yellow-400 font-bold">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Keep earning badges!</span>
              <span>{allBadges.length - earnedBadges.length} remaining</span>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-wrap gap-2 bg-gray-800/50 p-1 rounded-xl">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              All Badges ({allBadges.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {category} ({grouped[category].length})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Badges Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <AnimatePresence>
            {filteredBadges.map((badge, index) => {
              const earned = earnedNames.has(badge.name);
              const IconComponent = getBadgeIcon(badge.name);
              const categoryColor = getCategoryColor(badge.badgeCategory);
              
              return (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <AnimatedCard 
                    className={`text-center p-6 cursor-pointer transition-all duration-300 ${
                      earned 
                        ? 'border-yellow-400/60 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:border-yellow-400/80' 
                        : 'border-gray-700/60 opacity-60 hover:opacity-80 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedBadge(badge)}
                    hover={false}
                  >
                    {/* Badge Icon */}
                    <motion.div
                      className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center relative ${
                        earned 
                          ? `bg-gradient-to-br ${categoryColor} shadow-lg` 
                          : 'bg-gray-700 border-2 border-gray-600'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent className={`w-10 h-10 ${earned ? 'text-white' : 'text-gray-400'}`} />
                      
                      {/* Lock overlay for unearned badges */}
                      {!earned && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Earned checkmark */}
                      {earned && (
                        <motion.div
                          className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      
                      {/* Glow effect for earned badges */}
                      {earned && (
                        <motion.div
                          className={`absolute inset-0 rounded-full bg-gradient-to-br ${categoryColor} opacity-30 blur-xl`}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Badge Info */}
                    <h4 className={`text-lg font-bold mb-2 ${earned ? 'text-white' : 'text-gray-400'}`}>
                      {badge.name}
                    </h4>
                    <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                      {badge.description}
                    </p>
                    
                    {/* Category Tag */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      earned 
                        ? `bg-gradient-to-r ${categoryColor} text-white` 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {badge.badgeCategory}
                    </div>
                    
                    {/* Earned Status */}
                    {earned && (
                      <motion.div
                        className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Earned</span>
                      </motion.div>
                    )}
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No badges in this category</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </motion.div>
        )}

        {/* Motivational Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <AnimatedCard className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Keep Earning Badges!</h3>
              <p className="text-gray-300 mb-6">
                Complete challenges, maintain streaks, and reach new milestones to unlock more achievements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-white mb-1">Solve Problems</h4>
                  <p className="text-sm text-gray-400">Complete coding challenges to earn problem-solving badges</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🔥</div>
                  <h4 className="font-semibold text-white mb-1">Maintain Streaks</h4>
                  <p className="text-sm text-gray-400">Code daily to unlock streak-based achievements</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <h4 className="font-semibold text-white mb-1">Join Contests</h4>
                  <p className="text-sm text-gray-400">Participate in contests to earn competitive badges</p>
                </div>
              </div>
              <div className="mt-6">
                <GradientButton onClick={() => navigate('/home')}>
                  Start Earning Badges
                </GradientButton>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              className="glass-dark rounded-xl p-8 max-w-md w-full border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  earnedNames.has(selectedBadge.name)
                    ? `bg-gradient-to-br ${getCategoryColor(selectedBadge.badgeCategory)} shadow-lg`
                    : 'bg-gray-700 border-2 border-gray-600'
                }`}>
                  {React.createElement(getBadgeIcon(selectedBadge.name), {
                    className: `w-12 h-12 ${earnedNames.has(selectedBadge.name) ? 'text-white' : 'text-gray-400'}`
                  })}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
                <p className="text-gray-300 mb-4">{selectedBadge.description}</p>
                
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                  earnedNames.has(selectedBadge.name)
                    ? `bg-gradient-to-r ${getCategoryColor(selectedBadge.badgeCategory)} text-white`
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {selectedBadge.badgeCategory}
                </div>
                
                {earnedNames.has(selectedBadge.name) ? (
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Badge Earned!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-gray-400">
                    <Lock className="w-5 h-5" />
                    <span>Not earned yet</span>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgesPage;