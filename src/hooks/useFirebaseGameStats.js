// hooks/useFirebaseGameStats.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirebaseGameStats = () => {
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalPlayers: 0,
    totalRevenue: 0,
    averageScore: 0,
    averageSessionTime: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    gamesPlayedToday: 0,
    uniquePlayersToday: 0,
    currentPrizePool: 0.047,
    lastGameTime: null
  });
  
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to global stats
  useEffect(() => {
    try {
      const statsRef = doc(db, 'gameStats', 'global');
      
      const unsubscribe = onSnapshot(statsRef, 
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setGameStats(prev => ({
              ...prev,
              ...data,
              lastGameTime: data.lastGameTime?.toDate()?.toISOString() || null
            }));
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching game stats:', err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up stats listener:', err);
      setLoading(false);
    }
  }, []);

  // Listen to recent sessions
  useEffect(() => {
    try {
      const sessionsRef = collection(db, 'gameSessions');
      const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(10));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
          }));
          setRecentSessions(sessions);
        },
        (err) => {
          console.error('Error fetching recent sessions:', err);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up sessions listener:', err);
    }
  }, []);

  // Initialize global stats if they don't exist
  const initializeStats = async () => {
    try {
      const statsRef = doc(db, 'gameStats', 'global');
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        await setDoc(statsRef, {
          totalGames: 0,
          totalPlayers: 0,
          totalRevenue: 0,
          averageScore: 0,
          averageSessionTime: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          gamesPlayedToday: 0,
          uniquePlayersToday: 0,
          currentPrizePool: 0.047,
          lastGameTime: null,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error initializing stats:', err);
    }
  };

  // Record a game session
  const recordGameSession = async (sessionData) => {
    try {
      // Add session to collection
      const sessionRef = await addDoc(collection(db, 'gameSessions'), {
        ...sessionData,
        timestamp: serverTimestamp()
      });

      // Update global stats
      const statsRef = doc(db, 'gameStats', 'global');
      
      // Calculate new averages
      const newTotalGames = gameStats.totalGames + 1;
      const newAverageScore = Math.round(
        (gameStats.averageScore * gameStats.totalGames + sessionData.score) / newTotalGames
      );
      const newAverageSessionTime = Math.round(
        (gameStats.averageSessionTime * gameStats.totalGames + sessionData.sessionTime) / newTotalGames
      );

      await updateDoc(statsRef, {
        totalGames: increment(1),
        totalPlayers: increment(1),
        averageScore: newAverageScore,
        averageSessionTime: newAverageSessionTime,
        questionsAnswered: increment(sessionData.questionsAnswered || 0),
        correctAnswers: increment(Math.round((sessionData.accuracy || 0) * (sessionData.questionsAnswered || 0) / 100)),
        gamesPlayedToday: increment(1),
        lastGameTime: serverTimestamp()
      });

      return sessionRef.id;
    } catch (err) {
      console.error('Error recording game session:', err);
      throw err;
    }
  };

  // Update question statistics
  const updateQuestionStats = async (correctAnswersCount) => {
    try {
      const statsRef = doc(db, 'gameStats', 'global');
      await updateDoc(statsRef, {
        questionsAnswered: increment(1),
        correctAnswers: increment(correctAnswersCount)
      });
    } catch (err) {
      console.error('Error updating question stats:', err);
    }
  };

  // Get analytics data
  const getGameAnalytics = () => {
    const totalQuestions = gameStats.questionsAnswered;
    const totalCorrect = gameStats.correctAnswers;
    
    return {
      ...gameStats,
      overallAccuracy: totalQuestions > 0 
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0,
      questionsPerGame: gameStats.totalGames > 0
        ? Math.round(totalQuestions / gameStats.totalGames)
        : 0
    };
  };

  // Get recent sessions
  const getRecentSessions = (limitCount = 10) => {
    return recentSessions.slice(0, limitCount);
  };

  return {
    gameStats,
    recentSessions,
    loading,
    initializeStats,
    recordGameSession,
    updateQuestionStats,
    getGameAnalytics,
    getRecentSessions
  };
};