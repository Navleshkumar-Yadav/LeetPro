import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  Shield,
  Star,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const PremiumPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    fetchPlans();
    checkSubscriptionStatus();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchPlans = async () => {
    try {
      const response = await axiosClient.get('/payment/plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const response = await axiosClient.get('/payment/subscription-status');
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handlePlanSelect = async (plan) => {
    if (processingPayment) return;
    
    setProcessingPayment(true);
    setSelectedPlan(plan.type);
    setPaymentError(null);

    try {
      // Create order
      const orderResponse = await axiosClient.post('/payment/create-order', {
        planType: plan.type
      });

      const { orderId, amount, currency, key } = orderResponse.data;

      // Razorpay options
      const options = {
        key,
        amount,
        currency,
        name: 'LeetPro Premium',
        description: `${plan.name} Subscription`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axiosClient.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: plan.type
            });

            setPaymentSuccess(true);
            await checkSubscriptionStatus();
            
            // Redirect after success
            setTimeout(() => {
              navigate('/');
            }, 3000);

          } catch (error) {
            console.error('Payment verification failed:', error);
            setPaymentError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com'
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            setSelectedPlan(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error creating order:', error);
      setPaymentError('Failed to create payment order. Please try again.');
    } finally {
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'weekly': return Zap;
      case 'monthly': return Crown;
      case 'yearly': return Star;
      default: return Crown;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading premium plans..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-orange-900/10 to-purple-900/10" />
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 glass-dark border-b border-gray-800 sticky top-0"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-bold gradient-text">Premium Plans</h1>
            </div>
            <div className="ml-auto">
              <GlobalNavigation />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Success Message */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-dark rounded-xl p-8 max-w-md w-full border border-green-500/20 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h3>
                <p className="text-gray-300 mb-4">
                  Welcome to LeetPro Premium! You now have access to all premium features.
                </p>
                <div className="text-sm text-gray-400">
                  Redirecting to homepage in 3 seconds...
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {paymentError && (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{paymentError}</span>
            </div>
          </motion.div>
        )}

        {/* Current Subscription Status */}
        {subscriptionStatus?.hasActiveSubscription ? (
          <motion.div
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Crown className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-400">Current Premium Subscription</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-blue-400 font-semibold text-sm">Current Plan</div>
                <div className="text-white font-bold text-lg capitalize">{subscriptionStatus.subscription.planType}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-blue-400 font-semibold text-sm">Expires On</div>
                <div className="text-white font-bold text-lg">
                  {new Date(subscriptionStatus.subscription.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-blue-400 font-semibold text-sm">Days Remaining</div>
                <div className="text-white font-bold text-lg">{subscriptionStatus.subscription.daysRemaining}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                💡 You can upgrade to a higher plan or extend your subscription anytime. Your current benefits will continue until expiry.
              </p>
            </div>
          </motion.div>
        ) : null}

        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              className="relative"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Crown className="w-20 h-20 text-yellow-400" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
            </motion.div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Unlock Premium Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Take your coding skills to the next level with exclusive premium content and advanced features
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = getPlanIcon(plan.type);
            const isPopular = plan.popular;
            const isProcessing = processingPayment && selectedPlan === plan.type;
            
            return (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <AnimatedCard 
                  className={`h-full relative overflow-hidden ${
                    isPopular ? 'border-yellow-500/50 shadow-yellow-500/20 shadow-lg' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5" />
                  )}
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${
                          isPopular 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                            : 'bg-gray-700/50 border border-gray-600'
                        }`}>
                          <IconComponent className={`w-8 h-8 ${
                            isPopular ? 'text-yellow-400' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                        <span className="text-gray-400">/{plan.duration}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-center space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: (index * 0.1) + (featureIndex * 0.05) }}
                        >
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      className="mt-8"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <GradientButton
                        onClick={() => handlePlanSelect(plan)}
                        disabled={processingPayment}
                        loading={isProcessing}
                        className={`w-full py-3 ${
                          isPopular 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold' 
                            : ''
                        }`}
                      >
                        {subscriptionStatus?.hasActiveSubscription && subscriptionStatus.subscription.planType === plan.type ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Current Plan
                          </>
                        ) : subscriptionStatus?.hasActiveSubscription ? (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Upgrade to {plan.name}
                          </>
                        ) : isProcessing ? (
                          'Processing...'
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Choose {plan.name}
                          </>
                        )}
                      </GradientButton>
                    </motion.div>
                  </div>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Trust */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Powered by Razorpay</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-white">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, UPI, and net banking through our secure Razorpay integration."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 7-day money-back guarantee if you're not satisfied with our premium features."
              }
            ].map((faq, index) => (
              <AnimatedCard key={index} className="p-4">
                <h4 className="font-semibold text-white mb-2">{faq.question}</h4>
                <p className="text-gray-300 text-sm">{faq.answer}</p>
              </AnimatedCard>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumPlans;