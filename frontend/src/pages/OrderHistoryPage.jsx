import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  Star,
  Filter,
  Search,
  Eye,
  Gift,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const statusConfig = {
  pending: { 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: Clock,
    label: 'Order Placed',
    description: 'Your order has been received and is being processed'
  },
  processing: { 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Package,
    label: 'Processing',
    description: 'Your order is being prepared for shipment'
  },
  shipped: { 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Truck,
    label: 'Shipped',
    description: 'Your order is on its way to you'
  },
  delivered: { 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircle,
    label: 'Delivered',
    description: 'Your order has been successfully delivered'
  },
  cancelled: { 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: Clock,
    label: 'Cancelled',
    description: 'Your order has been cancelled'
  }
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/store/orders');
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.goodie.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderProgress = (status) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = (order) => {
    if (order.status === 'delivered') return 'Delivered';
    if (order.estimatedDelivery) {
      return new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    return 'TBD';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your orders..." />
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
                onClick={() => navigate('/store')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <History className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold gradient-text">Order History</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {filteredOrders.length} of {orders.length} orders
              </div>
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Package className="w-8 h-8 text-blue-400" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Your Order Journey
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Track all your point redemptions and deliveries in one place
          </p>
        </motion.div>

        {/* Search and Filters */}
        {orders.length > 0 && (
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
                    placeholder="Search your orders..."
                    className="dark-input w-full pl-10 pr-4 py-3 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    className="dark-input px-4 py-3 rounded-lg min-w-[140px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatedCard className="max-w-md mx-auto">
              <motion.div
                className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Gift className="w-10 h-10 text-gray-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6">
                You haven't redeemed any goodies yet. Start earning points and get some awesome merchandise!
              </p>
              <GradientButton onClick={() => navigate('/store')}>
                <Gift className="w-4 h-4 mr-2" />
                Browse Store
              </GradientButton>
            </AnimatedCard>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatePresence>
              {filteredOrders.map((order, index) => {
                const statusInfo = statusConfig[order.status];
                const StatusIcon = statusInfo.icon;
                const progress = getOrderProgress(order.status);
                
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group"
                  >
                    <AnimatedCard className="hover:border-blue-500/30 transition-colors duration-300 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Product Info */}
                        <div className="lg:col-span-2">
                          <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            <motion.div
                              className="relative overflow-hidden rounded-lg bg-gray-800/50"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                            >
                              <img 
                                src={order.goodie.image} 
                                alt={order.goodie.name}
                                className="w-20 h-20 object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.div>
                            
                            {/* Product Details */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-1">
                                {order.goodie.name}
                              </h3>
                              <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                                {order.goodie.description}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  <span className="text-yellow-300 font-bold">
                                    {order.pointsSpent} points
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-400">
                                    {formatDate(order.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Shipping Address */}
                          <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-400">Shipping Address</span>
                            </div>
                            <div className="text-gray-300 text-sm">
                              <div>{order.address.line1}</div>
                              {order.address.line2 && <div>{order.address.line2}</div>}
                              <div>{order.address.city}, {order.address.state} {order.address.zip}</div>
                              <div>{order.address.country}</div>
                            </div>
                          </div>
                        </div>

                        {/* Order Status & Progress */}
                        <div className="space-y-6">
                          {/* Current Status */}
                          <div className="text-center">
                            <motion.div
                              className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl border ${statusInfo.color}`}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <StatusIcon className="w-5 h-5" />
                              <div>
                                <div className="font-semibold">{statusInfo.label}</div>
                                <div className="text-xs opacity-75">{statusInfo.description}</div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white font-medium">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                              />
                            </div>
                          </div>

                          {/* Tracking Info */}
                          {order.trackingNumber && (
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-sm text-gray-400 mb-1">Tracking Number</div>
                              <div className="font-mono text-white text-sm">{order.trackingNumber}</div>
                            </div>
                          )}

                          {/* Estimated Delivery */}
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400 mb-1">Estimated Delivery</div>
                            <div className="text-white font-medium">{getEstimatedDelivery(order)}</div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-3">
                            <GradientButton
                              onClick={() => navigate('/order-track', { state: { order } })}
                              size="sm"
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Track Order
                            </GradientButton>
                            
                            {order.status === 'delivered' && (
                              <button className="w-full px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors">
                                <CheckCircle className="w-4 h-4 inline mr-2" />
                                Order Completed
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredOrders.length === 0 && orders.length > 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Order Statistics */}
        {orders.length > 0 && (
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <AnimatedCard className="text-center">
              <Package className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{orders.length}</div>
              <div className="text-sm text-gray-400">Total Orders</div>
            </AnimatedCard>
            
            <AnimatedCard className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-400">Delivered</div>
            </AnimatedCard>
            
            <AnimatedCard className="text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {orders.reduce((sum, o) => sum + o.pointsSpent, 0)}
              </div>
              <div className="text-sm text-gray-400">Points Spent</div>
            </AnimatedCard>
            
            <AnimatedCard className="text-center">
              <Truck className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {orders.filter(o => ['processing', 'shipped'].includes(o.status)).length}
              </div>
              <div className="text-sm text-gray-400">In Transit</div>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GradientButton
              onClick={() => navigate('/store')}
              className="px-8 py-3"
            >
              <Gift className="w-4 h-4 mr-2" />
              Continue Shopping
            </GradientButton>
            <button
              onClick={() => navigate('/points')}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Star className="w-4 h-4 mr-2 inline" />
              View Points Activity
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;