import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  Flame, 
  Trophy, 
  Zap, 
  Star,
  Target,
  Crown,
  X
} from 'lucide-react';

const StreakCelebrationModal = ({ 
  isOpen, 
  onClose, 
  streakInfo
}) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && streakInfo) {
      setShowConfetti(true);
      
      // Stop confetti after 3 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => {
        clearTimeout(confettiTimer);
      };
    }
  }, [isOpen, streakInfo]);

  if (!isOpen || !streakInfo) return null;

  const { currentStreak, isNewStreak, isStreakMaintained, maxStreak } = streakInfo;

  const getStreakMessage = () => {
    if (isNewStreak) {
      return {
        title: "🔥 Streak Started!",
        message: "You've started your coding streak! Keep it going!",
        color: "from-orange-500 to-red-500"
      };
    } else if (isStreakMaintained) {
      if (currentStreak >= 7) {
        return {
          title: "🚀 Amazing Streak!",
          message: `${currentStreak} days strong! You're on fire!`,
          color: "from-purple-500 to-pink-500"
        };
      } else {
        return {
          title: "⚡ Streak Maintained!",
          message: `${currentStreak} days in a row! Keep coding!`,
          color: "from-blue-500 to-cyan-500"
        };
      }
    }
    return {
      title: "🎉 Great Job!",
      message: "Problem solved successfully!",
      color: "from-green-500 to-emerald-500"
    };
  };

  const streakMessage = getStreakMessage();

  const getStreakIcon = () => {
    if (currentStreak >= 30) return Crown;
    if (currentStreak >= 14) return Trophy;
    if (currentStreak >= 7) return Star;
    if (currentStreak >= 3) return Zap;
    return Flame;
  };

  const StreakIcon = getStreakIcon();

  const getStreakLevel = () => {
    if (currentStreak >= 30) return "Legendary";
    if (currentStreak >= 14) return "Master";
    if (currentStreak >= 7) return "Expert";
    if (currentStreak >= 3) return "Rising";
    return "Beginner";
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={onClose}
      >
        {/* Confetti */}
        {showConfetti && (
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
            colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']}
          />
        )}

        <motion.div
          className="relative bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 overflow-hidden"
          initial={{ scale: 0.7, opacity: 0, y: 100, rotateX: -15 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50, rotateX: 10 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: 0.8 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${streakMessage.color} opacity-10`} />
          
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-full transition-colors z-10"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-5 h-5 text-gray-400" />
          </motion.button>

          <div className="relative z-10 text-center">
            {/* Animated Streak Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.3,
                type: "spring",
                damping: 12,
                stiffness: 200
              }}
            >
              <motion.div 
                className={`p-6 rounded-full bg-gradient-to-br ${streakMessage.color} shadow-lg`}
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(255,255,255,0.3)",
                    "0 0 40px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(255,255,255,0.3)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <StreakIcon className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            >
              {streakMessage.title}
            </motion.h2>

            {/* Message */}
            <motion.p
              className="text-gray-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            >
              {streakMessage.message}
            </motion.p>

            {/* Streak Stats */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
            >
              <motion.div 
                className="bg-gray-700/50 rounded-lg p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <motion.span 
                    className="text-2xl font-bold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    {currentStreak}
                  </motion.span>
                </div>
                <div className="text-xs text-gray-400">Current Streak</div>
              </motion.div>
              
              <motion.div 
                className="bg-gray-700/50 rounded-lg p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <motion.span 
                    className="text-2xl font-bold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                  >
                    {maxStreak}
                  </motion.span>
                </div>
                <div className="text-xs text-gray-400">Best Streak</div>
              </motion.div>
            </motion.div>

            {/* Streak Level Badge */}
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700/50 rounded-full border border-gray-600"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
            >
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">{getStreakLevel()} Level</span>
            </motion.div>

            {/* Motivational Quote */}
            <motion.div
              className="mt-6 text-xs text-gray-500 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {currentStreak === 1 && "Every expert was once a beginner!"}
              {currentStreak >= 2 && currentStreak < 7 && "Consistency is the key to mastery!"}
              {currentStreak >= 7 && currentStreak < 14 && "You're building an amazing habit!"}
              {currentStreak >= 14 && currentStreak < 30 && "Your dedication is inspiring!"}
              {currentStreak >= 30 && "You're a coding legend! 🏆"}
            </motion.div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.6, 1, 0.6],
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StreakCelebrationModal;