// components/Login.js
import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;700&display=swap');
        
        .font-bebas {
          font-family: 'Bebas Neue', cursive;
          letter-spacing: 0.05em;
        }
        
        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 bg-yellow-400/30 rounded-full animate-ping mx-auto"></div>
          </div>
          <h1 className="font-bebas text-5xl text-yellow-400 mb-2">
            BONK BLITZ
          </h1>
          <p className="font-space text-gray-300 text-lg">
            Admin Access Required
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="font-space block text-white font-bold mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-space w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="font-space block text-white font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-space w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                <p className="font-space text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!email.trim() || !password.trim() || isLoading}
              className="font-bebas w-full bg-yellow-400 text-gray-900 text-xl py-3 rounded-xl hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <span>ADMIN LOGIN</span>
              )}
            </button>
          </form>

          {/* Helper Text */}
          <div className="mt-6 text-center">
            <p className="font-space text-gray-500 text-sm">
              Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;