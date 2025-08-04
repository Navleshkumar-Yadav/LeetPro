import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  BarChart3,
  Crown,
  Zap
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

function ContestReportPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [contestId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/contest/${contestId}/report`);
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (change) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getRankColor = (rank, total) => {
    const percentile = (rank / total) * 100;
    if (percentile <= 10) return 'text-yellow-400'; // Top 10%
    if (percentile <= 25) return 'text-blue-400';   // Top 25%
    if (percentile <= 50) return 'text-green-400';  // Top 50%
    return 'text-gray-400';
  };

  const getPerformanceMessage = (percentage, rank, total) => {
    const percentile = (rank / total) * 100;
    
    if (percentile <= 5) return "🏆 Outstanding performance! You're in the top 5%!";
    if (percentile <= 10) return "🥇 Excellent work! Top 10% finish!";
    if (percentile <= 25) return "🥈 Great job! You're in the top 25%!";
    if (percentile <= 50) return "🥉 Good performance! Top 50% finish!";
    if (percentage >= 70) return "💪 Solid effort! Keep practicing!";
    return "📚 Keep learning and you'll improve!";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Generating contest report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Report not available</h2>
          <p className="text-gray-400 mb-4">Contest report could not be loaded.</p>
          <button 
            onClick={() => navigate('/contest')}
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  const { contest, performance, rating, results } = report;

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
                onClick={() => navigate('/contest')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">Contest Report</h1>
                  <p className="text-sm text-gray-400">{contest.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Final Results
              </div>
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Performance Overview */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-block mb-6">
            <motion.div
              className={`text-6xl font-bold mb-4 ${getRankColor(performance.rank, performance.totalParticipants)}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              #{performance.rank}
            </motion.div>
            <div className="text-xl text-gray-300">
              out of {performance.totalParticipants} participants
            </div>
          </div>
          
          <p className="text-lg text-gray-300 mb-4">
            {getPerformanceMessage(performance.percentage, performance.rank, performance.totalParticipants)}
          </p>
          
          {/* Rating Change */}
          <motion.div
            className="inline-flex items-center space-x-4 px-6 py-4 bg-gray-800/50 rounded-xl border border-gray-700"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Previous Rating</div>
              <div className="text-2xl font-bold text-gray-300">{rating.old}</div>
            </div>
            
            <motion.div
              className="flex items-center"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <TrendingUp className={`w-8 h-8 ${getRatingColor(rating.change)}`} />
            </motion.div>
            
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">New Rating</div>
              <div className={`text-2xl font-bold ${getRatingColor(rating.change)}`}>
                {rating.new}
              </div>
              <div className={`text-sm font-medium ${getRatingColor(rating.change)}`}>
                ({rating.change >= 0 ? '+' : ''}{rating.change})
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatedCard className="text-center">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{performance.totalScore}</div>
            <div className="text-sm text-gray-400">Total Score</div>
            <div className="text-xs text-gray-500 mt-1">Max: {performance.maxScore}</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{performance.percentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">#{performance.rank}</div>
            <div className="text-sm text-gray-400">Final Rank</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className={`text-2xl font-bold mb-1 ${getRatingColor(rating.change)}`}>
              {rating.change >= 0 ? '+' : ''}{rating.change}
            </div>
            <div className="text-sm text-gray-400">Rating Change</div>
          </AnimatedCard>
        </motion.div>

        {/* Problem-wise Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AnimatedCard>
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Problem-wise Performance</h3>
            </div>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <motion.div
                  key={result.problemId}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-400 font-mono text-sm">
                        Problem {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{result.problemTitle}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-2 py-1 rounded text-xs border ${
                            result.difficulty === 'easy' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                            result.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                            'text-red-400 bg-red-400/10 border-red-400/20'
                          }`}>
                            {result.difficulty?.charAt(0).toUpperCase() + result.difficulty?.slice(1)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Test Cases: {result.testCasesPassed}/{result.totalTestCases}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {result.status === 'accepted' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`font-medium ${
                          result.status === 'accepted' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-yellow-400 font-bold">
                        {result.marksAwarded}/{result.maxMarks} points
                      </div>
                      {result.runtime > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Runtime: {result.runtime.toFixed(3)}s
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex justify-center space-x-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GradientButton
            onClick={() => navigate('/contest')}
            variant="secondary"
            className="px-8 py-3"
          >
            Back to Contests
          </GradientButton>
          <GradientButton
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3"
          >
            <Award className="w-4 h-4 mr-2" />
            View Dashboard
          </GradientButton>
        </motion.div>

        {/* Motivational Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <AnimatedCard className="text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Keep Competing!</h3>
            <p className="text-gray-300 mb-6">
              Regular participation in contests is the best way to improve your problem-solving skills and coding speed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="font-semibold text-white mb-1">Practice Daily</h4>
                <p className="text-sm text-gray-400">Solve problems regularly to stay sharp</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-white mb-1">Speed Matters</h4>
                <p className="text-sm text-gray-400">Work on solving problems faster</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-white mb-1">Learn Patterns</h4>
                <p className="text-sm text-gray-400">Study common algorithmic patterns</p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
}

export default ContestReportPage;