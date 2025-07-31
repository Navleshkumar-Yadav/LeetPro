import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  Star,
  Phone,
  Mail,
  User,
  Gift,
  AlertCircle
} from 'lucide-react';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const statusSteps = [
  { 
    key: 'pending', 
    label: 'Order Placed', 
    icon: Package,
    description: 'Your order has been received'
  },
  { 
    key: 'processing', 
    label: 'Processing', 
    icon: Clock,
    description: 'Preparing your order for shipment'
  },
  { 
    key: 'shipped', 
    label: 'Shipped', 
    icon: Truck,
    description: 'Your order is on the way'
  },
  { 
    key: 'delivered', 
    label: 'Delivered', 
    icon: CheckCircle,
    description: 'Order successfully delivered'
  }
];

const OrderTrackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedCard>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Order Not Found</h2>
            <p className="text-gray-400 mb-6">
              We couldn't find the order details. Please try again from your order history.
            </p>
            <GradientButton onClick={() => navigate('/orders')}>
              View Order History
            </GradientButton>
          </AnimatedCard>
        </motion.div>
      </div>
    );
  }

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentStepIndex = getCurrentStepIndex();

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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Truck className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold gradient-text">Track Your Order</h1>
            </div>
            <div className="ml-auto">
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Order Header */}
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
                Order #{order._id.slice(-8).toUpperCase()}
              </span>
            </h2>
            <p className="text-gray-300">
              Placed on {formatDate(order.createdAt)}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Progress */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <Truck className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Order Progress</h3>
                </div>

                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isUpcoming = index > currentStepIndex;
                    
                    return (
                      <motion.div
                        key={step.key}
                        className="flex items-start space-x-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {/* Step Icon */}
                        <motion.div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : isUpcoming
                              ? 'border-gray-600 text-gray-400'
                              : 'border-blue-500 text-blue-400'
                          } ${isCurrent ? 'ring-4 ring-blue-500/30' : ''}`}
                          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <StepIcon className="w-5 h-5" />
                        </motion.div>

                        {/* Step Content */}
                        <div className="flex-1 pb-6">
                          <h4 className={`font-semibold mb-1 ${
                            isCompleted ? 'text-white' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h4>
                          <p className={`text-sm ${
                            isCompleted ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {step.description}
                          </p>
                          
                          {isCompleted && (
                            <motion.div
                              className="mt-2 text-xs text-blue-400"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              ✓ Completed
                            </motion.div>
                          )}
                        </div>

                        {/* Connecting Line */}
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute left-6 mt-12 w-0.5 h-6 ${
                            index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-600'
                          }`} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-blue-400">Tracking Number</span>
                    </div>
                    <div className="font-mono text-white text-lg">{order.trackingNumber}</div>
                    <p className="text-gray-400 text-sm mt-1">
                      Use this number to track your package with the courier
                    </p>
                  </div>
                )}
              </AnimatedCard>
            </motion.div>

            {/* Order Details */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Product Details */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <Gift className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Order Details</h3>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg mb-6">
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gray-900"
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
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg">{order.goodie.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">{order.goodie.description}</p>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-bold">{order.pointsSpent} points</span>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">Order ID</span>
                    <span className="font-mono text-white">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">Order Date</span>
                    <span className="text-white">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">Points Spent</span>
                    <span className="text-yellow-300 font-bold">{order.pointsSpent} points</span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-400">Est. Delivery</span>
                      <span className="text-white">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </AnimatedCard>

              {/* Shipping Address */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Shipping Address</h3>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="space-y-2 text-gray-300">
                    <div className="font-medium text-white">{order.address.line1}</div>
                    {order.address.line2 && <div>{order.address.line2}</div>}
                    <div>{order.address.city}, {order.address.state} {order.address.zip}</div>
                    <div>{order.address.country}</div>
                    {order.address.phone && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{order.address.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>

              {/* Order Notes */}
              {order.notes && (
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Order Notes</h3>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-gray-300">{order.notes}</p>
                  </div>
                </AnimatedCard>
              )}
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <GradientButton
              onClick={() => navigate('/orders')}
              variant="secondary"
              className="px-8 py-3"
            >
              <Package className="w-4 h-4 mr-2" />
              View All Orders
            </GradientButton>
            <GradientButton
              onClick={() => navigate('/store')}
              className="px-8 py-3"
            >
              <Gift className="w-4 h-4 mr-2" />
              Continue Shopping
            </GradientButton>
          </motion.div>

          {/* Help Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <AnimatedCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
                <p className="text-gray-300 mb-6">
                  If you have any questions about your order, feel free to contact our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">support@leetpro.com</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Phone className="w-4 h-4 text-green-400" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackPage;