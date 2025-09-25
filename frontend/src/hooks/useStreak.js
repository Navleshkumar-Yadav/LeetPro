import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient.js';

export const useStreak = () => {
  const [streakInfo, setStreakInfo] = useState({
    currentStreak: 0,
    maxStreak: 0,
    lastSubmissionDate: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get('/streak/current');
      
      if (response.data.success) {
        setStreakInfo(response.data.streak);
      } else {
        setError('Failed to fetch streak information');
      }
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError('Failed to fetch streak information');
    } finally {
      setLoading(false);
    }
  };

  const resetStreak = async () => {
    try {
      const response = await axiosClient.post('/streak/reset');
      
      if (response.data.success) {
        setStreakInfo({
          currentStreak: 0,
          maxStreak: streakInfo.maxStreak,
          lastSubmissionDate: null
        });
        return true;
      } else {
        setError('Failed to reset streak');
        return false;
      }
    } catch (err) {
      console.error('Error resetting streak:', err);
      setError('Failed to reset streak');
      return false;
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  return {
    streakInfo,
    loading,
    error,
    refetch: fetchStreak,
    resetStreak
  };
};

export default useStreak;