import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import axiosClient from '../utils/axiosClient.js';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axiosClient.post(`/user/reset-password/${token}`, { password });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl p-8 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 gradient-text">Reset Password</h2>
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg border text-center ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{message.text}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="dark-input w-full px-4 py-3 rounded-lg"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="dark-input w-full px-4 py-3 rounded-lg"
              placeholder="Confirm new password"
              required
            />
          </div>
          <GradientButton type="submit" loading={loading} disabled={loading} className="w-full py-3 text-lg font-semibold">
            {loading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
          </GradientButton>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 