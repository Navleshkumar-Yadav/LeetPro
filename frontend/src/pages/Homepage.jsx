import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Code,
  Trophy,
  Target,
  Zap,
  Crown,
  Lock,
  User,
  Star,
  Heart,
  Building2,
  Gift,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import { logoutUser } from '../authSlice.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import WaterfallEffect from '../components/WaterfallEffect.jsx';
import ActivityCalendar from '../components/ActivityCalendar.jsx';
import StreakDisplay from '../components/StreakDisplay.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';
import DailyPlanner from '../components/DailyPlanner.jsx';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWaterfall, setShowWaterfall] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  const PROBLEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [problemsRes, solvedRes, subscriptionRes] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] }),
          user ? axiosClient.get('/payment/subscription-status') : Promise.resolve({ data: { hasActiveSubscription: false } })
        ]);
        
        setProblems(problemsRes.data);
        setSolvedProblems(solvedRes.data);
        setSubscriptionStatus(subscriptionRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, showPremiumOnly]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    setSubscriptionStatus(null);
    setShowWaterfall(true);
  };

  const handlePremiumToggle = () => {
    setShowPremiumOnly(!showPremiumOnly);
    // Reset other filters when toggling premium view
    if (!showPremiumOnly) {
      setFilters({
        difficulty: 'all',
        tag: 'all',
        status: 'all'
      });
    } else {
      setFilters({
        difficulty: 'all',
        tag: 'all',
        status: 'all'
      });
    }
  };

  const filteredProblems = problems.filter(problem => {
    // If showing premium only, filter to premium problems
    if (showPremiumOnly) {
      if (!problem.isPremium) return false;
    } else {
      // Default view: exclude premium problems
      if (problem.isPremium) return false;
    }
    
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const matchesTag = filters.tag === 'all' || problem.tags === filters.tag;
    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'solved' && isSolved) ||
                         (filters.status === 'unsolved' && !isSolved);
    
    return matchesSearch && matchesDifficulty && matchesTag && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const endIndex = startIndex + PROBLEMS_PER_PAGE;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = {
    total: problems.length,
    solved: solvedProblems.length,
    premium: problems.filter(p => p.isPremium).length,
    free: problems.filter(p => !p.isPremium).length,
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length,
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTagColor = (tag) => {
    const colors = {
      array: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      linkedList: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      graph: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
      dp: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    };
    return colors[tag] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const hasAccess = (problem) => {
    if (!problem.isPremium) return true;
    return subscriptionStatus?.hasActiveSubscription;
  };

  // Add these derived solved counts before the return statement
  const solvedFree = solvedProblems.filter(sp => {
    const prob = problems.find(p => p._id === sp._id);
    return prob && !prob.isPremium;
  }).length;
  const solvedPremium = solvedProblems.filter(sp => {
    const prob = problems.find(p => p._id === sp._id);
    return prob && prob.isPremium;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading problems" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <WaterfallEffect trigger={showWaterfall} />
      
      {/* Navigation Bar */}
      <motion.nav 
        className="glass-dark border-b border-gray-800 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-4">
                <Code className="w-8 h-8 text-blue-400" />
                <NavLink to="/home" className="text-2xl font-bold gradient-text">
                  LeetPro
                </NavLink>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                {/* Favorite Lists Button */}
                <NavLink 
                  to="/favorites"
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/30 rounded-lg transition-all group"
                >
                  <Star className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-yellow-400 font-medium">My Lists</span>
                </NavLink>

                {/* Premium Button */}
                <motion.button
                  onClick={handlePremiumToggle}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all group ${
                    showPremiumOnly 
                      ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' 
                      : 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20 hover:border-yellow-500/30 text-yellow-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">
                    {showPremiumOnly ? 'Show All' : 'Premium Problems'}
                  </span>
                  {showPremiumOnly && (
                    <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
                      {stats.premium}
                    </span>
                  )}
                </motion.button>
              </div>
              
              {/* Assessment Button */}
              <div className="flex items-center space-x-4">
                <NavLink 
                  to="/assessments"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 rounded-lg transition-all group"
                >
                  <Trophy className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-purple-400 font-medium">Assessments</span>
                </NavLink>
                <NavLink
                  to="/store"
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/30 rounded-lg transition-all group"
                >
                  <Gift className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-yellow-400 font-medium">Store</span>
                </NavLink>
                <NavLink
                  to="/contest"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 rounded-lg transition-all group"
                >
                  <Trophy className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-blue-400 font-medium">Contest</span>
                </NavLink>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">
                    Solved: {showPremiumOnly ? solvedPremium : solvedFree}/{showPremiumOnly ? stats.premium : stats.free}
                  </span>
                </div>
                {/* Streak Display - only show current streak, not max streak */}
                <StreakDisplay showDetails={false} />
                {subscriptionStatus?.hasActiveSubscription && (
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">Premium Active</span>
                  </div>
                )}
              </div>
              
              <GlobalNavigation/>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Problems List */}
          <div className="lg:col-span-3 space-y-8">
            {/* Premium Header */}
            {showPremiumOnly && (
              <motion.div
                className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-400">Premium Problems</h2>
                    <p className="text-gray-300">Exclusive challenges for premium subscribers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-300">Total Premium Problems: {stats.premium}</span>
                  {!subscriptionStatus?.hasActiveSubscription && (
                    <NavLink to="/premium">
                      <GradientButton size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </GradientButton>
                    </NavLink>
                  )}
                </div>
              </motion.div>
            )}

            {/* Search and Filters */}
            <motion.div 
              className="glass-dark rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={showPremiumOnly ? "Search premium problems..." : "Search problems..."}
                    className="dark-input w-full pl-10 pr-4 py-3 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3">
                  <select 
                    className="dark-input px-4 py-3 rounded-lg min-w-[120px]"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Status</option>
                    <option value="solved">Solved</option>
                    <option value="unsolved">Unsolved</option>
                  </select>

                  <select 
                    className="dark-input px-4 py-3 rounded-lg min-w-[120px]"
                    value={filters.difficulty}
                    onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <select 
                    className="dark-input px-4 py-3 rounded-lg min-w-[120px]"
                    value={filters.tag}
                    onChange={(e) => setFilters({...filters, tag: e.target.value})}
                  >
                    <option value="all">All Topics</option>
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Problems List */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <AnimatePresence>
                {currentProblems.map((problem, index) => {
                  const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                  const userHasAccess = hasAccess(problem);
                  const globalIndex = startIndex + index;
                  
                  return (
                    <motion.div
                      key={problem._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`dark-card rounded-xl p-6 hover-lift border border-gray-700 ${
                        problem.isPremium && !userHasAccess ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-3">
                            {problem.isPremium && !userHasAccess ? (
                              <Lock className="w-6 h-6 text-yellow-400" />
                            ) : isSolved ? (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            ) : (
                              <Clock className="w-6 h-6 text-gray-500" />
                            )}
                            <span className="text-gray-400 font-mono text-sm">
                              #{globalIndex + 1}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            {userHasAccess ? (
                              <NavLink 
                                to={`/problem/${problem._id}`} 
                                className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                              >
                                {problem.title}
                              </NavLink>
                            ) : (
                              <div className="text-lg font-semibold text-gray-400">
                                {problem.title}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {problem.isPremium && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                              <Crown className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-yellow-400 font-medium">Premium</span>
                            </div>
                          )}
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTagColor(problem.tags)}`}>
                            {problem.tags === 'linkedList' ? 'Linked List' : 
                             problem.tags === 'dp' ? 'DP' : 
                             problem.tags.charAt(0).toUpperCase() + problem.tags.slice(1)}
                          </span>
                          
                          {isSolved && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 bg-green-400 rounded-full"
                            />
                          )}

                          {problem.isPremium && !userHasAccess && (
                            <NavLink to="/premium">
                              <GradientButton size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                                <Crown className="w-4 h-4 mr-1" />
                                Unlock
                              </GradientButton>
                            </NavLink>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {currentProblems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No problems found</h3>
                  <p className="text-gray-500">
                    {showPremiumOnly 
                      ? "No premium problems match your search criteria" 
                      : "Try adjusting your search or filters"
                    }
                  </p>
                  {showPremiumOnly && (
                    <button
                      onClick={handlePremiumToggle}
                      className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      ← Back to all problems
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center space-x-2 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <AnimatedCard className="flex items-center space-x-2 p-4">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = page === 1 || 
                                      page === totalPages || 
                                      Math.abs(page - currentPage) <= 2;
                      
                      if (!showPage) {
                        // Show ellipsis
                        if (page === currentPage - 3 || page === currentPage + 3) {
                          return (
                            <span key={page} className="px-2 py-1 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <span className="text-sm">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Pagination Info */}
            {filteredProblems.length > 0 && (
              <motion.div
                className="text-center text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProblems.length)} of {filteredProblems.length} problems
                {totalPages > 1 && (
                  <span className="ml-2">• Page {currentPage} of {totalPages}</span>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Activity Calendar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
             className="space-y-8"
            >
              <ActivityCalendar />
             <DailyPlanner />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;