// context/MultiplayerContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useGame } from './GameContext';

const MultiplayerContext = createContext();

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider = ({ children }) => {
  const { state } = useGame();
  const [activeRound, setActiveRound] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [isInGame, setIsInGame] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerAnswers, setPlayerAnswers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roundStartCountdown, setRoundStartCountdown] = useState(null);
  
  // Timer refs to manage intervals
  const questionTimerRef = useRef(null);
  const hasAnsweredRef = useRef(false);
  const isAdvancingRef = useRef(false); // Prevent multiple advances

  // Debug: Log state changes
  useEffect(() => {
    console.log('MultiplayerContext - activeRound changed:', activeRound);
  }, [activeRound]);

  useEffect(() => {
    console.log('MultiplayerContext - questions available:', state.questions.length);
  }, [state.questions]);

  // Helper function to get random questions
  const getRandomQuestions = (allQuestions, count, categories) => {
    const filteredQuestions = allQuestions.filter(q => 
      categories.includes(q.category)
    );
    
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Clear question timer
  const clearQuestionTimer = useCallback(() => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
  }, []);

  // ADMIN FUNCTIONS - Define these first before useEffect that depends on them

  // Create a new multiplayer round (Admin only)
  const createRound = useCallback(async (settings = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Get random questions from the database
      const selectedQuestions = getRandomQuestions(
        state.questions, 
        settings.questionCount || 10,
        settings.categories || ['blockchain', 'defi', 'nft']
      );

      if (selectedQuestions.length === 0) {
        throw new Error('No questions available for the selected categories');
      }

      const roundData = {
        name: settings.name || 'Bonk Blitz Round',
        status: 'waiting', // waiting, playing, finished
        players: [],
        questions: selectedQuestions,
        currentQuestionIndex: 0,
        questionCount: settings.questionCount || 10,
        timePerQuestion: settings.timePerQuestion || 15,
        categories: settings.categories || ['blockchain', 'defi', 'nft'],
        startDelay: settings.startDelay || 30,
        scheduledStartTime: new Date(Date.now() + (settings.startDelay || 30) * 1000).toISOString(),
        startTime: null,
        endTime: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating round with data:', roundData);
      const docRef = await addDoc(collection(db, 'multiplayerRounds'), roundData);
      console.log('Round created successfully with ID:', docRef.id);
      
      return { roundId: docRef.id };
    } catch (err) {
      console.error('Error in createRound:', err);
      setError('Failed to create round: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [state.questions]);

  // Start the round (Admin only)
  const startRound = useCallback(async (roundId) => {
    try {
      setLoading(true);
      const roundRef = doc(db, 'multiplayerRounds', roundId);
      
      await updateDoc(roundRef, {
        status: 'playing',
        startTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

    } catch (err) {
      setError('Failed to start round: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // End the round (Admin only)
  const endRound = useCallback(async (roundId) => {
    try {
      setLoading(true);
      clearQuestionTimer(); // Clear timer when round ends
      
      const roundRef = doc(db, 'multiplayerRounds', roundId);
      
      await updateDoc(roundRef, {
        status: 'finished',
        endTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

    } catch (err) {
      setError('Failed to end round: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearQuestionTimer]);

  // Next question (Admin only)
  const nextQuestion = useCallback(async (roundId) => {
    try {
      const roundRef = doc(db, 'multiplayerRounds', roundId);
      
      // Get current data from Firebase instead of relying on state
      const roundDoc = await getDoc(roundRef);
      
      if (!roundDoc.exists()) {
        throw new Error('Round not found');
      }
      
      const currentRoundData = roundDoc.data();
      const newIndex = (currentRoundData.currentQuestionIndex || 0) + 1;
      
      console.log('nextQuestion: current index:', currentRoundData.currentQuestionIndex, 'new index:', newIndex);
      
      if (newIndex >= (currentRoundData.questionCount || 10)) {
        // End game if all questions answered
        console.log('All questions completed, ending round');
        await endRound(roundId);
      } else {
        console.log('Advancing to question:', newIndex);
        await updateDoc(roundRef, {
          currentQuestionIndex: newIndex,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error in nextQuestion:', err);
      setError('Failed to advance question: ' + err.message);
      throw err;
    }
  }, [endRound]);

  // Delete round (Admin only)
  const deleteRound = useCallback(async (roundId) => {
    try {
      setLoading(true);
      clearQuestionTimer(); // Clear timer when round is deleted
      console.log('Deleting round:', roundId);
      await deleteDoc(doc(db, 'multiplayerRounds', roundId));
      console.log('Round deleted successfully');
    } catch (err) {
      console.error('Error deleting round:', err);
      setError('Failed to delete round: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearQuestionTimer]);

  // Start question timer - defined after nextQuestion to avoid circular dependency
  const startQuestionTimer = useCallback((initialTime, roundId) => {
    clearQuestionTimer();
    hasAnsweredRef.current = false;
    isAdvancingRef.current = false; // Reset advancing flag
    
    let currentTime = initialTime;
    setTimeLeft(currentTime);
    
    questionTimerRef.current = setInterval(() => {
      currentTime -= 1;
      setTimeLeft(currentTime);
      
      if (currentTime <= 0) {
        clearQuestionTimer();
        // Auto-advance to next question when time runs out
        if (roundId && !isAdvancingRef.current) {
          isAdvancingRef.current = true;
          setTimeout(() => {
            nextQuestion(roundId);
          }, 2000); // 2 second delay to show results
        }
      }
    }, 1000);
  }, [clearQuestionTimer, nextQuestion]);

  // Listen for active rounds
  useEffect(() => {
    console.log('Setting up listener for active rounds...');
    
    const roundsRef = collection(db, 'multiplayerRounds');
    
    // Try simple listener first - just get all rounds
    const unsubscribe = onSnapshot(roundsRef, (snapshot) => {
      console.log('Received snapshot with', snapshot.docs.length, 'total rounds');
      
      const allRounds = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log('All rounds:', allRounds);
      
      // Filter for active rounds manually
      const activeRounds = allRounds.filter(round => 
        round.status === 'waiting' || round.status === 'playing'
      );
      
      console.log('Active rounds found:', activeRounds);
      
      if (activeRounds.length > 0) {
        // Get the most recent active round
        const sortedRounds = activeRounds.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
          const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
          return bTime - aTime;
        });
        
        const roundData = sortedRounds[0];
        console.log('Setting active round:', roundData);
        setActiveRound(roundData);
      } else {
        console.log('No active rounds found');
        setActiveRound(null);
        clearQuestionTimer(); // Clear timer if no active rounds
      }
    }, (error) => {
      console.error('Error listening to rounds:', error);
    });

    return unsubscribe;
  }, [clearQuestionTimer]);

  // Listen for current question updates and start timer
  useEffect(() => {
    if (activeRound && activeRound.status === 'playing') {
      const questions = activeRound.questions || [];
      const questionIndex = activeRound.currentQuestionIndex || 0;
      
      if (questions[questionIndex]) {
        console.log('Setting new question and starting timer:', questionIndex);
        setCurrentQuestion(questions[questionIndex]);
        setCurrentQuestionIndex(questionIndex);
        
        // Start the question timer
        const timePerQuestion = activeRound.timePerQuestion || 15;
        startQuestionTimer(timePerQuestion, activeRound.id);
      }
    } else if (activeRound && activeRound.status === 'finished') {
      clearQuestionTimer();
      setTimeLeft(0);
    }
  }, [activeRound?.status, activeRound?.currentQuestionIndex, activeRound?.id, startQuestionTimer, clearQuestionTimer]);

  // Countdown timer for round start
  useEffect(() => {
    if (activeRound?.status === 'waiting' && activeRound.scheduledStartTime) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const startTime = new Date(activeRound.scheduledStartTime).getTime();
        const timeLeft = Math.max(0, Math.floor((startTime - now) / 1000));
        
        setRoundStartCountdown(timeLeft);
        
        // Auto-start round when countdown reaches 0
        if (timeLeft === 0 && activeRound.status === 'waiting') {
          startRound(activeRound.id);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    } else {
      setRoundStartCountdown(null);
    }
  }, [activeRound?.status, activeRound?.scheduledStartTime, activeRound?.id, startRound]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearQuestionTimer();
    };
  }, [clearQuestionTimer]);

  // Generate player name
  const generatePlayerName = () => {
    const adjectives = ['Quick', 'Smart', 'Fast', 'Clever', 'Sharp', 'Bright', 'Swift', 'Keen'];
    const nouns = ['Bonker', 'Trader', 'Holder', 'Ape', 'Diamond', 'Moon', 'Rocket', 'Whale'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };

  // PLAYER FUNCTIONS

  // Join the active round
  const joinRound = async (playerName = null, solanaAddress = null) => {
    try {
      if (!activeRound) {
        throw new Error('No active round to join');
      }

      setLoading(true);
      setError(null);

      const player = {
        id: Date.now().toString(),
        name: playerName || generatePlayerName(),
        solanaAddress: solanaAddress || '',
        score: 0,
        answers: [],
        joinedAt: new Date().toISOString()
      };

      const roundRef = doc(db, 'multiplayerRounds', activeRound.id);
      
      await updateDoc(roundRef, {
        players: arrayUnion(player),
        updatedAt: serverTimestamp()
      });

      setPlayerData(player);
      setIsInGame(true);
      setPlayerAnswers([]);

    } catch (err) {
      setError('Failed to join round: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Leave the current round
  const leaveRound = async () => {
    try {
      if (!activeRound || !playerData) return;

      const roundRef = doc(db, 'multiplayerRounds', activeRound.id);
      
      await updateDoc(roundRef, {
        players: arrayRemove(playerData),
        updatedAt: serverTimestamp()
      });

      setPlayerData(null);
      setIsInGame(false);
      setPlayerAnswers([]);
      clearQuestionTimer(); // Clear timer when leaving

    } catch (err) {
      setError('Failed to leave round: ' + err.message);
    }
  };

  // Submit answer
  const submitAnswer = async (answerIndex, timeTaken) => {
    try {
      if (!activeRound || !playerData || !currentQuestion) return;
      if (hasAnsweredRef.current) return; // Prevent double submission

      hasAnsweredRef.current = true;

      const isCorrect = answerIndex === currentQuestion.correct;
      // Enhanced scoring: more points for faster answers, bonus for streaks
      const timeBonus = Math.max(1, Math.round(10 * (timeLeft / (activeRound.timePerQuestion || 15))));
      const basePoints = isCorrect ? timeBonus : 0;
      
      // Speed bonus: extra points for very fast answers (within first 25% of time)
      const speedThreshold = (activeRound.timePerQuestion || 15) * 0.75;
      const speedBonus = isCorrect && timeLeft >= speedThreshold ? 2 : 0;
      
      const totalPoints = basePoints + speedBonus;

      const answer = {
        questionIndex: currentQuestionIndex,
        questionId: currentQuestion.id || currentQuestionIndex,
        answer: answerIndex,
        correct: isCorrect,
        points: totalPoints,
        timeTaken: timeTaken,
        timeLeft: timeLeft,
        timestamp: new Date().toISOString() // Use regular timestamp for better compatibility
      };

      console.log('Submitting answer:', {
        questionIndex: currentQuestionIndex,
        isCorrect,
        points: totalPoints,
        timeLeft,
        playerName: playerData.name
      });

      // Update player answers locally
      setPlayerAnswers(prev => [...prev, answer]);

      // Update player data in Firebase
      const roundRef = doc(db, 'multiplayerRounds', activeRound.id);
      const updatedPlayer = {
        ...playerData,
        score: playerData.score + totalPoints,
        answers: [...(playerData.answers || []), answer],
        lastAnswerTime: new Date().toISOString()
      };

      // Remove old player data and add updated version
      await updateDoc(roundRef, {
        players: arrayRemove(playerData)
      });
      
      await updateDoc(roundRef, {
        players: arrayUnion(updatedPlayer),
        updatedAt: serverTimestamp()
      });

      setPlayerData(updatedPlayer);

      console.log('Answer submitted successfully. New score:', updatedPlayer.score);

    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer: ' + err.message);
    }
  };

  // Calculate leaderboard with enhanced stats
  useEffect(() => {
    if (activeRound?.players) {
      const sortedPlayers = [...activeRound.players]
        .map(player => {
          const answers = player.answers || [];
          const correctAnswers = answers.filter(a => a.correct).length;
          const totalAnswers = answers.length;
          const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
          const averageTime = totalAnswers > 0 
            ? Math.round(answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / totalAnswers * 100) / 100
            : 0;

          return {
            ...player,
            correctAnswers,
            totalAnswers,
            accuracy,
            averageTime,
            // Tie-breaker: higher accuracy, then faster average time
            tieBreaker: accuracy * 1000 + (100 - averageTime)
          };
        })
        .sort((a, b) => {
          // Primary sort by score
          if (b.score !== a.score) return b.score - a.score;
          // Tie-breaker: accuracy then speed
          return b.tieBreaker - a.tieBreaker;
        })
        .map((player, index) => ({
          ...player,
          rank: index + 1
        }));
      
      setLeaderboard(sortedPlayers);
      console.log('Updated leaderboard:', sortedPlayers);
    }
  }, [activeRound?.players]);

  const value = {
    // State
    activeRound,
    playerData,
    isInGame,
    currentQuestion,
    currentQuestionIndex,
    timeLeft,
    playerAnswers,
    leaderboard,
    loading,
    error,
    roundStartCountdown,

    // Admin Functions
    createRound,
    startRound,
    endRound,
    nextQuestion,
    deleteRound,

    // Player Functions
    joinRound,
    leaveRound,
    submitAnswer,

    // Utils
    generatePlayerName
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};