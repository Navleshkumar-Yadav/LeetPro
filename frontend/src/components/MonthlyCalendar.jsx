import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Target,
  Zap,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from './AnimatedCard.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const MonthlyCalendar = () => {
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

  const getActivityColor = (submissionCount) => {
    if (submissionCount === 0) return 'bg-gray-800 border-gray-700'; // No submissions
    if (submissionCount === 1) return 'bg-green-600 border-green-600'; // 1 submission, strong green
    if (submissionCount <= 3) return 'bg-green-400 border-green-400'; // 2-3 submissions, brightest green
    return 'bg-green-400 border-green-400'; // 4+ submissions, brightest green
  };

  const getActivityLevel = (submissionCount) => {
    if (submissionCount === 0) return 0;
    if (submissionCount === 1) return 1;
    if (submissionCount <= 3) return 2;
    return 2;
  };

  const getDayName = (dayIndex) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
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
            <h3 className="text-lg font-semibold text-white">Monthly Activity</h3>
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
              <span className="text-2xl font-bold text-white">{calendarData.stats.totalSubmissions}</span>
            </div>
            <span className="text-xs text-gray-400">Total Submissions</span>
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
                  <div
                    className={`w-full h-full rounded border-2 flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer ${
                      getActivityColor(day.submissionCount)
                    } ${
                      day.submissionCount > 0 ? 'text-white' : 'text-gray-400'
                    }`}
                    title={`${day.date.toDateString()}: ${day.submissionCount} submissions`}
                  >
                    {day.day}
                    {day.submissionCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                          {day.submissionCount > 9 ? '9+' : day.submissionCount}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded border ${
                  level === 0 ? 'bg-gray-800 border-gray-700' :
                  level === 1 ? 'bg-green-600 border-green-600' :
                  'bg-green-400 border-green-400'
                }`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default MonthlyCalendar;