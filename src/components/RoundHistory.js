// components/RoundHistory.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  Filter,
  ChevronDown,
  ChevronUp,
  Award,
  Coins,
  Search,
  Download,
  Eye
} from 'lucide-react';
import { useRoundHistory } from '../hooks/useRoundHistory';

const RoundHistory = () => {
  const { 
    rounds, 
    loading, 
    error, 
    exportRoundData, 
    getWinnersByRound 
  } = useRoundHistory();

  const [expandedRound, setExpandedRound] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter rounds based on status, date, and search
  const filteredRounds = useMemo(() => {
    return rounds.filter(round => {
      const matchesStatus = statusFilter === 'all' || round.status === statusFilter;
      const matchesSearch = round.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const roundDate = new Date(round.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - roundDate) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [rounds, statusFilter, dateFilter, searchTerm]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const finishedRounds = rounds.filter(r => r.status === 'finished');
    const totalPrizesPaid = finishedRounds.reduce((sum, round) => {
      return sum + (round.prizes?.reduce((prizeSum, prize) => prizeSum + prize.amount, 0) || 0);
    }, 0);
    
    const totalPlayers = finishedRounds.reduce((sum, round) => {
      return sum + (round.players?.length || 0);
    }, 0);

    return {
      totalRounds: rounds.length,
      finishedRounds: finishedRounds.length,
      totalPrizesPaid,
      totalPlayers,
      averagePlayersPerRound: finishedRounds.length > 0 ? Math.round(totalPlayers / finishedRounds.length) : 0
    };
  }, [rounds]);

  const toggleRoundExpansion = (roundId) => {
    setExpandedRound(expandedRound === roundId ? null : roundId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'finished':
        return 'text-green-400 bg-green-400/20';
      case 'playing':
        return 'text-blue-400 bg-blue-400/20';
      case 'waiting':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const exportRound = async (roundId) => {
    try {
      await exportRoundData(roundId);
    } catch (error) {
      console.error('Failed to export round data:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="font-bebas text-xl text-yellow-400">LOADING ROUND HISTORY...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <div className="text-center py-12">
          <h3 className="font-bebas text-xl text-red-400 mb-2">ERROR LOADING ROUNDS</h3>
          <p className="font-space text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700 mb-6">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="font-bebas text-2xl text-yellow-400">ROUND HISTORY & ANALYTICS</h2>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <div className="font-bebas text-2xl text-yellow-400">{summaryStats.totalRounds}</div>
            <div className="font-space text-sm text-gray-400">Total Rounds</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <div className="font-bebas text-2xl text-green-400">{summaryStats.finishedRounds}</div>
            <div className="font-space text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <div className="font-bebas text-2xl text-blue-400">{summaryStats.totalPlayers}</div>
            <div className="font-space text-sm text-gray-400">Total Players</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <div className="font-bebas text-2xl text-purple-400">{summaryStats.averagePlayersPerRound}</div>
            <div className="font-space text-sm text-gray-400">Avg Players/Round</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 text-center">
            <div className="font-bebas text-2xl text-orange-400">{summaryStats.totalPrizesPaid}</div>
            <div className="font-space text-sm text-gray-400">Total Prizes (BONK)</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search rounds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="font-space w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="font-space px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="finished">Finished</option>
            <option value="playing">Playing</option>
            <option value="waiting">Waiting</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="font-space px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-yellow-400/50 focus:outline-none transition-colors"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Rounds List */}
        <div className="space-y-4">
          {filteredRounds.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="font-bebas text-2xl text-gray-400 mb-2">NO ROUNDS FOUND</h3>
              <p className="font-space text-gray-500">No rounds match your current filters.</p>
            </div>
          ) : (
            filteredRounds.map((round) => (
              <div key={round.id} className="bg-gray-900/60 rounded-xl border border-gray-700 overflow-hidden">
                {/* Round Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-800/40 transition-colors"
                  onClick={() => toggleRoundExpansion(round.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-bebas text-lg text-white">{round.name}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`font-space px-2 py-1 rounded-full text-xs ${getStatusColor(round.status)}`}>
                            {round.status.toUpperCase()}
                          </span>
                          <span className="font-space text-gray-400 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(round.createdAt)}
                          </span>
                          <span className="font-space text-gray-400 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {round.players?.length || 0} players
                          </span>
                          {round.status === 'finished' && (
                            <span className="font-space text-gray-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(round.startTime, round.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {round.status === 'finished' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportRound(round.id);
                          }}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="Export Round Data"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {expandedRound === round.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedRound === round.id && (
                  <div className="border-t border-gray-700 p-4 bg-gray-800/20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Round Details */}
                      <div>
                        <h5 className="font-bebas text-lg text-yellow-400 mb-3">ROUND DETAILS</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-space text-gray-400">Questions:</span>
                            <span className="font-space text-white">{round.questionCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-space text-gray-400">Time per Question:</span>
                            <span className="font-space text-white">{round.timePerQuestion}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-space text-gray-400">Categories:</span>
                            <span className="font-space text-white">{round.categories?.join(', ')}</span>
                          </div>
                          {round.status === 'finished' && (
                            <>
                              <div className="flex justify-between">
                                <span className="font-space text-gray-400">Started:</span>
                                <span className="font-space text-white">{formatDate(round.startTime)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-space text-gray-400">Ended:</span>
                                <span className="font-space text-white">{formatDate(round.endTime)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-space text-gray-400">Duration:</span>
                                <span className="font-space text-white">{formatDuration(round.startTime, round.endTime)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Winners & Prizes */}
                      {round.status === 'finished' && round.players && round.players.length > 0 && (
                        <div>
                          <h5 className="font-bebas text-lg text-yellow-400 mb-3">WINNERS & PRIZES</h5>
                          <div className="space-y-2">
                            {round.players
                              .sort((a, b) => b.score - a.score)
                              .slice(0, 10)
                              .map((player, index) => {
                                const prize = round.prizes?.find(p => p.rank === index + 1);
                                return (
                                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <span className={`font-bebas text-lg w-8 ${
                                        index === 0 ? 'text-yellow-400' :
                                        index === 1 ? 'text-gray-300' :
                                        index === 2 ? 'text-orange-400' :
                                        'text-gray-500'
                                      }`}>
                                        #{index + 1}
                                      </span>
                                      <div>
                                        <div className="font-space text-white">{player.name}</div>
                                        <div className="font-space text-xs text-gray-400">
                                          {player.solanaAddress?.slice(0, 8)}...{player.solanaAddress?.slice(-8)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bebas text-white">{player.score} pts</div>
                                      {prize && (
                                        <div className="font-space text-xs text-yellow-400">
                                          🏆 {prize.amount} {prize.currency}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prize Pool Summary */}
                    {round.prizes && round.prizes.length > 0 && (
                      <div className="mt-6 p-4 bg-purple-600/20 border border-purple-400/50 rounded-xl">
                        <h5 className="font-bebas text-lg text-purple-400 mb-2 flex items-center gap-2">
                          <Coins className="w-5 h-5" />
                          PRIZE POOL DISTRIBUTED
                        </h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="font-bebas text-xl text-yellow-400">
                              {round.prizes.filter(p => p.currency === 'BONK').reduce((sum, p) => sum + p.amount, 0)}
                            </div>
                            <div className="font-space text-xs text-gray-400">BONK</div>
                          </div>
                          <div>
                            <div className="font-bebas text-xl text-blue-400">
                              {round.prizes.filter(p => p.currency === 'SOL').reduce((sum, p) => sum + p.amount, 0)}
                            </div>
                            <div className="font-space text-xs text-gray-400">SOL</div>
                          </div>
                          <div>
                            <div className="font-bebas text-xl text-green-400">
                              {round.prizes.filter(p => p.currency === 'USDC').reduce((sum, p) => sum + p.amount, 0)}
                            </div>
                            <div className="font-space text-xs text-gray-400">USDC</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundHistory;