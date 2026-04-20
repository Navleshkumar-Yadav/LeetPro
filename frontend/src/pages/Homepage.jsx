import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle,
  Clock,
  Code,
  Trophy,
  Crown,
  Lock,
  Star,
  Gift,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import WaterfallEffect from '../components/WaterfallEffect.jsx';
import ActivityCalendar from '../components/ActivityCalendar.jsx';
import StreakDisplay from '../components/StreakDisplay.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';
import DailyPlanner from '../components/DailyPlanner.jsx';

const emptyStats = {
  total: 0,
  free: 0,
  premium: 0,
  easy: 0,
  medium: 0,
  hard: 0,
};

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [catalogStats, setCatalogStats] = useState(emptyStats);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [listMeta, setListMeta] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
  });
  const [listLoaded, setListLoaded] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showWaterfall, setShowWaterfall] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  const PROBLEMS_PER_PAGE = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev !== searchTerm) {
          setCurrentPage(1);
        }
        return searchTerm;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { data } = await axiosClient.get('/problem/catalogStats', {
          signal: ac.signal,
        });
        setCatalogStats(data);
        setCatalogLoaded(true);
      } catch (e) {
        if (e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError') return;
        console.error('Error loading catalog stats:', e);
        setCatalogLoaded(true);
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!user) {
      setSolvedProblems([]);
      setSubscriptionStatus({ hasActiveSubscription: false });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [solvedRes, subscriptionRes] = await Promise.all([
          axiosClient.get('/problem/problemSolvedByUser'),
          axiosClient.get('/payment/subscription-status'),
        ]);
        if (!cancelled) {
          setSolvedProblems(solvedRes.data);
          setSubscriptionStatus(subscriptionRes.data);
        }
      } catch (e) {
        if (!cancelled) console.error('Error fetching user data:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setListLoading(true);
        const { data } = await axiosClient.get('/problem/getAllProblem', {
          signal: ac.signal,
          params: {
            page: currentPage,
            limit: PROBLEMS_PER_PAGE,
            search: debouncedSearch,
            difficulty: filters.difficulty,
            tag: filters.tag,
            status: filters.status,
            premiumOnly: showPremiumOnly,
          },
        });
        setProblems(data.problems);
        setListMeta({
          total: data.total,
          totalPages: data.totalPages,
          page: data.page,
        });
        setListLoaded(true);
      } catch (e) {
        if (e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError') {
          return;
        }
        console.error('Error fetching problems:', e);
      } finally {
        setListLoading(false);
      }
    })();
    return () => ac.abort();
  }, [
    currentPage,
    debouncedSearch,
    filters.difficulty,
    filters.tag,
    filters.status,
    showPremiumOnly,
  ]);

  const handlePremiumToggle = () => {
    setShowPremiumOnly(!showPremiumOnly);
    setFilters({
      difficulty: 'all',
      tag: 'all',
      status: 'all',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { total, totalPages, page } = listMeta;
  const startIndex = (page - 1) * PROBLEMS_PER_PAGE;
  const endIndex = Math.min(page * PROBLEMS_PER_PAGE, total);

  const stats = {
    total: catalogStats.total,
    solved: solvedProblems.length,
    premium: catalogStats.premium,
    free: catalogStats.free,
    easy: catalogStats.easy,
    medium: catalogStats.medium,
    hard: catalogStats.hard,
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
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

  const solvedFree = solvedProblems.filter((sp) => !sp.isPremium).length;
  const solvedPremium = solvedProblems.filter((sp) => sp.isPremium).length;

  const bootReady = catalogLoaded && listLoaded;

  if (!bootReady) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading problems" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-900 text-white ${listLoading ? 'opacity-90' : ''}`}
    >
      <WaterfallEffect trigger={showWaterfall} />

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
                  CodeForge
                </NavLink>
              </div>

              <div className="flex items-center space-x-4">
                <NavLink
                  to="/favorites"
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/30 rounded-lg transition-all group"
                >
                  <Star className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-yellow-400 font-medium">My Lists</span>
                </NavLink>

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
                    Solved: {showPremiumOnly ? solvedPremium : solvedFree}/
                    {showPremiumOnly ? stats.premium : stats.free}
                  </span>
                </div>
                <StreakDisplay showDetails={false} />
                {subscriptionStatus?.hasActiveSubscription && (
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">Premium Active</span>
                  </div>
                )}
              </div>

              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
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
                    <h2 className="text-2xl font-bold text-yellow-400">
                      Premium Problems
                    </h2>
                    <p className="text-gray-300">
                      Exclusive challenges for premium subscribers
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-300">
                    Total Premium Problems: {stats.premium}
                  </span>
                  {!subscriptionStatus?.hasActiveSubscription && (
                    <NavLink to="/premium">
                      <GradientButton
                        size="sm"
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </GradientButton>
                    </NavLink>
                  )}
                </div>
              </motion.div>
            )}

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
                    placeholder={
                      showPremiumOnly
                        ? 'Search premium problems...'
                        : 'Search problems...'
                    }
                    className="dark-input w-full pl-10 pr-4 py-3 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    className="dark-input px-4 py-3 rounded-lg min-w-[120px]"
                    value={filters.status}
                    onChange={(e) => {
                      setFilters({ ...filters, status: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="solved">Solved</option>
                    <option value="unsolved">Unsolved</option>
                  </select>

                  <select
                    className="dark-input px-4 py-3 rounded-lg min-w-[120px]"
                    value={filters.difficulty}
                    onChange={(e) => {
                      setFilters({ ...filters, difficulty: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <select
                    className="dark-input px-4 py-3 rounded-lg min-w-[120px]"
                    value={filters.tag}
                    onChange={(e) => {
                      setFilters({ ...filters, tag: e.target.value });
                      setCurrentPage(1);
                    }}
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

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <AnimatePresence>
                {problems.map((problem, index) => {
                  const isSolved = solvedProblems.some(
                    (sp) => sp._id === problem._id
                  );
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
                              <span className="text-xs text-yellow-400 font-medium">
                                Premium
                              </span>
                            </div>
                          )}

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}
                          >
                            {problem.difficulty.charAt(0).toUpperCase() +
                              problem.difficulty.slice(1)}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getTagColor(problem.tags)}`}
                          >
                            {problem.tags === 'linkedList'
                              ? 'Linked List'
                              : problem.tags === 'dp'
                                ? 'DP'
                                : problem.tags.charAt(0).toUpperCase() +
                                  problem.tags.slice(1)}
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
                              <GradientButton
                                size="sm"
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                              >
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

              {problems.length === 0 && !listLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No problems found
                  </h3>
                  <p className="text-gray-500">
                    {showPremiumOnly
                      ? 'No premium problems match your search criteria'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {showPremiumOnly && (
                    <button
                      type="button"
                      onClick={handlePremiumToggle}
                      className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      ← Back to all problems
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>

            {totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center space-x-2 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <AnimatedCard className="flex items-center space-x-2 p-4">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Previous</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => {
                        const showPage =
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - page) <= 2;

                        if (!showPage) {
                          if (p === page - 3 || p === page + 3) {
                            return (
                              <span key={p} className="px-2 py-1 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              page === p
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <span className="text-sm">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </AnimatedCard>
              </motion.div>
            )}

            {total > 0 && (
              <motion.div
                className="text-center text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                Showing {startIndex + 1}-{endIndex} of {total} problems
                {totalPages > 1 && (
                  <span className="ml-2">
                    • Page {page} of {totalPages}
                  </span>
                )}
              </motion.div>
            )}
          </div>

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

