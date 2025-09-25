import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RINGS = [
  {
    key: 'easy',
    color: '#22c55e',
    strokeClass: 'stroke-green-400',
    bgClass: 'stroke-green-900',
    label: 'Easy',
    ringWidth: 16,
    radius: 85,
  },
  {
    key: 'medium',
    color: '#fbbf24',
    strokeClass: 'stroke-yellow-400',
    bgClass: 'stroke-yellow-900',
    label: 'Medium',
    ringWidth: 14,
    radius: 65,
  },
  {
    key: 'hard',
    color: '#ef4444',
    strokeClass: 'stroke-red-400',
    bgClass: 'stroke-red-900',
    label: 'Hard',
    ringWidth: 12,
    radius: 45,
  },
];

function DashboardMultiRingChart({
  easy, medium, hard, total, solvedEasy, solvedMedium, solvedHard, solvedTotal
}) {
  const [hovered, setHovered] = useState(null); // 'easy' | 'medium' | 'hard' | null
  const [animatedValues, setAnimatedValues] = useState({ easy: 0, medium: 0, hard: 0 });

  const getRingProps = (key) => {
    switch (key) {
      case 'easy':
        return { value: solvedEasy, max: easy };
      case 'medium':
        return { value: solvedMedium, max: medium };
      case 'hard':
        return { value: solvedHard, max: hard };
      default:
        return { value: solvedTotal, max: total };
    }
  };

  // Animate values on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        easy: solvedEasy,
        medium: solvedMedium,
        hard: solvedHard
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [solvedEasy, solvedMedium, solvedHard]);

  const display = hovered
    ? getRingProps(hovered)
    : { value: solvedTotal, max: total };

  const displayLabel = hovered
    ? RINGS.find(r => r.key === hovered).label
    : 'Solved';

  // SVG size and center
  const size = 240;
  const center = size / 2;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
      {/* SVG Rings */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Glow definitions */}
          <defs>
            {RINGS.map(ring => (
              <filter key={`glow-${ring.key}`} id={`glow-${ring.key}`}>
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            ))}
          </defs>
          
          {RINGS.map((ring, idx) => {
            const { value: targetValue, max } = getRingProps(ring.key);
            const animatedValue = animatedValues[ring.key] || 0;
            const percent = Math.max(0, Math.min(1, animatedValue / max));
            const circ = 2 * Math.PI * ring.radius;
            const offset = circ * (1 - percent);
            
            return (
              <g key={ring.key}>
                {/* Background ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  strokeWidth={ring.ringWidth}
                  className={ring.bgClass}
                  fill="none"
                  opacity={0.2}
                />
                {/* Foreground ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  strokeWidth={ring.ringWidth}
                  className={ring.strokeClass}
                  fill="none"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1.5s ease-out, opacity 0.3s, filter 0.3s',
                    opacity: hovered === null || hovered === ring.key ? 1 : 0.22,
                    filter: hovered === ring.key ? `url(#glow-${ring.key})` : 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHovered(ring.key)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Center text */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none"
          key={hovered}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-5xl font-extrabold text-white drop-shadow-lg mb-1"
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              key={display.value}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {display.value}
            </motion.span>
            <span className="text-2xl text-gray-400">/{display.max}</span>
          </motion.div>
          <motion.div 
            className="text-lg text-gray-400 font-medium tracking-wide"
            animate={{ 
              color: hovered ? 
                (hovered === 'easy' ? '#22c55e' : 
                 hovered === 'medium' ? '#fbbf24' : 
                 hovered === 'hard' ? '#ef4444' : '#9ca3af') : '#9ca3af'
            }}
            transition={{ duration: 0.2 }}
          >
            {displayLabel}
          </motion.div>
          
          {/* Percentage */}
          <motion.div 
            className="text-sm text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {display.max > 0 ? Math.round((display.value / display.max) * 100) : 0}%
          </motion.div>
        </motion.div>
      </div>
      
      {/* Enhanced Legend */}
      <div className="flex flex-col gap-4 min-w-[200px]">
        <h4 className="text-lg font-semibold text-white mb-2">Progress by Difficulty</h4>
        {RINGS.map((ring, index) => {
          const { value, max } = getRingProps(ring.key);
          const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
          
          return (
            <motion.div
              key={ring.key}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                hovered === ring.key 
                  ? 'bg-gray-700/50 border border-gray-600' 
                  : 'bg-gray-800/30 hover:bg-gray-700/30'
              }`}
              onMouseEnter={() => setHovered(ring.key)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Color indicator */}
              <motion.div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: ring.color }}
                animate={{ 
                  scale: hovered === ring.key ? 1.2 : 1,
                  boxShadow: hovered === ring.key ? `0 0 20px ${ring.color}66` : 'none'
                }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-semibold text-base">{ring.label}</span>
                  <span className="text-gray-400 font-mono text-sm">{value}/{max}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: ring.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                  />
                </div>
                
                {/* Percentage text */}
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{percentage}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Total summary */}
        <motion.div
          className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-semibold">Total Progress</span>
            <span className="text-blue-400 font-bold">{Math.round((solvedTotal / total) * 100)}%</span>
          </div>
          <div className="text-sm text-gray-400 mt-1">{solvedTotal} of {total} problems solved</div>
          </motion.div> 
        </div>
      </div>
    // </div>
  );
}

export default DashboardMultiRingChart; 