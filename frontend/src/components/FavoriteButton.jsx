import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import axiosClient from '../utils/axiosClient.js';
import FavoriteModal from './FavoriteModal.jsx';

const FavoriteButton = ({ problemId, problemTitle, className = '' }) => {
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfInFavorites();
  }, [problemId]);

  const checkIfInFavorites = async () => {
    try {
      const response = await axiosClient.get(`/favorites/problem/${problemId}/lists`);
      setIsInFavorites(response.data.lists.length > 0);
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const handleClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Refresh the favorite status after modal closes
    checkIfInFavorites();
  };

  return (
    <>
      <motion.button
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
          isInFavorites 
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' 
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400'
        } ${className}`}
        onClick={handleClick}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Star 
          className={`w-5 h-5 ${isInFavorites ? 'fill-current' : ''}`} 
        />
        <span className="text-sm font-medium">
          {isInFavorites ? 'In Lists' : 'Add to List'}
        </span>
      </motion.button>

      <FavoriteModal
        isOpen={showModal}
        onClose={handleModalClose}
        problemId={problemId}
        problemTitle={problemTitle}
      />
    </>
  );
};

export default FavoriteButton;