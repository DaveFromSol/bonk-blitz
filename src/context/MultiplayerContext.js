// context/MultiplayerContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  getDocs
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

  // Helper function to get random questions
  const getRandomQuestions = (allQuestions, count, categories) => {
    const filteredQuestions = allQuestions.filter(q => 
      categories.includes(q.category)
    );
    
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Listen for active rounds
  useEffect(() => {
    console.log('Setting up listener for active rounds...');
    
    const roundsRef = collection(db, 'multiplayerRounds');
    const activeRoundQuery = query(
      roundsRef, 
      where('status', 'in', ['waiting', 'playing']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(activeRoundQuery, (snapshot) => {
      console.log('Received snapshot with', snapshot.docs.length, 'rounds');
      
      if (!snapshot.empty) {
        const roundData = snapshot.docs[0].data();
        console.log('Active round found:', roundData);
        setActiveRound({ id: snapshot.docs[0].id, ...roundData });
      } else {
        console.log('No active rounds found');
        setActiveRound(null);
      }
    }, (error) => {
      console.error('Error listening to rounds:', error);
    });

    return unsubscribe;
  }, []);

  // Listen for current question updates
  useEffect(() => {
    if (activeRound && activeRound.status === 'playing') {
      const questions = activeRound.questions || [];
      const questionIndex = activeRound.currentQuestionIndex || 0;
      
      if (questions[questionIndex]) {
        setCurrentQuestion(questions[questionIndex]);
        setCurrentQuestionIndex(questionIndex);
        setTimeLeft(activeRound.timePerQuestion || 15);
      }
    }
  }, [activeRound]);

  // Timer countdown
  useEffect(() => {
    if (activeRound?.status === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, activeRound?.status]);

  // Generate player name
  const generatePlayerName = () => {
    const adjectives = ['Quick', 'Smart', 'Fast', 'Clever', 'Sharp', 'Bright', 'Swift', 'Keen'];
    const nouns = ['Bonker', 'Trader', 'Holder', 'Ape', 'Diamond', 'Moon', 'Rocket', 'Whale'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };

  // ADMIN FUNCTIONS

  // Create a new multiplayer round (Admin only)
  const createRound = async (settings = {}) => {
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
  };

  // Start the round (Admin only)
  const startRound = async (roundId) => {
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
  };

  // End the round (Admin only)
  const endRound = async (roundId) => {
    try {
      setLoading(true);
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
  };

  // Next question (Admin only)
  const nextQuestion = async (roundId) => {
    try {
      const roundRef = doc(db, 'multiplayerRounds', roundId);
      const newIndex = (activeRound?.currentQuestionIndex || 0) + 1;
      
      if (newIndex >= (activeRound?.questionCount || 10)) {
        // End game if all questions answered
        await endRound(roundId);
      } else {
        await updateDoc(roundRef, {
          currentQuestionIndex: newIndex,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      setError('Failed to advance question: ' + err.message);
      throw err;
    }
  };

  // Delete round (Admin only)
  const deleteRound = async (roundId) => {
    try {
      await deleteDoc(doc(db, 'multiplayerRounds', roundId));
    } catch (err) {
      setError('Failed to delete round: ' + err.message);
      throw err;
    }
  };

  // PLAYER FUNCTIONS

  // Join the active round
  const joinRound = async (playerName = null) => {
    try {
      if (!activeRound) {
        throw new Error('No active round to join');
      }

      setLoading(true);
      setError(null);

      const player = {
        id: Date.now().toString(),
        name: playerName || generatePlayerName(),
        score: 0,
        answers: [],
        joinedAt: serverTimestamp()
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

    } catch (err) {
      setError('Failed to leave round: ' + err.message);
    }
  };

  // Submit answer
  const submitAnswer = async (answerIndex, timeTaken) => {
    try {
      if (!activeRound || !playerData || !currentQuestion) return;

      const isCorrect = answerIndex === currentQuestion.correct;
      const points = isCorrect ? Math.max(1, Math.round(10 * (timeLeft / (activeRound.timePerQuestion || 15)))) : 0;

      const answer = {
        questionIndex: currentQuestionIndex,
        questionId: currentQuestion.id,
        answer: answerIndex,
        correct: isCorrect,
        points: points,
        timeTaken: timeTaken,
        timestamp: serverTimestamp()
      };

      // Update player answers locally
      setPlayerAnswers(prev => [...prev, answer]);

      // Update player data in Firebase
      const roundRef = doc(db, 'multiplayerRounds', activeRound.id);
      const updatedPlayer = {
        ...playerData,
        score: playerData.score + points,
        answers: [...playerData.answers, answer]
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

    } catch (err) {
      setError('Failed to submit answer: ' + err.message);
    }
  };

  // Calculate leaderboard
  useEffect(() => {
    if (activeRound?.players) {
      const sortedPlayers = [...activeRound.players]
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
          ...player,
          rank: index + 1
        }));
      setLeaderboard(sortedPlayers);
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