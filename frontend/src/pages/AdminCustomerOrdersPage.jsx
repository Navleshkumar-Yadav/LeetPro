import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Truck,
  Search,
  Filter,
  Calendar,
  Star,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
];

const AdminCustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const res = await axiosClient.get(`/store/admin/orders?${params}`);
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/store/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus, trackingNumber = '', notes = '') => {
    setUpdating(orderId);
    setMessage({ type: '', text: '' });
    
    try {
      const updateData = { status: newStatus };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (notes) updateData.notes = notes;
      
      const res = await axiosClient.patch(`/store/admin/order/${orderId}`, updateData);
      
      setOrders(prev => prev.map(order => 
        order._id === orderId ? res.data.order : order
      ));
      
      setMessage({ type: 'success', text: 'Order updated successfully!' });
      setEditingOrder(null);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update order' });
    } finally {
      setUpdating('');
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || statusOptions[0].color;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.emailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.goodie.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading orders..." />
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
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-yellow-400" />
                <h1 className="text-2xl font-bold gradient-text">Customer Orders</h1>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {message.text && (
          <motion.div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatedCard className="text-center">
              <Package className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.totalOrders}</div>
              <div className="text-sm text-gray-400">Total Orders</div>
            </AnimatedCard>
            
            <AnimatedCard className="text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.totalPointsSpent}</div>
              <div className="text-sm text-gray-400">Points Redeemed</div>
            </AnimatedCard>
            
            <AnimatedCard className="text-center">
              <Truck className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {stats.statusBreakdown?.find(s => s._id === 'shipped')?.count || 0}
              </div>
              <div className="text-sm text-gray-400">Shipped</div>
            </AnimatedCard>
            
            <AnimatedCard className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {stats.statusBreakdown?.find(s => s._id === 'delivered')?.count || 0}
              </div>
              <div className="text-sm text-gray-400">Delivered</div>
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
                  placeholder="Search by customer name, email, or product..."
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
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Orders List */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <AnimatedCard className="hover:border-blue-500/30 transition-colors duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer & Product Info */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Customer Details */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">
                            {order.userId?.firstName} {order.userId?.lastName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{order.userId?.emailId}</span>
                            </div>
                            {order.address.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{order.address.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <img 
                          src={order.goodie.image} 
                          alt={order.goodie.name}
                          className="w-16 h-16 object-cover rounded-lg bg-gray-900"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{order.goodie.name}</h4>
                          <p className="text-gray-400 text-sm">{order.goodie.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-300 font-bold">{order.pointsSpent} points</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400 text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="w-5 h-5 text-green-400" />
                          <h4 className="font-semibold text-white">Shipping Address</h4>
                        </div>
                        <div className="text-gray-300 text-sm space-y-1">
                          <div>{order.address.line1}</div>
                          {order.address.line2 && <div>{order.address.line2}</div>}
                          <div>{order.address.city}, {order.address.state} {order.address.zip}</div>
                          <div>{order.address.country}</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Management */}
                    <div className="space-y-4">
                      {/* Current Status */}
                      <div className="text-center">
                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border font-medium ${getStatusColor(order.status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current" />
                          <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </div>
                      </div>

                      {/* Tracking Number */}
                      {order.trackingNumber && (
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-sm text-gray-400 mb-1">Tracking Number</div>
                          <div className="font-mono text-white">{order.trackingNumber}</div>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-sm text-gray-400 mb-1">Notes</div>
                          <div className="text-gray-300 text-sm">{order.notes}</div>
                        </div>
                      )}

                      {/* Edit Form */}
                      {editingOrder === order._id ? (
                        <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-blue-500/30">
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Status</label>
                            <select
                              className="dark-input w-full px-3 py-2 rounded"
                              defaultValue={order.status}
                              id={`status-${order._id}`}
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Tracking Number</label>
                            <input
                              type="text"
                              className="dark-input w-full px-3 py-2 rounded"
                              placeholder="Enter tracking number"
                              defaultValue={order.trackingNumber}
                              id={`tracking-${order._id}`}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Notes</label>
                            <textarea
                              className="dark-input w-full px-3 py-2 rounded h-20 resize-none"
                              placeholder="Add notes about this order"
                              defaultValue={order.notes}
                              id={`notes-${order._id}`}
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <GradientButton
                              onClick={() => {
                                const status = document.getElementById(`status-${order._id}`).value;
                                const tracking = document.getElementById(`tracking-${order._id}`).value;
                                const notes = document.getElementById(`notes-${order._id}`).value;
                                handleStatusChange(order._id, status, tracking, notes);
                              }}
                              loading={updating === order._id}
                              disabled={updating === order._id}
                              size="sm"
                              className="flex-1"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </GradientButton>
                            <button
                              onClick={() => setEditingOrder(null)}
                              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                            >
                              <X className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <GradientButton
                            onClick={() => setEditingOrder(order._id)}
                            size="sm"
                            className="w-full"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Update Order
                          </GradientButton>
                          
                          {/* Quick Status Updates */}
                          <div className="grid grid-cols-2 gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'processing')}
                                disabled={updating === order._id}
                                className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-400 text-sm transition-colors"
                              >
                                Mark Processing
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'shipped')}
                                disabled={updating === order._id}
                                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded text-purple-400 text-sm transition-colors"
                              >
                                Mark Shipped
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'delivered')}
                                disabled={updating === order._id}
                                className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-green-400 text-sm transition-colors"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'No customer orders yet'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCustomerOrdersPage;