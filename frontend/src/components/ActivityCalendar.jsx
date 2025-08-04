import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Target,
  Zap,
  CheckCircle
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from './AnimatedCard.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const ActivityCalendar = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // API expects 1-indexed month
      
      const response = await axiosClient.get(`/dashboard/calendar?year=${year}&month=${month}`);
      setCalendarData(response.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getActivityEmoji = (problemsSolved, dayDate) => {
    // Get current date for comparison
    const today = new Date();
    const currentDay = new Date(dayDate);
    
    // Only show emojis for days from start of month till current day
    if (currentDay > today) {
      return null;
    }

    if (problemsSolved > 0) {
      return (
        <motion.span
          className="text-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🔥
        </motion.span>
      );
    } else {
      return (
        <motion.span
          className="text-2xl opacity-70"
          animate={{ 
            scale: [1, 0.9, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          😢
        </motion.span>
      );
    }
  };

  const isDateInPast = (dayDate) => {
    const today = new Date();
    const currentDay = new Date(dayDate);
    return currentDay <= today;
  };

  const isToday = (dayDate) => {
    const today = new Date();
    const d = new Date(dayDate);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <AnimatedCard className="h-96">
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" text="Loading calendar..." />
        </div>
      </AnimatedCard>
    );
  }

  if (!calendarData) {
    return (
      <AnimatedCard className="h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Failed to load calendar</h3>
            <button 
              onClick={fetchCalendarData}
              className="text-blue-400 hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  // Calculate calendar layout
  const firstDayOfMonth = new Date(calendarData.year, calendarData.month - 1, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = calendarData.calendarData.length;
  
  // Create calendar grid
  const calendarGrid = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarGrid.push(null);
  }
  
  // Add all days of the month
  calendarGrid.push(...calendarData.calendarData);

  return (
    <AnimatedCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Activity Calendar</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-white font-medium min-w-[120px] text-center">
              {calendarData.monthName} {calendarData.year}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={currentDate >= new Date()}
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-2xl font-bold text-white">{calendarData.stats.totalProblemsSolved}</span>
            </div>
            <span className="text-xs text-gray-400">Problems Solved</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-bold text-white">{calendarData.stats.activeDays}</span>
            </div>
            <span className="text-xs text-gray-400">Active Days</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-2xl font-bold text-white">{calendarData.stats.streak}</span>
            </div>
            <span className="text-xs text-gray-400">Max Streak</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center text-xs text-gray-400 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((day, index) => (
              <motion.div
                key={index}
                className="aspect-square relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
              >
                {day ? (
                  <motion.div
                    className={`w-full h-full rounded border-2 bg-gray-800/50 flex flex-col items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer hover:border-blue-500/50 relative group
                      ${isToday(day.date) ? 'border-blue-400 ring-2 ring-blue-400/60 z-10' : 'border-gray-700'}`}
                    title={`${new Date(day.date).toDateString()}: ${day.problemsSolved} problems solved`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Show emoji if date is in past/present, otherwise show date */}
                    {isDateInPast(day.date) ? (
                      <>
                        {/* Emoji Display */}
                        <div className="flex items-center justify-center">
                          {getActivityEmoji(day.problemsSolved, day.date)}
                        </div>
                        
                        {/* Problems solved count for active days */}
                        {day.problemsSolved > 0 && (
                          <motion.div 
                            className="text-[8px] text-orange-400 font-bold mt-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {day.problemsSolved}
                          </motion.div>
                        )}

                        {/* Date tooltip on hover */}
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap"
                          initial={{ opacity: 0, y: 5 }}
                          whileHover={{ opacity: 1, y: 0 }}
                        >
                          <div className="font-semibold">{day.day}</div>
                          <div className="text-[10px] text-gray-400">
                            {day.problemsSolved} problem{day.problemsSolved !== 1 ? 's' : ''}
                          </div>
                          {/* Arrow pointing down */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                        </motion.div>
                      </>
                    ) : (
                      /* Future dates - show date number only */
                      <div className="text-gray-500">{day.day}</div>
                    )}
                  </motion.div>
                ) : (
                  <div className="w-full h-full" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span>😢</span>
            <span>No problems</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔥</span>
            <span>Problems solved</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default ActivityCalendar;