// components/UserRegistrationModal.js
import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Mail, 
  X, 
  Star,
  Trophy,
  Coins,
  Shield
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const UserRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const { registerUser, loading, error } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    solanaAddress: '',
    email: ''
  });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      await registerUser(formData);
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        username: '',
        solanaAddress: '',
        email: ''
      });
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formError) setFormError(''); // Clear errors when user types
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400/20 p-2 rounded-xl">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-bebas text-2xl text-yellow-400">JOIN THE BLITZ</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-gray-800/60 rounded-xl p-4 mb-6 border border-gray-700">
          <h4 className="font-bebas text-lg text-yellow-400 mb-3">EXCLUSIVE BENEFITS</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-space text-gray-300">Earn BONK tokens for winning</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="font-space text-gray-300">Compete in multiplayer tournaments</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="font-space text-gray-300">Track your stats & achievements</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="font-space block text-white font-bold mb-2">
              Username *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="font-space w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
                placeholder="Choose your battle name"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          </div>

          {/* Solana Address */}
          <div>
            <label className="font-space block text-white font-bold mb-2">
              Solana Wallet Address *
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.solanaAddress}
                onChange={(e) => handleChange('solanaAddress', e.target.value)}
                className="font-space w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
                placeholder="Your SOL address (for BONK rewards)"
                required
              />
            </div>
            <p className="font-space text-xs text-gray-400 mt-1">
              We'll send your BONK winnings here
            </p>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="font-space block text-white font-bold mb-2">
              Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="font-space w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
                placeholder="For tournament notifications"
              />
            </div>
          </div>

          {/* Error Display */}
          {(formError || error) && (
            <div className="bg-red-600/20 border border-red-400/50 rounded-xl p-3">
              <p className="font-space text-red-400 text-sm">{formError || error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.username.trim() || !formData.solanaAddress.trim()}
            className="font-bebas w-full bg-yellow-400 text-gray-900 text-xl py-3 rounded-xl hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                <span>JOINING...</span>
              </>
            ) : (
              <>
                <Star className="w-5 h-5" />
                <span>JOIN THE BLITZ</span>
              </>
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="font-space text-xs text-gray-500 text-center mt-4">
          By joining, you agree to receive BONK rewards for tournament wins.
          We'll never share your wallet address or spam you.
        </p>
      </div>
    </div>
  );
};

export default UserRegistrationModal;