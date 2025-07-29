// components/AdminMultiplayerControls.js
import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Square, 
  SkipForward, 
  Users, 
  Clock, 
  Trophy,
  Settings,
  Trash2,
  Plus,
  Target,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useGame } from '../context/GameContext';

const AdminMultiplayerControls = () => {
  const { 
    activeRound, 
    createRound, 
    startRound, 
    endRound, 
    nextQuestion, 
    deleteRound,
    leaderboard,
    loading 
  } = useMultiplayer();

  const { state } = useGame(); // Get questions to validate categories

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roundSettings, setRoundSettings] = useState({
    name: '',
    questionCount: 10,
    timePerQuestion: 15,
    categories: ['blockchain', 'defi', 'nft']
  });
  const [createError, setCreateError] = useState(null);

  const categories = ['blockchain', 'defi', 'nft', 'meme', 'history', 'gaming'];

  // Calculate available questions per category
  const questionCounts = useMemo(() => {
    const counts = {};
    categories.forEach(category => {
      counts[category] = state.questions.filter(q => q.category === category).length;
    });
    return counts;
  }, [state.questions, categories]);

  // Calculate total available questions for selected categories
  const availableQuestions = useMemo(() => {
    return state.questions.filter(q => 
      roundSettings.categories.includes(q.category)
    ).length;
  }, [state.questions, roundSettings.categories]);

  // Check if round can be created
  const canCreateRound = useMemo(() => {
    return roundSettings.name.trim() && 
           roundSettings.categories.length > 0 && 
           availableQuestions >= roundSettings.questionCount;
  }, [roundSettings, availableQuestions]);

  const handleCreateRound = async () => {
    try {
      setCreateError(null);
      
      if (availableQuestions < roundSettings.questionCount) {
        setCreateError(`Not enough questions available. You need ${roundSettings.questionCount} questions but only ${availableQuestions} are available for the selected categories.`);
        return;
      }

      console.log('Attempting to create round with settings:', roundSettings);
      
      const result = await createRound(roundSettings);
      console.log('Round created successfully:', result);
      setShowCreateModal(false);
      
      // Reset form
      setRoundSettings({
        name: '',
        questionCount: 10,
        timePerQuestion: 15,
        categories: ['blockchain', 'defi', 'nft']
      });
    } catch (error) {
      console.error('Error creating round:', error);
      setCreateError(error.message || 'Failed to create round');
    }
  };

  const handleStartRound = () => {
    if (activeRound) {
      startRound(activeRound.id);
    }
  };

  const handleEndRound = () => {
    if (activeRound && window.confirm('Are you sure you want to end this round?')) {
      endRound(activeRound.id);
    }
  };

  const handleNextQuestion = () => {
    if (activeRound) {
      nextQuestion(activeRound.id);
    }
  };

  const handleDeleteRound = () => {
    if (activeRound && window.confirm('Are you sure you want to delete this round?')) {
      deleteRound(activeRound.id);
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-6 border border-gray-700 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Users className="w-8 h-8 text-yellow-400 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 bg-yellow-400/30 rounded-full animate-ping"></div>
          </div>
          <h2 className="font-bebas text-2xl text-yellow-400">
            MULTIPLAYER CONTROL CENTER
          </h2>
        </div>
        
        {!activeRound && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="font-bebas bg-yellow-400 text-gray-900 py-2 px-4 rounded-xl hover:bg-yellow-300 transition-all flex items-center gap-2"
            disabled={loading}
          >
            <Plus className="w-4 h-4" />
            CREATE ROUND
          </button>
        )}
      </div>

      {/* Active Round Display */}
      {activeRound ? (
        <div className="space-y-6">
          {/* Round Status Card */}
          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bebas text-lg text-white">{activeRound.name || 'Multiplayer Round'}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`font-space px-3 py-1 rounded-full ${
                    activeRound.status === 'waiting' ? 'bg-yellow-400/20 text-yellow-400' :
                    activeRound.status === 'playing' ? 'bg-green-400/20 text-green-400' :
                    'bg-gray-400/20 text-gray-400'
                  }`}>
                    {activeRound.status.toUpperCase()}
                  </span>
                  <span className="font-space text-gray-400">
                    {activeRound.players?.length || 0} players joined
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bebas text-xl text-yellow-400">
                  Q{(activeRound.currentQuestionIndex || 0) + 1}/{activeRound.questionCount}
                </div>
                <div className="font-space text-sm text-gray-400">
                  {activeRound.timePerQuestion}s per question
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-3">
            {activeRound.status === 'waiting' && (
              <button
                onClick={handleStartRound}
                className="font-bebas bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
                disabled={loading || (activeRound.players?.length || 0) === 0}
              >
                <Play className="w-5 h-5" />
                START ROUND
              </button>
            )}

            {activeRound.status === 'playing' && (
              <>
                <button
                  onClick={handleNextQuestion}
                  className="font-bebas bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                  disabled={loading}
                >
                  <SkipForward className="w-5 h-5" />
                  NEXT QUESTION
                </button>
                
                <button
                  onClick={handleEndRound}
                  className="font-bebas bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
                  disabled={loading}
                >
                  <Square className="w-5 h-5" />
                  END ROUND
                </button>
              </>
            )}

            <button
              onClick={handleDeleteRound}
              className="font-bebas bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2"
              disabled={loading}
            >
              <Trash2 className="w-5 h-5" />
              DELETE
            </button>
          </div>

          {/* Current Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bebas text-lg text-yellow-400 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                LIVE LEADERBOARD
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leaderboard.slice(0, 10).map((player, index) => (
                  <div key={player.id} className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`font-bebas text-lg ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="font-space text-white">{player.name}</span>
                    </div>
                    <span className="font-bebas text-yellow-400">{player.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-900/60 rounded-xl p-8 border border-gray-700">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="font-bebas text-2xl text-gray-400 mb-2">NO ACTIVE ROUND</h3>
            <p className="font-space text-gray-500 mb-6">Create a new multiplayer round to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="font-bebas bg-yellow-400 text-gray-900 py-3 px-6 rounded-xl hover:bg-yellow-300 transition-all flex items-center gap-2 mx-auto"
              disabled={loading}
            >
              <Plus className="w-5 h-5" />
              CREATE FIRST ROUND
            </button>
          </div>
        </div>
      )}

      {/* Create Round Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <h3 className="font-bebas text-2xl text-yellow-400 mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              CREATE NEW ROUND
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="font-space block text-white font-bold mb-2">Round Name</label>
                <input
                  type="text"
                  value={roundSettings.name}
                  onChange={(e) => setRoundSettings(prev => ({ ...prev, name: e.target.value }))}
                  className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none"
                  placeholder="Enter round name (e.g., 'Crypto Masters')"
                />
              </div>

              <div>
                <label className="font-space block text-white font-bold mb-2">Questions per Round</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={roundSettings.questionCount}
                  onChange={(e) => setRoundSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                  className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-space block text-white font-bold mb-2">Time per Question (seconds)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={roundSettings.timePerQuestion}
                  onChange={(e) => setRoundSettings(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) }))}
                  className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-space block text-white font-bold mb-2">Categories</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map(category => {
                    const questionCount = questionCounts[category] || 0;
                    const isDisabled = questionCount === 0;
                    
                    return (
                      <label key={category} className={`flex items-center justify-between gap-2 ${isDisabled ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={roundSettings.categories.includes(category)}
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRoundSettings(prev => ({ 
                                  ...prev, 
                                  categories: [...prev.categories, category] 
                                }));
                              } else {
                                setRoundSettings(prev => ({ 
                                  ...prev, 
                                  categories: prev.categories.filter(c => c !== category) 
                                }));
                              }
                            }}
                            className="rounded border-gray-700 bg-gray-800 text-yellow-400 focus:ring-yellow-400"
                          />
                          <span className="font-space text-white capitalize">{category}</span>
                        </div>
                        <span className={`font-space text-sm ${
                          questionCount === 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {questionCount} questions
                        </span>
                      </label>
                    );
                  })}
                </div>
                
                {/* Category Validation Messages */}
                {roundSettings.categories.length === 0 && (
                  <div className="bg-red-600/20 border border-red-400/50 rounded-xl p-3 mt-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="font-space text-red-400 text-sm">
                        Please select at least one category.
                      </span>
                    </div>
                  </div>
                )}
                
                {roundSettings.categories.length > 0 && availableQuestions < roundSettings.questionCount && (
                  <div className="bg-orange-600/20 border border-orange-400/50 rounded-xl p-3 mt-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="font-space text-orange-400 text-sm">
                        Only {availableQuestions} questions available for selected categories. Need {roundSettings.questionCount}.
                      </span>
                    </div>
                  </div>
                )}
                
                {roundSettings.categories.length > 0 && availableQuestions >= roundSettings.questionCount && (
                  <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-3 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-space text-green-400 text-sm">
                        ✅ {availableQuestions} questions available for selected categories.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {createError && (
              <div className="bg-red-600/20 border border-red-400/50 rounded-xl p-3 mt-4">
                <p className="font-space text-red-400 text-sm">{createError}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateRound}
                disabled={loading || !canCreateRound}
                className="font-bebas flex-1 bg-yellow-400 text-gray-900 py-3 px-4 rounded-xl hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all"
              >
                {loading ? 'CREATING...' : 'CREATE ROUND'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="font-bebas bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-all"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMultiplayerControls;