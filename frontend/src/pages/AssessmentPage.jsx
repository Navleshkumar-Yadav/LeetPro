import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Code, 
  CheckCircle,
  AlertCircle,
  Play,
  Send,
  Timer,
  Target
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const AssessmentPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAssessment();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [assessmentId]);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompleteAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, timeLeft]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/assessment/${assessmentId}`);
      setAssessment(response.data.assessment);
      
      if (response.data.hasActiveSubmission) {
        setSubmissionId(response.data.submissionId);
        setIsStarted(true);
        // Calculate remaining time
        const duration = response.data.assessment.duration * 60; // convert to seconds
        setTimeLeft(duration);
      }
      
      // Initialize code for coding assessments
      if (response.data.assessment.type === 'coding' && response.data.assessment.questions[0]?.problemId) {
        const problem = response.data.assessment.questions[0].problemId;
        const initialCode = problem.startCode?.find(sc => sc.language === 'C++')?.initialCode || '';
        setCode(initialCode);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      if (error.response?.status === 403) {
        navigate('/premium');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    try {
      const response = await axiosClient.post(`/assessment/${assessmentId}/start`);
      setSubmissionId(response.data.submissionId);
      setIsStarted(true);
      setTimeLeft(assessment.duration * 60); // convert minutes to seconds
    } catch (error) {
      console.error('Error starting assessment:', error);
    }
  };

  const handleMCQAnswer = async (questionIndex, selectedOption) => {
    try {
      setAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
      
      await axiosClient.post(`/assessment/${assessmentId}/mcq-answer`, {
        submissionId,
        questionIndex,
        selectedOption
      });
    } catch (error) {
      console.error('Error submitting MCQ answer:', error);
    }
  };

  const handleCodingSubmit = async (questionIndex) => {
    try {
      setSubmitting(true);
      const response = await axiosClient.post(`/assessment/${assessmentId}/coding-answer`, {
        submissionId,
        questionIndex,
        code,
        language: selectedLanguage
      });
      
      setAnswers(prev => ({ 
        ...prev, 
        [questionIndex]: {
          code,
          language: selectedLanguage,
          testCasesPassed: response.data.testCasesPassed,
          totalTestCases: response.data.totalTestCases
        }
      }));
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteAssessment = async () => {
    try {
      const response = await axiosClient.post(`/assessment/${assessmentId}/complete`, {
        submissionId
      });
      
      setIsCompleted(true);
      navigate(`/assessment/${assessmentId}/report/${submissionId}`);
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'cpp';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading assessment..." />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Assessment not found</h2>
          <button onClick={() => navigate('/assessments')} className="text-blue-400 hover:text-blue-300">
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="glass-dark border-b border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/assessments')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">Assessment Instructions</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <AnimatedCard>
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  assessment.type === 'mcq' 
                    ? 'bg-blue-500/20 border border-blue-500/30' 
                    : 'bg-purple-500/20 border border-purple-500/30'
                }`}>
                  {assessment.type === 'mcq' ? (
                    <FileText className="w-8 h-8 text-blue-400" />
                  ) : (
                    <Code className="w-8 h-8 text-purple-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{assessment.title}</h2>
                <p className="text-gray-400">{assessment.description}</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">{assessment.duration}</div>
                    <div className="text-sm text-gray-400">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">{assessment.totalQuestions}</div>
                    <div className="text-sm text-gray-400">Questions</div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">Instructions:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• You have {assessment.duration} minutes to complete this assessment</li>
                    <li>• {assessment.type === 'mcq' ? 'Select the best answer for each question' : 'Write and submit code for each problem'}</li>
                    <li>• You can navigate between questions freely</li>
                    <li>• Your progress is automatically saved</li>
                    <li>• The assessment will auto-submit when time expires</li>
                  </ul>
                </div>

                <GradientButton
                  onClick={handleStartAssessment}
                  className="w-full py-3 text-lg font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Assessment
                </GradientButton>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = assessment.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="glass-dark border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <div className="ml-auto">
              <GlobalNavigation />
            </div>
              <h1 className="text-xl font-bold">{assessment.title}</h1>
              <span className="text-sm text-gray-400">
                Question {currentQuestion + 1} of {assessment.totalQuestions}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                timeLeft < 300 ? 'bg-red-500/20 border border-red-500/30' : 'bg-blue-500/20 border border-blue-500/30'
              }`}>
                <Timer className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-400' : 'text-blue-400'}`} />
                <span className={`font-mono font-semibold ${timeLeft < 300 ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <GradientButton
                onClick={handleCompleteAssessment}
                size="sm"
                variant="success"
              >
                Complete Assessment
              </GradientButton>
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <AnimatedCard>
              <h3 className="font-semibold text-white mb-4">Questions</h3>
              <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
                {assessment.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`p-3 rounded-lg border transition-all ${
                      currentQuestion === index
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : answers[index] !== undefined
                        ? 'bg-green-600/20 border-green-500/30 text-green-400'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-sm font-medium">{index + 1}</div>
                    {answers[index] !== undefined && (
                      <CheckCircle className="w-3 h-3 mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </AnimatedCard>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {assessment.type === 'mcq' ? (
                  <AnimatedCard>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-medium">
                            {currentQ.subject}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-4">
                          {currentQ.question}
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {currentQ.options.map((option, optionIndex) => (
                          <motion.button
                            key={optionIndex}
                            onClick={() => handleMCQAnswer(currentQuestion, optionIndex)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              answers[currentQuestion] === optionIndex
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 text-gray-300'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                answers[currentQuestion] === optionIndex
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-500'
                              }`}>
                                {answers[currentQuestion] === optionIndex && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <span className="font-medium">
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </AnimatedCard>
                ) : (
                  <div className="space-y-6">
                    {/* Problem Description */}
                    <AnimatedCard>
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">
                          {currentQ.problemId?.title}
                        </h2>
                        <div className="prose prose-invert max-w-none">
                          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {currentQ.problemId?.description}
                          </div>
                        </div>
                        
                        {currentQ.problemId?.visibleTestCases && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-white">Examples:</h3>
                            <div className="space-y-4">
                              {currentQ.problemId.visibleTestCases.map((example, index) => (
                                <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                                  <h4 className="font-semibold mb-3 text-blue-400">Example {index + 1}:</h4>
                                  <div className="space-y-2 text-sm font-mono">
                                    <div className="flex">
                                      <span className="text-gray-400 w-20">Input:</span>
                                      <span className="text-green-400">{example.input}</span>
                                    </div>
                                    <div className="flex">
                                      <span className="text-gray-400 w-20">Output:</span>
                                      <span className="text-blue-400">{example.output}</span>
                                    </div>
                                    <div className="mt-3">
                                      <span className="text-gray-400">Explanation:</span>
                                      <p className="text-gray-300 mt-1 font-sans">{example.explanation}</p>
                                    </div>
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
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Your Solution</h3>
                          <div className="flex items-center space-x-4">
                            <select
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className="dark-input px-3 py-2 rounded"
                            >
                              <option value="cpp">C++</option>
                              <option value="java">Java</option>
                              <option value="javascript">JavaScript</option>
                            </select>
                            <GradientButton
                              onClick={() => handleCodingSubmit(currentQuestion)}
                              disabled={submitting}
                              loading={submitting}
                              size="sm"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Submit Code
                            </GradientButton>
                          </div>
                        </div>
                        
                        <div className="h-96 border border-gray-700 rounded-lg overflow-hidden">
                          <Editor
                            height="100%"
                            language={getLanguageForMonaco(selectedLanguage)}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                              fontSize: 14,
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                            }}
                          />
                        </div>

                        {answers[currentQuestion] && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <span className="font-semibold text-green-400">Code Submitted</span>
                            </div>
                            <div className="text-sm text-gray-300">
                              Test Cases Passed: {answers[currentQuestion].testCasesPassed}/{answers[currentQuestion].totalTestCases}
                            </div>
                          </div>
                        )}
                      </div>
                    </AnimatedCard>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentQuestion(Math.min(assessment.totalQuestions - 1, currentQuestion + 1))}
                disabled={currentQuestion === assessment.totalQuestions - 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;