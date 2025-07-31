import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Target,
  CheckCircle,
  AlertCircle,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

function ContestRegisterPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchContest();
  }, [contestId]);

  const fetchContest = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/contest/${contestId}`);
      setContest(res.data.contest);
    } catch (err) {
      console.error('Error fetching contest:', err);
      setContest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError('');
    
    try {
      await axiosClient.post(`/contest/${contestId}/register`);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/contest');
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setRegistering(true);
    setError('');
    
    try {
      await axiosClient.post(`/contest/${contestId}/unregister`);
      setContest(prev => ({ ...prev, isRegistered: false }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unregistration failed');
    } finally {
      setRegistering(false);
    }
  };

  const getTimeUntilStart = () => {
    if (!contest) return '';
    
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const diff = start - now;
    
    if (now >= start && now <= end) return 'Contest is live now!';
    if (now > end) return 'Contest has ended';
    if (diff <= 0) return 'Contest is starting soon';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading contest details..." />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Contest not found</h2>
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedCard className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <motion.div
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-green-400 mb-4">Registration Successful!</h2>
            <p className="text-gray-300 mb-6">
              You're now registered for <span className="font-semibold text-white">{contest.name}</span>
            </p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-2">Contest starts in:</div>
              <div className="text-lg font-bold text-blue-400">{getTimeUntilStart()}</div>
            </div>
            
            <div className="text-sm text-gray-400 mb-6">
              Redirecting to contests page in 3 seconds...
            </div>
            
            <GradientButton onClick={() => navigate('/contest')} className="w-full">
              Go to Contests
            </GradientButton>
          </AnimatedCard>
        </motion.div>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/contest')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Contest Registration</h1>
            </div>
            <div className="ml-auto">
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Contest Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">{contest.name}</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">{contest.description}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contest Details */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Contest Info */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Contest Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">Start Time</span>
                    </div>
                    <span className="text-white font-medium">
                      {new Date(contest.startTime).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-red-400" />
                      <span className="text-gray-300">End Time</span>
                    </div>
                    <span className="text-white font-medium">
                      {new Date(contest.endTime).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-300">Participants</span>
                    </div>
                    <span className="text-white font-medium">
                      {contest.participantCount || 0} / {contest.maxParticipants}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Problems</span>
                    </div>
                    <span className="text-white font-medium">{contest.problems?.length || 0}</span>
                  </div>
                </div>
              </AnimatedCard>

              {/* Instructions */}
              {contest.instructions && (
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-4">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Instructions</h3>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                      {contest.instructions}
                    </p>
                  </div>
                </AnimatedCard>
              )}
            </motion.div>

            {/* Problems & Registration */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Problems List */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Contest Problems</h3>
                </div>
                
                <div className="space-y-3">
                  {contest.problems?.map((problem, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {problem.problemId?.title || `Problem ${index + 1}`}
                          </h4>
                          {problem.problemId?.difficulty && (
                            <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(problem.problemId.difficulty)}`}>
                              {problem.problemId.difficulty.charAt(0).toUpperCase() + problem.problemId.difficulty.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">{problem.marks} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-medium">Total Points Available:</span>
                    <span className="text-blue-400 font-bold text-lg">
                      {contest.problems?.reduce((sum, p) => sum + p.marks, 0) || 0}
                    </span>
                  </div>
                </div>
              </AnimatedCard>

              {/* Registration Card */}
              <AnimatedCard className={`${
                contest.isRegistered 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-blue-500/10 border-blue-500/20'
              }`}>
                <div className="text-center">
                  {contest.isRegistered ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-400 mb-4">Already Registered!</h3>
                      <p className="text-gray-300 mb-6">
                        You're all set for this contest. We'll notify you when it starts.
                      </p>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                        <div className="text-sm text-gray-400 mb-2">Contest starts in:</div>
                        <div className="text-lg font-bold text-blue-400">{getTimeUntilStart()}</div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <GradientButton
                          onClick={() => navigate('/contest')}
                          variant="secondary"
                          className="flex-1"
                        >
                          Back to Contests
                        </GradientButton>
                        <button
                          onClick={handleUnregister}
                          disabled={registering}
                          className="flex-1 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
                        >
                          {registering ? 'Unregistering...' : 'Unregister'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {(() => {
                          const now = new Date();
                          const start = new Date(contest.startTime);
                          const end = new Date(contest.endTime);
                          
                          if (now >= start && now <= end) {
                            return 'Contest is Live! Register Now!';
                          } else if (now > end) {
                            return 'Contest Has Ended';
                          } else {
                            return 'Ready to Compete?';
                          }
                        })()}
                      </h3>
                      <p className="text-gray-300 mb-6">
                        {(() => {
                          const now = new Date();
                          const start = new Date(contest.startTime);
                          const end = new Date(contest.endTime);
                          
                          if (now >= start && now <= end) {
                            return 'The contest is currently running! Register now and start competing immediately!';
                          } else if (now > end) {
                            return 'This contest has already ended. Check out other contests!';
                          } else {
                            return 'Join this contest to test your coding skills and improve your rating!';
                          }
                        })()}
                      </p>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                        <div className="text-sm text-gray-400 mb-2">Contest starts in:</div>
                        <div className="text-lg font-bold text-blue-400">{getTimeUntilStart()}</div>
                      </div>
                      
                      {/* Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                          <div className="text-sm font-medium text-white">Improve Rating</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                          <div className="text-sm font-medium text-white">Earn Recognition</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <div className="text-sm font-medium text-white">Compete & Learn</div>
                        </div>
                      </div>
                      
                      {(() => {
                        const now = new Date();
                        const end = new Date(contest.endTime);
                        
                        if (now > end) {
                          return (
                            <button
                              disabled
                              className="w-full py-4 text-lg font-semibold bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                            >
                              Contest Ended
                            </button>
                          );
                        } else {
                          return (
                            <GradientButton
                              onClick={handleRegister}
                              disabled={registering}
                              loading={registering}
                              className="w-full py-4 text-lg font-semibold"
                            >
                              {registering ? 'Registering...' : 'Register for Contest'}
                            </GradientButton>
                          );
                        }
                      })()}
                    </>
                  )}
                </div>
                
                {error && (
                  <motion.div
                    className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatedCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestRegisterPage;