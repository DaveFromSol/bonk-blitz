import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import { UserProvider } from './context/UserContext';
import BonkBlitz from './components/BonkBlitz';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <AuthProvider>
      <UserProvider>
        <GameProvider>
          <MultiplayerProvider>
            <div className="relative">
              {/* Admin Toggle Button */}
              <button 
                onClick={() => setShowAdmin(!showAdmin)}
                className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm text-white border-2 border-white/30 font-bold px-4 py-2 rounded-xl hover:bg-black/90 transition-all transform hover:scale-105 shadow-2xl"
                style={{
                  fontFamily: 'Comic Sans MS, cursive, sans-serif',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {showAdmin ? '🎮 Game Mode' : '⚙️ Admin Panel'}
              </button>

              {/* Main Content */}
              {showAdmin ? (
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              ) : (
                <BonkBlitz />
              )}
            </div>
          </MultiplayerProvider>
        </GameProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;