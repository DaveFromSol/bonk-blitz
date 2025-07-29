import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Clock, Zap, Trophy, Users, Coins, Play, RefreshCw, Star, Target, Flame, Award, ChevronRight, Timer, TrendingUp } from 'lucide-react';
import { useGame } from '../context/GameContext';
import MultiplayerGame from './MultiplayerGame';
import { useMultiplayer } from '../context/MultiplayerContext';

// BONK Character Component
const BonkCharacter = ({ imageFile, position, className = "", animate = false, gameState = 'idle' }) => {
  return (
    <div 
      className={`fixed ${position} ${className} ${animate ? 'bonk-bounce' : ''} transition-all duration-500 z-10 pointer-events-none`}
      style={{ 
        filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))',
        transform: animate ? 'scale(1.1)' : 'scale(1)'
      }}
    >
      <img 
        src={`/${imageFile}`}
        alt="BONK Character" 
        className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56"
        style={{ 
          imageRendering: 'auto',
          animation: gameState === 'correct' ? 'bonkBounce 1s ease-in-out' : 
                    gameState === 'wrong' ? 'bonkPulse 0.5s ease-in-out' : 'none'
        }}
      />
    </div>
  );
};

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
  const [characterState, setCharacterState] = useState('idle');

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
    setCharacterState('playing');
    actions.startGame();
    
    // Reset character state after animation
    setTimeout(() => setCharacterState('idle'), 2000);
  }, [shuffleQuestions, actions]);

  // Answer selection with real data tracking and character reactions
  const selectAnswer = useCallback((answerIndex) => {
    if (isAnswered || !currentQuestionData) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestionData.correct;
    
    // Track question analytics
    actions.questionAsked(currentQuestionData.id);
    actions.questionAnswered(currentQuestionData.id, isCorrect);
    
    // Character reaction
    setCharacterState(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setCharacterState('idle'), 2000);
    
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
      setCharacterState('playing');
      setTimeout(() => setCharacterState('idle'), 1000);
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
    setCharacterState('finished');
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
    setCharacterState('idle');
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
    <div className="min-h-screen text-white overflow-x-hidden bg-bonk-gradient relative">
      {/* BONK Characters - Only show during offline game states */}
      {!state.liveGame.isActive && (
        <>
          {/* Left BONK Character */}
          <BonkCharacter 
            imageFile="BONK_Pose_ThumbsUp_001.png"
            position="left-4 top-1/2 transform -translate-y-1/2" 
            className="hidden xl:block"
            animate={characterState === 'correct' || characterState === 'playing'}
            gameState={characterState}
          />
          
          {/* Right BONK Character */}
          <BonkCharacter 
            imageFile="BONK_Pose_ThumbsUp_002.png"
            position="right-4 top-1/2 transform -translate-y-1/2" 
            className="hidden xl:block"
            animate={characterState === 'correct' || characterState === 'finished'}
            gameState={characterState}
          />
          
          {/* Smaller characters for medium screens */}
          <BonkCharacter 
            imageFile="BONK_Pose_ThumbsUp_001.png"
            position="left-2 top-1/3" 
            className="hidden lg:block xl:hidden"
            animate={characterState === 'correct'}
            gameState={characterState}
          />
          
          <BonkCharacter 
            imageFile="BONK_Pose_ThumbsUp_002.png"
            position="right-2 top-2/3" 
            className="hidden lg:block xl:hidden"
            animate={characterState === 'correct'}
            gameState={characterState}
          />
        </>
      )}

      {/* Header - Clean version without badges */}
      <header className="relative z-10 pt-20">
        {/* Empty header space for logo */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-[calc(100vh-100px)] relative z-20">
        {/* Multiplayer Section */}
        <MultiplayerSection />

        {gameState === 'lobby' && (
          <div className="text-center max-w-4xl w-full">
            <div className="mb-8 sm:mb-12 bonk-fade-in">
              <h2 className="bonk-header-spaced text-6xl sm:text-8xl lg:text-9xl mb-4 shadow-bonk-glow">
                BONK BLITZ
              </h2>
              <p className="bonk-body text-xl sm:text-2xl mb-2">Think Fast, Win Big</p>
              <p className="bonk-body text-base sm:text-lg opacity-90">60 seconds • Lightning trivia • Epic rewards</p>
            </div>

            {/* Ultra-Blended How to Play Section */}
            <div className="relative mb-8">
              {/* Subtle background enhancement that extends the main gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-bonk-orange/8 via-transparent to-bonk-yellow/8 rounded-3xl blur-2xl transform scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-bonk-yellow/5 via-transparent to-bonk-orange/5 rounded-3xl"></div>
              
              <div className="relative">
                <h3 className="bonk-header text-2xl sm:text-3xl mb-8 text-center text-bonk-yellow drop-shadow-lg">HOW TO PLAY</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  
                  {/* Lightning Speed Card - Ultra Blended */}
                  <div className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:scale-105 bonk-fade-in">
                    {/* Multi-layer seamless blending */}
                    <div className="absolute inset-0 bg-gradient-to-br from-bonk-orange/20 via-bonk-orange/10 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-bonk-yellow/15 via-transparent to-bonk-orange/8"></div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                    
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bonk-orange/40 via-bonk-yellow/30 to-bonk-orange/40 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>
                    
                    <div className="relative p-8 text-center">
                      {/* Glowing icon with multiple layers */}
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-bonk-orange/40 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-bonk-orange/50 to-bonk-orange/20 rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-bonk-orange/60 via-bonk-orange/40 to-bonk-orange/20 w-20 h-20 rounded-full flex items-center justify-center border-2 border-bonk-orange/50 shadow-2xl">
                          <Timer className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      
                      <h4 className="bonk-header text-xl sm:text-2xl mb-3 text-white drop-shadow-lg">LIGHTNING SPEED</h4>
                      <p className="bonk-body text-sm sm:text-base text-white/95 leading-relaxed">5 seconds per question. Think fast or get left behind!</p>
                    </div>
                  </div>

                  {/* Streak Bonus Card - Ultra Blended */}
                  <div className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:scale-105 bonk-fade-in" style={{animationDelay: '0.1s'}}>
                    {/* Multi-layer seamless blending */}
                    <div className="absolute inset-0 bg-gradient-to-br from-bonk-red/20 via-bonk-red/10 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-bonk-orange/15 via-transparent to-bonk-red/8"></div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                    
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bonk-red/40 via-bonk-orange/30 to-bonk-red/40 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>
                    
                    <div className="relative p-8 text-center">
                      {/* Glowing icon with multiple layers */}
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-bonk-red/40 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-bonk-red/50 to-bonk-red/20 rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-bonk-red/60 via-bonk-red/40 to-bonk-red/20 w-20 h-20 rounded-full flex items-center justify-center border-2 border-bonk-red/50 shadow-2xl">
                          <Flame className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      
                      <h4 className="bonk-header text-xl sm:text-2xl mb-3 text-white drop-shadow-lg">STREAK BONUS</h4>
                      <p className="bonk-body text-sm sm:text-base text-white/95 leading-relaxed">Chain correct answers for massive point multipliers!</p>
                    </div>
                  </div>

                  {/* Win Big Card - Ultra Blended */}
                  <div className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:scale-105 bonk-fade-in" style={{animationDelay: '0.2s'}}>
                    {/* Multi-layer seamless blending */}
                    <div className="absolute inset-0 bg-gradient-to-br from-bonk-yellow/20 via-bonk-yellow/10 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-bonk-orange/15 via-transparent to-bonk-yellow/8"></div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                    
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bonk-yellow/40 via-bonk-orange/30 to-bonk-yellow/40 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>
                    
                    <div className="relative p-8 text-center">
                      {/* Glowing icon with multiple layers */}
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-bonk-yellow/40 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-bonk-yellow/50 to-bonk-yellow/20 rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-bonk-yellow/60 via-bonk-yellow/40 to-bonk-yellow/20 w-20 h-20 rounded-full flex items-center justify-center border-2 border-bonk-yellow/50 shadow-2xl">
                          <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      
                      <h4 className="bonk-header text-xl sm:text-2xl mb-3 text-white drop-shadow-lg">WIN BIG</h4>
                      <p className="bonk-body text-sm sm:text-base text-white/95 leading-relaxed">Top players split the prize pool. Every game counts!</p>
                    </div>
                  </div>

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
                  #{finalRank} OUT OF 42 PLAYERS
                </p>
                <p className="bonk-body text-sm text-gray-300">
                  <Award className="w-4 h-4 inline mr-1" />
                  GAMES PLAYED TODAY: 156
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