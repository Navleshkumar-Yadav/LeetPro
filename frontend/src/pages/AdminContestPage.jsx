import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  Plus, 
  Calendar, 
  Users, 
  Trophy,
  Clock,
  Target,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const AdminContestPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [contestForm, setContestForm] = useState({
    name: '',
    description: '',
    instructions: '',
    startTime: '',
    endTime: '',
    maxParticipants: 1000,
    isPublic: true,
    problems: [
      { problemId: '', marks: 100 },
      { problemId: '', marks: 150 },
      { problemId: '', marks: 200 }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [problemsRes, contestsRes] = await Promise.all([
        axiosClient.get('/problem/getAllProblem'),
        axiosClient.get('/contest/admin/all') // Get all contests for admin view
      ]);
      
      setProblems(problemsRes.data || []);
      setContests(contestsRes.data.contests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContestForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProblemChange = (index, field, value) => {
    const newProblems = [...contestForm.problems];
    newProblems[index][field] = field === 'marks' ? Number(value) : value;
    setContestForm(prev => ({ ...prev, problems: newProblems }));
  };

  const addProblemSlot = () => {
    setContestForm(prev => ({
      ...prev,
      problems: [...prev.problems, { problemId: '', marks: 100 }]
    }));
  };

  const removeProblemSlot = (index) => {
    if (contestForm.problems.length > 1) {
      const newProblems = contestForm.problems.filter((_, i) => i !== index);
      setContestForm(prev => ({ ...prev, problems: newProblems }));
    }
  };

  const validateForm = () => {
    if (!contestForm.name.trim()) {
      setMessage({ type: 'error', text: 'Contest name is required' });
      return false;
    }
    
    if (!contestForm.description.trim()) {
      setMessage({ type: 'error', text: 'Contest description is required' });
      return false;
    }
    
    if (!contestForm.startTime || !contestForm.endTime) {
      setMessage({ type: 'error', text: 'Start and end times are required' });
      return false;
    }
    
    if (new Date(contestForm.startTime) >= new Date(contestForm.endTime)) {
      setMessage({ type: 'error', text: 'End time must be after start time' });
      return false;
    }
    
    if (new Date(contestForm.startTime) <= new Date()) {
      setMessage({ type: 'error', text: 'Start time must be in the future' });
      return false;
    }
    
    const validProblems = contestForm.problems.filter(p => p.problemId && p.marks > 0);
    if (validProblems.length === 0) {
      setMessage({ type: 'error', text: 'At least one problem is required' });
      return false;
    }
    
    setMessage({ type: '', text: '' });
    return true;
  };

  const handleCreateContest = async () => {
    if (!validateForm()) return;
    
    setCreating(true);
    
    try {
      // Filter out empty problems
      const validProblems = contestForm.problems.filter(p => p.problemId && p.marks > 0);
      
      const contestData = {
        ...contestForm,
        problems: validProblems
      };
      
      await axiosClient.post('/contest/create', contestData);
      
      setMessage({ type: 'success', text: 'Contest created successfully!' });
      setShowCreateForm(false);
      setContestForm({
        name: '',
        description: '',
        instructions: '',
        startTime: '',
        endTime: '',
        maxParticipants: 1000,
        isPublic: true,
        problems: [
          { problemId: '', marks: 100 },
          { problemId: '', marks: 150 },
          { problemId: '', marks: 200 }
        ]
      });
      
      // Refresh contests list
      fetchData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err?.response?.data?.message || 'Failed to create contest' 
      });
    } finally {
      setCreating(false);
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    if (now < start) return { status: 'upcoming', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    if (now >= start && now <= end) return { status: 'live', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    return { status: 'completed', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading contest data..." />
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
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold gradient-text">Contest Management</h1>
              </div>
            </div>
            <GradientButton
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Contest</span>
            </GradientButton>
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

        {/* Create Contest Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-dark rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="p-8">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-6 h-6 text-blue-400" />
                      <h2 className="text-2xl font-bold text-white">Create New Contest</h2>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Contest Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={contestForm.name}
                          onChange={handleFormChange}
                          className="dark-input w-full px-4 py-3 rounded-lg"
                          placeholder="Weekly Coding Challenge #1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={contestForm.description}
                          onChange={handleFormChange}
                          className="dark-input w-full px-4 py-3 rounded-lg h-24 resize-none"
                          placeholder="Test your coding skills with challenging problems..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Instructions
                        </label>
                        <textarea
                          name="instructions"
                          value={contestForm.instructions}
                          onChange={handleFormChange}
                          className="dark-input w-full px-4 py-3 rounded-lg h-24 resize-none"
                          placeholder="Contest rules and guidelines..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Start Time *
                          </label>
                          <input
                            type="datetime-local"
                            name="startTime"
                            value={contestForm.startTime}
                            onChange={handleFormChange}
                            className="dark-input w-full px-4 py-3 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            End Time *
                          </label>
                          <input
                            type="datetime-local"
                            name="endTime"
                            value={contestForm.endTime}
                            onChange={handleFormChange}
                            className="dark-input w-full px-4 py-3 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Participants
                        </label>
                        <input
                          type="number"
                          name="maxParticipants"
                          value={contestForm.maxParticipants}
                          onChange={handleFormChange}
                          className="dark-input w-full px-4 py-3 rounded-lg"
                          min="1"
                          max="10000"
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="isPublic"
                          name="isPublic"
                          checked={contestForm.isPublic}
                          onChange={handleFormChange}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600"
                        />
                        <label htmlFor="isPublic" className="text-gray-300">
                          Make contest public
                        </label>
                      </div>
                    </div>

                    {/* Problems Selection */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Contest Problems</h3>
                        <button
                          onClick={addProblemSlot}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 text-sm">Add Problem</span>
                        </button>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {contestForm.problems.map((problem, index) => (
                          <motion.div
                            key={index}
                            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-white">Problem {index + 1}</h4>
                              {contestForm.problems.length > 1 && (
                                <button
                                  onClick={() => removeProblemSlot(index)}
                                  className="p-1 hover:bg-red-600/20 rounded transition-colors"
                                >
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                  Select Problem
                                </label>
                                <select
                                  value={problem.problemId}
                                  onChange={(e) => handleProblemChange(index, 'problemId', e.target.value)}
                                  className="dark-input w-full px-3 py-2 rounded"
                                >
                                  <option value="">Choose a problem...</option>
                                  {problems.map(prob => (
                                    <option key={prob._id} value={prob._id}>
                                      {prob.title} ({prob.difficulty})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                  Points
                                </label>
                                <input
                                  type="number"
                                  value={problem.marks}
                                  onChange={(e) => handleProblemChange(index, 'marks', e.target.value)}
                                  className="dark-input w-full px-3 py-2 rounded"
                                  min="1"
                                  max="1000"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Total Points Display */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 font-medium">Total Contest Points:</span>
                          <span className="text-blue-400 font-bold text-lg">
                            {contestForm.problems.reduce((sum, p) => sum + (p.marks || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <GradientButton
                      onClick={handleCreateContest}
                      disabled={creating}
                      loading={creating}
                      className="px-6 py-3"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Create Contest
                    </GradientButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Contests */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Contests</h2>
            <span className="text-sm text-gray-400">{contests.length} contests</span>
          </div>

          {contests.length === 0 ? (
            <AnimatedCard className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No contests yet</h3>
              <p className="text-gray-500 mb-6">Create your first contest to get started</p>
              <GradientButton onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Contest
              </GradientButton>
            </AnimatedCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.map((contest, index) => {
                const contestStatus = getContestStatus(contest);
                
                return (
                  <motion.div
                    key={contest._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <AnimatedCard className="h-full">
                      <div className="space-y-4">
                        {/* Contest Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">{contest.name}</h3>
                            <p className="text-gray-400 text-sm">{contest.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${contestStatus.color}`}>
                            {contestStatus.status.charAt(0).toUpperCase() + contestStatus.status.slice(1)}
                          </span>
                        </div>

                        {/* Contest Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                            <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{contest.problems?.length || 0}</div>
                            <div className="text-xs text-gray-400">Problems</div>
                          </div>
                          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                            <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{contest.participantCount || 0}</div>
                            <div className="text-xs text-gray-400">Participants</div>
                          </div>
                        </div>

                        {/* Contest Timing */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Start: {new Date(contest.startTime).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>End: {new Date(contest.endTime).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <button className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-400 text-sm transition-colors">
                            <Edit className="w-4 h-4 mx-auto" />
                          </button>
                          <button className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors">
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </AnimatedCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminContestPage;