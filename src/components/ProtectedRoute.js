// components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;700&display=swap');
          
          .font-bebas {
            font-family: 'Bebas Neue', cursive;
            letter-spacing: 0.05em;
          }
        `}</style>
        
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="font-bebas text-2xl text-yellow-400">LOADING...</h2>
        </div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return <Login />;
  }

  // If authenticated, show protected content
  return children;
};

export default ProtectedRoute;