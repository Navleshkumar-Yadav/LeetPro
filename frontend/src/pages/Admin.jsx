import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Video, Upload, Settings, BarChart3, Users, ArrowLeft, Package, Crown } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';

function Admin() {
  const navigate = useNavigate();
  
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Design and add new coding challenges to the platform',
      icon: Plus,
      color: 'from-green-500 to-emerald-600',
      route: '/admin/create',
      stats: 'Add Challenge'
    },
    {
      id: 'video',
      title: 'Video Management',
      description: 'Upload solution videos and manage video content',
      icon: Video,
      color: 'from-purple-500 to-violet-600',
      route: '/admin/video',
      stats: 'Manage Videos'
    },
    {
      id: 'delete',
      title: 'Delete Problems',
      description: 'Remove outdated or incorrect problems from the platform',
      icon: Trash2,
      color: 'from-red-500 to-rose-600',
      route: '/admin/delete',
      stats: 'Remove Content'
    },
    {
      id: 'update',
      title: 'Update Problems',
      description: 'Edit and modify existing problem statements and solutions',
      icon: Edit,
      color: 'from-blue-500 to-cyan-600',
      route: '/admin/update',
      stats: 'Edit Content'
    },
    {
      id: 'customer-orders',
      title: 'Customer Orders',
      description: 'View and manage all customer orders, update their status, and track delivery progress.',
      icon: Package,
      color: 'from-yellow-500 to-yellow-600',
      route: '/admin/orders',
      stats: 'Manage Orders'
    },
    {
      id: 'contest',
      title: 'Create Contest',
      description: 'Schedule and manage coding contests for the platform',
      icon: Crown,
      color: 'from-blue-500 to-blue-600',
      route: '/admin/contest',
      stats: 'Manage Contests'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative container mx-auto px-6 py-16">
          {/* Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Problems</span>
            </button>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Settings className="w-16 h-16 text-blue-400 mr-4" />
              <h1 className="text-5xl font-bold gradient-text">Admin Control Center</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your coding platform with powerful administrative tools
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="container mx-auto px-6 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <AnimatedCard className="text-center" delay={0.1}>
            <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">Platform</div>
            <div className="text-sm text-gray-400">Analytics</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center" delay={0.2}>
            <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">User</div>
            <div className="text-sm text-gray-400">Management</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center" delay={0.3}>
            <Settings className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">System</div>
            <div className="text-sm text-gray-400">Configuration</div>
          </AnimatedCard>
        </div>
      </motion.div>

      {/* Admin Options Grid */}
      <div className="container mx-auto px-6 pb-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                key={option.id}
                variants={itemVariants}
                className="group"
              >
                <AnimatedCard className="h-full relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} shadow-lg`}>
                        <IconComponent size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {option.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex-1 flex items-end">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs text-gray-500 uppercase tracking-wider">
                            Quick Action
                          </span>
                          <span className="text-xs text-gray-400">
                            {option.stats}
                          </span>
                        </div>
                        
                        {/* Action Button */}
                        <NavLink to={option.route} className="block">
                          <GradientButton className="w-full justify-center">
                            <IconComponent size={16} className="mr-2" />
                            {option.title}
                          </GradientButton>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Quick Actions Footer */}
      <motion.div
        className="border-t border-gray-800 bg-gray-800/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-gray-400 text-sm">
                Check our documentation or contact support for assistance
              </p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Documentation
              </button>
              <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Admin;