import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Clock, Zap, Trophy, Users, Coins, Play, RefreshCw, Star, Target, Flame, Award, ChevronRight, Timer, TrendingUp } from 'lucide-react';
import { useGame } from '../context/GameContext';
import MultiplayerGame from './MultiplayerGame';
import { useMultiplayer } from '../context/MultiplayerContext';

// Multiplayer Section Component
const MultiplayerSection = () => {
  const { activeRound } = useMultiplayer();

  // Only show if there's an active round
  if (!activeRound) return null;

  return (
    <div className="mb-8">
      <h2 className="font-bebas text-3xl text-yellow-400 mb-4 text-center">
        🔥 {activeRound.name || 'LIVE MULTIPLAYER ROUND'} 🔥
      </h2>
      <MultiplayerGame />
    </div>
  );
};

const BonkBlitz = () => {
  const { state, actions } = useGame();
  
  // Game state
  const [gameState, setGameState] = useState('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(5);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);

  // Refs for timers
  const timerRef = useRef(null);
  const questionTimerRef = useRef(null);

  // Get active questions for the game
  const activeQuestions = useMemo(() => {
    return actions.getActiveQuestions();
  }, [state.questions, actions]);

  // Current question data
  const currentQuestionData = useMemo(() => {
    return gameQuestions[currentQuestionIndex] || null;
  }, [gameQuestions, currentQuestionIndex]);

  // Shuffle questions for each game
  const shuffleQuestions = useCallback(() => {
    const shuffled = [...activeQuestions].sort(() => Math.random() - 0.5);
    setGameQuestions(shuffled.slice(0, Math.min(8, shuffled.length)));
  }, [activeQuestions]);

  // Start game function
  const startGame = useCallback(() => {
    shuffleQuestions();
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setQuestionTimeLeft(5);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setGameStartTime(Date.now());
    actions.startGame();
  }, [shuffleQuestions, actions]);

  // Answer selection with real data tracking
  const selectAnswer = useCallback((answerIndex) => {
    if (isAnswered || !currentQuestionData) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestionData.correct;
    
    // Track question analytics
    actions.questionAsked(currentQuestionData.id);
    actions.questionAnswered(currentQuestionData.id, isCorrect);
    
    if (isCorrect) {
      const timeBonus = questionTimeLeft * 100;
      const streakBonus = streak * 50;
      const points = 1000 + timeBonus + streakBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }, [isAnswered, currentQuestionData, questionTimeLeft, streak, actions]);

  // Next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionTimeLeft(5);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      endGame();
    }
  }, [currentQuestionIndex, gameQuestions]);

  // End game with analytics
  const endGame = useCallback(() => {
    const sessionTime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
    const questionsAnswered = currentQuestionIndex + (isAnswered ? 1 : 0);
    
    // Save game session data
    actions.endGame({
      score,
      streak,
      questionsAnswered,
      sessionTime,
      accuracy: questionsAnswered > 0 ? Math.round((score / 1000) / questionsAnswered * 100) : 0
    });
    
    setGameState('finished');
  }, [gameStartTime, currentQuestionIndex, isAnswered, score, streak, actions]);

  // Reset game
  const resetGame = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(questionTimerRef.current);
    
    setGameState('lobby');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuestionTimeLeft(5);
    setGameQuestions([]);
  }, []);

  // Timer effects
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState, endGame]);

  useEffect(() => {
    if (gameState === 'playing' && !isAnswered && questionTimeLeft > 0) {
      questionTimerRef.current = setTimeout(() => {
        setQuestionTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (questionTimeLeft === 0 && !isAnswered) {
      nextQuestion();
    }

    return () => clearTimeout(questionTimerRef.current);
  }, [questionTimeLeft, isAnswered, gameState, nextQuestion]);

  // Auto-advance after answer
  useEffect(() => {
    if (isAnswered) {
      const timeout = setTimeout(nextQuestion, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isAnswered, nextQuestion]);

  // Memoized computed values
  const formattedScore = useMemo(() => score.toLocaleString(), [score]);
  const formattedPrizePool = useMemo(() => state.gameStats.currentPrizePool.toFixed(3), [state.gameStats.currentPrizePool]);
  const questionProgress = useMemo(() => `${currentQuestionIndex + 1} / ${gameQuestions.length}`, [currentQuestionIndex, gameQuestions.length]);
  const accuracy = useMemo(() => gameQuestions.length > 0 ? Math.round((score / 1000) * 100 / gameQuestions.length) : 0, [score, gameQuestions.length]);
  const finalRank = useMemo(() => Math.floor(Math.random() * 10) + 1, []);

  // Show loading if no questions available
  if (activeQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-x-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 animate-pulse text-yellow-400" />
            <h2 className="font-bebas text-2xl mb-2 text-yellow-400">LOADING QUESTIONS...</h2>
            <p className="font-space text-gray-300">Please wait while we prepare your trivia experience!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-x-hidden">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;700&display=swap');
        
        .font-bebas {
          font-family: 'Bebas Neue', cursive;
          letter-spacing: 0.05em;
        }
        
        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }
        
        .glow-yellow {
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.5), 0 0 40px rgba(250, 204, 21, 0.3);
        }
        
        .text-glow {
          text-shadow: 0 0 10px rgba(250, 204, 21, 0.8), 0 0 20px rgba(250, 204, 21, 0.5);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent"></div>
        <div className="relative flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 w-10 h-10 bg-yellow-400/30 rounded-full animate-ping"></div>
            </div>
            <h1 className="font-bebas text-4xl sm:text-5xl text-yellow-400 text-glow">
              BONK BLITZ
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/30">
              <Users className="w-5 h-5 text-yellow-400" />
              <span className="font-space font-bold text-sm sm:text-base">{state.liveGame.currentPlayers} Players</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/30">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-space font-bold text-sm sm:text-base">{formattedPrizePool} SOL</span>
            </div>
            <div className="bg-yellow-400/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400">
              <span className="text-yellow-400 font-space font-bold text-sm">LIVE NOW</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-[calc(100vh-100px)]">
        {/* Multiplayer Section - Shows when there's an active round */}
        <MultiplayerSection />

        {gameState === 'lobby' && (
          <div className="text-center max-w-4xl w-full">
            <div className="mb-8 sm:mb-12 float-animation">
              <h2 className="font-bebas text-6xl sm:text-8xl lg:text-9xl mb-4 text-yellow-400 text-glow">
                BONK BLITZ
              </h2>
              <p className="font-space text-xl sm:text-2xl text-gray-300 mb-2">Think Fast, Win SOL</p>
              <p className="font-space text-base sm:text-lg text-gray-400">60 seconds • Lightning trivia • Epic rewards</p>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-8 border border-gray-700">
              <h3 className="font-bebas text-2xl sm:text-3xl mb-6 text-yellow-400">HOW TO PLAY</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-colors">
                  <div className="bg-yellow-400/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Timer className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h4 className="font-bebas text-xl mb-2 text-yellow-400">LIGHTNING SPEED</h4>
                  <p className="font-space text-sm text-gray-300">5 seconds per question. Think fast!</p>
                </div>
                <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-colors">
                  <div className="bg-yellow-400/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Flame className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h4 className="font-bebas text-xl mb-2 text-yellow-400">STREAK BONUS</h4>
                  <p className="font-space text-sm text-gray-300">Chain correct answers for mega points!</p>
                </div>
                <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-colors">
                  <div className="bg-yellow-400/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h4 className="font-bebas text-xl mb-2 text-yellow-400">WIN BIG</h4>
                  <p className="font-space text-sm text-gray-300">Top players split the prize pool!</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="font-space text-base sm:text-lg text-gray-300 bg-gray-800/60 px-6 py-3 rounded-lg inline-block border border-gray-700">
                Entry: FREE
              </div>
              <button 
                onClick={startGame}
                className="group font-bebas text-2xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 rounded-xl bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 mx-auto glow-yellow"
              >
                <Play className="w-6 sm:w-8 h-6 sm:h-8" />
                <span>START BLITZ</span>
                <ChevronRight className="w-6 sm:w-8 h-6 sm:h-8 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && currentQuestionData && (
          <div className="w-full max-w-4xl">
            {/* Game Header */}
            <div className="grid grid-cols-2 sm:flex sm:justify-between items-center mb-6 sm:mb-8 bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 gap-3 sm:gap-4 border border-gray-700">
              <div className="bg-gray-900/80 px-4 py-3 rounded-xl border border-gray-700">
                <div className="font-bebas text-2xl sm:text-3xl text-yellow-400">{timeLeft}s</div>
                <div className="font-space text-xs sm:text-sm text-gray-400">Game Time</div>
              </div>
              <div className="bg-gray-900/80 px-4 py-3 rounded-xl border border-gray-700">
                <div className="font-bebas text-2xl sm:text-3xl text-yellow-400">{formattedScore}</div>
                <div className="font-space text-xs sm:text-sm text-gray-400">Score</div>
              </div>
              <div className="bg-gray-900/80 px-4 py-3 rounded-xl border border-gray-700">
                <div className="font-bebas text-2xl sm:text-3xl text-yellow-400">{streak}</div>
                <div className="font-space text-xs sm:text-sm text-gray-400">Streak</div>
              </div>
              <div className="bg-gray-900/80 px-4 py-3 rounded-xl border border-gray-700 col-span-2 sm:col-span-1">
                <div className="font-bebas text-lg sm:text-xl text-yellow-400">{questionProgress}</div>
                <div className="font-space text-xs sm:text-sm text-gray-400">Progress</div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 sm:p-8 mb-6 border border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="font-bebas text-2xl sm:text-3xl text-yellow-400">
                  QUESTION {currentQuestionIndex + 1}
                </h3>
                <div className={`font-bebas text-3xl sm:text-4xl px-4 py-2 rounded-xl ${
                  questionTimeLeft <= 2 
                    ? 'text-red-400 bg-red-400/20 border border-red-400 animate-pulse' 
                    : 'text-yellow-400 bg-yellow-400/20 border border-yellow-400'
                }`}>
                  {questionTimeLeft}s
                </div>
              </div>
              <p className="font-space text-base sm:text-xl mb-6 sm:mb-8 text-center text-gray-200 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
                {currentQuestionData.question}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {currentQuestionData.options.map((option, index) => {
                  const getAnswerColor = () => {
                    if (!isAnswered) return 'bg-gray-900/80 hover:bg-gray-800 border-gray-700 hover:border-yellow-400/50';
                    if (index === currentQuestionData.correct) return 'bg-green-900/40 border-green-400';
                    if (index === selectedAnswer && index !== currentQuestionData.correct) return 'bg-red-900/40 border-red-400';
                    return 'bg-gray-900/40 border-gray-700 opacity-50';
                  };

                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={isAnswered}
                      className={`font-space p-4 text-base sm:text-lg font-medium rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 text-white border-2 ${getAnswerColor()}`}
                    >
                      <span className="font-bebas text-yellow-400 mr-2">{String.fromCharCode(65 + index)}.</span> {option}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-6 text-center">
                  {selectedAnswer === currentQuestionData.correct ? (
                    <div className="font-space text-base sm:text-lg font-bold text-green-400 bg-green-400/20 p-4 rounded-xl border border-green-400">
                      <Star className="w-6 h-6 inline mr-2" />
                      Awesome! +{1000 + (questionTimeLeft * 100) + (streak * 50)} points!
                    </div>
                  ) : (
                    <div className="font-space text-base sm:text-lg font-bold text-red-400 bg-red-400/20 p-4 rounded-xl border border-red-400">
                      Oops! Answer: {currentQuestionData.options[currentQuestionData.correct]}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center max-w-2xl w-full">
            <div className="mb-8">
              <div className="relative mb-6">
                <Trophy className="w-20 sm:w-28 h-20 sm:h-28 text-yellow-400 mx-auto float-animation" />
              </div>
              <h2 className="font-bebas text-5xl sm:text-7xl mb-4 text-yellow-400 text-glow">
                BLITZ COMPLETE
              </h2>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-8 border border-gray-700">
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                  <div className="font-bebas text-2xl sm:text-3xl text-yellow-400">{formattedScore}</div>
                  <div className="font-space text-xs sm:text-sm text-gray-400">Final Score</div>
                </div>
                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                  <div className="font-bebas text-2xl sm:text-3xl text-yellow-400">{streak}</div>
                  <div className="font-space text-xs sm:text-sm text-gray-400">Best Streak</div>
                </div>
                <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                  <div className="font-bebas text-2xl sm:text-3xl text-yellow-400">{accuracy}%</div>
                  <div className="font-space text-xs sm:text-sm text-gray-400">Accuracy</div>
                </div>
              </div>

              <div className="bg-yellow-400/10 p-6 rounded-xl border border-yellow-400">
                <h3 className="font-bebas text-2xl mb-3 text-yellow-400">YOUR EPIC RANKING</h3>
                <p className="font-bebas text-3xl sm:text-4xl text-white mb-2">
                  #{finalRank} out of {state.liveGame.currentPlayers} players
                </p>
                <p className="font-space text-sm text-gray-300">
                  <Award className="w-4 h-4 inline mr-1" />
                  Games played today: {state.gameStats.gamesPlayedToday}
                </p>
              </div>
            </div>

            <button 
              onClick={resetGame}
              className="group font-bebas text-xl sm:text-2xl px-6 sm:px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-300 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 mx-auto glow-yellow"
            >
              <RefreshCw className="w-5 sm:w-6 h-5 sm:h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BonkBlitz;