import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronDown,
  X
} from 'lucide-react';

const StopwatchTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'stopwatch' or 'timer'
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [timerInput, setTimerInput] = useState({ hours: 1, minutes: 0, seconds: 0 });
  const [showTimerInput, setShowTimerInput] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (mode === 'timer') {
            if (prevTime <= 1) {
              setIsRunning(false);
              // Timer finished - could add notification here
              return 0;
            }
            return prevTime - 1;
          } else {
            return prevTime + 1;
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setIsRunning(false);
    
    if (selectedMode === 'stopwatch') {
      setTime(0);
    } else {
      setShowTimerInput(true);
    }
  };

  const handleTimerSet = () => {
    const totalSeconds = (timerInput.hours * 3600) + (timerInput.minutes * 60) + timerInput.seconds;
    setTime(totalSeconds);
    setShowTimerInput(false);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setTime(0);
    } else {
      const totalSeconds = (timerInput.hours * 3600) + (timerInput.minutes * 60) + timerInput.seconds;
      setTime(totalSeconds);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMode(null);
    setIsRunning(false);
    setShowTimerInput(false);
  };

  return (
    <div className="relative">
      {/* Stopwatch Button */}
      <motion.button
        className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Clock className="w-5 h-5 text-blue-400" />
        {mode && (
          <span className="text-white font-mono text-sm">
            {formatTime(time)}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-lg z-50 min-w-[300px]"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {!mode ? (
              // Mode Selection
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Choose Mode</h3>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    className="flex flex-col items-center space-y-2 p-4 bg-gray-700/50 hover:bg-blue-600/20 border border-gray-600 hover:border-blue-500/50 rounded-lg transition-all"
                    onClick={() => handleModeSelect('stopwatch')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Clock className="w-8 h-8 text-blue-400" />
                    <span className="text-white font-medium">Stopwatch</span>
                  </motion.button>
                  <motion.button
                    className="flex flex-col items-center space-y-2 p-4 bg-gray-700/50 hover:bg-orange-600/20 border border-gray-600 hover:border-orange-500/50 rounded-lg transition-all"
                    onClick={() => handleModeSelect('timer')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Timer className="w-8 h-8 text-orange-400" />
                    <span className="text-white font-medium">Timer</span>
                  </motion.button>
                </div>
              </div>
            ) : showTimerInput ? (
              // Timer Input
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Set Timer</h3>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={timerInput.hours}
                        onChange={(e) => setTimerInput({...timerInput, hours: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerInput.minutes}
                        onChange={(e) => setTimerInput({...timerInput, minutes: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Seconds</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerInput.seconds}
                        onChange={(e) => setTimerInput({...timerInput, seconds: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center"
                      />
                    </div>
                  </div>
                  <motion.button
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                    onClick={handleTimerSet}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Timer className="w-4 h-4" />
                    <span className="font-medium">Set Timer</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              // Active Timer/Stopwatch
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {mode === 'stopwatch' ? (
                      <Clock className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Timer className="w-5 h-5 text-orange-400" />
                    )}
                    <h3 className="text-white font-semibold capitalize">{mode}</h3>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                {/* Time Display */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-mono font-bold text-white mb-2">
                    {formatTime(time)}
                  </div>
                  {mode === 'timer' && time <= 10 && time > 0 && (
                    <div className="text-red-400 text-sm animate-pulse">
                      Time running out!
                    </div>
                  )}
                  {mode === 'timer' && time === 0 && (
                    <div className="text-red-400 text-sm font-semibold">
                      Time's up!
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex space-x-2">
                  {!isRunning ? (
                    <motion.button
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                      onClick={handleStart}
                      disabled={mode === 'timer' && time === 0}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">Start</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
                      onClick={handlePause}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Pause className="w-4 h-4" />
                      <span className="font-medium">Pause</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    className="flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    onClick={handleReset}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Back to Mode Selection */}
                <button
                  className="w-full mt-3 text-sm text-gray-400 hover:text-white transition-colors"
                  onClick={() => {
                    setMode(null);
                    setIsRunning(false);
                    setShowTimerInput(false);
                  }}
                >
                  ← Back to mode selection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StopwatchTimer;