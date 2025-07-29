// hooks/useFirebaseQuestions.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirebaseQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener for questions
  useEffect(() => {
    try {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const questionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
          }));
          setQuestions(questionsData);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching questions:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up questions listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Add a new question
  const addQuestion = async (questionData) => {
    try {
      const docRef = await addDoc(collection(db, 'questions'), {
        ...questionData,
        timesAsked: 0,
        correctAnswers: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding question:', err);
      throw err;
    }
  };

  // Update a question
  const updateQuestion = async (questionId, questionData) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        ...questionData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating question:', err);
      throw err;
    }
  };

  // Delete a question
  const deleteQuestion = async (questionId) => {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
    } catch (err) {
      console.error('Error deleting question:', err);
      throw err;
    }
  };

  // Track question being asked
  const trackQuestionAsked = async (questionId) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        timesAsked: increment(1),
        lastAsked: serverTimestamp()
      });
    } catch (err) {
      console.error('Error tracking question asked:', err);
    }
  };

  // Track question answer
  const trackQuestionAnswered = async (questionId, isCorrect) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        ...(isCorrect && { correctAnswers: increment(1) }),
        lastAnswered: serverTimestamp()
      });
    } catch (err) {
      console.error('Error tracking question answered:', err);
    }
  };

  // Get active questions only
  const getActiveQuestions = () => {
    return questions.filter(q => q.status === 'active');
  };

  // Get question stats
  const getQuestionStats = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;
    
    return {
      ...question,
      correctRate: question.timesAsked > 0 
        ? Math.round((question.correctAnswers / question.timesAsked) * 100)
        : 0
    };
  };

  return {
    questions,
    loading,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    trackQuestionAsked,
    trackQuestionAnswered,
    getActiveQuestions,
    getQuestionStats
  };
};