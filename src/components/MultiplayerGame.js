import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Play, 
  Clock, 
  Trophy, 
  LogOut,
  Crown,
  Target,
  Timer
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
    loading
  } = useMultiplayer();

  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setStartTime(Date.now());
  }, [currentQuestion]);

  const handleJoinRound = async () => {
    if (showNameInput && playerName.trim()) {
      await joinRound(playerName.trim());
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
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
    const baseClass = "w-full p-4 rounded-xl font-space font-semibold text-left transition-all transform";
    
    if (!hasAnswered) {
      return `${baseClass} bg-gray-800 border-2 border-gray-600 text-white hover:border-yellow-400 hover:bg-gray-700 hover:scale-[1.02]`;
    }
    
    if (index === currentQuestion.correct) {
      return `${baseClass} bg-green-600 border-2 border-green-400 text-white`;
    } else if (index === selectedAnswer) {
      return `${baseClass} bg-red-600 border-2 border-red-400 text-white`;
    } else {
      return `${baseClass} bg-gray-700 border-2 border-gray-600 text-gray-400`;
    }
  };

  if (!activeRound) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h2 className="font-bebas text-3xl text-gray-400 mb-2">NO MULTIPLAYER ROUND ACTIVE</h2>
        <p className="font-space text-gray-500">
          Check back later or ask an admin to start a round!
        </p>
      </div>
    );
  }

  if (activeRound.status === 'waiting') {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <Users className="w-16 h-16 text-yellow-400 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 bg-yellow-400/30 rounded-full animate-ping"></div>
          </div>
          <h2 className="font-bebas text-3xl text-yellow-400 mb-2">{activeRound.name || 'MULTIPLAYER ROUND'}</h2>
          <p className="font-space text-gray-300 mb-4">
            Join now and wait for the admin to start the game!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="font-space text-gray-400 text-sm">Questions</div>
            <div className="font-bebas text-xl text-white">{activeRound.questionCount}</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="font-space text-gray-400 text-sm">Time per Question</div>
            <div className="font-bebas text-xl text-white">{activeRound.timePerQuestion}s</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="font-space text-gray-400 text-sm">Players Joined</div>
            <div className="font-bebas text-xl text-white">{activeRound.players?.length || 0}</div>
          </div>
        </div>

        {!isInGame ? (
          <div className="text-center">
            {showNameInput ? (
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your player name..."
                  className="font-space w-full p-3 mb-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRound()}
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleJoinRound}
                    disabled={!playerName.trim() || loading}
                    className="font-bebas flex-1 bg-yellow-400 text-gray-900 py-3 px-6 rounded-xl hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all"
                  >
                    JOIN ROUND
                  </button>
                  <button
                    onClick={() => setShowNameInput(false)}
                    className="font-bebas bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleJoinRound}
                disabled={loading}
                className="font-bebas bg-yellow-400 text-gray-900 py-3 px-8 rounded-xl hover:bg-yellow-300 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                JOIN MULTIPLAYER ROUND
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-4 mb-4">
              <p className="font-space text-green-400">
                ✅ You're in! Playing as <strong>{playerData?.name}</strong>
              </p>
            </div>
            <button
              onClick={leaveRound}
              className="font-bebas bg-red-600 text-white py-2 px-6 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 mx-auto"
            >
              <LogOut className="w-4 h-4" />
              LEAVE ROUND
            </button>
          </div>
        )}

        {activeRound.players && activeRound.players.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bebas text-lg text-yellow-400 mb-3">WAITING PLAYERS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {activeRound.players.map((player) => (
                <div key={player.id} className="bg-gray-900/60 rounded-lg p-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-space text-white">{player.name}</span>
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
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="bg-gray-900/60 rounded-xl px-4 py-2">
              <span className="font-space text-gray-400 text-sm">Question </span>
              <span className="font-bebas text-yellow-400 text-lg">
                {currentQuestionIndex + 1}/{activeRound.questionCount}
              </span>
            </div>
            <div className="bg-gray-900/60 rounded-xl px-4 py-2">
              <span className="font-space text-gray-400 text-sm">Your Score: </span>
              <span className="font-bebas text-yellow-400 text-lg">{playerData?.score || 0}</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 bg-gray-900/60 rounded-xl px-4 py-2 ${
            timeLeft <= 5 ? 'animate-pulse' : ''
          }`}>
            <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`} />
            <span className={`font-bebas text-xl ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {currentQuestion && (
          <div className="mb-8">
            <div className="bg-gray-900/60 rounded-xl p-6 mb-6">
              <h2 className="font-space text-xl text-white font-bold leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={hasAnswered || timeLeft === 0}
                  className={getAnswerButtonClass(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center font-bebas text-white">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {hasAnswered && (
              <div className="mt-4 text-center">
                {selectedAnswer === currentQuestion.correct ? (
                  <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-4">
                    <p className="font-bebas text-green-400 text-lg">🎉 CORRECT! Great job!</p>
                  </div>
                ) : (
                  <div className="bg-red-600/20 border border-red-400/50 rounded-xl p-4">
                    <p className="font-bebas text-red-400 text-lg">❌ Wrong answer</p>
                    <p className="font-space text-gray-300 text-sm mt-1">
                      Correct answer: {String.fromCharCode(65 + currentQuestion.correct)} - {currentQuestion.options[currentQuestion.correct]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {leaderboard.length > 0 && (
          <div className="bg-gray-900/60 rounded-xl p-4">
            <h3 className="font-bebas text-lg text-yellow-400 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              LIVE LEADERBOARD
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {leaderboard.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                    player.id === playerData?.id ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                    <span className={`font-bebas text-lg ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className={`font-space ${
                      player.id === playerData?.id ? 'text-yellow-400 font-bold' : 'text-white'
                    }`}>
                      {player.name}
                    </span>
                  </div>
                  <span className="font-bebas text-yellow-400">{player.score} pts</span>
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
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <h2 className="font-bebas text-3xl text-yellow-400 mb-4">ROUND FINISHED!</h2>
        
        {leaderboard.length > 0 && (
          <div className="bg-gray-900/60 rounded-xl p-6 mb-6">
            <h3 className="font-bebas text-xl text-yellow-400 mb-4">FINAL RESULTS</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex justify-between items-center py-3 px-4 rounded-lg ${
                    player.id === playerData?.id ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index < 3 && (
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <span className={`font-bebas text-lg ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className={`font-space ${
                      player.id === playerData?.id ? 'text-yellow-400 font-bold' : 'text-white'
                    }`}>
                      {player.name}
                    </span>
                  </div>
                  <span className="font-bebas text-yellow-400 text-lg">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={leaveRound}
          className="font-bebas bg-yellow-400 text-gray-900 py-3 px-8 rounded-xl hover:bg-yellow-300 transition-all"
        >
          RETURN TO LOBBY
        </button>
      </div>
    );
  }

  if (activeRound.status === 'playing' && !isInGame) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
        <Clock className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h2 className="font-bebas text-3xl text-red-400 mb-2">ROUND IN PROGRESS</h2>
        <p className="font-space text-gray-300 mb-4">
          A multiplayer round is currently active, but you can't join mid-game.
        </p>
        <p className="font-space text-gray-500">
          Wait for the current round to finish!
        </p>
      </div>
    );
  }

  return null;
};

export default MultiplayerGame;