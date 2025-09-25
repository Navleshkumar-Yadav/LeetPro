import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Plus, Calendar, Target, Users, Clock, Save, X } from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from './AnimatedCard.jsx';
import GradientButton from './GradientButton.jsx';

const CreateContest = () => {
  const [showContestModal, setShowContestModal] = useState(false);
  const [problemsList, setProblemsList] = useState([]);
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
  const [contestLoading, setContestLoading] = useState(false);
  const [contestError, setContestError] = useState('');

  useEffect(() => {
    if (showContestModal) {
      axiosClient.get('/problem/getAllProblem').then(res => {
        setProblemsList(res.data || []);
      });
    }
  }, [showContestModal]);

  const handleContestFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContestForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProblemChange = (idx, field, value) => {
    const newProblems = [...contestForm.problems];
    newProblems[idx][field] = field === 'marks' ? Number(value) : value;
    setContestForm(prev => ({ ...prev, problems: newProblems }));
  };

  const addProblemSlot = () => {
    setContestForm(prev => ({
      ...prev,
      problems: [...prev.problems, { problemId: '', marks: 100 }]
    }));
  };

  const removeProblemSlot = (idx) => {
    if (contestForm.problems.length > 1) {
      const newProblems = contestForm.problems.filter((_, i) => i !== idx);
      setContestForm(prev => ({ ...prev, problems: newProblems }));
    }
  };

  const validateForm = () => {
    if (!contestForm.name.trim()) {
      setContestError('Contest name is required');
      return false;
    }
    
    if (!contestForm.description.trim()) {
      setContestError('Contest description is required');
      return false;
    }
    
    if (!contestForm.startTime || !contestForm.endTime) {
      setContestError('Start and end times are required');
      return false;
    }
    
    if (new Date(contestForm.startTime) >= new Date(contestForm.endTime)) {
      setContestError('End time must be after start time');
      return false;
    }
    
    if (new Date(contestForm.startTime) <= new Date()) {
      setContestError('Start time must be in the future');
      return false;
    }
    
    const validProblems = contestForm.problems.filter(p => p.problemId && p.marks > 0);
    if (validProblems.length === 0) {
      setContestError('At least one problem is required');
      return false;
    }
    
    setContestError('');
    return true;
  };

  const handleCreateContest = async () => {
    if (!validateForm()) return;
    
    setContestLoading(true);
    setContestError('');
    
    try {
      // Filter out empty problems
      const validProblems = contestForm.problems.filter(p => p.problemId && p.marks > 0);
      
      const contestData = {
        ...contestForm,
        problems: validProblems
      };
      
      await axiosClient.post('/contest/create', contestData);
      
      setShowContestModal(false);
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
      
      // Show success message or redirect
      // Trigger a custom event or callback to refresh the parent component
      if (window.contestCreated) {
        window.contestCreated();
      }
    } catch (err) {
      setContestError(err?.response?.data?.message || 'Failed to create contest');
    } finally {
      setContestLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="w-full max-w-md"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatedCard className="text-center p-8 border border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 transition-colors cursor-pointer">
          <Crown className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3 text-blue-300">Create Contest</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Schedule a new coding contest with custom problems, timing, and participant limits.
          </p>
          <GradientButton 
            onClick={() => setShowContestModal(true)} 
            className="w-full py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Contest
          </GradientButton>
        </AnimatedCard>
      </motion.div>

      {/* Contest Creation Modal */}
      {showContestModal && (
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
                  <h2 className="text-2xl font-bold text-white">Schedule New Contest</h2>
                </div>
                <button
                  onClick={() => setShowContestModal(false)}
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
                      onChange={handleContestFormChange}
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
                      onChange={handleContestFormChange}
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
                      onChange={handleContestFormChange}
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
                        onChange={handleContestFormChange}
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
                        onChange={handleContestFormChange}
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
                      onChange={handleContestFormChange}
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
                      onChange={handleContestFormChange}
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
                              {problemsList.map(prob => (
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

              {/* Error Message */}
              {contestError && (
                <motion.div
                  className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-red-400 text-sm">{contestError}</div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowContestModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={contestLoading}
                >
                  Cancel
                </button>
                <GradientButton
                  onClick={handleCreateContest}
                  disabled={contestLoading}
                  loading={contestLoading}
                  className="px-6 py-3"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {contestLoading ? 'Creating...' : 'Create Contest'}
                </GradientButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default CreateContest;