import { motion } from 'framer-motion';
import { Flame, Trophy, Zap, Target } from 'lucide-react';
import { useStreak } from '../hooks/useStreak.js';
import LoadingSpinner from './LoadingSpinner.jsx';

const StreakDisplay = ({ className = '', showDetails = false }) => {
  const { streakInfo, loading, error } = useStreak();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-gray-400 text-sm">Loading streak...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Flame className="w-4 h-4 text-gray-500" />
        <span className="text-gray-500 text-sm">--</span>
      </div>
    );
  }

  const { currentStreak, maxStreak } = streakInfo;

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'text-purple-400';
    if (currentStreak >= 14) return 'text-yellow-400';
    if (currentStreak >= 7) return 'text-blue-400';
    if (currentStreak >= 3) return 'text-green-400';
    return 'text-orange-400';
  };

  const getStreakIcon = () => {
    if (currentStreak >= 30) return Trophy;
    if (currentStreak >= 7) return Zap;
    return Flame;
  };

  const StreakIcon = getStreakIcon();

  return (
    <motion.div
      className={`flex items-center space-x-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={currentStreak > 0 ? {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{
          duration: 2,
          repeat: currentStreak > 0 ? Infinity : 0,
          repeatDelay: 3
        }}
      >
        <StreakIcon className={`w-5 h-5 ${getStreakColor()}`} />
      </motion.div>
      
      <div className="flex items-center space-x-1">
        <span className={`font-bold ${getStreakColor()}`}>
          {currentStreak}
        </span>
        {showDetails && (
          <>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-gray-400 text-sm">{maxStreak}</span>
          </>
        )}
      </div>
      
      {showDetails && (
        <div className="text-xs text-gray-500">
          {currentStreak === 0 && 'Start your streak!'}
          {currentStreak === 1 && 'Great start!'}
          {currentStreak >= 2 && currentStreak < 7 && 'Keep it up!'}
          {currentStreak >= 7 && currentStreak < 14 && 'On fire!'}
          {currentStreak >= 14 && currentStreak < 30 && 'Amazing!'}
          {currentStreak >= 30 && 'Legendary!'}
        </div>
      )}
    </motion.div>
  );
};

export default StreakDisplay;