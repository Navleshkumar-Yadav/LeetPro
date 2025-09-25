import { useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  Package,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const goodie = location.state?.goodie;
  
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Confirmation

  if (!goodie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No item selected</h2>
          <button 
            onClick={() => navigate('/store')}
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validateAddress = () => {
    const required = ['line1', 'city', 'state', 'zip', 'country', 'phone'];
    for (const field of required) {
      if (!address[field] || address[field].trim() === '') {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(address.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateAddress()) {
        setStep(2);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateAddress()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axiosClient.post('/store/order', { goodie, address });
      setStep(3);
      
      // Redirect to order tracking after 3 seconds
      setTimeout(() => {
        navigate('/order-track', { state: { order: res.data.order } });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => navigate('/store')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold gradient-text">Complete Your Order</h1>
            </div>
            <div className="ml-auto">
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <motion.div
            className="flex items-center justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-8">
              {[
                { number: 1, label: 'Shipping', icon: MapPin },
                { number: 2, label: 'Review', icon: CheckCircle },
                { number: 3, label: 'Confirmation', icon: Package }
              ].map((stepItem, index) => {
                const IconComponent = stepItem.icon;
                const isActive = step >= stepItem.number;
                const isCurrent = step === stepItem.number;
                
                return (
                  <div key={stepItem.number} className="flex items-center">
                    <div className={`flex items-center space-x-3 ${
                      index > 0 ? 'ml-8' : ''
                    }`}>
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'border-gray-600 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-blue-500/30' : ''}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`font-medium ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}>
                        {stepItem.label}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        step > stepItem.number ? 'bg-blue-500' : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {step === 1 && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Shipping Address Form */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Shipping Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      name="line1"
                      value={address.line1}
                      onChange={handleChange}
                      className="dark-input w-full px-4 py-3 rounded-lg"
                      placeholder="Street address, P.O. box, company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 2
                    </label>
                    <input
                      name="line2"
                      value={address.line2}
                      onChange={handleChange}
                      className="dark-input w-full px-4 py-3 rounded-lg"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        name="city"
                        value={address.city}
                        onChange={handleChange}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State *
                      </label>
                      <input
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        name="zip"
                        value={address.zip}
                        onChange={handleChange}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={address.country}
                        onChange={handleChange}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                      >
                        <option value="India">India</option>
                        <option value="USA">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="phone"
                        value={address.phone}
                        onChange={handleChange}
                        className="dark-input w-full pl-10 pr-4 py-3 rounded-lg"
                        placeholder="10-digit phone number"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>
                
                {error && (
                  <motion.div
                    className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}
                
                <div className="mt-6">
                  <GradientButton onClick={handleNext} className="w-full">
                    Continue to Review
                  </GradientButton>
                </div>
              </AnimatedCard>

              {/* Order Summary */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <Package className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Order Summary</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Product Details */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                    <img 
                      src={goodie.image} 
                      alt={goodie.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-900"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{goodie.name}</h3>
                      <p className="text-gray-400 text-sm">{goodie.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-yellow-300 font-bold text-lg">{goodie.price} Points</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Truck className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">Estimated Delivery: {goodie.estimatedDelivery}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-sm">Secure & Tracked Shipping</span>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Total Cost:</span>
                      <span className="text-2xl font-bold text-yellow-300">{goodie.price} Points</span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Review Order */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Review Your Order</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Shipping Address Review */}
                  <div>
                    <h3 className="font-semibold text-white mb-3">Shipping Address</h3>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-gray-300 text-sm">
                      <div>{address.line1}</div>
                      {address.line2 && <div>{address.line2}</div>}
                      <div>{address.city}, {address.state} {address.zip}</div>
                      <div>{address.country}</div>
                      <div className="mt-2 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{address.phone}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                    >
                      Edit Address
                    </button>
                  </div>
                  
                  {/* Order Details */}
                  <div>
                    <h3 className="font-semibold text-white mb-3">Order Details</h3>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={goodie.image} 
                          alt={goodie.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{goodie.name}</h4>
                          <p className="text-gray-400 text-sm">{goodie.description}</p>
                          <div className="text-yellow-300 font-bold mt-1">{goodie.price} Points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <GradientButton
                    onClick={handleSubmit}
                    disabled={loading}
                    loading={loading}
                    className="flex-1"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </GradientButton>
                </div>
                
                {error && (
                  <motion.div
                    className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatedCard>

              {/* Security & Trust */}
              <AnimatedCard>
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Secure Checkout</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="font-semibold text-green-400">Secure Transaction</h4>
                      <p className="text-gray-300 text-sm">Your order is protected by our secure system</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-blue-400">Free Shipping</h4>
                      <p className="text-gray-300 text-sm">No additional charges for delivery</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-semibold text-purple-400">Quality Guaranteed</h4>
                      <p className="text-gray-300 text-sm">Premium quality merchandise</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <AnimatedCard className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
                <motion.div
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-green-400 mb-4">Order Placed Successfully!</h2>
                <p className="text-gray-300 mb-6">
                  Thank you for your order! We'll start processing it right away.
                </p>
                
                <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-white mb-4">What's Next?</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-bold">1</span>
                      </div>
                      <span className="text-gray-300 text-sm">Order confirmation email sent</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-bold">2</span>
                      </div>
                      <span className="text-gray-300 text-sm">Processing and packaging (1-2 days)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-bold">3</span>
                      </div>
                      <span className="text-gray-300 text-sm">Shipped with tracking number</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 mb-6">
                  Redirecting to order tracking in 3 seconds...
                </div>
                
                <GradientButton onClick={() => navigate('/store')} className="w-full">
                  Continue Shopping
                </GradientButton>
              </AnimatedCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;