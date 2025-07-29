import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import { UserProvider } from './context/UserContext';
import BonkBlitz from './components/BonkBlitz';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Official BONK Character Components
const BonkCharacter = ({ pose, position, className = "", animate = false }) => {
  const characters = {
    thumbsUp: "/BONK_Pose_ThumbsUp_001.png",
    relaxed: "/BONK_Pose_RelaxedUp_002.png", 
    excited: "/BONK_Pose_ThumbsUp_001.png" // Using thumbs up for excited state
  };

  return (
    <div 
      className={`fixed ${position} ${className} ${animate ? 'bonk-bounce' : ''} transition-all duration-500 z-10 pointer-events-none`}
      style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
    >
      <img 
        src={characters[pose]} 
        alt="BONK Character" 
        className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
};

// Official BONK Background Pattern
const BonkBackgroundPattern = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='20' r='15' fill='%23FFFFFF'/%3E%3Cpath d='M30 17L33 10L30 17Z' fill='%23FFFFFF'/%3E%3Cpath d='M50 17L47 10L50 17Z' fill='%23FFFFFF'/%3E%3Ccircle cx='35' cy='18' r='1' fill='%23000'/%3E%3Ccircle cx='45' cy='18' r='1' fill='%23000'/%3E%3Cellipse cx='40' cy='23' rx='2' ry='1' fill='%23000'/%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px',
        backgroundRepeat: 'repeat'
      }} />
    </div>
  );
};

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [gameState, setGameState] = useState('idle');

  // Listen for game events to trigger character animations
  useEffect(() => {
    const handleGameEvent = (event) => {
      if (event.detail) {
        setGameState(event.detail.state);
        setTimeout(() => setGameState('idle'), 2000);
      }
    };

    window.addEventListener('bonkGameEvent', handleGameEvent);
    return () => window.removeEventListener('bonkGameEvent', handleGameEvent);
  }, []);

  return (
    <AuthProvider>
      <UserProvider>
        <GameProvider>
          <MultiplayerProvider>
            <div className="relative min-h-screen bg-bonk-gradient">
              {/* Official BONK Background Pattern */}
              <BonkBackgroundPattern />

              {/* Official BONK Logo - Upper Left Corner */}
              <div className="fixed top-6 left-6 z-50" style={{ padding: '8px' }}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-bonk-yellow rounded-full flex items-center justify-center">
                      <img 
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDE1TDE4IDhMMTUgMTVaIiBmaWxsPSIjRkYwMDAwIi8+CjxwYXRoIGQ9Ik0yNSAxNUwyMiA4TDI1IDE1WiIgZmlsbD0iI0ZGMDAwMCIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMiIgZmlsbD0iI0ZGNUMwMSIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE4IiByPSIxLjUiIGZpbGw9IiMwMDAiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIxOCIgcj0iMS41IiBmaWxsPSIjMDAwIi8+CjxlbGxpcHNlIGN4PSIyMCIgY3k9IjIzIiByeD0iMyIgcnk9IjEuNSIgZmlsbD0iIzAwMCIvPgo8L3N2Zz4K" 
                        alt="BONK" 
                        className="w-8 h-8"
                      />
                    </div>
                  </div>
                  <h1 className="bonk-header-red text-2xl">BONK BLITZ</h1>
                </div>
              </div>

              {/* Official BONK Characters */}
              <BonkCharacter 
                pose={gameState === 'correct' ? 'excited' : gameState === 'wrong' ? 'relaxed' : 'thumbsUp'} 
                position="top-20 right-4" 
                animate={gameState === 'correct'}
              />
              
              <BonkCharacter 
                pose="relaxed" 
                position="bottom-4 left-4" 
                className="hidden md:block"
              />

              {/* Official BONK Admin Toggle Button */}
              <button 
                onClick={() => setShowAdmin(!showAdmin)}
                className="fixed top-4 right-4 z-50 bonk-btn-outline"
              >
                {showAdmin ? '🎮 GAME MODE' : '⚙️ ADMIN PANEL'}
              </button>

              {/* Main Content with Official BONK styling */}
              <div className="relative z-20">
                {showAdmin ? (
                  <ProtectedRoute>
                    <div className="bonk-widget min-h-screen">
                      <AdminDashboard />
                    </div>
                  </ProtectedRoute>
                ) : (
                  <BonkBlitz />
                )}
              </div>

              {/* Official BONK Footer */}
              <footer className="bonk-footer mt-auto p-6 text-center">
                <div className="bonk-body text-sm opacity-75">
                  © 2024 BONK INU. THE DOG COIN OF THE PEOPLE.
                </div>
              </footer>
            </div>
          </MultiplayerProvider>
        </GameProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;