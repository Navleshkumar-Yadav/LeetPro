import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Send, 
  Code, 
  FileText, 
  Video, 
  MessageSquare, 
  History,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Zap,
  Target,
  ChevronDown,
  Crown,
  Lock,
  StickyNote,
  Star,
  User,
  Terminal,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useSelector } from 'react-redux';
import axiosClient from "../utils/axiosClient.js";
import SubmissionHistory from "../components/SubmissionHistory.jsx";
import ChatAi from '../components/ChatAi.jsx';
import Editorial from '../components/Editorial.jsx';
import PremiumButton from '../components/PremiumButton.jsx';
import NotesModal from '../components/NotesModal.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import StopwatchTimer from '../components/StopwatchTimer.jsx';
import CompanyNamesButton from '../components/CompanyNamesButton.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import WaterfallEffect from '../components/WaterfallEffect.jsx';
import CompaniesTag from '../components/CompaniesTag.jsx';
import StreakCelebrationModal from '../components/StreakCelebrationModal.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
  const [codeByLanguage, setCodeByLanguage] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('editor');
  const [showWaterfall, setShowWaterfall] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [premiumError, setPremiumError] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [complexityAnalysis, setComplexityAnalysis] = useState(null);
  const [analyzingComplexity, setAnalyzingComplexity] = useState(false);
  const [showComplexityAnalysis, setShowComplexityAnalysis] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakCelebrationData, setStreakCelebrationData] = useState(null);
  const editorRef = useRef(null);
  const { problemId } = useParams();
  const [customTestCases, setCustomTestCases] = useState([]); // {input: '', output: ''}
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  // Remove customRunResult state
  // Add state for editing custom test cases
  const [editingIdx, setEditingIdx] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [editOutput, setEditOutput] = useState('');

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const problemData = response.data;
        setProblem(problemData);
        
        if (problemData.isPremium && !problemData.hasAccess) {
          setCode('// This is a premium problem. Upgrade to access the full content.');
          setCodeByLanguage({});
        } else {
          // Initialize codeByLanguage with start code for each language
          const initialCodes = {};
          problemData.startCode.forEach(sc => {
            const langId = Object.keys(langMap).find(key => langMap[key] === sc.language);
            if (langId) initialCodes[langId] = sc.initialCode;
          });
          setCodeByLanguage(initialCodes);
          setCode(initialCodes[selectedLanguage] || '');
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem && problem.hasAccess) {
      setCode(codeByLanguage[selectedLanguage] || '');
    }
  }, [selectedLanguage, problem, codeByLanguage]);

  const handleEditorChange = (value) => {
    if (problem?.isPremium && !problem?.hasAccess) {
      return;
    }
    setCode(value || '');
    setCodeByLanguage(prev => ({ ...prev, [selectedLanguage]: value || '' }));
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setShowLanguageDropdown(false);
  };

  // Modified run handler: run all sample and custom test cases
  const handleRun = async () => {
    if (problem?.isPremium && !problem?.hasAccess) {
      setPremiumError('This is a premium problem. Please upgrade to run code.');
      setActiveRightTab('testcases');
      return;
    }
    setRunLoading(true);
    setRunResult(null);
    setPremiumError(null);
    setActiveRightTab('testcases');
    try {
      // Gather all test cases: sample + custom
      const allTestCases = [
        ...(problem?.visibleTestCases?.map(tc => ({ input: tc.input, output: tc.output })) || []),
        ...customTestCases
      ];
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
        testCases: allTestCases
      });
      setRunResult({
        ...response.data,
        totalTestCases: allTestCases.length,
        passedTestCases: response.data.testCases.filter(tc => tc.status_id === 3).length
      });
    } catch (error) {
      console.error('Error running code:', error);
      if (error.response?.status === 403) {
        setPremiumError('This is a premium problem. Please upgrade to run code.');
      } else {
        setRunResult({ success: false, error: 'Internal server error' });
      }
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (problem?.isPremium && !problem?.hasAccess) {
      setPremiumError('This is a premium problem. Please upgrade to submit code.');
      setActiveRightTab('results');
      return;
    }

    setSubmitLoading(true);
    setSubmitResult(null);
    setPremiumError(null);
    setActiveRightTab('results');
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      
      if (response.data.accepted) {
        setShowWaterfall(true);
        
        // Show streak celebration if streak info is available
        if (response.data.streak && (response.data.streak.isNewStreak || response.data.streak.isStreakMaintained)) {
          setStreakCelebrationData(response.data.streak);
          setShowStreakModal(true);
        }
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      if (error.response?.status === 403) {
        setPremiumError('This is a premium problem. Please upgrade to submit code.');
      } else {
        setSubmitResult(null);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAnalyzeComplexity = async () => {
    if (!submitResult?.accepted || !code || !problem) {
      return;
    }

    setAnalyzingComplexity(true);
    setComplexityAnalysis(null);
    
    try {
      const response = await axiosClient.post('/complexity/analyze', {
        code,
        language: selectedLanguage,
        problemTitle: problem.title,
        problemDescription: problem.description
      });

      setComplexityAnalysis(response.data.analysis);
      setShowComplexityAnalysis(true);
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      setComplexityAnalysis('Failed to analyze complexity. Please try again.');
      setShowComplexityAnalysis(true);
    } finally {
      setAnalyzingComplexity(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'cpp';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const leftTabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'editorial', label: 'Editorial', icon: Video },
    { id: 'solutions', label: 'Solutions', icon: Code },
    { id: 'submissions', label: 'Submissions', icon: History },
    { id: 'chatAI', label: 'AI Assistant', icon: MessageSquare },
  ];

  const rightTabs = [
    { id: 'editor', label: 'Code Editor', icon: Code },
    { id: 'testcases', label: 'Test Cases', icon: Target },
    { id: 'results', label: 'Results', icon: BarChart3 },
  ];

  const languages = [
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'javascript', label: 'JavaScript' }
  ];

  if (loading && !problem) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading problem" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <WaterfallEffect trigger={showWaterfall} />
      
      {/* Header */}
      <motion.div
        className="glass-dark border-b border-gray-800 px-6 py-4 relative z-30"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {problem && (
              <div className="flex items-center space-x-6">
                <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                
                <div className="flex items-center space-x-4">
                  <StopwatchTimer />
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all"
                  >
                    <StickyNote className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Notes</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {problem.isPremium && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-medium">Premium</span>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* <div className="flex items-center space-x-4">
            <div className="dropdown dropdown-end">
              <motion.div 
                tabIndex={0} 
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2">{user?.firstName}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
              <ul className="mt-2 p-2 shadow-lg menu menu-sm dropdown-content glass-dark rounded-lg w-52 border border-gray-700 z-50">
                <li>
                  <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 px-3 py-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/favorites')} className="flex items-center space-x-2 px-3 py-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors">
                    <Star className="w-4 h-4" />
                    <span>My Lists</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/')} className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:bg-gray-400/10 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Problems</span>
                  </button>
                </li>
              </ul>
            </div>
          </div> */}
          
          <div><GlobalNavigation/></div>

        </div>
      </motion.div>
      

      <div className="flex-1 overflow-hidden p-2 gap-2 flex">
        {/* Left Panel - 45% width */}
        <div className="w-[45%] flex flex-col bg-gray-800/30 rounded-xl border border-gray-700">
          {/* Left Tabs */}
          <div className="flex bg-gray-800/50 border-b border-gray-700 rounded-t-xl overflow-x-auto">
            {leftTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeLeftTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveLeftTab(tab.id)}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {problem && (
                <motion.div
                  key={activeLeftTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {activeLeftTab === 'description' && (
                    <div className="space-y-6">
                      {problem.isPremium && !problem.hasAccess && (
                        <PremiumButton problem={problem} />
                      )}

                      <div className="flex items-center space-x-4 mb-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium border border-blue-400/20 text-blue-400 bg-blue-400/10">
                          {problem.tags === 'linkedList' ? 'Linked List' : 
                           problem.tags === 'dp' ? 'DP' : 
                           problem.tags.charAt(0).toUpperCase() + problem.tags.slice(1)}
                        </span>
                        {problem.isPremium && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                            <Crown className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-yellow-400 font-medium">Premium</span>
                          </div>
                        )}
                      </div>
                      
                        <div className="flex items-center space-x-3 mb-6">
                          <CompanyNamesButton 
                            problemId={problemId} 
                            problemTitle={problem.title}
                          />
                          <FavoriteButton 
                            problemId={problemId} 
                            problemTitle={problem.title}
                          />
                        </div>

                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                          {problem.hasAccess ? problem.description : 
                           problem.isPremium ? 'This is a premium problem. Upgrade to view the full description.' : 
                           problem.description}
                        </div>
                      </div>

                      {problem.hasAccess && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-white">Examples:</h3>
                          <div className="space-y-4">
                            {problem.visibleTestCases.map((example, index) => (
                              <AnimatedCard key={index} className="bg-gray-800/50">
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
                              </AnimatedCard>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'editorial' && (
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-white">Video Editorial</h2>
                      {problem.isPremium && !problem.hasAccess ? (
                        <PremiumButton problem={problem} />
                      ) : (
                        <Editorial videos={problem.videos} />
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'solutions' && (
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-white">Reference Solutions</h2>
                      {problem.isPremium && !problem.hasAccess ? (
                        <PremiumButton problem={problem} />
                      ) : (
                        <div className="space-y-6">
                          {problem.referenceSolution?.map((solution, index) => (
                            <AnimatedCard key={index}>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-blue-400">{solution?.language}</h3>
                                <span className="text-xs text-gray-400">Reference Solution</span>
                              </div>
                              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                                <pre className="text-sm overflow-x-auto">
                                  <code className="text-gray-300">{solution?.completeCode}</code>
                                </pre>
                              </div>
                            </AnimatedCard>
                          )) || (
                            <AnimatedCard className="text-center py-12">
                              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-400 mb-2">Solutions Locked</h3>
                              <p className="text-gray-500">Solve the problem to unlock reference solutions</p>
                            </AnimatedCard>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'submissions' && (
                    problem.hasAccess ? (
                      <SubmissionHistory 
                        problemId={problemId} 
                        onMoveToEditor={(code, language) => {
                          const validLangs = ['cpp', 'java', 'javascript'];
                          const langId = validLangs.includes(language) ? language : 'cpp';
                          setSelectedLanguage(langId);
                          setTimeout(() => {
                            setCode(code);
                            setCodeByLanguage(prev => ({ ...prev, [langId]: code }));
                          }, 0);
                          setActiveRightTab('editor'); // Only switch right tab, not left
                        }}
                      />
                    ) : (
                      <PremiumButton problem={problem} />
                    )
                  )}

                  {activeLeftTab === 'chatAI' && (
                    problem.hasAccess ? (
                      <ChatAi problem={problem} />
                    ) : (
                      <PremiumButton problem={problem} />
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - 55% width */}
        <div className="w-[55%] flex flex-col bg-gray-800/30 rounded-xl border border-gray-700">
          {/* Right Panel Header with Tabs and Controls */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700 rounded-t-xl bg-gray-800/50">
            {/* Left side - Tab Navigation */}
            <div className="flex space-x-1 bg-gray-700/50 rounded-lg p-1">
              {rightTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all rounded-md ${
                      activeRightTab === tab.id
                        ? 'text-white bg-blue-600 shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveRightTab(tab.id)}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right side - Language Selector and Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Language Dropdown - Only show for editor tab */}
              {activeRightTab === 'editor' && (
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    disabled={problem?.isPremium && !problem?.hasAccess}
                  >
                    <span className="text-white font-medium">
                      {languages.find(lang => lang.id === selectedLanguage)?.label}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showLanguageDropdown && (
                    <motion.div
                      className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedLanguage === lang.id ? 'bg-blue-600 text-white' : 'text-gray-300'
                          }`}
                          onClick={() => handleLanguageChange(lang.id)}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <GradientButton
                  variant="secondary"
                  size="sm"
                  onClick={handleRun}
                  disabled={runLoading || submitLoading || (problem?.isPremium && !problem?.hasAccess)}
                  loading={runLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </GradientButton>
                <GradientButton
                  size="sm"
                  onClick={handleSubmitCode}
                  disabled={runLoading || submitLoading || (problem?.isPremium && !problem?.hasAccess)}
                  loading={submitLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </GradientButton>
              </div>
            </div>
          </div>

          {/* Premium Error */}
          {premiumError && (
            <motion.div
              className="bg-yellow-500/10 border-b border-yellow-500/20 p-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">{premiumError}</span>
              </div>
            </motion.div>
          )}

          {/* Right Panel Content */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRightTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeRightTab === 'editor' && (
                  <div className="h-full">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'line',
                        selectOnLineNumbers: true,
                        roundedSelection: false,
                        readOnly: problem?.isPremium && !problem?.hasAccess,
                        cursorStyle: 'line',
                        mouseWheelZoom: true,
                      }}
                    />
                  </div>
                )}

                {activeRightTab === 'testcases' && (
                  <div className="h-full overflow-y-auto p-6">
                    {/* Test Case Results (summary + merged details) */}
                    {runResult && (
                      <div className={`rounded-lg p-6 border mb-8 ${
                        runResult.success 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        <div className="flex items-center space-x-4 mb-6">
                          {runResult.success ? (
                            <CheckCircle className="w-12 h-12 text-green-400" />
                          ) : (
                            <XCircle className="w-12 h-12 text-red-400" />
                          )}
                          <div>
                            <h4 className={`text-2xl font-bold ${runResult.success ? 'text-green-400' : 'text-red-400'}`}>
                              {runResult.success ? '🎉 Accepted!' : '❌ Wrong Answer'}
                            </h4>
                            <p className="text-gray-300 mt-1">
                              {runResult.success 
                                ? 'Congratulations! Your solution is correct.' 
                                : 'Your solution didn\'t pass all test cases.'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-gray-400 text-sm mb-1">Test Cases</div>
                            <div className="text-2xl font-bold text-white font-mono">
                              {runResult.passedTestCases}/{runResult.totalTestCases}
                            </div>
                            <div className={`text-xs mt-1 ${
                              runResult.success ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {runResult.success ? 'All Passed' : 'Some Failed'}
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-gray-400 text-sm mb-1">Runtime</div>
                            <div className="text-2xl font-bold text-white font-mono">
                              {runResult.runtime}s
                            </div>
                            <div className="text-xs text-blue-400 mt-1">Execution Time</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-gray-400 text-sm mb-1">Memory</div>
                            <div className="text-2xl font-bold text-white font-mono">
                              {runResult.memory} KB
                            </div>
                            <div className="text-xs text-purple-400 mt-1">Memory Used</div>
                          </div>
                        </div>
                        {/* Merged test case results: sample + custom, custom labeled */}
                        <div className="space-y-4">
                          <h5 className="font-semibold text-white mb-3">Test Case Details:</h5>
                          {runResult.testCases && runResult.testCases.map((tc, i) => {
                            const isCustom = i >= (problem?.visibleTestCases?.length || 0);
                            // For custom test cases, show output even if expected_output is missing
                            return (
                              <AnimatedCard key={i} className={`bg-gray-800/50 rounded-lg p-4 border ${isCustom ? 'border-blue-700' : 'border-gray-700'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <h6 className="font-medium text-white">{isCustom ? `Custom Test Case ${i + 1 - (problem?.visibleTestCases?.length || 0)}` : `Test Case ${i + 1}`}</h6>
                                    {isCustom && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 ml-2">Custom</span>
                                    )}
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tc.status_id === 3 
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
                                  </span>
                                </div>
                                <div className="text-sm font-mono space-y-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-gray-400 block mb-1">Input:</span>
                                      <div className="bg-gray-900 rounded p-2 text-green-400 break-all">
                                        {tc.stdin || 'No input'}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block mb-1">Output:</span>
                                      <div className="bg-gray-900 rounded p-2 text-yellow-400 break-all">
                                        {/* Always show output, even for custom test cases */}
                                        {tc.stdout !== undefined && tc.stdout !== null ? tc.stdout : 'No output'}
                                      </div>
                                    </div>
                                  </div>
                                  {tc.stderr && (
                                    <div>
                                      <span className="text-gray-400 block mb-1">Error:</span>
                                      <div className="bg-red-900/20 rounded p-2 text-red-400 break-all">
                                        {tc.stderr}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AnimatedCard>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Sample Test Cases (static, not results) */}
                    {problem?.visibleTestCases && (
                      <div className="mb-8">
                        <h4 className="font-semibold text-blue-400 mb-2">Sample Test Cases</h4>
                        <div className="space-y-4">
                          {problem.visibleTestCases.map((tc, idx) => (
                            <AnimatedCard key={idx} className="bg-gray-800/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-white">Test Case {idx + 1}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                                <div>
                                  <span className="text-gray-400 block mb-1">Input:</span>
                                  <div className="bg-gray-900 rounded p-2 text-green-400 break-all">{tc.input}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Output:</span>
                                  <div className="bg-gray-900 rounded p-2 text-yellow-400 break-all">{tc.output}</div>
                                </div>
                              </div>
                              {tc.explanation && (
                                <div className="mt-2 text-gray-400 text-xs">{tc.explanation}</div>
                              )}
                            </AnimatedCard>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Custom Test Cases Section (static, not results) */}
                    <div className="mb-8">
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold text-blue-400 mr-2">Custom Test Cases</h4>
                        <button
                          className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                          onClick={() => setShowAddCustom((v) => !v)}
                          title="Add Custom Test Case"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {showAddCustom && (
                        <div className="mb-4 flex flex-col md:flex-row gap-2 items-start">
                          <textarea
                            className="dark-input w-full md:w-1/2 px-3 py-2 rounded border border-gray-700 bg-gray-900 text-green-400 font-mono"
                            rows={3}
                            placeholder="Enter custom input..."
                            value={customInput}
                            onChange={e => setCustomInput(e.target.value)}
                          />
                          <textarea
                            className="dark-input w-full md:w-1/2 px-3 py-2 rounded border border-gray-700 bg-gray-900 text-yellow-400 font-mono"
                            rows={3}
                            placeholder="Enter expected output..."
                            value={customOutput}
                            onChange={e => setCustomOutput(e.target.value)}
                          />
                          <GradientButton
                            size="sm"
                            className="mt-2 md:mt-0"
                            onClick={() => {
                              if (customInput.trim()) {
                                setCustomTestCases(prev => [...prev, { input: customInput, output: customOutput }]);
                                setCustomInput('');
                                setCustomOutput('');
                                setShowAddCustom(false);
                              }
                            }}
                          >Insert Test Case</GradientButton>
                          <div className="text-xs text-gray-400 mt-2 md:ml-2 md:mt-0 max-w-xs">
                            <span>Note: The expected output must match exactly what your code prints for the given input, otherwise the test will fail.</span>
                          </div>
                        </div>
                      )}
                      {/* List of custom test cases */}
                      {customTestCases.length > 0 && (
                        <div className="space-y-4">
                          {customTestCases.map((tc, idx) => (
                            <AnimatedCard key={idx} className="bg-gray-800/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-white">Custom Test Case {idx + 1}</span>
                                <div className="flex gap-2">
                                  <button
                                    className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                    title="Edit"
                                    onClick={() => {
                                      setEditingIdx(idx);
                                      setEditInput(tc.input);
                                      setEditOutput(tc.output);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="p-1 rounded bg-red-600 hover:bg-red-700 text-white"
                                    title="Delete"
                                    onClick={() => {
                                      setCustomTestCases(prev => prev.filter((_, i) => i !== idx));
                                      if (editingIdx === idx) setEditingIdx(null);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {editingIdx === idx ? (
                                <div className="flex flex-col md:flex-row gap-2 items-start">
                                  <textarea
                                    className="dark-input w-full md:w-1/2 px-3 py-2 rounded border border-gray-700 bg-gray-900 text-green-400 font-mono"
                                    rows={3}
                                    value={editInput}
                                    onChange={e => setEditInput(e.target.value)}
                                  />
                                  <textarea
                                    className="dark-input w-full md:w-1/2 px-3 py-2 rounded border border-gray-700 bg-gray-900 text-yellow-400 font-mono"
                                    rows={3}
                                    value={editOutput}
                                    onChange={e => setEditOutput(e.target.value)}
                                  />
                                  <button
                                    className="p-2 rounded bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                    title="Save"
                                    onClick={() => {
                                      setCustomTestCases(prev => prev.map((item, i) => i === idx ? { input: editInput, output: editOutput } : item));
                                      setEditingIdx(null);
                                    }}
                                  >
                                    <Save className="w-4 h-4" /> Save
                                  </button>
                                  <button
                                    className="p-2 rounded bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-1"
                                    title="Cancel"
                                    onClick={() => setEditingIdx(null)}
                                  >
                                    <X className="w-4 h-4" /> Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                                  <div>
                                    <span className="text-gray-400 block mb-1">Input:</span>
                                    <div className="bg-gray-900 rounded p-2 text-green-400 break-all">{tc.input}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block mb-1">Expected Output:</span>
                                    <div className="bg-gray-900 rounded p-2 text-yellow-400 break-all">{tc.output}</div>
                                  </div>
                                </div>
                              )}
                            </AnimatedCard>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeRightTab === 'results' && (
                  <div className="h-full overflow-y-auto p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-semibold text-white">Submission Results</h3>
                      {submitLoading && <LoadingSpinner size="sm" />}
                    </div>
                    
                    {premiumError ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <Lock className="w-6 h-6 text-yellow-400" />
                          <h4 className="text-lg font-bold text-yellow-400">Premium Feature</h4>
                        </div>
                        <p className="text-gray-300">{premiumError}</p>
                      </div>
                    ) : submitResult ? (
                      <div className={`rounded-lg p-6 border ${
                        submitResult.accepted 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        <div className="flex items-center space-x-4 mb-6">
                          {submitResult.accepted ? (
                            <CheckCircle className="w-12 h-12 text-green-400" />
                          ) : (
                            <XCircle className="w-12 h-12 text-red-400" />
                          )}
                          <div>
                            <h4 className={`text-2xl font-bold ${submitResult.accepted ? 'text-green-400' : 'text-red-400'}`}>
                              {submitResult.accepted ? '🎉 Accepted!' : '❌ Wrong Answer'}
                            </h4>
                            <p className="text-gray-300 mt-1">
                              {submitResult.accepted 
                                ? 'Congratulations! Your solution is correct.' 
                                : 'Your solution didn\'t pass all test cases.'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-gray-400 text-sm mb-1">Test Cases</div>
                            <div className="text-2xl font-bold text-white font-mono">
                              {submitResult.passedTestCases}/{submitResult.totalTestCases}
                            </div>
                            <div className={`text-xs mt-1 ${
                              submitResult.accepted ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {submitResult.accepted ? 'All Passed' : 'Some Failed'}
                            </div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-gray-400 text-sm mb-1">Runtime</div>
                            <div className="text-2xl font-bold text-white font-mono">
                              {submitResult.runtime}s
                            </div>
                            <div className="text-xs text-blue-400 mt-1">Execution Time</div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <div className="text-gray-400 text-sm mb-1">Memory</div>
                            <div className="text-2xl font-bold text-white font-mono">
                              {submitResult.memory} KB
                            </div>
                            <div className="text-xs text-purple-400 mt-1">Memory Used</div>
                          </div>
                        </div>
                        {/* Complexity Analysis Button - Only show for accepted submissions */}
                        {submitResult.accepted && (
                          <div className="mt-6">
                            <GradientButton
                              onClick={handleAnalyzeComplexity}
                              disabled={analyzingComplexity}
                              loading={analyzingComplexity}
                              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                            >
                              <BarChart3 className="w-5 h-5 mr-2" />
                              {analyzingComplexity ? 'Analyzing...' : 'Analyze Time & Space Complexity'}
                            </GradientButton>
                          </div>
                        )}

                        {/* Complexity Analysis Results */}
                        <AnimatePresence>
                          {showComplexityAnalysis && complexityAnalysis && (
                            <motion.div
                              className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-6"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <BarChart3 className="w-6 h-6 text-purple-400" />
                                  <h5 className="text-lg font-semibold text-purple-400">Complexity Analysis</h5>
                                </div>
                                <button
                                  onClick={() => setShowComplexityAnalysis(false)}
                                  className="text-gray-400 hover:text-white transition-colors"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </div>
                              
                              <div className="prose prose-invert prose-purple max-w-none">
                                <div 
                                  className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: complexityAnalysis
                                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-400">$1</strong>')
                                      .replace(/## (.*?)$/gm, '<h3 class="text-lg font-semibold text-purple-300 mt-4 mb-2">$1</h3>')
                                      .replace(/- \*\*(.*?)\*\*: (.*?)$/gm, '<div class="mb-2"><span class="font-semibold text-purple-400">$1:</span> <span class="text-gray-300">$2</span></div>')
                                      .replace(/O\(([^)]+)\)/g, '<code class="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-sm">O($1)</code>')
                                      .replace(/\n\n/g, '<br><br>')
                                  }}
                                />
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-purple-500/20">
                                <div className="flex items-center space-x-2 text-xs text-purple-400">
                                  <Zap className="w-4 h-4" />
                                  <span>Analysis powered by AI • Results may vary based on implementation details</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {submitResult.accepted && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Zap className="w-5 h-5 text-green-400" />
                              <span className="font-semibold text-green-400">Great job!</span>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Your solution has been accepted. You can now view the editorial and explore other solutions.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-400 mb-2">No submission results yet</h4>
                        <p className="text-gray-500">Click "Submit" to submit your solution for evaluation</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        problemId={problemId}
        problemTitle={problem?.title}
      />

      {/* Streak Celebration Modal */}
      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakInfo={streakCelebrationData}
      />
    </div>
  );
};

export default ProblemPage;