import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, User, Phone, Home, AlertCircle, Loader } from 'lucide-react';
import { authAPI } from '../services/api';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [forgotPwdEmail, setForgotPwdEmail] = useState('');
  const [forgotPwdMessage, setForgotPwdMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    apartment: '',
    role: 'resident'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authAPI.register(formData);
      }

      const { token, user } = response.data;
      localStorage.setItem('flatConnectToken', token);
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDemoLogin = async (demoUser) => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (demoUser.role === 'admin') {
        response = await authAPI.login({
          email: 'admin@demo.com',
          password: 'demo123'
        });
      } else {
        response = await authAPI.login({
          email: 'resident@demo.com',
          password: 'demo123'
        });
      }

      const { token, user } = response.data;
      localStorage.setItem('flatConnectToken', token);
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPwdEmail) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    setForgotPwdMessage('');
    
    try {
      const response = await authAPI.forgotPassword({ email: forgotPwdEmail });
      setForgotPwdMessage(response.data.message || 'If an account exists with this email, a reset link will be sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8 border border-white/10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Flat Connect</h1>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Welcome back to your community' : 'Join your apartment community'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}

          {showForgotPwd ? (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
              <p className="text-gray-400 text-sm mb-4">
                Enter your email address to receive reset instructions.
              </p>
              {forgotPwdMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm mb-4">
                  {forgotPwdMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={forgotPwdEmail}
                    onChange={(e) => setForgotPwdEmail(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all"
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>
              <button
                onClick={() => { setShowForgotPwd(false); setError(''); setForgotPwdMessage(''); }}
                className="w-full mt-3 bg-transparent text-gray-400 hover:text-white py-2 rounded-xl text-sm transition-all"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
          {/* Toggle Buttons */}
          <div className="flex bg-gray-900/50 rounded-xl p-1 mb-6 border border-gray-800">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all"
                      placeholder="Enter your phone number"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Apartment Number
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all"
                      placeholder="e.g., A-101, B-205"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all"
                  >
                    <option value="resident">Resident</option>
                    <option value="owner">Flat Owner</option>
                    <option value="admin">Administrator</option>
                    <option value="maintenance">Maintenance Staff</option>
                  </select>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-400">
                  <input type="checkbox" className="mr-2 rounded bg-gray-900 border-gray-700" />
                  Remember me
                </label>
                <button type="button" onClick={() => setShowForgotPwd(true)} className="text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm text-center mb-4">Quick Demo Access:</p>
            <div className="space-y-3">
              <button
                onClick={() => handleDemoLogin({ role: 'resident' })}
                disabled={loading}
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white py-2.5 rounded-xl text-sm transition-all border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
              >
                Demo as Resident
              </button>
              <button
                onClick={() => handleDemoLogin({ role: 'admin' })}
                disabled={loading}
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white py-2.5 rounded-xl text-sm transition-all border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
              >
                Demo as Admin
              </button>
            </div>
          </div>
          </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;