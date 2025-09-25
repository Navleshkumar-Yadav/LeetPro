import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Target,
  Play,
  Send,
  CheckCircle,
  AlertCircle,
  Code,
  FileText,
  Timer,
  Zap
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const contestLanguages = [
  { id: 'cpp', label: 'C++', monacoId: 'cpp' },
  { id: 'java', label: 'Java', monacoId: 'java' },
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' }
];

function ContestLivePage() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [isContestEnded, setIsContestEnded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const timerRef = useRef(null);

  useEffect(() => {
    fetchContestData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [contestId]);

  useEffect(() => {
    if (contest) {
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [contest]);

  useEffect(() => {
    // Update code when switching problems or languages
    if (problems.length > 0 && problems[activeTab]) {
      const problem = problems[activeTab];
      const startCode = problem.startCode?.find(sc => sc.language === getLanguageDisplayName(selectedLanguage));
      setCode(startCode?.initialCode || '');
    }
  }, [activeTab, selectedLanguage, problems]);

  const fetchContestData = async () => {
    try {
      setLoading(true);
      const [contestRes, problemsRes] = await Promise.all([
        axiosClient.get(`/contest/${contestId}`),
        axiosClient.get(`/contest/${contestId}/problems`)
      ]);
      
      setContest(contestRes.data.contest);
      setProblems(problemsRes.data.problems || []);
      
      // Initialize submissions tracking
      const initialSubmissions = {};
      problemsRes.data.problems?.forEach(problem => {
        initialSubmissions[problem.problemId] = {
          hasSubmission: problem.hasSubmission,
          status: problem.submissionStatus,
          marksAwarded: problem.marksAwarded || 0,
          testCasesPassed: problem.testCasesPassed || 0,
          totalTestCases: problem.totalTestCases || 0
        };
      });
      setSubmissions(initialSubmissions);
      
    } catch (err) {
      console.error('Error fetching contest data:', err);
      if (err.response?.status === 403) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'You are not registered for this contest or it is not live.' });
        setTimeout(() => navigate(`/contest/${contestId}/register`), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTimer = () => {
    if (!contest) return;
    
    const now = new Date();
    const end = new Date(contest.endTime);
    const diff = end - now;
    
    if (diff <= 0) {
      setTimeLeft('Contest Ended');
      setIsContestEnded(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeout(() => navigate(`/contest/${contestId}/report`), 3000);
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const getLanguageDisplayName = (langId) => {
    const mapping = {
      'cpp': 'C++',
      'java': 'Java',
      'javascript': 'JavaScript'
    };
    return mapping[langId] || langId;
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please write some code before submitting' });
      return;
    }
    
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await axiosClient.post(`/contest/${contestId}/submit`, {
        problemId: problems[activeTab].problemId,
        code,
        language: selectedLanguage
      });
      
      // Update submission status
      setSubmissions(prev => ({
        ...prev,
        [problems[activeTab].problemId]: {
          hasSubmission: true,
          status: response.data.submission.status,
          marksAwarded: response.data.submission.marksAwarded,
          testCasesPassed: response.data.submission.testCasesPassed,
          totalTestCases: response.data.submission.totalTestCases
        }
      }));
      
      setMessage({ 
        type: 'success', 
        text: `Submission received! Status: ${response.data.submission.status}` 
      });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Submission failed' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading contest..." />
      </div>
    );
  }

  if (!contest || problems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Contest not available</h2>
          <p className="text-gray-400 mb-4">
            {message.text || 'Contest not found or not accessible.'}
          </p>
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

  const currentProblem = problems[activeTab];
  const currentSubmission = submissions[currentProblem?.problemId];

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
                <Trophy className="w-6 h-6 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">{contest.name}</h1>
                  <p className="text-sm text-gray-400">Live Contest</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                isContestEnded 
                  ? 'bg-red-500/20 border-red-500/30' 
                  : timeLeft.startsWith('00:') 
                  ? 'bg-red-500/20 border-red-500/30' 
                  : 'bg-blue-500/20 border-blue-500/30'
              }`}>
                <Timer className={`w-5 h-5 ${
                  isContestEnded || timeLeft.startsWith('00:') ? 'text-red-400' : 'text-blue-400'
                }`} />
                <span className={`font-mono font-bold text-lg ${
                  isContestEnded || timeLeft.startsWith('00:') ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {timeLeft}
                </span>
              </div>
              
              {/* Submit All Button */}
              <GradientButton
                onClick={() => navigate(`/contest/${contestId}/report`)}
                variant="success"
                size="sm"
                disabled={isContestEnded}
              >
                Finish Contest
              </GradientButton>
              
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {message.text && (
          <motion.div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Problem Navigation */}
          <div className="lg:col-span-1">
            <AnimatedCard>
              <h3 className="font-semibold text-white mb-4">Problems</h3>
              <div className="space-y-2">
                {problems.map((problem, index) => {
                  const submission = submissions[problem.problemId];
                  
                  return (
                    <button
                      key={problem.problemId}
                      onClick={() => setActiveTab(index)}
                      className={`w-full p-4 rounded-lg border transition-all text-left ${
                        activeTab === index
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : submission?.hasSubmission
                          ? 'bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Problem {index + 1}</span>
                        <div className="flex items-center space-x-2">
                          {submission?.hasSubmission && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span className="text-yellow-400 font-bold text-sm">
                            {problem.marks}pts
                          </span>
                        </div>
                      </div>
                      <div className="text-sm opacity-75 truncate">
                        {problem.title}
                      </div>
                      {submission?.hasSubmission && (
                        <div className="text-xs mt-1 opacity-75">
                          {submission.status === 'accepted' ? (
                            <span className="text-green-400">✓ Solved ({submission.marksAwarded} pts)</span>
                          ) : (
                            <span className="text-red-400">✗ {submission.status}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Contest Progress */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-medium text-white mb-3">Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Submitted:</span>
                    <span className="text-white">
                      {Object.values(submissions).filter(s => s.hasSubmission).length}/{problems.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(Object.values(submissions).filter(s => s.hasSubmission).length / problems.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Problem Description */}
                <AnimatedCard>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-blue-400" />
                      <div>
                        <h2 className="text-xl font-bold text-white">{currentProblem.title}</h2>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-yellow-400 font-bold">{currentProblem.marks} points</span>
                          <span className={`px-2 py-1 rounded text-xs border ${
                            currentProblem.difficulty === 'easy' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                            currentProblem.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                            'text-red-400 bg-red-400/10 border-red-400/20'
                          }`}>
                            {currentProblem.difficulty?.charAt(0).toUpperCase() + currentProblem.difficulty?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {currentSubmission?.hasSubmission && (
                      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                        currentSubmission.status === 'accepted' 
                          ? 'bg-green-500/20 border-green-500/30 text-green-400'
                          : 'bg-red-500/20 border-red-500/30 text-red-400'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {currentSubmission.status === 'accepted' ? 'Solved' : 'Attempted'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed mb-6">
                      {currentProblem.description}
                    </div>
                    
                    {currentProblem.visibleTestCases && currentProblem.visibleTestCases.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Examples:</h3>
                        <div className="space-y-4">
                          {currentProblem.visibleTestCases.map((example, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <h4 className="font-semibold mb-3 text-blue-400">Example {index + 1}:</h4>
                              <div className="space-y-2 text-sm font-mono">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-gray-400 block mb-1">Input:</span>
                                    <div className="bg-gray-900 rounded p-2 text-green-400">
                                      {example.input}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block mb-1">Output:</span>
                                    <div className="bg-gray-900 rounded p-2 text-blue-400">
                                      {example.output}
                                    </div>
                                  </div>
                                </div>
                                {example.explanation && (
                                  <div className="mt-3">
                                    <span className="text-gray-400 block mb-1">Explanation:</span>
                                    <p className="text-gray-300 font-sans">{example.explanation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>

                {/* Code Editor */}
                <AnimatedCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Code className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Solution</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Language Selector */}
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="dark-input px-3 py-2 rounded-lg"
                        disabled={isContestEnded}
                      >
                        {contestLanguages.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.label}</option>
                        ))}
                      </select>
                      
                      {/* Submit Button */}
                      <GradientButton
                        onClick={handleSubmit}
                        disabled={submitting || isContestEnded || !code.trim()}
                        loading={submitting}
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Solution
                      </GradientButton>
                    </div>
                  </div>
                  
                  <div className="h-96 border border-gray-700 rounded-lg overflow-hidden">
                    <Editor
                      height="100%"
                      language={contestLanguages.find(l => l.id === selectedLanguage)?.monacoId || 'cpp'}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isContestEnded
                      }}
                    />
                  </div>
                  
                  {/* Submission Status */}
                  {currentSubmission?.hasSubmission && (
                    <motion.div
                      className={`mt-4 p-4 rounded-lg border ${
                        currentSubmission.status === 'accepted' 
                          ? 'bg-green-500/10 border-green-500/20'
                          : currentSubmission.status === 'wrong'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-yellow-500/10 border-yellow-500/20'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className={`w-5 h-5 ${
                            currentSubmission.status === 'accepted' ? 'text-green-400' : 
                            currentSubmission.status === 'wrong' ? 'text-red-400' :
                            'text-yellow-400'
                          }`} />
                          <div>
                            <h4 className={`font-semibold ${
                              currentSubmission.status === 'accepted' ? 'text-green-400' : 
                              currentSubmission.status === 'wrong' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {currentSubmission.status === 'accepted' ? 'Solution Accepted!' : 
                               currentSubmission.status === 'wrong' ? 'Wrong Answer' :
                               currentSubmission.status === 'error' ? 'Runtime Error' : 'Pending'}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              Test Cases: {currentSubmission.testCasesPassed}/{currentSubmission.totalTestCases}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">
                            +{currentSubmission.marksAwarded} points
                          </div>
                          <div className="text-xs text-gray-400">
                            Max: {currentProblem.marks} points
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatedCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestLivePage;