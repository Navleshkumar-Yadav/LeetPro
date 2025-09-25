import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import GradientButton from './GradientButton.jsx';

const PremiumButton = ({ problem }) => {
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await axiosClient.get('/payment/subscription-status');
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setSubscriptionStatus({ hasActiveSubscription: false });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/premium');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  // If user has premium access, don't show the button
  if (subscriptionStatus?.hasActiveSubscription || problem?.hasAccess) {
    return null;
  }

  // Only show for premium problems
  if (!problem?.isPremium) {
    return null;
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Premium Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 rounded-xl" />
      
      <div className="relative glass-dark border border-yellow-500/30 rounded-xl p-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="flex items-center space-x-3"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="relative">
                <Crown className="w-8 h-8 text-yellow-400" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Premium Problem
              </h3>
            </motion.div>
          </div>

          {/* Lock Icon */}
          <div className="flex justify-center mb-4">
            <motion.div
              className="p-4 bg-yellow-500/20 rounded-full border border-yellow-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-white mb-2">
              Unlock Premium Content
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              This problem is part of our premium collection. Upgrade to access:
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {[
              'Advanced problem solutions',
              'Detailed video explanations',
              'Priority support',
              'Exclusive coding challenges'
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 text-sm text-gray-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GradientButton
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold py-3 px-6 rounded-lg shadow-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Premium
            </GradientButton>
          </motion.div>

          {/* Pricing Hint */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              Starting from ₹99/week • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumButton;