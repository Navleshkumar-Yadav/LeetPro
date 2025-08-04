import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  List, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Globe,
  Lock,
  CheckCircle,
  Clock,
  Crown,
  Building2
} from 'lucide-react';
import { useNavigate, NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const FavoriteLists = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPublic, setNewListPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/favorites/lists');
      setLists(response.data.lists);
      
      // Select the first list by default (usually "Favorite")
      if (response.data.lists.length > 0) {
        setSelectedList(response.data.lists[0]);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    try {
      setCreating(true);
      const response = await axiosClient.post('/favorites/lists', {
        name: newListName.trim(),
        description: newListDescription.trim(),
        isPublic: newListPublic
      });

      const newList = response.data.list;
      setLists([...lists, newList]);
      setNewListName('');
      setNewListDescription('');
      setNewListPublic(false);
      setShowCreateForm(false);
      setSelectedList(newList);
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      await axiosClient.delete(`/favorites/lists/${listId}`);
      const updatedLists = lists.filter(list => list.id !== listId);
      setLists(updatedLists);
      
      if (selectedList?.id === listId) {
        setSelectedList(updatedLists[0] || null);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleRemoveProblem = async (problemId) => {
    if (!selectedList) return;

    try {
      await axiosClient.delete(`/favorites/lists/${selectedList.id}/problems/${problemId}`);
      
      // Update the selected list
      const updatedList = {
        ...selectedList,
        problems: selectedList.problems.filter(p => p.id !== problemId),
        problemCount: selectedList.problemCount - 1
      };
      setSelectedList(updatedList);
      
      // Update the lists array
      setLists(lists.map(list => 
        list.id === selectedList.id ? updatedList : list
      ));
    } catch (error) {
      console.error('Error removing problem:', error);
    }
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

  const filteredProblems = selectedList?.problems?.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading favorite lists..." />
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
                <Star className="w-6 h-6 text-yellow-400" />
                <h1 className="text-2xl font-bold gradient-text">My Lists</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {lists.length} lists • {selectedList?.problemCount || 0} problems
              </div>
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Lists */}
          <div className="lg:col-span-1">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Lists Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">My Lists</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Create New List Form */}
              <AnimatePresence>
                {showCreateForm && (
                  <motion.div
                    className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="dark-input w-full px-3 py-2 rounded-lg"
                      placeholder="List name"
                      maxLength={100}
                    />
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      className="dark-input w-full px-3 py-2 rounded-lg h-20 resize-none"
                      placeholder="Description (optional)"
                      maxLength={500}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="newListPublic"
                        checked={newListPublic}
                        onChange={(e) => setNewListPublic(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600"
                      />
                      <label htmlFor="newListPublic" className="text-sm text-gray-300">
                        Make public
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewListName('');
                          setNewListDescription('');
                          setNewListPublic(false);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <GradientButton
                        onClick={handleCreateList}
                        disabled={creating || !newListName.trim()}
                        loading={creating}
                        className="flex-1"
                        size="sm"
                      >
                        Create
                      </GradientButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lists */}
              <div className="space-y-2">
                {lists.map((list, index) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedList?.id === list.id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedList(list)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {list.isDefault ? (
                          <Heart className="w-5 h-5 text-red-400" />
                        ) : (
                          <List className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <h3 className="font-medium text-white">{list.name}</h3>
                          <p className="text-xs text-gray-400">{list.problemCount} problems</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {list.isPublic ? (
                          <Globe className="w-4 h-4 text-green-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-500" />
                        )}
                        {!list.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteList(list.id);
                            }}
                            className="p-1 hover:bg-red-600/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    {list.description && (
                      <p className="text-xs text-gray-500 mt-2">{list.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Content - Problems */}
          <div className="lg:col-span-3">
            {selectedList ? (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* List Header */}
                <AnimatedCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {selectedList.isDefault ? (
                        <div className="p-3 bg-red-500/20 rounded-full">
                          <Heart className="w-6 h-6 text-red-400" />
                        </div>
                      ) : (
                        <div className="p-3 bg-blue-500/20 rounded-full">
                          <List className="w-6 h-6 text-blue-400" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedList.name}</h2>
                        <p className="text-gray-400">{selectedList.problemCount} problems</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedList.isPublic ? (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                          <Globe className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">Public</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded-full">
                          <Lock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Private</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedList.description && (
                    <p className="text-gray-300">{selectedList.description}</p>
                  )}
                </AnimatedCard>

                {/* Search and Filters */}
                <AnimatedCard>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search problems..."
                        className="dark-input w-full pl-10 pr-4 py-3 rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Filter className="w-5 h-5 text-gray-400" />
                      <select
                        className="dark-input px-4 py-3 rounded-lg min-w-[120px]"
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                      >
                        <option value="all">All Levels</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Problems List */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredProblems.map((problem, index) => (
                      <motion.div
                        key={problem.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <AnimatedCard className="hover:border-blue-500/30 transition-colors duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="text-gray-400 font-mono text-sm min-w-[60px]">
                                #{index + 1}
                              </div>
                              
                              <div className="flex-1">
                                <NavLink 
                                  to={`/problem/${problem.id}`} 
                                  className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                                >
                                  {problem.title}
                                </NavLink>
                                <div className="flex items-center space-x-3 mt-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTagColor(problem.tags)}`}>
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
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-400">
                                Added {new Date(problem.addedAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => handleRemoveProblem(problem.id)}
                                className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                                title="Remove from list"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </AnimatedCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredProblems.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">
                        {selectedList.problemCount === 0 ? 'No problems yet' : 'No problems found'}
                      </h3>
                      <p className="text-gray-500">
                        {selectedList.problemCount === 0 
                          ? 'Start adding problems to your list!' 
                          : 'Try adjusting your search or filters'
                        }
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <List className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No lists yet</h3>
                <p className="text-gray-500 mb-6">Create your first list to get started!</p>
                <GradientButton onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create List
                </GradientButton>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteLists;