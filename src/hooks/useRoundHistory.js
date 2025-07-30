// hooks/useRoundHistory.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useRoundHistory = () => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to all rounds (including finished ones)
  useEffect(() => {
    try {
      const roundsRef = collection(db, 'multiplayerRounds');
      const q = query(roundsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const roundsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            startTime: data.startTime?.toDate()?.toISOString() || null,
            endTime: data.endTime?.toDate()?.toISOString() || null,
            scheduledStartTime: data.scheduledStartTime || null
          };
        });
        
        setRounds(roundsData);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching round history:', err);
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up round history listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Export round data as JSON
  const exportRoundData = async (roundId) => {
    try {
      const round = rounds.find(r => r.id === roundId);
      if (!round) {
        throw new Error('Round not found');
      }

      // Create detailed export data
      const exportData = {
        roundInfo: {
          id: round.id,
          name: round.name,
          status: round.status,
          createdAt: round.createdAt,
          startTime: round.startTime,
          endTime: round.endTime,
          questionCount: round.questionCount,
          timePerQuestion: round.timePerQuestion,
          categories: round.categories
        },
        players: round.players?.map(player => ({
          id: player.id,
          name: player.name,
          solanaAddress: player.solanaAddress,
          score: player.score,
          answers: player.answers,
          joinedAt: player.joinedAt,
          correctAnswers: player.answers?.filter(a => a.correct).length || 0,
          totalAnswers: player.answers?.length || 0,
          accuracy: player.answers?.length > 0 
            ? Math.round((player.answers.filter(a => a.correct).length / player.answers.length) * 100)
            : 0
        })) || [],
        prizes: round.prizes || [],
        questions: round.questions || [],
        winners: round.players
          ?.sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map((player, index) => {
            const prize = round.prizes?.find(p => p.rank === index + 1);
            return {
              rank: index + 1,
              playerId: player.id,
              playerName: player.name,
              solanaAddress: player.solanaAddress,
              score: player.score,
              prize: prize || null
            };
          }) || [],
        summary: {
          totalPlayers: round.players?.length || 0,
          totalPrizesDistributed: round.prizes?.reduce((sum, prize) => sum + prize.amount, 0) || 0,
          avgScore: round.players?.length > 0 
            ? Math.round(round.players.reduce((sum, p) => sum + p.score, 0) / round.players.length)
            : 0,
          completionRate: round.players?.length > 0
            ? Math.round((round.players.filter(p => p.answers && p.answers.length > 0).length / round.players.length) * 100)
            : 0
        }
      };

      // Download as JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bonk-blitz-round-${round.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return exportData;
    } catch (err) {
      console.error('Error exporting round data:', err);
      throw err;
    }
  };

  // Get winners by round ID
  const getWinnersByRound = (roundId) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round || !round.players) return [];

    return round.players
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((player, index) => {
        const prize = round.prizes?.find(p => p.rank === index + 1);
        return {
          rank: index + 1,
          player,
          prize
        };
      });
  };

  // Get rounds by status
  const getRoundsByStatus = (status) => {
    return rounds.filter(round => round.status === status);
  };

  // Get rounds from date range
  const getRoundsByDateRange = (startDate, endDate) => {
    return rounds.filter(round => {
      const roundDate = new Date(round.createdAt);
      return roundDate >= startDate && roundDate <= endDate;
    });
  };

  // Calculate analytics
  const getAnalytics = () => {
    const finishedRounds = rounds.filter(r => r.status === 'finished');
    
    if (finishedRounds.length === 0) {
      return {
        totalRounds: rounds.length,
        finishedRounds: 0,
        totalPlayers: 0,
        totalPrizes: 0,
        averagePlayersPerRound: 0,
        averageRoundDuration: 0,
        popularCategories: [],
        topPerformers: []
      };
    }

    const totalPlayers = finishedRounds.reduce((sum, round) => sum + (round.players?.length || 0), 0);
    const totalPrizes = finishedRounds.reduce((sum, round) => {
      return sum + (round.prizes?.reduce((prizeSum, prize) => prizeSum + prize.amount, 0) || 0);
    }, 0);

    // Calculate average round duration
    const durationsMs = finishedRounds
      .filter(round => round.startTime && round.endTime)
      .map(round => new Date(round.endTime) - new Date(round.startTime));
    
    const averageRoundDuration = durationsMs.length > 0
      ? Math.round(durationsMs.reduce((sum, duration) => sum + duration, 0) / durationsMs.length / 60000) // in minutes
      : 0;

    // Get popular categories
    const categoryCount = {};
    finishedRounds.forEach(round => {
      round.categories?.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });
    
    const popularCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Get top performers across all rounds
    const allPlayers = {};
    finishedRounds.forEach(round => {
      round.players?.forEach(player => {
        if (!allPlayers[player.solanaAddress]) {
          allPlayers[player.solanaAddress] = {
            name: player.name,
            solanaAddress: player.solanaAddress,
            totalScore: 0,
            roundsPlayed: 0,
            wins: 0,
            totalPrizes: 0
          };
        }
        
        allPlayers[player.solanaAddress].totalScore += player.score;
        allPlayers[player.solanaAddress].roundsPlayed += 1;
        
        // Check if this player won (top 3)
        const sortedPlayers = round.players.sort((a, b) => b.score - a.score);
        const playerRank = sortedPlayers.findIndex(p => p.solanaAddress === player.solanaAddress) + 1;
        if (playerRank <= 3) {
          allPlayers[player.solanaAddress].wins += 1;
          const prize = round.prizes?.find(p => p.rank === playerRank);
          if (prize) {
            allPlayers[player.solanaAddress].totalPrizes += prize.amount;
          }
        }
      });
    });

    const topPerformers = Object.values(allPlayers)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map(player => ({
        ...player,
        averageScore: Math.round(player.totalScore / player.roundsPlayed)
      }));

    return {
      totalRounds: rounds.length,
      finishedRounds: finishedRounds.length,
      totalPlayers,
      totalPrizes,
      averagePlayersPerRound: Math.round(totalPlayers / finishedRounds.length),
      averageRoundDuration,
      popularCategories,
      topPerformers
    };
  };

  return {
    rounds,
    loading,
    error,
    exportRoundData,
    getWinnersByRound,
    getRoundsByStatus,
    getRoundsByDateRange,
    getAnalytics
  };
};