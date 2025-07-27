import { motion } from 'framer-motion';
import { 
  Gift, 
  CheckCircle, 
  ArrowLeft, 
  Star, 
  Zap, 
  Target, 
  Crown,
  Calendar,
  Trophy,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const MISSIONS = [
  { 
    name: 'First Signup', 
    points: 200, 
    icon: Star, 
    color: 'from-blue-500 to-purple-600',
    description: 'Welcome bonus for joining LeetPro',
    category: 'Welcome'
  },
  { 
    name: 'Daily Check in', 
    points: 5, 
    icon: Calendar, 
    color: 'from-green-500 to-blue-500',
    description: 'Solve at least one problem daily',
    category: 'Daily'
  },
  { 
    name: 'Makes 2 Day Streak', 
    points: 20, 
    icon: Zap, 
    color: 'from-orange-500 to-red-500',
    description: 'Maintain a 2-day coding streak',
    category: 'Streak'
  },
  { 
    name: 'Makes 3 Day Streak', 
    points: 30, 
    icon: Zap, 
    color: 'from-orange-500 to-red-500',
    description: 'Maintain a 3-day coding streak',
    category: 'Streak'
  },
  { 
    name: 'Makes 5 Day Streak', 
    points: 80, 
    icon: Zap, 
    color: 'from-orange-500 to-red-500',
    description: 'Maintain a 5-day coding streak',
    category: 'Streak'
  },
  { 
    name: 'Buys a Premium', 
    points: 300, 
    icon: Crown, 
    color: 'from-yellow-500 to-orange-500',
    description: 'Upgrade to premium subscription',
    category: 'Premium'
  },
  { 
    name: 'Completes a free assessment', 
    points: 100, 
    icon: Target, 
    color: 'from-purple-500 to-pink-500',
    description: 'Complete any free assessment',
    category: 'Assessment'
  },
  { 
    name: 'Completes a Premium Assessment', 
    points: 150, 
    icon: Trophy, 
    color: 'from-yellow-500 to-orange-500',
    description: 'Complete a premium assessment',
    category: 'Assessment'
  },
];

const MissionsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: 'All Missions', count: MISSIONS.length },
    { id: 'Daily', label: 'Daily', count: MISSIONS.filter(m => m.category === 'Daily').length },
    { id: 'Streak', label: 'Streak', count: MISSIONS.filter(m => m.category === 'Streak').length },
    { id: 'Assessment', label: 'Assessment', count: MISSIONS.filter(m => m.category === 'Assessment').length },
    { id: 'Premium', label: 'Premium', count: MISSIONS.filter(m => m.category === 'Premium').length }
  ];
  
  const filteredMissions = selectedCategory === 'all' 
    ? MISSIONS 
    : MISSIONS.filter(mission => mission.category === selectedCategory);

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
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Gift className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text">Missions & Rewards</h1>
          </div>
          <GlobalNavigation />
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
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
              <Trophy className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Complete Missions, Earn Rewards
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Accomplish various coding challenges and milestones to earn points that you can redeem for awesome merchandise
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-2 bg-gray-800/50 p-1 rounded-xl">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">{category.label}</span>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Missions Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredMissions.map((mission, index) => {
              const IconComponent = mission.icon;
              
              return (
                <motion.div
                  key={mission.name}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group"
                >
                  <AnimatedCard className="h-full relative overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mission.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative z-10 text-center p-6">
                      {/* Mission Icon */}
                      <motion.div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${mission.color} flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      {/* Mission Details */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                        {mission.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        {mission.description}
                      </p>
                      
                      {/* Points Reward */}
                      <motion.div
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-xl font-bold text-yellow-300">+{mission.points}</span>
                        <span className="text-yellow-400 text-sm">points</span>
                      </motion.div>
                      
                      {/* Category Badge */}
                      <div className="mt-4">
                        <span className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-xs text-gray-400">
                          {mission.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Floating Particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Points Summary */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <AnimatedCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Start Your Journey</h3>
              <p className="text-gray-300 mb-6">
                Complete missions to earn points and unlock exclusive merchandise in our store
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-white mb-1">Set Goals</h4>
                  <p className="text-sm text-gray-400">Choose missions that match your coding journey</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-semibold text-white mb-1">Stay Consistent</h4>
                  <p className="text-sm text-gray-400">Daily practice leads to bigger rewards</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <h4 className="font-semibold text-white mb-1">Earn Rewards</h4>
                  <p className="text-sm text-gray-400">Redeem points for awesome merchandise</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GradientButton onClick={() => navigate('/points')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Point Activity
                </GradientButton>
                <GradientButton onClick={() => navigate('/store')} variant="secondary">
                  <Gift className="w-4 h-4 mr-2" />
                  Browse Store
                </GradientButton>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default MissionsPage; 