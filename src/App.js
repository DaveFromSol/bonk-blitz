import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import BonkBlitz from './components/BonkBlitz';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Main App Content Component
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="relative min-h-screen bg-bonk-gradient">
      {/* BONK BLITZ Logo - Top Left */}
      <div className="fixed top-4 left-4 z-50 flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
        <div className="relative">
          <img 
            src="/Capture213123.PNG" 
            alt="BONK Logo" 
            className="w-10 h-10 rounded-lg shadow-lg"
            style={{ 
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
              imageRendering: 'auto'
            }}
          />
        </div>
        <div>
          <h1 
            className="bonk-header text-xl text-bonk-yellow cursor-pointer"
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: '1.25rem',
              fontWeight: '900'
            }}
          >
            BONK BLITZ
          </h1>
          <p 
            className="text-xs text-white/80 -mt-1"
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.75rem'
            }}
          >
            Think Fast, Win Big
          </p>
        </div>
      </div>



      {/* Routes */}
      <Routes>
        <Route path="/" element={<BonkBlitz />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <MultiplayerProvider>
          <Router>
            <AppContent />
          </Router>
        </MultiplayerProvider>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;