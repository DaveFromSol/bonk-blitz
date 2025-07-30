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
  AlertTriangle,
  Coins,
  X,
  Award,
  Gift
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

  const { state } = useGame();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic Settings, 2: Prize Distribution
  const [roundSettings, setRoundSettings] = useState({
    name: '',
    questionCount: 10,
    timePerQuestion: 15,
    categories: ['blockchain', 'defi'],
    startDelay: 30,
    prizes: [
      { rank: 1, amount: 100, currency: 'BONK' },
      { rank: 2, amount: 50, currency: 'BONK' },
      { rank: 3, amount: 25, currency: 'BONK' }
    ]
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

      const result = await createRound(roundSettings);
      setShowCreateModal(false);
      setCurrentStep(1);
      
      // Reset form
      setRoundSettings({
        name: '',
        questionCount: 10,
        timePerQuestion: 15,
        categories: ['blockchain', 'defi'],
        startDelay: 30,
        prizes: [
          { rank: 1, amount: 100, currency: 'BONK' },
          { rank: 2, amount: 50, currency: 'BONK' },
          { rank: 3, amount: 25, currency: 'BONK' }
        ]
      });
    } catch (error) {
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

  const handleDeleteRound = async () => {
    if (activeRound && window.confirm('Are you sure you want to delete this round?')) {
      try {
        await deleteRound(activeRound.id);
      } catch (error) {
        alert('Failed to delete round: ' + error.message);
      }
    }
  };

  const addPrize = () => {
    if (roundSettings.prizes.length < 10) {
      const newRank = roundSettings.prizes.length + 1;
      setRoundSettings(prev => ({
        ...prev,
        prizes: [...prev.prizes, { rank: newRank, amount: 10, currency: 'BONK' }]
      }));
    }
  };

  const removePrize = (index) => {
    setRoundSettings(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index).map((prize, i) => ({
        ...prize,
        rank: i + 1
      }))
    }));
  };

  const updatePrize = (index, field, value) => {
    setRoundSettings(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setCurrentStep(1);
    setCreateError(null);
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700 mb-6">
      <div className="p-6">
        {/* Header */}
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
              className="font-bebas bg-yellow-400 text-gray-900 py-2 px-4 rounded-xl hover:bg-yellow-300 transition-all flex items-center gap-2 shadow-lg"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              CREATE ROUND
            </button>
          )}
        </div>

        {/* Active Round Display */}
        {activeRound ? (
          <div className="space-y-4">
            {/* Round Status Card */}
            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bebas text-xl text-white mb-2">{activeRound.name || 'Multiplayer Round'}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className={`font-space px-3 py-1 rounded-full text-xs font-bold ${
                      activeRound.status === 'waiting' ? 'bg-yellow-400/20 text-yellow-400' :
                      activeRound.status === 'playing' ? 'bg-green-400/20 text-green-400' :
                      'bg-gray-400/20 text-gray-400'
                    }`}>
                      {activeRound.status.toUpperCase()}
                    </span>
                    <span className="font-space text-gray-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {activeRound.players?.length || 0} players
                    </span>
                    <span className="font-space text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activeRound.timePerQuestion}s per question
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bebas text-2xl text-yellow-400">
                    Q{(activeRound.currentQuestionIndex || 0) + 1}/{activeRound.questionCount}
                  </div>
                  <div className="font-space text-sm text-gray-400">
                    Progress: {Math.round(((activeRound.currentQuestionIndex || 0) / activeRound.questionCount) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-3">
              {activeRound.status === 'waiting' && (
                <button
                  onClick={handleStartRound}
                  className="font-bebas bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
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
                    className="font-bebas bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
                    disabled={loading}
                  >
                    <SkipForward className="w-5 h-5" />
                    NEXT QUESTION
                  </button>
                  
                  <button
                    onClick={handleEndRound}
                    className="font-bebas bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg"
                    disabled={loading}
                  >
                    <Square className="w-5 h-5" />
                    END ROUND
                  </button>
                </>
              )}

              <button
                onClick={handleDeleteRound}
                className="font-bebas bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2 shadow-lg"
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
                        <span className={`font-bebas text-lg w-8 ${
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
                className="font-bebas bg-yellow-400 text-gray-900 py-3 px-6 rounded-xl hover:bg-yellow-300 transition-all flex items-center gap-2 mx-auto shadow-lg"
                disabled={loading}
              >
                <Plus className="w-5 h-5" />
                CREATE FIRST ROUND
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Round Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-yellow-400" />
                <h3 className="font-bebas text-2xl text-yellow-400">CREATE NEW ROUND</h3>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= 1 ? 'bg-yellow-400 border-yellow-400 text-gray-900' : 'border-gray-600 text-gray-400'
                }`}>
                  1
                </div>
                <div className={`h-0.5 w-12 ${currentStep > 1 ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= 2 ? 'bg-yellow-400 border-yellow-400 text-gray-900' : 'border-gray-600 text-gray-400'
                }`}>
                  2
                </div>
              </div>
            </div>

            {/* Step 1: Basic Settings */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-bebas text-lg text-white mb-4">ROUND SETTINGS</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
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
                    <label className="font-space block text-white font-bold mb-2">Questions</label>
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
                    <label className="font-space block text-white font-bold mb-2">Time per Question</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={roundSettings.timePerQuestion}
                      onChange={(e) => setRoundSettings(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) }))}
                      className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-space block text-white font-bold mb-2">Start Delay (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={roundSettings.startDelay}
                    onChange={(e) => setRoundSettings(prev => ({ ...prev, startDelay: parseInt(e.target.value) }))}
                    className="font-space w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none"
                  />
                  <p className="font-space text-xs text-gray-400 mt-1">Time before round auto-starts after creation</p>
                </div>

                <div>
                  <label className="font-space block text-white font-bold mb-2">Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(category => {
                      const questionCount = questionCounts[category] || 0;
                      const isDisabled = questionCount === 0;
                      
                      return (
                        <label key={category} className={`flex items-center justify-between gap-2 p-3 bg-gray-800 rounded-lg ${isDisabled ? 'opacity-50' : 'hover:bg-gray-700'} transition-colors`}>
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
                              className="rounded border-gray-600 bg-gray-700 text-yellow-400 focus:ring-yellow-400"
                            />
                            <span className="font-space text-white capitalize text-sm">{category}</span>
                          </div>
                          <span className={`font-space text-xs ${
                            questionCount === 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {questionCount}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  
                  {/* Validation Messages */}
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
                          Only {availableQuestions} questions available. Need {roundSettings.questionCount}.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {roundSettings.categories.length > 0 && availableQuestions >= roundSettings.questionCount && (
                    <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-3 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="font-space text-green-400 text-sm">
                          ✅ {availableQuestions} questions available
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Prize Distribution */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bebas text-lg text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    PRIZE DISTRIBUTION
                  </h4>
                  <button
                    onClick={addPrize}
                    disabled={roundSettings.prizes.length >= 10}
                    className="font-bebas bg-yellow-400 text-gray-900 py-1 px-3 rounded-lg hover:bg-yellow-300 transition-all flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    ADD PRIZE
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {roundSettings.prizes.map((prize, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <Award className={`w-5 h-5 ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-orange-400' :
                          'text-blue-400'
                        }`} />
                        <span className="font-bebas text-white">#{prize.rank}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="number"
                          min="0"
                          value={prize.amount}
                          onChange={(e) => updatePrize(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="font-space w-20 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-yellow-400/50 focus:outline-none"
                        />
                        <select
                          value={prize.currency}
                          onChange={(e) => updatePrize(index, 'currency', e.target.value)}
                          className="font-space p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-yellow-400/50 focus:outline-none"
                        >
                          <option value="BONK">BONK</option>
                          <option value="SOL">SOL</option>
                          <option value="USDC">USDC</option>
                        </select>
                      </div>

                      <button
                        onClick={() => removePrize(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        disabled={roundSettings.prizes.length <= 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-600/20 border border-blue-400/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-400" />
                    <span className="font-space text-blue-400 text-sm">
                      Total Prize Pool: {roundSettings.prizes.reduce((sum, p) => {
                        if (p.currency === 'BONK') return sum + p.amount;
                        return sum;
                      }, 0)} BONK + {roundSettings.prizes.reduce((sum, p) => {
                        if (p.currency === 'SOL') return sum + p.amount;
                        return sum;
                      }, 0)} SOL + {roundSettings.prizes.reduce((sum, p) => {
                        if (p.currency === 'USDC') return sum + p.amount;
                        return sum;
                      }, 0)} USDC
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {createError && (
              <div className="bg-red-600/20 border border-red-400/50 rounded-xl p-3 mt-4">
                <p className="font-space text-red-400 text-sm">{createError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => currentStep === 1 ? closeModal() : setCurrentStep(1)}
                className="font-bebas bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-all"
              >
                {currentStep === 1 ? 'CANCEL' : 'BACK'}
              </button>

              {currentStep === 1 ? (
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!roundSettings.name.trim() || roundSettings.categories.length === 0 || availableQuestions < roundSettings.questionCount}
                  className="font-bebas bg-yellow-400 text-gray-900 py-3 px-6 rounded-xl hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all"
                >
                  NEXT: PRIZES
                </button>
              ) : (
                <button
                  onClick={handleCreateRound}
                  disabled={loading || !canCreateRound}
                  className="font-bebas bg-yellow-400 text-gray-900 py-3 px-6 rounded-xl hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all"
                >
                  {loading ? 'CREATING...' : 'CREATE ROUND'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMultiplayerControls;