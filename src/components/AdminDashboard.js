import React, { useState, useMemo, useCallback } from 'react';
import { 
  Settings, Plus, Edit3, Trash2, Target, Search, Save, X, LogOut, User
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import AdminMultiplayerControls from './AdminMultiplayerControls';

// Extracted QuestionModal as a separate component to prevent recreation
const QuestionModal = ({ 
  isOpen, 
  onClose, 
  editingQuestion, 
  modalData, 
  setModalData, 
  onSave, 
  categories, 
  difficulties 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bebas text-3xl text-yellow-400">
            {editingQuestion ? 'EDIT QUESTION' : 'ADD NEW QUESTION'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="font-space block text-white font-bold mb-2">Question</label>
            <textarea
              value={modalData.question}
              onChange={(e) => setModalData(prev => ({ ...prev, question: e.target.value }))}
              className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors resize-none"
              placeholder="Enter your trivia question..."
              rows={3}
            />
          </div>

          {/* Answer Options */}
          <div>
            <label className="font-space block text-white font-bold mb-2">Answer Options</label>
            <div className="space-y-3">
              {modalData.options.map((option, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...modalData.options];
                      newOptions[index] = e.target.value;
                      setModalData(prev => ({ ...prev, options: newOptions }));
                    }}
                    className={`font-space w-full p-3 pr-10 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      modalData.correct === index 
                        ? 'border-green-400 bg-green-400/10' 
                        : 'border-gray-700 focus:border-yellow-400/50'
                    }`}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                  <button
                    type="button"
                    onClick={() => setModalData(prev => ({ ...prev, correct: index }))}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 transition-colors ${
                      modalData.correct === index 
                        ? 'bg-green-400 border-green-400' 
                        : 'border-gray-600 hover:border-yellow-400'
                    }`}
                    title="Mark as correct answer"
                  >
                    {modalData.correct === index && (
                      <div className="w-2 h-2 bg-gray-900 rounded-full mx-auto mt-1"></div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-space block text-white font-bold mb-2">Category</label>
              <select
                value={modalData.category}
                onChange={(e) => setModalData(prev => ({ ...prev, category: e.target.value }))}
                className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-800 capitalize">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-space block text-white font-bold mb-2">Difficulty</label>
              <select
                value={modalData.difficulty}
                onChange={(e) => setModalData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none transition-colors"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff} className="bg-gray-800 capitalize">{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={!modalData.question.trim() || modalData.options.some(opt => !opt.trim())}
            className="font-bebas w-full bg-yellow-400 text-gray-900 text-xl py-3 rounded-xl hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{editingQuestion ? 'UPDATE QUESTION' : 'SAVE QUESTION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { state, actions } = useGame();
  const { logout, user } = useAuth();
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Separate state for modal form to prevent conflicts
  const [modalData, setModalData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    category: 'blockchain',
    difficulty: 'easy'
  });

  const categories = ['blockchain', 'defi', 'nft', 'meme', 'history', 'gaming'];
  const difficulties = ['easy', 'medium', 'hard'];

  // Filter questions based on search and category
  const filteredQuestions = useMemo(() => {
    return state.questions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [state.questions, searchTerm, categoryFilter]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  }, [logout]);

  // Open modal for new question
  const openNewQuestionModal = useCallback(() => {
    setEditingQuestion(null);
    setModalData({
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      category: 'blockchain',
      difficulty: 'easy'
    });
    setShowQuestionModal(true);
  }, []);

  // Open modal for editing
  const openEditQuestionModal = useCallback((question) => {
    setEditingQuestion(question);
    setModalData({
      question: question.question,
      options: [...question.options],
      correct: question.correct,
      category: question.category,
      difficulty: question.difficulty
    });
    setShowQuestionModal(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setShowQuestionModal(false);
    setEditingQuestion(null);
    setModalData({
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      category: 'blockchain',
      difficulty: 'easy'
    });
  }, []);

  // Save question
  const saveQuestion = useCallback(async () => {
    try {
      if (editingQuestion) {
        await actions.updateQuestion({ ...editingQuestion, ...modalData });
      } else {    
        await actions.addQuestion(modalData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question: ' + error.message);
    }
  }, [editingQuestion, modalData, actions, closeModal]);

  const handleDeleteQuestion = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      actions.deleteQuestion(id);
    }
  }, [actions]);

  // Memoized QuestionRow component to prevent unnecessary re-renders
  const QuestionRow = React.memo(({ question }) => {
    const questionStats = actions.getQuestionStats(question.id);
    
    return (
      <tr className="border-b border-gray-700 hover:bg-gray-800/40 transition-colors">
        <td className="p-4">
          <div className="font-space font-semibold text-white">{question.question}</div>
          <div className="font-space text-sm text-gray-400 mt-1">
            <span className="capitalize">{question.category}</span> • {question.difficulty}
          </div>
        </td>
        <td className="p-4 text-center">
          <span className="font-bebas text-xl text-white">{questionStats?.timesAsked || 0}</span>
        </td>
        <td className="p-4 text-center">
          <span className="font-bebas text-xl text-white">{questionStats?.correctRate || 0}%</span>
        </td>
        <td className="p-4">
          <div className="flex space-x-2 justify-end">
            <button 
              onClick={() => openEditQuestionModal(question)}
              className="p-2 bg-gray-700 text-yellow-400 rounded-lg hover:bg-gray-600 transition-colors"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDeleteQuestion(question.id)}
              className="p-2 bg-gray-700 text-red-400 rounded-lg hover:bg-gray-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;700&display=swap');
        
        .font-bebas {
          font-family: 'Bebas Neue', cursive;
          letter-spacing: 0.05em;
        }
        
        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent"></div>
        <div className="relative bg-gray-900/80 backdrop-blur-md border-b border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Settings className="w-10 h-10 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 w-10 h-10 bg-yellow-400/30 rounded-full animate-ping"></div>
              </div>
              <h1 className="font-bebas text-4xl sm:text-5xl text-yellow-400">
                BONK BLITZ ADMIN
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-2 bg-gray-800/60 px-3 py-2 rounded-xl border border-gray-700">
                <User className="w-4 h-4 text-yellow-400" />
                <span className="font-space text-white font-semibold">
                  {user?.email || 'Admin'}
                </span>
              </div>
              
              {/* Stats */}
              <div className="font-space text-gray-300 font-semibold">
                {state.questions.length} Questions • {state.questions.filter(q => q.status === 'active').length} Active
              </div>
              
              {/* Actions */}
              <button 
                onClick={openNewQuestionModal}
                className="font-bebas bg-yellow-400 text-gray-900 py-2 px-6 rounded-xl hover:bg-yellow-300 transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>ADD QUESTION</span>
              </button>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Multiplayer Controls */}
        <AdminMultiplayerControls />

        {/* Filters */}
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-space w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="font-space px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none transition-colors"
            >
              <option value="all" className="bg-gray-800">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800 capitalize">{cat}</option>
              ))}
            </select>
            <div className="font-space text-gray-400 flex items-center px-3">
              {filteredQuestions.length} questions
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/60 border-b border-gray-700">
                <tr>
                  <th className="font-space text-left p-4 font-bold text-white">Question</th>
                  <th className="font-space text-center p-4 font-bold text-white">Asked</th>
                  <th className="font-space text-center p-4 font-bold text-white">Correct %</th>
                  <th className="font-space text-right p-4 font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map(question => (
                  <QuestionRow key={question.id} question={question} />
                ))}
              </tbody>
            </table>
            
            {filteredQuestions.length === 0 && (
              <div className="font-space text-center py-12 text-gray-500">
                {state.questions.length === 0 ? (
                  <div>
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="font-bebas text-2xl text-gray-400 mb-2">NO QUESTIONS YET</h3>
                    <p className="text-gray-500 mb-4">Add your first question to get started!</p>
                    <button 
                      onClick={openNewQuestionModal}
                      className="font-bebas bg-yellow-400 text-gray-900 py-2 px-6 rounded-xl hover:bg-yellow-300 transition-all"
                    >
                      ADD FIRST QUESTION
                    </button>
                  </div>
                ) : (
                  'No questions match your filters.'
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Question Modal */}
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={closeModal}
        editingQuestion={editingQuestion}
        modalData={modalData}
        setModalData={setModalData}
        onSave={saveQuestion}
        categories={categories}
        difficulties={difficulties}
      />
    </div>
  );
};

export default AdminDashboard;