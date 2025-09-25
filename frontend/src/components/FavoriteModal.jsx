import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Plus, 
  Check,
  Heart,
  List,
  Lock,
  Globe
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import GradientButton from './GradientButton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const FavoriteModal = ({ isOpen, onClose, problemId, problemTitle }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPublic, setNewListPublic] = useState(false);
  const [selectedLists, setSelectedLists] = useState(new Set());
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen && problemId) {
      fetchLists();
    }
  }, [isOpen, problemId]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const [listsResponse, problemListsResponse] = await Promise.all([
        axiosClient.get('/favorites/lists'),
        axiosClient.get(`/favorites/problem/${problemId}/lists`)
      ]);
      
      setLists(listsResponse.data.lists);
      
      // Set which lists already contain this problem
      const problemLists = new Set(problemListsResponse.data.lists.map(list => list.id));
      setSelectedLists(problemLists);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setMessage({ type: 'error', text: 'Failed to load favorite lists' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setMessage({ type: 'error', text: 'List name is required' });
      return;
    }

    try {
      setSaving(true);
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
      setMessage({ type: 'success', text: 'List created successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error creating list:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create list' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleList = async (listId) => {
    const isCurrentlySelected = selectedLists.has(listId);
    
    try {
      setSaving(true);
      
      if (isCurrentlySelected) {
        // Remove from list
        await axiosClient.delete(`/favorites/lists/${listId}/problems/${problemId}`);
        setSelectedLists(prev => {
          const newSet = new Set(prev);
          newSet.delete(listId);
          return newSet;
        });
        setMessage({ type: 'success', text: 'Removed from list!' });
      } else {
        // Add to list
        await axiosClient.post('/favorites/add-problem', {
          listId,
          problemId
        });
        setSelectedLists(prev => new Set([...prev, listId]));
        setMessage({ type: 'success', text: 'Added to list!' });
      }
      
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Error toggling list:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update list' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="glass-dark rounded-xl w-full max-w-md border border-gray-700 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-yellow-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Add to List</h2>
                <p className="text-sm text-gray-400">{problemTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <motion.div
              className={`mx-6 mt-4 p-3 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" text="Loading lists..." />
              </div>
            ) : (
              <div className="space-y-4">
                {/* My Lists Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">My Lists</h3>
                  <span className="text-xs text-gray-500">{lists.length} lists</span>
                </div>

                {/* Lists */}
                <div className="space-y-2">
                  {lists.map((list) => {
                    const isSelected = selectedLists.has(list.id);
                    return (
                      <motion.div
                        key={list.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 text-gray-300'
                        }`}
                        onClick={() => handleToggleList(list.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex items-center space-x-2">
                            {list.isDefault ? (
                              <Heart className="w-4 h-4 text-red-400" />
                            ) : (
                              <List className="w-4 h-4 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium">{list.name}</div>
                              {list.description && (
                                <div className="text-xs text-gray-500">{list.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {list.isPublic ? (
                            <Globe className="w-4 h-4 text-green-400" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-xs text-gray-500">{list.problemCount}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Create New List */}
                {!showCreateForm ? (
                  <motion.button
                    className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                    onClick={() => setShowCreateForm(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create a new list</span>
                  </motion.button>
                ) : (
                  <motion.div
                    className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        List Name
                      </label>
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="dark-input w-full px-3 py-2 rounded-lg"
                        placeholder="My Awesome List"
                        maxLength={100}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        className="dark-input w-full px-3 py-2 rounded-lg h-20 resize-none"
                        placeholder="Description of your list..."
                        maxLength={500}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="publicList"
                          checked={newListPublic}
                          onChange={(e) => setNewListPublic(e.target.checked)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="publicList" className="text-sm text-gray-300">
                          Make public
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewListName('');
                          setNewListDescription('');
                          setNewListPublic(false);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <GradientButton
                        onClick={handleCreateList}
                        disabled={saving || !newListName.trim()}
                        loading={saving}
                        className="flex-1"
                      >
                        Create List
                      </GradientButton>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FavoriteModal;