import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  User, 
  Lock, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mail,
  Calendar,
  Shield,
  Crown,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice.js';
import axiosClient from '../utils/axiosClient.js';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GradientButton from '../components/GradientButton.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import GlobalNavigation from '../components/GlobalNavigation.jsx';

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [settingsData, setSettingsData] = useState({
    user: null,
    profile: null
  });
  
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmText: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/settings');
      setSettingsData(response.data);
      setProfileForm({
        firstName: response.data.user.firstName || '',
        lastName: response.data.user.lastName || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileForm.firstName.trim()) {
      setMessage({ type: 'error', text: 'First name is required' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await axiosClient.put('/settings/profile', profileForm);
      
      setSettingsData(prev => ({
        ...prev,
        user: response.data.user
      }));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      await axiosClient.put('/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update password' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDelete = async () => {
    if (!deleteForm.password) {
      setMessage({ type: 'error', text: 'Password is required to delete account' });
      return;
    }

    if (deleteForm.confirmText !== 'DELETE MY ACCOUNT') {
      setMessage({ type: 'error', text: 'Please type "DELETE MY ACCOUNT" to confirm' });
      return;
    }

    try {
      setDeleting(true);
      setMessage({ type: '', text: '' });
      
      await axiosClient.delete('/settings/account', {
        data: {
          password: deleteForm.password,
          confirmText: deleteForm.confirmText
        }
      });
      
      // Logout user and redirect
      dispatch(logoutUser());
      navigate('/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to delete account' 
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axiosClient.post('/dashboard/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSettingsData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          profileImage: response.data.profileImage
        }
      }));
      
      setMessage({ type: 'success', text: 'Profile image updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading settings..." />
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
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold gradient-text">Settings</h1>
              </div>
            </div>
            <GlobalNavigation />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
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
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <motion.div
            className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Profile Overview */}
                <AnimatedCard>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                        {settingsData.profile?.profileImage?.secureUrl ? (
                          <img 
                            src={settingsData.profile.profileImage.secureUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          settingsData.user?.firstName?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 rounded-full p-2 cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {settingsData.user?.firstName} {settingsData.user?.lastName}
                      </h2>
                      <div className="flex items-center space-x-4 text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{settingsData.user?.emailId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(settingsData.user?.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{settingsData.user?.points || 0}</div>
                      <div className="text-sm text-gray-400">Points</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{settingsData.user?.contestRating || 1200}</div>
                      <div className="text-sm text-gray-400">Contest Rating</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white capitalize">{settingsData.user?.role || 'User'}</div>
                      <div className="text-sm text-gray-400">Account Type</div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Edit Profile */}
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="Enter your first name"
                        minLength={3}
                        maxLength={20}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="Enter your last name"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <GradientButton
                      onClick={handleProfileUpdate}
                      disabled={saving}
                      loading={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </GradientButton>
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold text-white">Change Password</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="dark-input w-full px-4 py-3 pr-12 rounded-lg"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="dark-input w-full px-4 py-3 pr-12 rounded-lg"
                          placeholder="Enter your new password"
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="Confirm your new password"
                      />
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">Password Requirements:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Include uppercase and lowercase letters</li>
                        <li>• Include at least one number</li>
                        <li>• Include at least one special character</li>
                      </ul>
                    </div>
                    
                    <GradientButton
                      onClick={handlePasswordUpdate}
                      disabled={saving}
                      loading={saving}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </GradientButton>
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard className="border-red-500/20 bg-red-500/5">
                  <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-semibold text-red-400">Danger Zone</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">⚠️ Account Deletion</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Once you delete your account, there is no going back. This action will:
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1 mb-4">
                        <li>• Permanently delete your profile and account data</li>
                        <li>• Remove all your submissions and progress</li>
                        <li>• Delete your points and achievements</li>
                        <li>• Cancel any active subscriptions</li>
                        <li>• Remove you from all contests and leaderboards</li>
                      </ul>
                      <p className="text-red-400 text-sm font-semibold">
                        This action cannot be undone!
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Enter your password to confirm *
                      </label>
                      <input
                        type="password"
                        value={deleteForm.password}
                        onChange={(e) => setDeleteForm({...deleteForm, password: e.target.value})}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="Enter your password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type "DELETE MY ACCOUNT" to confirm *
                      </label>
                      <input
                        type="text"
                        value={deleteForm.confirmText}
                        onChange={(e) => setDeleteForm({...deleteForm, confirmText: e.target.value})}
                        className="dark-input w-full px-4 py-3 rounded-lg"
                        placeholder="DELETE MY ACCOUNT"
                      />
                    </div>
                    
                    <button
                      onClick={handleAccountDelete}
                      disabled={deleting || !deleteForm.password || deleteForm.confirmText !== 'DELETE MY ACCOUNT'}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
                    >
                      {deleting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Delete My Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;