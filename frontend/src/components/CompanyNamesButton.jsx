import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import CompanyNamesModal from './CompanyNamesModal.jsx';

const CompanyNamesButton = ({ problemId, problemTitle, className = '' }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await axiosClient.get('/api/users/check-premium-status');
      setHasAccess(response.data.hasActiveSubscription);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (hasAccess) {
      setShowModal(true);
    } else {
      navigate('/premium');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg opacity-50">
        <div className="w-4 h-4 border-2 border-gray-400/20 border-t-gray-400 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <motion.button
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all group ${
          hasAccess 
            ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/30 text-blue-400' 
            : 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20 hover:border-yellow-500/30 text-yellow-400'
        } ${className}`}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {hasAccess ? (
          <>
            <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Companies</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Building2 className="w-4 h-4" />
              <Lock className="w-2 h-2 absolute -top-1 -right-1 text-yellow-400" />
            </div>
            <span className="text-sm font-medium">Companies</span>
            <Crown className="w-3 h-3" />
          </>
        )}
      </motion.button>

      <CompanyNamesModal
        isOpen={showModal}
        onClose={handleModalClose}
        problemId={problemId}
        problemTitle={problemTitle}
      />
    </>
  );
};

export default CompanyNamesButton;