import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { motion } from 'framer-motion';
import { Eye, EyeOff, Code, Lock, Mail } from 'lucide-react';
import { loginUser } from "../authSlice.js";
import { useEffect, useState } from 'react';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ForgotPasswordModal from '../components/ForgotPasswordModal.jsx';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
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

      <motion.div
        className="glass-dark rounded-2xl p-6 w-full max-w-sm border border-gray-700 relative z-10"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-3">
            <Code className="w-8 h-8 text-blue-400 mr-2" />
            <h1 className="text-2xl font-bold gradient-text">LeetPro</h1>
          </div>
          <p className="text-gray-400 text-sm">Welcome back, coder!</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="john@example.com"
                className={`dark-input w-full pl-9 pr-4 py-2.5 rounded-lg text-sm ${
                  errors.emailId ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('emailId')}
              />
            </div>
            {errors.emailId && (
              <motion.p
                className="text-red-400 text-xs mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.emailId.message}
              </motion.p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`dark-input w-full pl-9 pr-10 py-2.5 rounded-lg text-sm ${
                  errors.password ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                className="text-red-400 text-xs mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>

          {/* Forgot Password Link */}
          {/* <div className="flex justify-end">
            <button type="button" className="text-blue-400 hover:underline text-xs" onClick={() => setForgotOpen(true)}>
              Forgot Password?
            </button>
          </div> */}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <GradientButton
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full py-2.5 text-base font-semibold"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </GradientButton>
          </motion.div>
        </form>

        {/* Google Sign-In Button */}
        <div className="flex flex-col items-center mt-4">
          <span className="text-gray-400 mb-2 text-sm">or</span>
          <a
            href="http://localhost:3000/user/auth/google"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-700 bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors text-sm"
            style={{ textDecoration: 'none' }}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-4 h-4" />
            Sign in with Google
          </a>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-6 pt-4 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <NavLink to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign Up
            </NavLink>
          </p>
        </motion.div>
      </motion.div>
      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}

export default Login;
