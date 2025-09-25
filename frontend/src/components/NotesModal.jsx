import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  FileText, 
  Trash2, 
  Edit3,
  Tag,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import GradientButton from './GradientButton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const NotesModal = ({ isOpen, onClose, problemId, problemTitle }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: 'My Notes',
    content: '',
    isPublic: false,
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen && problemId) {
      fetchNote();
    }
  }, [isOpen, problemId]);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || 'My Notes',
        content: note.content || '',
        isPublic: note.isPublic || false,
        tags: note.tags || []
      });
      setEditMode(false);
    } else if (isOpen) {
      setFormData({
        title: 'My Notes',
        content: '',
        isPublic: false,
        tags: []
      });
      setEditMode(true);
    }
  }, [note, isOpen]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/notes/problem/${problemId}`);
      setNote(response.data.note);
    } catch (error) {
      console.error('Error fetching note:', error);
      setNote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.content.trim()) {
      setMessage({ type: 'error', text: 'Note content cannot be empty' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await axiosClient.post(`/notes/problem/${problemId}`, formData);
      setNote(response.data.note);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Note saved successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving note:', error);
      setMessage({ type: 'error', text: 'Failed to save note. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      setDeleting(true);
      await axiosClient.delete(`/notes/problem/${problemId}`);
      setNote(null);
      setFormData({
        title: 'My Notes',
        content: '',
        isPublic: false,
        tags: []
      });
      setEditMode(true);
      setMessage({ type: 'success', text: 'Note deleted successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting note:', error);
      setMessage({ type: 'error', text: 'Failed to delete note. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'newTag') {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === 'Enter' && e.ctrlKey && editMode) {
      e.preventDefault();
      handleSave();
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
          className="glass-dark rounded-xl w-full max-w-4xl max-h-[90vh] border border-gray-700 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Notes</h2>
                <p className="text-sm text-gray-400">{problemTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {note && !editMode && (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit note"
                  >
                    <Edit3 className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                    title="Delete note"
                  >
                    {deleting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-red-400" />
                    )}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
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
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Loading note..." />
              </div>
            ) : editMode ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="dark-input w-full px-4 py-3 rounded-lg"
                    placeholder="Enter note title..."
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    onKeyDown={handleKeyPress}
                    className="dark-input w-full px-4 py-3 rounded-lg h-64 resize-none"
                    placeholder="Write your notes here... You can use markdown formatting.&#10;&#10;Tip: Press Ctrl+Enter to save quickly!"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-400"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="newTag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="dark-input flex-1 px-3 py-2 rounded text-sm"
                      placeholder="Add a tag..."
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {formData.isPublic ? (
                      <Eye className="w-5 h-5 text-green-400" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h4 className="font-medium text-white">
                        {formData.isPublic ? 'Public Note' : 'Private Note'}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {formData.isPublic 
                          ? 'Other users can see this note' 
                          : 'Only you can see this note'
                        }
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      if (note) {
                        setEditMode(false);
                        setFormData({
                          title: note.title,
                          content: note.content,
                          isPublic: note.isPublic,
                          tags: note.tags
                        });
                      } else {
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <GradientButton
                    onClick={handleSave}
                    disabled={saving || !formData.content.trim()}
                    loading={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                  </GradientButton>
                </div>
              </div>
            ) : note ? (
              <div className="space-y-6">
                {/* Note Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{note.title}</h3>
                  <div className="flex items-center space-x-2">
                    {note.isPublic ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                        <Eye className="w-3 h-3" />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-xs text-gray-400">
                        <EyeOff className="w-3 h-3" />
                        <span>Private</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-400"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Note Content */}
                <div className="prose prose-invert max-w-none">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <pre className="whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">
                      {note.content}
                    </pre>
                  </div>
                </div>

                {/* Note Metadata */}
                <div className="text-sm text-gray-400 pt-4 border-t border-gray-700">
                  <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
                  {note.updatedAt !== note.createdAt && (
                    <p>Last updated: {new Date(note.updatedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No notes yet</h3>
                <p className="text-gray-500 mb-6">Create your first note for this problem</p>
                <GradientButton onClick={() => setEditMode(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Create Note
                </GradientButton>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotesModal;