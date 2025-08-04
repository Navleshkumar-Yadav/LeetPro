import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Code,
  Award,
  TrendingUp
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const AssessmentReport = () => {
  const { assessmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [assessmentId, submissionId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/assessment/${assessmentId}/report/${submissionId}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'F';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return 'Outstanding performance! 🎉';
    if (percentage >= 80) return 'Excellent work! 👏';
    if (percentage >= 70) return 'Good job! 👍';
    if (percentage >= 60) return 'Keep practicing! 💪';
    return 'More practice needed! 📚';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Generating report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Report not found</h2>
          <button onClick={() => navigate('/assessments')} className="text-blue-400 hover:text-blue-300">
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const { assessment, submission, answers, questions, subjectBreakdown } = report;

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
                onClick={() => navigate('/assessments')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h1 className="text-2xl font-bold gradient-text">Assessment Report</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {new Date(submission.endTime).toLocaleDateString()}
              </div>
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Overall Score */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-block">
            <div className={`text-8xl font-bold ${getGradeColor(submission.percentage)} mb-4`}>
              {getGradeLetter(submission.percentage)}
            </div>
            <div className="text-2xl text-gray-300 mb-2">
              {submission.score} / {submission.totalScore}
            </div>
            <div className={`text-xl font-semibold ${getGradeColor(submission.percentage)}`}>
              {submission.percentage.toFixed(1)}%
            </div>
          </div>
          <p className="text-lg text-gray-300 mt-4">
            {getPerformanceMessage(submission.percentage)}
          </p>
        </motion.div>

        {/* Assessment Info */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatedCard>
            <div className="flex items-center space-x-4 mb-6">
              {assessment.type === 'mcq' ? (
                <FileText className="w-8 h-8 text-blue-400" />
              ) : (
                <Code className="w-8 h-8 text-purple-400" />
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{assessment.title}</h2>
                <p className="text-gray-400">
                  {assessment.type === 'mcq' ? 'Multiple Choice Assessment' : 'Coding Assessment'}
                  {assessment.company && ` • ${assessment.company}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{submission.timeTaken}</div>
                <div className="text-sm text-gray-400">Minutes Taken</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{assessment.totalQuestions}</div>
                <div className="text-sm text-gray-400">Total Questions</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{submission.score}</div>
                <div className="text-sm text-gray-400">Correct Answers</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{submission.percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Subject Breakdown for MCQ */}
        {assessment.type === 'mcq' && subjectBreakdown && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatedCard>
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Subject-wise Performance</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(subjectBreakdown).map(([subject, data]) => {
                  const percentage = (data.correct / data.total) * 100;
                  return (
                    <div key={subject} className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-lg font-bold text-white mb-2">{subject}</div>
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {data.correct}/{data.total}
                      </div>
                      <div className={`text-sm font-medium ${getGradeColor(percentage)}`}>
                        {percentage.toFixed(0)}%
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            percentage >= 80 ? 'bg-green-400' :
                            percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AnimatedCard>
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Detailed Results</h3>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => {
                const answer = answers.find(a => a.questionIndex === index);
                
                return (
                  <div key={index} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-400">
                            Question {index + 1}
                          </span>
                          {assessment.type === 'mcq' && (
                            <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400">
                              {question.subject}
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-medium">
                          {assessment.type === 'mcq' ? question.question : question.problemId?.title}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assessment.type === 'mcq' ? (
                          answer?.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )
                        ) : (
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {answer?.testCasesPassed || 0}/{answer?.totalTestCases || 0}
                            </div>
                            <div className="text-xs text-gray-400">Test Cases</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {assessment.type === 'mcq' && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                : optionIndex === answer?.selectedOption && answer?.selectedOption !== question.correctAnswer
                                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                                : 'bg-gray-800/50 text-gray-300'
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </span>
                            {optionIndex === question.correctAnswer && (
                              <span className="ml-2 text-xs">(Correct)</span>
                            )}
                            {optionIndex === answer?.selectedOption && answer?.selectedOption !== question.correctAnswer && (
                              <span className="ml-2 text-xs">(Your Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {assessment.type === 'coding' && answer?.code && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-400 mb-2">Your Solution ({answer.language}):</div>
                        <div className="bg-gray-900 rounded p-3 text-sm font-mono text-gray-300 max-h-40 overflow-y-auto">
                          <pre>{answer.code}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex justify-center space-x-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GradientButton
            onClick={() => navigate('/assessments')}
            variant="secondary"
          >
            Back to Assessments
          </GradientButton>
          <GradientButton
            onClick={() => window.print()}
          >
            <Award className="w-4 h-4 mr-2" />
            Print Report
          </GradientButton>
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentReport;