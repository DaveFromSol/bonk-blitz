// context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('bonkBlitzUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('bonkBlitzUser');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bonkBlitzUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bonkBlitzUser');
    }
  }, [currentUser]);

  // Validate Solana address format
  const isValidSolanaAddress = (address) => {
    // Basic Solana address validation (base58, 32-44 characters)
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaRegex.test(address);
  };

  // Register new user
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const { username, solanaAddress, email } = userData;

      // Validate inputs
      if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (!isValidSolanaAddress(solanaAddress)) {
        throw new Error('Invalid Solana wallet address format');
      }

      if (email && !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Invalid email format');
      }

      // Generate user ID
      const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

      const newUser = {
        id: userId,
        username: username.trim(),
        solanaAddress: solanaAddress.trim(),
        email: email?.trim() || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalScore: 0,
          bestStreak: 0,
          totalBonkEarned: 0
        },
        preferences: {
          favoriteCategories: [],
          notifications: true
        }
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), newUser);

      // Set as current user
      const userForState = { ...newUser, createdAt: new Date(), updatedAt: new Date() };
      setCurrentUser(userForState);

      return userForState;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (updates) => {
    try {
      if (!currentUser) throw new Error('No user logged in');

      setLoading(true);
      setError(null);

      // Validate Solana address if being updated
      if (updates.solanaAddress && !isValidSolanaAddress(updates.solanaAddress)) {
        throw new Error('Invalid Solana wallet address format');
      }

      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Update in Firestore
      await updateDoc(doc(db, 'users', currentUser.id), updatedData);

      // Update local state
      const updatedUser = { 
        ...currentUser, 
        ...updates, 
        updatedAt: new Date() 
      };
      setCurrentUser(updatedUser);

      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user stats after game
  const updateUserStats = async (gameResults) => {
    try {
      if (!currentUser) return;

      const { score, won, streak, bonkEarned = 0 } = gameResults;

      const newStats = {
        gamesPlayed: currentUser.stats.gamesPlayed + 1,
        gamesWon: currentUser.stats.gamesWon + (won ? 1 : 0),
        totalScore: currentUser.stats.totalScore + score,
        bestStreak: Math.max(currentUser.stats.bestStreak, streak),
        totalBonkEarned: currentUser.stats.totalBonkEarned + bonkEarned
      };

      await updateUser({ stats: newStats });
    } catch (err) {
      console.error('Error updating user stats:', err);
    }
  };

  // Logout user
  const logout = () => {
    setCurrentUser(null);
    setError(null);
  };

  // Check if user is registered
  const isRegistered = () => {
    return !!currentUser;
  };

  const value = {
    currentUser,
    loading,
    error,
    registerUser,
    updateUser,
    updateUserStats,
    logout,
    isRegistered,
    isValidSolanaAddress
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};