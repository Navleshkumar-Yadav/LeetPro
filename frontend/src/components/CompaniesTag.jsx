import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import GradientButton from './GradientButton.jsx';

const CompaniesTag = ({ companies = [], hasAccess = false, className = '' }) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  if (!companies || companies.length === 0) {
    return null;
  }

  const displayedCompanies = showAll ? companies : companies.slice(0, 3);
  const hasMore = companies.length > 3;

  const handleCompanyClick = (company) => {
    if (!hasAccess) {
      navigate('/premium');
      return;
    }
    // Future: Could navigate to company-specific problems page
    console.log(`Clicked on ${company}`);
  };

  const handleUpgradeClick = () => {
    navigate('/premium');
  };

  if (!hasAccess) {
    return (
      <motion.div
        className={`relative overflow-hidden rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Premium Lock Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-lg" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-yellow-400">Companies</span>
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
            <Lock className="w-5 h-5 text-yellow-400" />
          </div>
          
          {/* Blurred Companies Preview */}
          <div className="flex flex-wrap gap-2 mb-3 filter blur-sm">
            {displayedCompanies.map((company, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-sm text-gray-300"
              >
                {company}
              </span>
            ))}
            {hasMore && !showAll && (
              <span className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-sm text-gray-400">
                +{companies.length - 3} more
              </span>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-300 mb-3">
              Unlock to see which companies have asked this problem
            </p>
            <GradientButton
              size="sm"
              onClick={handleUpgradeClick}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </GradientButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Building2 className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-blue-400">Companies</span>
        <span className="text-xs text-gray-400">({companies.length} companies)</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayedCompanies.map((company, index) => (
          <motion.button
            key={index}
            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-full text-sm text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
            onClick={() => handleCompanyClick(company)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {company}
          </motion.button>
        ))}
        
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-gray-500 rounded-full text-sm text-gray-400 hover:text-gray-300 transition-all"
          >
            {showAll ? 'Show less' : `+${companies.length - 3} more`}
          </button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Click on a company to see similar problems (coming soon)
      </p>
    </motion.div>
  );
};

export default CompaniesTag;