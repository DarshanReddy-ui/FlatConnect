import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { AppProvider } from './context/AppContext';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('flatConnectUser');
    const storedToken = localStorage.getItem('flatConnectToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('flatConnectUser', JSON.stringify(userData));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('flatConnectUser');
    localStorage.removeItem('flatConnectToken');
    setShowAuth(false);
  };

  const handleGetStarted = () => {
    if (user) {
      // User is already logged in, redirect to dashboard
      return;
    }
    setShowAuth(true);
  };

  return (
    <AppProvider>
      {/* If user is logged in, show appropriate dashboard */}
      {user && !showAuth ? (
        <Router>
          <div className="min-h-screen bg-black">
            {/* Navigation Bar for logged-in users */}
            <nav className="glass-effect border-b border-gray-800">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-medium tracking-tight text-xl">
                    Flat Connect
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300 text-sm">
                      Welcome, {user.name} ({user.apartment})
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            <Routes>
              <Route 
                path="/" 
                element={
                  user.role === 'admin' ? (
                    <AdminDashboard user={user} />
                  ) : (
                    <Dashboard userRole={user.role} user={user} />
                  )
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      ) : showAuth ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <div className="App">
          <HeroSection onGetStarted={handleGetStarted} />
        </div>
      )}
    </AppProvider>
  );
}

export default App;