// context/GameContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useFirebaseQuestions } from '../hooks/useFirebaseQuestions';
import { useFirebaseGameStats } from '../hooks/useFirebaseGameStats';

// Game Context
const GameContext = createContext();

// Initial state for local game data (non-persistent)
const initialLocalState = {
  // Live game data (local only)
  liveGame: {
    isActive: false,
    currentPlayers: Math.floor(Math.random() * 50) + 30, // Start with 30-80 players
    timeLeft: 0,
    questionsAsked: []
  }
};

// Action types for local state
const localActionTypes = {
  START_GAME: 'START_GAME',
  END_GAME: 'END_GAME',
  UPDATE_LIVE_PLAYERS: 'UPDATE_LIVE_PLAYERS'
};

// Reducer for local state only
const localGameReducer = (state, action) => {
  switch (action.type) {
    case localActionTypes.START_GAME:
      return {
        ...state,
        liveGame: {
          ...state.liveGame,
          isActive: true,
          timeLeft: 60,
          questionsAsked: [],
          currentPlayers: state.liveGame.currentPlayers + Math.floor(Math.random() * 3)
        }
      };

    case localActionTypes.END_GAME:
      return {
        ...state,
        liveGame: {
          ...state.liveGame,
          isActive: false,
          timeLeft: 0
        }
      };

    case localActionTypes.UPDATE_LIVE_PLAYERS:
      return {
        ...state,
        liveGame: {
          ...state.liveGame,
          currentPlayers: action.payload
        }
      };

    default:
      return state;
  }
};

// Context Provider Component
export const GameProvider = ({ children }) => {
  const [localState, localDispatch] = useReducer(localGameReducer, initialLocalState);
  
  // Firebase hooks
  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    trackQuestionAsked,
    trackQuestionAnswered,
    getActiveQuestions,
    getQuestionStats
  } = useFirebaseQuestions();

  const {
    gameStats,
    recentSessions,
    loading: statsLoading,
    initializeStats,
    recordGameSession,
    updateQuestionStats,
    getGameAnalytics,
    getRecentSessions
  } = useFirebaseGameStats();

  // Initialize Firebase stats on mount
  useEffect(() => {
    initializeStats();
  }, []);

  // Simulate realistic player count updates
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const isPlayTime = (hour >= 17 && hour <= 23) || (hour >= 12 && hour <= 14); // Peak hours
      
      const baseChange = isPlayTime ? 
        Math.floor(Math.random() * 8) - 3 : // Peak: -3 to +4
        Math.floor(Math.random() * 6) - 2;  // Off-peak: -2 to +3
      
      localDispatch({
        type: localActionTypes.UPDATE_LIVE_PLAYERS,
        payload: Math.max(25, Math.min(150, localState.liveGame.currentPlayers + baseChange))
      });
    }, 4000 + Math.random() * 2000); // 4-6 seconds

    return () => clearInterval(interval);
  }, [localState.liveGame.currentPlayers]);

  // Combined state object
  const state = {
    questions,
    gameStats,
    liveGame: localState.liveGame,
    playerSessions: recentSessions,
    loading: questionsLoading || statsLoading,
    error: questionsError
  };

  // Action creators
  const actions = {
    // Question management (Firebase)
    addQuestion: async (questionData) => {
      try {
        await addQuestion(questionData);
      } catch (err) {
        console.error('Failed to add question:', err);
        throw err;
      }
    },

    updateQuestion: async (questionData) => {
      try {
        await updateQuestion(questionData.id, questionData);
      } catch (err) {
        console.error('Failed to update question:', err);
        throw err;
      }
    },

    deleteQuestion: async (questionId) => {
      try {
        await deleteQuestion(questionId);
      } catch (err) {
        console.error('Failed to delete question:', err);
        throw err;
      }
    },

    // Game actions (Local + Firebase tracking)
    startGame: () => {
      localDispatch({ type: localActionTypes.START_GAME });
    },

    endGame: async (sessionData) => {
      try {
        // Record session in Firebase
        await recordGameSession(sessionData);
        
        // Update local state
        localDispatch({ type: localActionTypes.END_GAME });
      } catch (err) {
        console.error('Failed to end game:', err);
        // Still update local state even if Firebase fails
        localDispatch({ type: localActionTypes.END_GAME });
      }
    },

    questionAsked: async (questionId) => {
      try {
        await trackQuestionAsked(questionId);
      } catch (err) {
        console.error('Failed to track question asked:', err);
      }
    },

    questionAnswered: async (questionId, isCorrect) => {
      try {
        await trackQuestionAnswered(questionId, isCorrect);
        await updateQuestionStats(isCorrect ? 1 : 0);
      } catch (err) {
        console.error('Failed to track question answered:', err);
      }
    },

    // Utility functions
    getActiveQuestions: () => {
      return getActiveQuestions();
    },

    getQuestionStats: (questionId) => {
      return getQuestionStats(questionId);
    },

    getGameAnalytics: () => {
      return getGameAnalytics();
    },

    getTopQuestions: (limit = 5) => {
      return [...questions]
        .filter(q => q.timesAsked > 0)
        .sort((a, b) => b.timesAsked - a.timesAsked)
        .slice(0, limit)
        .map(q => ({
          ...q,
          correctRate: q.timesAsked > 0 
            ? Math.round((q.correctAnswers / q.timesAsked) * 100)
            : 0
        }));
    },

    getRecentSessions: (limit = 10) => {
      return getRecentSessions(limit);
    }
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};