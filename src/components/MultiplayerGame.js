import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Play, 
  Clock, 
  Trophy, 
  LogOut,
  Crown,
  Target,
  Timer,
  Wallet,
  Gift,
  Award,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';
import { useMultiplayer } from '../context/MultiplayerContext';

// BONK Character Component for Multiplayer
const BonkMultiplayerCharacter = ({ pose, position, className = "", animate = false }) => {
  const characters = {
    thumbsUp: "/BONK_Pose_ThumbsUp_001.png",
    relaxed: "/BONK_Pose_RelaxedUp_002.png", 
    excited: "/BONK_Pose_ThumbsUp_001.png"
  };

  return (
    <div 
      className={`absolute ${position} ${className} ${animate ? 'bonk-bounce' : ''} transition-all duration-500 z-10 pointer-events-none`}
      style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
    >
      <img 
        src={characters[pose]} 
        alt="BONK Character" 
        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
};

// Sound Manager Hook
const useSoundManager = () => {
  const backgroundMusicRef = useRef(null);
  const bonkSoundRef = useRef(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize audio
    backgroundMusicRef.current = new Audio('/music-for-game-fun-kid-game-163649.mp3');
    bonkSoundRef.current = new Audio('/bonk-sound-effect-36055.mp3');
    
    // Configure background music
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;
    
    // Configure bonk sound
    bonkSoundRef.current.volume = 0.5;
    
    setIsLoaded(true);

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  const playBackgroundMusic = () => {
    if (backgroundMusicRef.current && isMusicEnabled && isLoaded) {
      backgroundMusicRef.current.play().catch(console.error);
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  };

  const playBonkSound = () => {
    if (bonkSoundRef.current && isSoundEnabled && isLoaded) {
      bonkSoundRef.current.currentTime = 0;
      bonkSoundRef.current.play().catch(console.error);
    }
  };

  const toggleMusic = () => {
    setIsMusicEnabled(prev => {
      const newState = !prev;
      if (newState) {
        playBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
      return newState;
    });
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  return {
    playBackgroundMusic,
    stopBackgroundMusic,
    playBonkSound,
    toggleMusic,
    toggleSound,
    isMusicEnabled,
    isSoundEnabled,
    isLoaded
  };
};

const MultiplayerGame = () => {
  const { 
    activeRound,
    playerData,
    isInGame,
    currentQuestion,
    currentQuestionIndex,
    timeLeft,
    leaderboard,
    joinRound,
    leaveRound,
    submitAnswer,
    loading,
    roundStartCountdown
  } = useMultiplayer();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [solanaAddress, setSolanaAddress] = useState('');
  const [characterState, setCharacterState] = useState('idle');

  // Sound management
  const {
    playBackgroundMusic,
    stopBackgroundMusic,
    playBonkSound,
    toggleMusic,
    toggleSound,
    isMusicEnabled,
    isSoundEnabled
  } = useSoundManager();

  // Start background music when game starts
  useEffect(() => {
    if (activeRound?.status === 'playing' && isMusicEnabled) {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }

    return () => stopBackgroundMusic();
  }, [activeRound?.status, isMusicEnabled, playBackgroundMusic, stopBackgroundMusic]);

  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setStartTime(Date.now());
    
    // Trigger BONK character animations
    if (currentQuestion) {
      setCharacterState('playing');
      setTimeout(() => setCharacterState('idle'), 1000);
    }
  }, [currentQuestion]);

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleAddressChange = (e) => {
    setSolanaAddress(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && playerName.trim() && solanaAddress.trim()) {
      handleJoinRound();
    }
  };

  const isValidSolanaAddress = (address) => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address) && address.length >= 32 && address.length <= 44;
  };

  const handleJoinRound = async () => {
    if (!playerName.trim()) return;
    if (!solanaAddress.trim()) return;
    if (!isValidSolanaAddress(solanaAddress)) {
      alert('Please enter a valid Solana address');
      return;
    }

    try {
      await joinRound(playerName.trim(), solanaAddress.trim());
      setShowJoinForm(false);
      setPlayerName('');
      setSolanaAddress('');
    } catch (error) {
      console.error('Error joining round:', error);
    }
  };

  const handleAnswer = async (answerIndex) => {
    if (hasAnswered || !currentQuestion) return;

    // Play bonk sound effect
    playBonkSound();

    const timeTaken = (Date.now() - startTime) / 1000;
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    await submitAnswer(answerIndex, timeTaken);
    
    // Trigger BONK character celebration/disappointment
    const isCorrect = answerIndex === currentQuestion.correct;
    setCharacterState(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setCharacterState('idle'), 2000);
  };

  const getAnswerButtonClass = (index) => {
    const baseClass = "group relative w-full p-4 rounded-xl font-space font-semibold text-left transition-all duration-300 transform overflow-hidden";
    
    if (!hasAnswered) {
      return `${baseClass} bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 text-white hover:border-yellow-400 hover:from-yellow-400/10 hover:to-orange-400/10 hover:scale-[1.02] hover:shadow-lg cursor-pointer active:scale-[0.98]`;
    }
    
    if (index === currentQuestion.correct) {
      return `${baseClass} bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-400 text-white shadow-lg shadow-green-400/30`;
    } else if (index === selectedAnswer) {
      return `${baseClass} bg-gradient-to-r from-red-600 to-red-500 border-2 border-red-400 text-white shadow-lg shadow-red-400/30`;
    } else {
      return `${baseClass} bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-gray-600 text-gray-400`;
    }
  };

  // Prize Display Component
  const PrizeDisplay = ({ prizes }) => {
    if (!prizes || prizes.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bebas text-lg text-yellow-400">PRIZE POOL</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {prizes.slice(0, 6).map((prize, index) => (
            <div key={index} className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
              <Award className={`w-4 h-4 ${
                index === 0 ? 'text-yellow-400' :
                index === 1 ? 'text-gray-300' :
                index === 2 ? 'text-orange-400' :
                'text-blue-400'
              }`} />
              <span className="font-space text-sm text-white">
                #{prize.rank}: {prize.amount} {prize.currency}
              </span>
            </div>
          ))}
        </div>
        {prizes.length > 6 && (
          <div className="text-center mt-2">
            <span className="font-space text-xs text-gray-400">
              +{prizes.length - 6} more prizes
            </span>
          </div>
        )}
      </div>
    );
  };

  // Audio Controls Component
  const AudioControls = () => (
    <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
      <button
        onClick={toggleMusic}
        className={`p-2 rounded-lg transition-all ${
          isMusicEnabled ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-400'
        }`}
        title={isMusicEnabled ? 'Disable Music' : 'Enable Music'}
      >
        {isMusicEnabled ? <Music className="w-4 h-4" /> : <Music className="w-4 h-4" />}
      </button>
      <button
        onClick={toggleSound}
        className={`p-2 rounded-lg transition-all ${
          isSoundEnabled ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-400'
        }`}
        title={isSoundEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
      >
        {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );

  if (!activeRound) {
    return (
      <>
        <AudioControls />
        <div className="relative bonk-card bonk-fade-in p-8 text-center max-w-2xl mx-auto mt-20">
          <BonkMultiplayerCharacter 
            pose="relaxed" 
            position="-left-16 top-1/2 transform -translate-y-1/2" 
            className="hidden lg:block"
          />
          <BonkMultiplayerCharacter 
            pose="relaxed" 
            position="-right-16 top-1/2 transform -translate-y-1/2" 
            className="hidden lg:block"
          />
          
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="bonk-subtitle text-3xl mb-2">NO MULTIPLAYER ROUND ACTIVE</h2>
          <p className="text-gray-400">
            Check back later or ask an admin to start a round!
          </p>
        </div>
      </>
    );
  }

  if (activeRound.status === 'waiting') {
    return (
      <>
        <AudioControls />
        <div className="relative bonk-card bonk-fade-in p-8 max-w-4xl mx-auto mt-20">
          <BonkMultiplayerCharacter 
            pose="thumbsUp" 
            position="-left-20 top-1/2 transform -translate-y-1/2" 
            className="hidden xl:block"
            animate={roundStartCountdown !== null && roundStartCountdown <= 10}
          />
          <BonkMultiplayerCharacter 
            pose="excited" 
            position="-right-20 top-1/2 transform -translate-y-1/2" 
            className="hidden xl:block"
            animate={roundStartCountdown !== null && roundStartCountdown <= 10}
          />
          
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <Users className="w-16 h-16 text-bonk-yellow bonk-pulse" />
              <div className="absolute inset-0 w-16 h-16 bg-bonk-yellow/30 rounded-full animate-ping"></div>
            </div>
            <h2 className="bonk-title text-3xl mb-2">{activeRound.name || 'MULTIPLAYER ROUND'}</h2>
            {roundStartCountdown !== null && roundStartCountdown > 0 ? (
              <div className="bonk-card-glow p-4 mb-4 border-bonk-yellow">
                <p className="bonk-subtitle text-2xl">
                  STARTING IN: {Math.floor(roundStartCountdown / 60)}:{(roundStartCountdown % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-gray-300 text-sm">
                  Get ready! The round will begin automatically.
                </p>
              </div>
            ) : (
              <p className="text-gray-300 mb-4">
                Join now and wait for the admin to start the game!
              </p>
            )}
          </div>

          {/* Prize Display */}
          <PrizeDisplay prizes={activeRound.prizes} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bonk-glass rounded-xl p-4 text-center bonk-slide-in">
              <Target className="w-6 h-6 mx-auto mb-2 text-bonk-yellow" />
              <div className="text-gray-400 text-sm">Questions</div>
              <div className="bonk-subtitle text-xl">{activeRound.questionCount}</div>
            </div>
            <div className="bonk-glass rounded-xl p-4 text-center bonk-slide-in" style={{animationDelay: '0.1s'}}>
              <Clock className="w-6 h-6 mx-auto mb-2 text-bonk-yellow" />
              <div className="text-gray-400 text-sm">Time per Question</div>
              <div className="bonk-subtitle text-xl">{activeRound.timePerQuestion}s</div>
            </div>
            <div className="bonk-glass rounded-xl p-4 text-center bonk-slide-in" style={{animationDelay: '0.2s'}}>
              <Users className="w-6 h-6 mx-auto mb-2 text-bonk-yellow" />
              <div className="text-gray-400 text-sm">Players Joined</div>
              <div className="bonk-subtitle text-xl">{activeRound.players?.length || 0}</div>
            </div>
          </div>

          {!isInGame ? (
            <div className="text-center">
              {showJoinForm ? (
                <div className="max-w-md mx-auto">
                  <div className="bonk-card-glow p-6 border-bonk-yellow">
                    <h3 className="bonk-subtitle text-xl mb-4 flex items-center gap-2 justify-center">
                      <Wallet className="w-5 h-5" />
                      JOIN THE ROUND
                    </h3>
                    
                    <input
                      type="text"
                      value={playerName}
                      onChange={handleNameChange}
                      placeholder="Enter your display name..."
                      className="bonk-input mb-4"
                      maxLength={20}
                    />
                    
                    <input
                      type="text"
                      value={solanaAddress}
                      onChange={handleAddressChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your Solana wallet address..."
                      className="bonk-input mb-4 text-sm"
                      autoFocus
                    />
                    
                    <p className="text-gray-400 text-xs mb-4">
                      💡 Your Solana address is needed for potential prize distributions
                    </p>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleJoinRound}
                        disabled={!playerName.trim() || !solanaAddress.trim() || loading}
                        className="bonk-btn flex-1 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2 justify-center">
                            <div className="bonk-spinner"></div>
                            JOINING...
                          </div>
                        ) : (
                          'JOIN ROUND'
                        )}
                      </button>
                      <button
                        onClick={() => setShowJoinForm(false)}
                        className="bonk-btn-secondary"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowJoinForm(true)}
                  disabled={loading}
                  className="bonk-btn bonk-glow flex items-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  JOIN MULTIPLAYER ROUND
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="bonk-card-glow p-4 mb-4 border-green-400/50 bg-green-600/20">
                <p className="text-green-400">
                  ✅ You're in! Playing as <strong>{playerData?.name}</strong>
                </p>
                <p className="text-green-300 text-sm mt-1">
                  Wallet: {playerData?.solanaAddress?.slice(0, 4)}...{playerData?.solanaAddress?.slice(-4)}
                </p>
              </div>
              <button
                onClick={leaveRound}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all flex items-center gap-2 mx-auto"
              >
                <LogOut className="w-4 h-4" />
                LEAVE ROUND
              </button>
            </div>
          )}

          {activeRound.players && activeRound.players.length > 0 && (
            <div className="mt-6">
              <h3 className="bonk-subtitle text-lg mb-3">WAITING PLAYERS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {activeRound.players.map((player, index) => (
                  <div 
                    key={player.id} 
                    className="bonk-glass rounded-lg p-3 flex items-center gap-2 bonk-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{player.name}</span>
                    {player.solanaAddress && (
                      <span className="text-gray-400 text-xs">
                        ({player.solanaAddress.slice(0, 4)}...{player.solanaAddress.slice(-4)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (activeRound.status === 'playing' && isInGame) {
    return (
      <>
        <AudioControls />
        <div className="relative bonk-card bonk-fade-in p-8 max-w-4xl mx-auto mt-20">
          <BonkMultiplayerCharacter 
            pose={characterState === 'correct' ? 'excited' : characterState === 'wrong' ? 'relaxed' : 'thumbsUp'} 
            position="-left-20 top-1/2 transform -translate-y-1/2" 
            className="hidden xl:block"
            animate={characterState === 'correct'}
          />
          <BonkMultiplayerCharacter 
            pose={characterState === 'correct' ? 'thumbsUp' : characterState === 'wrong' ? 'relaxed' : 'excited'} 
            position="-right-20 top-1/2 transform -translate-y-1/2" 
            className="hidden xl:block"
            animate={characterState === 'correct'}
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="bonk-glass rounded-xl px-4 py-2">
                <span className="text-gray-400 text-sm">Question </span>
                <span className="bonk-subtitle text-lg">
                  {currentQuestionIndex + 1}/{activeRound.questionCount}
                </span>
              </div>
              <div className="bonk-glass rounded-xl px-4 py-2">
                <span className="text-gray-400 text-sm">Your Score: </span>
                <span className="bonk-subtitle text-lg">{playerData?.score || 0}</span>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 bonk-glass rounded-xl px-4 py-2 ${
              timeLeft <= 5 ? 'bonk-pulse border-red-400' : ''
            }`}>
              <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400' : 'text-bonk-yellow'}`} />
              <span className={`font-bold text-xl ${timeLeft <= 5 ? 'text-red-400' : 'text-bonk-yellow'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {currentQuestion && (
            <div className="mb-8">
              <div className="bonk-card-glow p-6 mb-6">
                <h2 className="text-xl text-white font-bold leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={hasAnswered || timeLeft === 0}
                    className={`${getAnswerButtonClass(index)} ${hasAnswered ? '' : 'bonk-fade-in'}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-orange-400/0 group-hover:from-yellow-400/10 group-hover:to-orange-400/10 rounded-xl transition-all duration-300"></div>
                    
                    <div className="relative flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center font-bold text-white group-hover:bg-yellow-400 group-hover:text-gray-900 transition-all duration-300">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {hasAnswered && (
                <div className="mt-4 text-center bonk-fade-in">
                  {selectedAnswer === currentQuestion.correct ? (
                    <div className="bonk-card-glow p-4 border-green-400/50 bg-green-600/20 bonk-bounce">
                      <p className="font-bold text-green-400 text-lg">🎉 CORRECT! Great job!</p>
                    </div>
                  ) : (
                    <div className="bonk-card-glow p-4 border-red-400/50 bg-red-600/20">
                      <p className="font-bold text-red-400 text-lg">❌ Wrong answer</p>
                      <p className="text-gray-300 text-sm mt-1">
                        Correct answer: {String.fromCharCode(65 + currentQuestion.correct)} - {currentQuestion.options[currentQuestion.correct]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {leaderboard.length > 0 && (
            <div className="bonk-card-glow p-4">
              <h3 className="bonk-subtitle text-lg mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                LIVE LEADERBOARD
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leaderboard.map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`bonk-leaderboard-item ${
                      player.id === playerData?.id ? 'current-player' : ''
                    } ${index < 3 ? 'top-3' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 && <Crown className="w-4 h-4 text-bonk-yellow" />}
                      <span className={`font-bold text-lg ${
                        index === 0 ? 'text-bonk-yellow' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className={`${
                          player.id === playerData?.id ? 'text-bonk-yellow font-bold' : 'text-white'
                        }`}>
                          {player.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {player.correctAnswers || 0}/{player.totalAnswers || 0} correct
                          {player.accuracy ? ` (${player.accuracy}%)` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="bonk-subtitle font-bold">{player.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (activeRound.status === 'finished' && isInGame) {
    return (
      <>
        <AudioControls />
        <div className="relative bonk-card bonk-fade-in p-8 text-center max-w-5xl mx-auto mt-20">
          <BonkMultiplayerCharacter 
            pose="excited" 
            position="-left-20 top-1/4" 
            className="hidden xl:block"
            animate={true}
          />
          <BonkMultiplayerCharacter 
            pose="thumbsUp" 
            position="-right-20 top-1/4" 
            className="hidden xl:block"
            animate={true}
          />
          
          <Trophy className="w-16 h-16 mx-auto mb-4 text-bonk-yellow bonk-bounce" />
          <h2 className="bonk-title text-3xl mb-6">🎉 ROUND COMPLETE!</h2>
          
          {/* Prize Pool Info */}
          <PrizeDisplay prizes={activeRound.prizes} />
          
          {/* Player's Personal Stats */}
          {playerData && (
            <div className="bonk-card-glow p-6 mb-6 border-bonk-yellow">
              <h3 className="bonk-subtitle text-xl mb-4">YOUR PERFORMANCE</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bonk-glass rounded-lg p-3 bonk-fade-in">
                  <div className="bonk-title text-2xl">{playerData.score}</div>
                  <div className="text-gray-300 text-sm">Total Points</div>
                </div>
                <div className="bonk-glass rounded-lg p-3 bonk-fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="text-green-400 font-bold text-2xl">{playerData.correctAnswers || 0}</div>
                  <div className="text-gray-300 text-sm">Correct</div>
                </div>
                <div className="bonk-glass rounded-lg p-3 bonk-fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="text-blue-400 font-bold text-2xl">{playerData.accuracy || 0}%</div>
                  <div className="text-gray-300 text-sm">Accuracy</div>
                </div>
                <div className="bonk-glass rounded-lg p-3 bonk-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="text-purple-400 font-bold text-2xl">#{playerData.rank || '?'}</div>
                  <div className="text-gray-300 text-sm">Final Rank</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Final Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="bonk-card-glow p-6 mb-6">
              <h3 className="bonk-subtitle text-xl mb-4">🏆 FINAL LEADERBOARD</h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((player, index) => {
                  const prize = activeRound.prizes?.find(p => p.rank === index + 1);
                  
                  return (
                    <div 
                      key={player.id} 
                      className={`bonk-leaderboard-item ${
                        player.id === playerData?.id 
                          ? 'current-player bonk-glow' 
                          : index < 3 
                            ? 'top-3' 
                            : ''
                      } bonk-slide-in`}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <span className="text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                          <span className={`font-bold text-xl ${
                            index === 0 ? 'text-bonk-yellow' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-400' :
                            'text-gray-500'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-start">
                          <span className={`text-lg ${
                            player.id === playerData?.id ? 'text-bonk-yellow font-bold' : 'text-white'
                          }`}>
                            {player.name}
                          </span>
                          <div className="flex gap-4 text-xs">
                            <span className="text-green-400">
                              ✓ {player.correctAnswers || 0}/{player.totalAnswers || 0}
                            </span>
                            <span className="text-blue-400">
                              {player.accuracy || 0}% accuracy
                            </span>
                            {player.averageTime && (
                              <span className="text-purple-400">
                                ~{player.averageTime}s avg
                              </span>
                            )}
                          </div>
                          {player.solanaAddress && (
                            <span className="text-gray-400 text-xs mt-1">
                              {player.solanaAddress.slice(0, 8)}...{player.solanaAddress.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="bonk-subtitle text-xl">{player.score}</div>
                        <div className="text-gray-400 text-xs">points</div>
                        {prize && (
                          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-lg px-2 py-1 mt-1">
                            <span className="text-yellow-400 text-xs font-bold">
                              🏆 {prize.amount} {prize.currency}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prize Distribution Info */}
          <div className="bg-bonk-gradient/10 border border-bonk-yellow/30 rounded-xl p-4 mb-6 bonk-glow">
            <h4 className="bonk-subtitle text-lg mb-2">💰 PRIZE DISTRIBUTION</h4>
            <p className="text-gray-300 text-sm">
              Prizes will be distributed to Solana wallets based on final rankings.
              Check your wallet in the next 24 hours!
            </p>
          </div>

          <button
            onClick={leaveRound}
            className="bonk-btn bonk-glow"
          >
            RETURN TO LOBBY
          </button>
        </div>
      </>
    );
  }

  if (activeRound.status === 'playing' && !isInGame) {
    return (
      <>
        <AudioControls />
        <div className="relative bonk-card bonk-fade-in p-8 text-center max-w-2xl mx-auto mt-20">
          <BonkMultiplayerCharacter 
            pose="relaxed" 
            position="-left-16 top-1/2 transform -translate-y-1/2" 
            className="hidden lg:block"
          />
          <BonkMultiplayerCharacter 
            pose="relaxed" 
            position="-right-16 top-1/2 transform -translate-y-1/2" 
            className="hidden lg:block"
          />
          
          <Clock className="w-16 h-16 mx-auto mb-4 text-red-400 bonk-pulse" />
          <h2 className="text-red-400 text-3xl font-bold mb-2">ROUND IN PROGRESS</h2>
          <p className="text-gray-300 mb-4">
            A multiplayer round is currently active, but you can't join mid-game.
          </p>
          <p className="text-gray-500">
            Wait for the current round to finish!
          </p>
        </div>
      </>
    );
  }

  return null;
};

export default MultiplayerGame;