import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Clock, Zap, Trophy, Users, Coins, Play, RefreshCw, Star, Target, Flame, Award, ChevronRight, Timer, TrendingUp } from 'lucide-react';
import { useGame } from '../context/GameContext';
import MultiplayerGame from './MultiplayerGame';
import { useMultiplayer } from '../context/MultiplayerContext';

// Multiplayer Section Component
const MultiplayerSection = () => {
  const { activeRound } = useMultiplayer();

  if (!activeRound) return null;

  return (
    <div className="mb-8">
      <h2 className="bonk-header text-3xl mb-4 text-center bonk-glow">
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
      <div className="min-h-screen text-white overflow-x-hidden bg-bonk-gradient">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bonk-widget p-8">
            <Zap className="w-16 h-16 mx-auto mb-4 bonk-pulse text-bonk-orange" />
            <h2 className="bonk-header text-2xl mb-2">LOADING QUESTIONS...</h2>
            <p className="bonk-body text-gray-300">Please wait while we prepare your trivia experience!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden bg-bonk-gradient">
      {/* Header */}
      <header className="relative z-10 pt-20">
        <div className="relative flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 ml-auto">
            <div className="bonk-badge flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="bonk-body font-bold text-sm sm:text-base">{state.liveGame.currentPlayers} PLAYERS</span>
            </div>
            <div className="bonk-badge flex items-center space-x-2">
              <Coins className="w-5 h-5" />
              <span className="bonk-body font-bold text-sm sm:text-base">{formattedPrizePool} SOL</span>
            </div>
            <div className="bonk-badge-gradient">
              <span className="bonk-body font-bold text-sm">LIVE NOW</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-[calc(100vh-100px)]">
        {/* Multiplayer Section */}
        <MultiplayerSection />

        {gameState === 'lobby' && (
          <div className="text-center max-w-4xl w-full">
            <div className="mb-8 sm:mb-12 bonk-fade-in">
              <h2 className="bonk-header-spaced text-6xl sm:text-8xl lg:text-9xl mb-4 shadow-bonk-glow">
                BONK BLITZ
              </h2>
              <p className="bonk-body text-xl sm:text-2xl mb-2">Think Fast, Win SOL</p>
              <p className="bonk-body text-base sm:text-lg opacity-90">60 seconds • Lightning trivia • Epic rewards</p>
            </div>

            <div className="bonk-widget p-6 sm:p-8 mb-8">
              <h3 className="bonk-header text-2xl sm:text-3xl mb-6">HOW TO PLAY</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bonk-widget-dark p-6 rounded-xl hover:bg-bonk-navy transition-colors">
                  <div className="bg-bonk-orange/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Timer className="w-8 h-8 text-bonk-orange" />
                  </div>
                  <h4 className="bonk-header text-xl mb-2">LIGHTNING SPEED</h4>
                  <p className="bonk-body text-sm text-gray-300">5 seconds per question. Think fast!</p>
                </div>
                <div className="bonk-widget-dark p-6 rounded-xl hover:bg-bonk-navy transition-colors">
                  <div className="bg-bonk-orange/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Flame className="w-8 h-8 text-bonk-orange" />
                  </div>
                  <h4 className="bonk-header text-xl mb-2">STREAK BONUS</h4>
                  <p className="bonk-body text-sm text-gray-300">Chain correct answers for mega points!</p>
                </div>
                <div className="bonk-widget-dark p-6 rounded-xl hover:bg-bonk-navy transition-colors">
                  <div className="bg-bonk-orange/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Trophy className="w-8 h-8 text-bonk-orange" />
                  </div>
                  <h4 className="bonk-header text-xl mb-2">WIN BIG</h4>
                  <p className="bonk-body text-sm text-gray-300">Top players split the prize pool!</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bonk-badge-outline text-base sm:text-lg">
                ENTRY: FREE
              </div>
              <button 
                onClick={startGame}
                className="bonk-btn-primary bonk-glow group text-2xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 flex items-center justify-center space-x-3 mx-auto"
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
            <div className="grid grid-cols-2 sm:flex sm:justify-between items-center mb-6 sm:mb-8 bonk-widget p-4 sm:p-6 gap-3 sm:gap-4">
              <div className="bonk-widget-dark px-4 py-3 rounded-xl">
                <div className="bonk-header text-2xl sm:text-3xl text-bonk-yellow">{timeLeft}s</div>
                <div className="bonk-body text-xs sm:text-sm text-gray-300">Game Time</div>
              </div>
              <div className="bonk-widget-dark px-4 py-3 rounded-xl">
                <div className="bonk-header text-2xl sm:text-3xl text-bonk-yellow">{formattedScore}</div>
                <div className="bonk-body text-xs sm:text-sm text-gray-300">Score</div>
              </div>
              <div className="bonk-widget-dark px-4 py-3 rounded-xl">
                <div className="bonk-header text-2xl sm:text-3xl text-bonk-yellow">{streak}</div>
                <div className="bonk-body text-xs sm:text-sm text-gray-300">Streak</div>
              </div>
              <div className="bonk-widget-dark px-4 py-3 rounded-xl col-span-2 sm:col-span-1">
                <div className="bonk-header text-lg sm:text-xl text-bonk-yellow">{questionProgress}</div>
                <div className="bonk-body text-xs sm:text-sm text-gray-300">Progress</div>
              </div>
            </div>

            {/* Question */}
            <div className="bonk-widget p-4 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="bonk-header text-2xl sm:text-3xl text-bonk-yellow">
                  QUESTION {currentQuestionIndex + 1}
                </h3>
                <div className={`bonk-header text-3xl sm:text-4xl px-4 py-2 rounded-xl border-2 ${
                  questionTimeLeft <= 2 
                    ? 'text-bonk-red bg-red-900/20 border-bonk-red bonk-pulse' 
                    : 'text-bonk-yellow bg-bonk-yellow/10 border-bonk-yellow'
                }`}>
                  {questionTimeLeft}s
                </div>
              </div>
              <p className="bonk-body text-base sm:text-xl mb-6 sm:mb-8 text-center bonk-widget-dark p-4 rounded-xl">
                {currentQuestionData.question}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {currentQuestionData.options.map((option, index) => {
                  const getAnswerColor = () => {
                    if (!isAnswered) return 'bonk-answer-btn';
                    if (index === currentQuestionData.correct) return 'bonk-answer-correct';
                    if (index === selectedAnswer && index !== currentQuestionData.correct) return 'bonk-answer-wrong';
                    return 'bonk-answer-disabled';
                  };

                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={isAnswered}
                      className={`${getAnswerColor()} bonk-fade-in`}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <span className="bonk-header text-bonk-yellow mr-2">{String.fromCharCode(65 + index)}.</span> 
                      <span className="bonk-body">{option}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-6 text-center bonk-fade-in">
                  {selectedAnswer === currentQuestionData.correct ? (
                    <div className="bonk-body text-base sm:text-lg font-bold text-green-400 bg-green-900/20 p-4 rounded-xl border border-green-400">
                      <Star className="w-6 h-6 inline mr-2" />
                      AWESOME! +{1000 + (questionTimeLeft * 100) + (streak * 50)} POINTS!
                    </div>
                  ) : (
                    <div className="bonk-body text-base sm:text-lg font-bold text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-400">
                      OOPS! ANSWER: {currentQuestionData.options[currentQuestionData.correct]}
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
                <Trophy className="w-20 sm:w-28 h-20 sm:h-28 text-bonk-yellow mx-auto bonk-bounce" />
              </div>
              <h2 className="bonk-header-spaced text-5xl sm:text-7xl mb-4 shadow-bonk-glow">
                BLITZ COMPLETE
              </h2>
            </div>

            <div className="bonk-widget p-6 sm:p-8 mb-8">
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
                <div className="bonk-widget-dark p-4 rounded-xl">
                  <div className="bonk-header text-2xl sm:text-3xl text-bonk-yellow">{formattedScore}</div>
                  <div className="bonk-body text-xs sm:text-sm text-gray-300">Final Score</div>
                </div>
                <div className="bonk-widget-dark p-4 rounded-xl">
                  <div className="bonk-header text-2xl sm:text-3xl text-bonk-yellow">{streak}</div>
                  <div className="bonk-body text-xs sm:text-sm text-gray-300">Best Streak</div>
                </div>
                <div className="bonk-widget-dark p-4 rounded-xl">
                  <div className="bonk-header text-2xl sm:text-3xl text-bonk-yellow">{accuracy}%</div>
                  <div className="bonk-body text-xs sm:text-sm text-gray-300">Accuracy</div>
                </div>
              </div>

              <div className="bg-bonk-orange/10 p-6 rounded-xl border border-bonk-orange">
                <h3 className="bonk-header text-2xl mb-3 text-bonk-yellow">YOUR EPIC RANKING</h3>
                <p className="bonk-header text-3xl sm:text-4xl mb-2">
                  #{finalRank} OUT OF {state.liveGame.currentPlayers} PLAYERS
                </p>
                <p className="bonk-body text-sm text-gray-300">
                  <Award className="w-4 h-4 inline mr-1" />
                  GAMES PLAYED TODAY: {state.gameStats.gamesPlayedToday}
                </p>
              </div>
            </div>

            <button 
              onClick={resetGame}
              className="bonk-btn-primary bonk-glow group text-xl sm:text-2xl px-6 sm:px-8 py-4 flex items-center justify-center space-x-3 mx-auto"
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