import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Code, FileText, TestTube, Save, ArrowLeft, CheckCircle, AlertCircle, Crown, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from './AnimatedCard.jsx';
import GradientButton from './GradientButton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { useState, useEffect } from 'react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  companies: z.array(z.string()).optional(),
  isPremium: z.boolean().optional(),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminUpdateForm() {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [problem, setProblem] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [newCompany, setNewCompany] = useState('');
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    getValues
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      companies: [],
      isPremium: false,
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosClient.get(`/problem/problemById/${problemId}`);
      const problemData = response.data;
      setProblem(problemData);
      
      // Reset form with fetched data
      reset({
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        tags: problemData.tags,
        companies: problemData.companies || [],
        isPremium: problemData.isPremium || false,
        visibleTestCases: problemData.visibleTestCases,
        hiddenTestCases: problemData.hiddenTestCases,
        startCode: problemData.startCode,
        referenceSolution: problemData.referenceSolution
      });
    } catch (error) {
      console.error('Error fetching problem:', error);
      setUpdateError('Failed to fetch problem data');
      setTimeout(() => navigate('/admin/update'), 2000);
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      // Filter out empty companies
      data.companies = data.companies?.filter(company => company.trim() !== '') || [];
      
      console.log('Submitting update data:', data);
      
      const response = await axiosClient.put(`/problem/update/${problemId}`, data);
      
      console.log('Update response:', response.data);
      
      setUpdateSuccess(true);
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        navigate('/admin/update');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating problem:', error);
      setUpdateError(
        error.response?.data?.message || 
        error.response?.data || 
        'Failed to update problem. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = () => {
    if (newCompany.trim()) {
      const currentCompanies = getValues('companies') || [];
      if (!currentCompanies.includes(newCompany.trim())) {
        setValue('companies', [...currentCompanies, newCompany.trim()]);
        setNewCompany('');
      }
    }
  };

  const handleRemoveCompany = (companyToRemove) => {
    const currentCompanies = getValues('companies') || [];
    setValue('companies', currentCompanies.filter(company => company !== companyToRemove));
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'testcases', label: 'Test Cases', icon: TestTube },
    { id: 'code', label: 'Code Templates', icon: Code },
  ];

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading problem..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Updating problem..." />
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
                onClick={() => navigate('/admin/update')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold gradient-text">Update Problem</h1>
              {problem && (
                <span className="text-gray-400">- {problem.title}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {updateSuccess ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Updated Successfully</span>
                </div>
              ) : (
                <>
                  <span className="text-sm text-gray-400">Draft Auto-saved</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Success/Error Messages */}
          {updateSuccess && (
            <motion.div
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Problem updated successfully! Redirecting...</span>
              </div>
            </motion.div>
          )}

          {updateError && (
            <motion.div
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{updateError}</span>
              </div>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <motion.div
            className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedCard>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <FileText className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-semibold">Problem Details</h2>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Problem Title
                          </label>
                          <input
                            {...register('title')}
                            className={`dark-input w-full px-4 py-3 rounded-lg ${
                              errors.title ? 'border-red-500' : ''
                            }`}
                            placeholder="Two Sum"
                          />
                          {errors.title && (
                            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Difficulty Level
                          </label>
                          <select
                            {...register('difficulty')}
                            className={`dark-input w-full px-4 py-3 rounded-lg ${
                              errors.difficulty ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                          {watch('difficulty') && (
                            <div className="mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(watch('difficulty'))}`}>
                                {watch('difficulty').charAt(0).toUpperCase() + watch('difficulty').slice(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Topic Category
                          </label>
                          <select
                            {...register('tags')}
                            className={`dark-input w-full px-4 py-3 rounded-lg ${
                              errors.tags ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="array">Array</option>
                            <option value="linkedList">Linked List</option>
                            <option value="graph">Graph</option>
                            <option value="dp">Dynamic Programming</option>
                          </select>
                        </div>

                        {/* Companies Section */}
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Companies (Premium Feature)
                          </label>
                          <div className="space-y-3">
                            {/* Display existing companies */}
                            <div className="flex flex-wrap gap-2">
                              {(watch('companies') || []).map((company, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-400"
                                >
                                  <span>{company}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCompany(company)}
                                    className="hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                            
                            {/* Add new company */}
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={newCompany}
                                onChange={(e) => setNewCompany(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCompany();
                                  }
                                }}
                                className="dark-input flex-1 px-3 py-2 rounded text-sm"
                                placeholder="Add company (e.g., Google, Microsoft, Amazon)"
                              />
                              <button
                                type="button"
                                onClick={handleAddCompany}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                              >
                                Add
                              </button>
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              Add companies where this problem has been asked. This will be visible to premium users only.
                            </p>
                          </div>
                        </div>

                        {/* Premium Toggle */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                            <Crown className="w-6 h-6 text-yellow-400" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-yellow-400">Premium Problem</h3>
                              <p className="text-sm text-gray-400">Make this problem available only to premium subscribers</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                {...register('isPremium')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                            </label>
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Problem Description
                          </label>
                          <textarea
                            {...register('description')}
                            className={`dark-input w-full px-4 py-3 rounded-lg h-40 resize-none ${
                              errors.description ? 'border-red-500' : ''
                            }`}
                            placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                          />
                          {errors.description && (
                            <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {/* Test Cases Tab */}
              {activeTab === 'testcases' && (
                <motion.div
                  key="testcases"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Visible Test Cases */}
                  <AnimatedCard>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <TestTube className="w-6 h-6 text-green-400" />
                        <h2 className="text-xl font-semibold">Visible Test Cases</h2>
                        <span className="text-sm text-gray-400">(Shown to users)</span>
                      </div>
                      <GradientButton
                        type="button"
                        onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Case
                      </GradientButton>
                    </div>
                    
                    <div className="space-y-4">
                      {visibleFields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-gray-300">Example {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => removeVisible(index)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Input</label>
                              <textarea
                                {...register(`visibleTestCases.${index}.input`)}
                                className="dark-input w-full px-3 py-2 rounded text-sm font-mono"
                                rows={3}
                                placeholder="[2,7,11,15], 9"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Output</label>
                              <textarea
                                {...register(`visibleTestCases.${index}.output`)}
                                className="dark-input w-full px-3 py-2 rounded text-sm font-mono"
                                rows={3}
                                placeholder="[0,1]"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm text-gray-400 mb-2">Explanation</label>
                              <textarea
                                {...register(`visibleTestCases.${index}.explanation`)}
                                className="dark-input w-full px-3 py-2 rounded text-sm"
                                rows={2}
                                placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedCard>

                  {/* Hidden Test Cases */}
                  <AnimatedCard>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <TestTube className="w-6 h-6 text-orange-400" />
                        <h2 className="text-xl font-semibold">Hidden Test Cases</h2>
                        <span className="text-sm text-gray-400">(For evaluation)</span>
                      </div>
                      <GradientButton
                        type="button"
                        onClick={() => appendHidden({ input: '', output: '' })}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Case
                      </GradientButton>
                    </div>
                    
                    <div className="space-y-4">
                      {hiddenFields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-gray-300">Test Case {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => removeHidden(index)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Input</label>
                              <textarea
                                {...register(`hiddenTestCases.${index}.input`)}
                                className="dark-input w-full px-3 py-2 rounded text-sm font-mono"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Expected Output</label>
                              <textarea
                                {...register(`hiddenTestCases.${index}.output`)}
                                className="dark-input w-full px-3 py-2 rounded text-sm font-mono"
                                rows={3}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {/* Code Templates Tab */}
              {activeTab === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {[0, 1, 2].map((index) => {
                    const languages = ['C++', 'Java', 'JavaScript'];
                    const language = languages[index];
                    
                    return (
                      <AnimatedCard key={index}>
                        <div className="flex items-center space-x-3 mb-6">
                          <Code className="w-6 h-6 text-purple-400" />
                          <h2 className="text-xl font-semibold">{language} Templates</h2>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Starter Code Template
                            </label>
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              <textarea
                                {...register(`startCode.${index}.initialCode`)}
                                className="w-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
                                rows={8}
                                placeholder={`// ${language} starter code\nclass Solution {\n    public:\n        // Your code here\n};`}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Reference Solution
                            </label>
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              <textarea
                                {...register(`referenceSolution.${index}.completeCode`)}
                                className="w-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
                                rows={12}
                                placeholder={`// ${language} complete solution\nclass Solution {\n    public:\n        // Complete implementation\n};`}
                              />
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation and Submit */}
            <motion.div
              className="flex justify-between items-center pt-8 border-t border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex space-x-4">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1].id);
                      }
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Previous
                  </button>
                )}
                {activeTab !== 'code' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1].id);
                      }
                    }}
                    className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
              
              <GradientButton
                type="submit"
                disabled={loading || updateSuccess}
                loading={loading}
                size="lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {updateSuccess ? 'Updated!' : 'Update Problem'}
              </GradientButton>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminUpdateForm;