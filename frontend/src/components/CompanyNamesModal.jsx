import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Building2, 
  Crown, 
  Lock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import GradientButton from './GradientButton.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const CompanyNamesModal = ({ isOpen, onClose, problemId, problemTitle }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && problemId) {
      fetchCompanies();
    }
  }, [isOpen, problemId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosClient.get(`/api/problems/${problemId}/companies`);
      setCompanies(response.data.companies);
      setHasAccess(response.data.hasAccess);
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (error.response?.status === 403) {
        setHasAccess(false);
        setError('Premium subscription required to view companies');
      } else {
        setError('Failed to load companies');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    onClose();
    navigate('/premium');
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
              <Building2 className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Companies</h2>
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

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" text="Loading companies..." />
              </div>
            ) : !hasAccess ? (
              <div className="text-center">
                {/* Premium Lock Screen */}
                <div className="relative overflow-hidden rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 mb-6">
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-lg" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                        <Lock className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Premium Feature</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Unlock company information to see which top tech companies have asked this problem in their interviews.
                    </p>
                    
                    {/* Blurred Preview */}
                    <div className="filter blur-sm mb-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['Google', 'Microsoft', 'Amazon', 'Meta'].map((company, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-400"
                          >
                            {company}
                          </span>
                        ))}
                        <span className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-sm text-gray-400">
                          +5 more
                        </span>
                      </div>
                    </div>
                    
                    <GradientButton
                      onClick={handleUpgradeClick}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </GradientButton>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Get access to company information, premium problems, and more!
                </div>
              </div>
            ) : companies.length > 0 ? (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Premium Content</span>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                
                <p className="text-gray-300 text-sm mb-6">
                  This problem has been asked by the following companies:
                </p>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {companies.map((company, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 rounded-lg transition-all cursor-pointer group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        <span className="font-medium text-white">{company}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">
                    💡 <strong>Pro tip:</strong> Research these companies' interview processes and common question patterns to better prepare!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Company Data</h3>
                <p className="text-gray-500 text-sm">
                  Company information for this problem is not available yet.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanyNamesModal;