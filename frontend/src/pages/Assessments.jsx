import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Code, 
  Trophy,
  Crown,
  Lock,
  Play,
  Users,
  Target,
  Zap,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const Assessments = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/assessment/all');
      // Sort: free first, then premium
      const sorted = response.data.assessments.slice().sort((a, b) => {
        if (a.isPremium === b.isPremium) return 0;
        return a.isPremium ? 1 : -1;
      });
      setAssessments(sorted);
      setHasActiveSubscription(response.data.hasActiveSubscription);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessmentId, hasAccess) => {
    if (!hasAccess) {
      navigate('/premium');
      return;
    }
    navigate(`/assessment/${assessmentId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'mcq' ? FileText : Code;
  };

  const getCompanyLogo = (company) => {
    const logos = {
      'Google': '🔍',
      'Meta': '📘',
      'Uber': '🚗',
      'Microsoft': '🪟'
    };
    return logos[company] || '🏢';
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'mcq') return assessment.type === 'mcq';
    if (selectedCategory === 'coding') return assessment.type === 'coding';
    if (selectedCategory === 'premium') return assessment.isPremium;
    return true;
  });

  const categories = [
    { id: 'all', label: 'All Assessments', icon: Target },
    { id: 'mcq', label: 'MCQ Tests', icon: FileText },
    { id: 'coding', label: 'Coding Tests', icon: Code },
    { id: 'premium', label: 'Premium', icon: Crown }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading assessments..." />
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold gradient-text">Assessments</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {hasActiveSubscription && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Premium Active</span>
                </div>
              )}
              <span className="text-sm text-gray-400">{filteredAssessments.length} assessments</span>
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Test Your Skills
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Challenge yourself with our comprehensive assessments covering technical knowledge and coding skills
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Assessments Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredAssessments.map((assessment, index) => {
              const TypeIcon = getTypeIcon(assessment.type);
              const hasAccess = assessment.hasAccess;
              
              return (
                <motion.div
                  key={assessment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group"
                >
                  <AnimatedCard className={`h-full relative overflow-hidden ${
                    !hasAccess ? 'opacity-75' : ''
                  }`}>
                    {/* Premium Badge */}
                    {assessment.isPremium && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">Premium</span>
                        </div>
                      </div>
                    )}

                    {/* Lock Overlay for Premium */}
                    {assessment.isPremium && !hasAccess && (
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-xl z-20 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <span className="text-yellow-400 text-sm font-medium">Premium Required</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${
                          assessment.type === 'mcq' 
                            ? 'bg-blue-500/20 border border-blue-500/30' 
                            : 'bg-purple-500/20 border border-purple-500/30'
                        }`}>
                          <TypeIcon className={`w-6 h-6 ${
                            assessment.type === 'mcq' ? 'text-blue-400' : 'text-purple-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {assessment.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {assessment.description}
                          </p>
                        </div>
                      </div>

                      {/* Company Badge */}
                      {assessment.category === 'company' && (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-lg">
                          <span className="text-lg">{getCompanyLogo(assessment.company)}</span>
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{assessment.company}</span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-semibold">{assessment.duration}</span>
                          </div>
                          <span className="text-xs text-gray-400">Minutes</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-semibold">{assessment.totalQuestions}</span>
                          </div>
                          <span className="text-xs text-gray-400">Questions</span>
                        </div>
                      </div>

                      {/* Difficulty & Type */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(assessment.difficulty)}`}>
                          {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                          {assessment.type === 'mcq' ? 'Multiple Choice' : 'Coding Challenge'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <GradientButton
                          onClick={() => handleStartAssessment(assessment._id, hasAccess)}
                          className={`w-full justify-center ${
                            !hasAccess 
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black' 
                              : ''
                          }`}
                          disabled={assessment.isPremium && !hasAccess ? false : false}
                        >
                          {!hasAccess ? (
                            <>
                              <Crown className="w-4 h-4 mr-2" />
                              Upgrade to Access
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Assessment
                            </>
                          )}
                        </GradientButton>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAssessments.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No assessments found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <AnimatedCard className="text-center">
            <FileText className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {assessments.filter(a => a.type === 'mcq').length}
            </div>
            <div className="text-sm text-gray-400">MCQ Tests</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <Code className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {assessments.filter(a => a.type === 'coding').length}
            </div>
            <div className="text-sm text-gray-400">Coding Tests</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {assessments.filter(a => a.isPremium).length}
            </div>
            <div className="text-sm text-gray-400">Premium Tests</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center">
            <Building2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">4</div>
            <div className="text-sm text-gray-400">Companies</div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Assessments;