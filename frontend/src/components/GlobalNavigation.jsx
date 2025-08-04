import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Home, 
  Trophy, 
  Star, 
  Crown, 
  Target,
  Gift,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  BarChart3,
  Package,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice.js';

const GlobalNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsOpen(false);
  };

  const navigationItems = [
    { label: 'Home', path: '/home', icon: Home, color: 'text-blue-400 hover:bg-blue-400/10' },
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3, color: 'text-purple-400 hover:bg-purple-400/10' },
    { label: 'My Lists', path: '/favorites', icon: Star, color: 'text-yellow-400 hover:bg-yellow-400/10' },
    { label: 'Assessments', path: '/assessments', icon: Target, color: 'text-green-400 hover:bg-green-400/10' },
    { label: 'Contests', path: '/contest', icon: Trophy, color: 'text-orange-400 hover:bg-orange-400/10' },
    { label: 'Store', path: '/store', icon: Gift, color: 'text-pink-400 hover:bg-pink-400/10' },
    { label: 'Points Activity', path: '/points', icon: TrendingUp, color: 'text-cyan-400 hover:bg-cyan-400/10' },
    { label: 'Badges', path: '/badges', icon: Award, color: 'text-yellow-300 hover:bg-yellow-300/10' },
    { label: 'Missions', path: '/missions', icon: Zap, color: 'text-indigo-400 hover:bg-indigo-400/10' },
    { label: 'Settings', path: '/settings', icon: Settings, color: 'text-gray-400 hover:bg-gray-400/10' }
  ];

  const adminItems = [
    { label: 'Admin Panel', path: '/admin', icon: Settings, color: 'text-red-400 hover:bg-red-400/10' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-semibold text-sm">
            {user?.firstName?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-white font-medium text-sm">{user?.firstName}</div>
          <div className="text-gray-400 text-xs">View Profile</div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // Ultra-Denser: Fixed height with overflow-hidden to prevent scrolling completely
            className="absolute top-full right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 h-[85vh] flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* User Info Header */}
            {/* Ultra-Denser: Further reduced padding and avatar size */}
            <div className="p-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-white font-semibold text-xs">{user?.firstName} {user?.lastName}</div>
                  <div className="text-gray-400 text-xs">{user?.emailId}</div>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="py-1">
              <div className="px-2 pt-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</div>
              </div>
              
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div key={item.path} /* ...animation props... */ >
                    <NavLink
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      // Ultra-Denser: py-1, text-xs, space-x-2
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-3 py-2.5 mx-2 rounded-md transition-all duration-200 text-xs ${
                          isActive 
                            ? 'bg-blue-600/20 text-blue-400' 
                            : `${item.color} hover:bg-opacity-75`
                        }`
                      }
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>

            {/* Premium Section */}
            <div className="px-2 pt-0.5 mt-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Premium</div>
            </div>
            <motion.div /* ...animation props... */ >
              <NavLink
                to="/premium"
                onClick={() => setIsOpen(false)}
                // Ultra-Denser: py-1, text-xs, space-x-2
                className="flex items-center space-x-2 px-3 py-2 mx-2 rounded-md transition-all duration-200 text-yellow-400 hover:bg-yellow-400/10 text-xs"
              >
                <Crown className="w-4 h-4" />
                <span className="font-medium">Get Premium</span>
              </NavLink>
            </motion.div>

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <>
                <div className="px-2 pt-1 mt-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                </div>
                
                {adminItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div key={item.path} /* ...animation props... */ >
                      <NavLink
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        // Ultra-Denser: py-1, text-xs, space-x-2
                        className={({ isActive }) =>
                          `flex items-center space-x-2 px-3 py-2 mx-2 rounded-md transition-all duration-200 text-xs ${
                            isActive 
                              ? 'bg-red-600/20 text-red-400' 
                              : `${item.color} hover:bg-opacity-75`
                          }`
                        }
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    </motion.div>
                  );
                })}
              </>
            )}

            {/* Logout */}
            <div className="border-t border-gray-700 mt-auto">
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-3 mx-2 rounded-md transition-all duration-200 text-red-400 hover:bg-red-400/10 w-full text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalNavigation;