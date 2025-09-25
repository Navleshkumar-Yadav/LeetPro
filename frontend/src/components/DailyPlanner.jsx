import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit3,
  Trash2
} from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from './AnimatedCard.jsx';
import GradientButton from './GradientButton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const DailyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [pendingRes, completedRes] = await Promise.all([
        axiosClient.get('/daily-tasks?completed=false'),
        axiosClient.get('/daily-tasks?completed=true')
      ]);
      
      setTasks(pendingRes.data.tasks || []);
      setCompletedTasks(completedRes.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setCompletedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      setAdding(true);
      const response = await axiosClient.post('/daily-tasks', newTask);
      
      setTasks(prev => [...prev, response.data.task]);
      setNewTask({
        title: '',
        dueDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      const response = await axiosClient.put(`/daily-tasks/${taskId}`, {
        isCompleted: !isCompleted
      });

      if (!isCompleted) {
        // Moving to completed
        const taskToMove = tasks.find(t => t.id === taskId);
        if (taskToMove) {
          setTasks(prev => prev.filter(t => t.id !== taskId));
          setCompletedTasks(prev => [...prev, response.data.task]);
        }
      } else {
        // Moving back to pending
        const taskToMove = completedTasks.find(t => t.id === taskId);
        if (taskToMove) {
          setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
          setTasks(prev => [...prev, response.data.task]);
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId, isCompleted) => {
    try {
      await axiosClient.delete(`/daily-tasks/${taskId}`);
      
      if (isCompleted) {
        setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <AnimatedCard className="h-96">
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" text="Loading planner..." />
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="h-[600px] flex flex-col">
      <div className="flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Daily Planner</h3>
          </div>
          <div className="text-sm text-gray-400">
            {tasks.length} pending
          </div>
        </div>

        {/* Add Task Form */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Add a task"
              className="dark-input w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                }
              }}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                className="dark-input w-full pl-10 pr-4 py-2 rounded-lg text-sm"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <GradientButton
              onClick={handleAddTask}
              disabled={adding || !newTask.title.trim()}
              loading={adding}
              size="sm"
              className="px-4"
            >
              Add
            </GradientButton>
          </div>
        </div>
      </div>

      {/* Tasks List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Pending Tasks */}
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task, index) => {
              const overdue = isOverdue(task.dueDate);
              const daysOverdue = overdue ? getDaysOverdue(task.dueDate) : 0;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-3 rounded-lg border transition-all ${
                    overdue 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleComplete(task.id, task.isCompleted)}
                      className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        overdue 
                          ? 'border-red-400 hover:bg-red-400/20' 
                          : 'border-gray-500 hover:border-blue-400 hover:bg-blue-400/20'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm leading-tight">
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs ${
                            overdue ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                        {overdue && (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-red-400">
                              Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id, false)}
                      className="p-1 hover:bg-red-600/20 rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No pending tasks</p>
              <p className="text-gray-500 text-xs">Add a task to get started!</p>
            </div>
          )}
        </div>

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center justify-between w-full p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-gray-300">
                  Completed ({completedTasks.length})
                </span>
              </div>
              {showCompleted ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showCompleted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 space-y-2"
                >
                  {completedTasks.slice(0, 10).map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleToggleComplete(task.id, task.isCompleted)}
                          className="mt-1 w-4 h-4 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center"
                        >
                          <Check className="w-2 h-2 text-white" />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-green-300 font-medium text-sm leading-tight line-through opacity-75">
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {formatDate(task.dueDate)}
                              </span>
                            </div>
                            {task.completedAt && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-green-400">
                                  Completed {formatDate(task.completedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteTask(task.id, true)}
                          className="p-1 hover:bg-red-600/20 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {completedTasks.length > 10 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-gray-500">
                        View all tasks ({completedTasks.length - 10} more)
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default DailyPlanner;