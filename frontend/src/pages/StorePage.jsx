import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  ArrowLeft, 
  History, 
  Star, 
  ShoppingCart,
  Package,
  Truck,
  Clock,
  Filter,
  Search,
  Tag,
  Sparkles
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const StorePage = () => {
  const [points, setPoints] = useState(0);
  const [goodies, setGoodies] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const [pointsRes, goodiesRes, ordersRes] = await Promise.all([
        axiosClient.get('/dashboard/points'),
        axiosClient.get('/store/goodies'),
        axiosClient.get('/store/orders')
      ]);
      
      setPoints(pointsRes.data.points);
      setGoodies(goodiesRes.data.goodies);
      setRecentOrders(ordersRes.data.orders.slice(0, 3)); // Show only recent 3 orders
    } catch (error) {
      console.error('Error fetching store data:', error);
      setPoints(0);
      setGoodies([]);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (goodie) => {
    if (points < goodie.price) {
      return;
    }
    navigate('/order', { state: { goodie } });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.pending;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      apparel: '👕',
      accessories: '🎒',
      stationery: '✏️',
      all: '🛍️'
    };
    return icons[category] || '📦';
  };

  // Enhanced image handling with fallbacks
  const getGoodieImage = (goodie) => {
    const fallbackImages = {
      'tshirt': 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      'cap': 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg',
      'pen': 'https://images.pexels.com/photos/29253139/pexels-photo-29253139.jpeg',
      'bag': 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
      'mug': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
      'stickers': 'https://images.pexels.com/photos/30101191/pexels-photo-30101191.jpeg'
    };
    
    return goodie.image || fallbackImages[goodie.id] || 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg';
  };
  const categories = [
    { id: 'all', label: 'All Items', count: goodies.length },
    { id: 'apparel', label: 'Apparel', count: goodies.filter(g => g.category === 'apparel').length },
    { id: 'accessories', label: 'Accessories', count: goodies.filter(g => g.category === 'accessories').length },
    { id: 'stationery', label: 'Stationery', count: goodies.filter(g => g.category === 'stationery').length }
  ];

  const filteredGoodies = goodies.filter(goodie => {
    const matchesCategory = selectedCategory === 'all' || goodie.category === selectedCategory;
    const matchesSearch = goodie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goodie.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading store..." />
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
                onClick={() => navigate("/home")}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6 text-yellow-400" />
                <h1 className="text-2xl font-bold gradient-text">Points Store</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Points Display */}
              <motion.div
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-300">{points}</span>
                <span className="text-yellow-400 font-medium">Points</span>
              </motion.div>
              
              {/* Order History Button */}
              <GradientButton
                onClick={() => navigate('/orders')}
                size="sm"
                className="flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>Order History</span>
              </GradientButton>
              
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Recent Orders Section */}
        {recentOrders.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatedCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Package className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                </div>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  View All →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={getGoodieImage(order.goodie)} 
                        alt={order.goodie.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-900"
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{order.goodie.name}</h3>
                        <p className="text-xs text-gray-400">{order.pointsSpent} points</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatedCard>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search goodies..."
                  className="dark-input w-full pl-10 pr-4 py-3 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <div className="flex space-x-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <span>{getCategoryIcon(category.id)}</span>
                      <span className="text-sm font-medium">{category.label}</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Goodies Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredGoodies.map((goodie, index) => {
              const canAfford = points >= goodie.price;
              
              return (
                <motion.div
                  key={goodie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group"
                >
                  <AnimatedCard className={`h-full relative overflow-hidden ${
                    !canAfford ? 'opacity-75' : ''
                  }`}>
                    {/* Stock Badge */}
                    {goodie.inStock && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-xs text-green-400 font-medium">In Stock</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="relative overflow-hidden rounded-lg bg-gray-800/50 aspect-square">
                        <img 
                          src={getGoodieImage(goodie)} 
                          alt={goodie.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Quick View Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.button
                            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleBuy(goodie)}
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {goodie.name}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {goodie.description}
                          </p>
                        </div>

                        {/* Category Tag */}
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500 capitalize">{goodie.category}</span>
                        </div>

                        {/* Delivery Info */}
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Truck className="w-4 h-4" />
                          <span>{goodie.estimatedDelivery}</span>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-xl font-bold text-yellow-300">
                              {goodie.price}
                            </span>
                            <span className="text-yellow-400 text-sm">points</span>
                          </div>
                          
                          <GradientButton
                            onClick={() => handleBuy(goodie)}
                            disabled={!canAfford || !goodie.inStock}
                            size="sm"
                            className={`${
                              !canAfford 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:scale-105'
                            }`}
                          >
                            {!goodie.inStock ? (
                              'Out of Stock'
                            ) : !canAfford ? (
                              `Need ${goodie.price - points} more`
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Buy Now
                              </>
                            )}
                          </GradientButton>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredGoodies.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </motion.div>
        )}

        {/* Points Earning Tips */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <AnimatedCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Need More Points?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl mb-2">🔥</div>
                <h4 className="font-semibold text-white mb-1">Daily Streak</h4>
                <p className="text-sm text-gray-400">Solve problems daily to earn streak bonuses</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-semibold text-white mb-1">Assessments</h4>
                <p className="text-sm text-gray-400">Complete assessments for bonus points</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl mb-2">👑</div>
                <h4 className="font-semibold text-white mb-1">Premium</h4>
                <p className="text-sm text-gray-400">Get premium for exclusive point opportunities</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <GradientButton onClick={() => navigate('/missions')}>
                View All Missions
              </GradientButton>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default StorePage;