import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Play, 
  Clock, 
  Trophy, 
  LogOut,
  Crown,
  Target,
  Timer,
  Wallet
} from 'lucide-react';
import { useMultiplayer } from '../context/MultiplayerContext';

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

  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setStartTime(Date.now());
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
    // Basic Solana address validation (base58, 32-44 characters)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address) && address.length >= 32 && address.length <= 44;
  };

  const handleJoinRound = async () => {
    if (!playerName.trim()) {
      alert('Please enter a player name');
      return;
    }
    if (!solanaAddress.trim()) {
      alert('Please enter your Solana wallet address');
      return;
    }
    if (!isValidSolanaAddress(solanaAddress)) {
      alert('Please enter a valid Solana address (32-44 characters, base58 format)');
      return;
    }

    try {
      await joinRound(playerName.trim(), solanaAddress.trim());
      setShowJoinForm(false);
      setPlayerName('');
      setSolanaAddress('');
    } catch (error) {
      console.error('Error joining round:', error);
      alert('Failed to join round: ' + error.message);
    }
  };

  const handleAnswer = async (answerIndex) => {
    if (hasAnswered || !currentQuestion) return;

    const timeTaken = (Date.now() - startTime) / 1000;
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    await submitAnswer(answerIndex, timeTaken);
  };

  const getAnswerButtonClass = (index) => {
    if (!hasAnswered) {
      return "bonk-answer-btn";
    }
    
    if (index === currentQuestion.correct) {
      return "bonk-answer-correct";
    } else if (index === selectedAnswer) {
      return "bonk-answer-wrong";
    } else {
      return "bonk-answer-disabled";
    }
  };

  if (!activeRound) {
    return (
      <div className="bonk-widget p-8 text-center max-w-2xl mx-auto">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h2 className="bonk-header text-3xl text-gray-400 mb-2">NO MULTIPLAYER ROUND ACTIVE</h2>
        <p className="bonk-body text-gray-500">
          Check back later or ask an admin to start a round!
        </p>
      </div>
    );
  }

  if (activeRound.status === 'waiting') {
    return (
      <div className="bonk-widget p-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <Users className="w-16 h-16 text-yellow-400 bonk-pulse" />
            <div className="absolute inset-0 w-16 h-16 bg-yellow-400/30 rounded-full animate-ping"></div>
          </div>
          <h2 className="bonk-header text-3xl text-yellow-400 mb-2">{activeRound.name || 'MULTIPLAYER ROUND'}</h2>
          {roundStartCountdown !== null && roundStartCountdown > 0 ? (
            <div className="bg-yellow-400/20 border border-yellow-400 rounded-xl p-4 mb-4">
              <p className="bonk-header text-yellow-400 text-2xl">
                STARTING IN: {Math.floor(roundStartCountdown / 60)}:{(roundStartCountdown % 60).toString().padStart(2, '0')}
              </p>
              <p className="bonk-body text-gray-300 text-sm">
                Get ready! The round will begin automatically.
              </p>
            </div>
          ) : (
            <p className="bonk-body text-gray-300 mb-4">
              Join now and wait for the admin to start the game!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bonk-widget-dark rounded-xl p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="bonk-body text-gray-400 text-sm">Questions</div>
            <div className="bonk-header text-xl text-white">{activeRound.questionCount}</div>
          </div>
          <div className="bonk-widget-dark rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="bonk-body text-gray-400 text-sm">Time per Question</div>
            <div className="bonk-header text-xl text-white">{activeRound.timePerQuestion}s</div>
          </div>
          <div className="bonk-widget-dark rounded-xl p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="bonk-body text-gray-400 text-sm">Players Joined</div>
            <div className="bonk-header text-xl text-white">{activeRound.players?.length || 0}</div>
          </div>
        </div>

        {!isInGame ? (
          <div className="text-center">
            {showJoinForm ? (
              <div className="max-w-md mx-auto">
                <div className="bonk-widget-dark p-6 rounded-xl border border-yellow-400/50">
                  <h3 className="bonk-header text-xl text-yellow-400 mb-4 flex items-center gap-2 justify-center">
                    <Wallet className="w-5 h-5" />
                    JOIN THE ROUND
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="bonk-body block text-white font-bold mb-2 text-left">
                        Player Name
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={handleNameChange}
                        placeholder="Enter your display name..."
                        className="bonk-body w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
                        maxLength={20}
                      />
                    </div>
                    
                    <div>
                      <label className="bonk-body block text-white font-bold mb-2 text-left">
                        Solana Wallet Address
                      </label>
                      <input
                        type="text"
                        value={solanaAddress}
                        onChange={handleAddressChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your Solana wallet address..."
                        className="bonk-body w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors text-sm"
                        autoFocus
                      />
                      <p className="bonk-body text-gray-400 text-xs mt-2 text-left">
                        💡 Your Solana address is needed for potential prize distributions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleJoinRound}
                      disabled={!playerName.trim() || !solanaAddress.trim() || loading}
                      className="bonk-btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
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
                className="bonk-btn-primary bonk-glow group flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                JOIN MULTIPLAYER ROUND
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-4 mb-4">
              <p className="bonk-body text-green-400">
                ✅ You're in! Playing as <strong>{playerData?.name}</strong>
              </p>
              <p className="bonk-body text-green-300 text-sm mt-1">
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
            <h3 className="bonk-header text-lg text-yellow-400 mb-3">WAITING PLAYERS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {activeRound.players.map((player, index) => (
                <div 
                  key={player.id} 
                  className="bonk-widget-dark rounded-lg p-3 flex items-center gap-2 bonk-fade-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <Users className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="bonk-body text-white">{player.name}</span>
                    {player.solanaAddress && (
                      <span className="bonk-body text-gray-400 text-xs">
                        {player.solanaAddress.slice(0, 4)}...{player.solanaAddress.slice(-4)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeRound.status === 'playing' && isInGame) {
    return (
      <div className="bonk-widget p-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="bonk-widget-dark rounded-xl px-4 py-2">
              <span className="bonk-body text-gray-400 text-sm">Question </span>
              <span className="bonk-header text-yellow-400 text-lg">
                {currentQuestionIndex + 1}/{activeRound.questionCount}
              </span>
            </div>
            <div className="bonk-widget-dark rounded-xl px-4 py-2">
              <span className="bonk-body text-gray-400 text-sm">Your Score: </span>
              <span className="bonk-header text-yellow-400 text-lg">{playerData?.score || 0}</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 bonk-widget-dark rounded-xl px-4 py-2 ${
            timeLeft <= 5 ? 'bonk-pulse border border-red-400' : ''
          }`}>
            <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`} />
            <span className={`bonk-header text-xl ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {currentQuestion && (
          <div className="mb-8">
            <div className="bonk-widget-dark rounded-xl p-6 mb-6">
              <h2 className="bonk-body text-xl text-white font-bold leading-relaxed">
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
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center bonk-header text-white">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="bonk-body">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {hasAnswered && (
              <div className="mt-4 text-center bonk-fade-in">
                {selectedAnswer === currentQuestion.correct ? (
                  <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-4 bonk-bounce">
                    <p className="bonk-header text-green-400 text-lg">🎉 CORRECT! Great job!</p>
                  </div>
                ) : (
                  <div className="bg-red-600/20 border border-red-400/50 rounded-xl p-4">
                    <p className="bonk-header text-red-400 text-lg">❌ Wrong answer</p>
                    <p className="bonk-body text-gray-300 text-sm mt-1">
                      Correct answer: {String.fromCharCode(65 + currentQuestion.correct)} - {currentQuestion.options[currentQuestion.correct]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {leaderboard.length > 0 && (
          <div className="bonk-widget-dark rounded-xl p-4">
            <h3 className="bonk-header text-lg text-yellow-400 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              LIVE LEADERBOARD
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {leaderboard.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                    player.id === playerData?.id ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                    <span className={`bonk-header text-lg ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className={`bonk-body ${
                        player.id === playerData?.id ? 'text-yellow-400 font-bold' : 'text-white'
                      }`}>
                        {player.name}
                      </span>
                      <span className="bonk-body text-gray-400 text-xs">
                        {player.correctAnswers || 0}/{player.totalAnswers || 0} correct
                        {player.accuracy ? ` (${player.accuracy}%)` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="bonk-header text-yellow-400">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeRound.status === 'finished' && isInGame) {
    return (
      <div className="bonk-widget p-8 text-center max-w-5xl mx-auto">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400 bonk-bounce" />
        <h2 className="bonk-header text-3xl text-yellow-400 mb-6">🎉 ROUND COMPLETE!</h2>
        
        {/* Player's Personal Stats */}
        {playerData && (
          <div className="bonk-widget-dark p-6 mb-6 border border-yellow-400/50">
            <h3 className="bonk-header text-xl text-yellow-400 mb-4">YOUR PERFORMANCE</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bonk-widget-dark rounded-lg p-3 bonk-fade-in">
                <div className="bonk-header text-2xl text-yellow-400">{playerData.score}</div>
                <div className="bonk-body text-gray-300 text-sm">Total Points</div>
              </div>
              <div className="bonk-widget-dark rounded-lg p-3 bonk-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="text-green-400 font-bold text-2xl">{playerData.correctAnswers || 0}</div>
                <div className="bonk-body text-gray-300 text-sm">Correct</div>
              </div>
              <div className="bonk-widget-dark rounded-lg p-3 bonk-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="text-blue-400 font-bold text-2xl">{playerData.accuracy || 0}%</div>
                <div className="bonk-body text-gray-300 text-sm">Accuracy</div>
              </div>
              <div className="bonk-widget-dark rounded-lg p-3 bonk-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="text-purple-400 font-bold text-2xl">#{playerData.rank || '?'}</div>
                <div className="bonk-body text-gray-300 text-sm">Final Rank</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Final Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bonk-widget-dark p-6 mb-6">
            <h3 className="bonk-header text-xl text-yellow-400 mb-4">🏆 FINAL LEADERBOARD</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex justify-between items-center py-3 px-4 rounded-lg transition-colors bonk-slide-in ${
                    player.id === playerData?.id 
                      ? 'bg-yellow-400/20 border border-yellow-400/50 bonk-glow' 
                      : index < 3 
                        ? 'bg-gray-800/60' 
                        : 'bg-gray-800/40'
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className={`bonk-header text-xl ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-start">
                      <span className={`bonk-body text-lg ${
                        player.id === playerData?.id ? 'text-yellow-400 font-bold' : 'text-white'
                      }`}>
                        {player.name}
                      </span>
                      <div className="flex gap-4 text-xs">
                        <span className="bonk-body text-green-400">
                          ✓ {player.correctAnswers || 0}/{player.totalAnswers || 0}
                        </span>
                        <span className="bonk-body text-blue-400">
                          {player.accuracy || 0}% accuracy
                        </span>
                        {player.averageTime && (
                          <span className="bonk-body text-purple-400">
                            ~{player.averageTime}s avg
                          </span>
                        )}
                      </div>
                      {player.solanaAddress && (
                        <span className="bonk-body text-gray-400 text-xs mt-1">
                          {player.solanaAddress.slice(0, 8)}...{player.solanaAddress.slice(-8)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="bonk-header text-xl text-yellow-400">{player.score}</div>
                    <div className="bonk-body text-gray-400 text-xs">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prize Pool Info */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-6 bonk-glow">
          <h4 className="bonk-header text-lg text-yellow-400 mb-2">💰 PRIZE DISTRIBUTION</h4>
          <p className="bonk-body text-gray-300 text-sm">
            Prizes will be distributed to Solana wallets based on final rankings.
            Check your wallet in the next 24 hours!
          </p>
        </div>

        <button
          onClick={leaveRound}
          className="bonk-btn-primary bonk-glow"
        >
          RETURN TO LOBBY
        </button>
      </div>
    );
  }

  if (activeRound.status === 'playing' && !isInGame) {
    return (
      <div className="bonk-widget p-8 text-center max-w-2xl mx-auto">
        <Clock className="w-16 h-16 mx-auto mb-4 text-red-400 bonk-pulse" />
        <h2 className="bonk-header text-3xl text-red-400 mb-2">ROUND IN PROGRESS</h2>
        <p className="bonk-body text-gray-300 mb-4">
          A multiplayer round is currently active, but you can't join mid-game.
        </p>
        <p className="bonk-body text-gray-500">
          Wait for the current round to finish!
        </p>
      </div>
    );
  }

  return null;
};

export default MultiplayerGame;