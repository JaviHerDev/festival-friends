import { useState, useEffect } from 'react';
import { Trophy, Users, Award, Star, CheckCircle } from 'lucide-react';
import useStore from '../store/useStore.js';

const BadgeAwardModal = ({ festival, isOpen, onClose }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [badgeDefinitions, setBadgeDefinitions] = useState([]);
  const [festivalUsers, setFestivalUsers] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const { loadBadgeDefinitions, voteForBadge, awardBadge, users } = useStore();

  useEffect(() => {
    if (isOpen && festival) {
      loadData();
    }
  }, [isOpen, festival]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load badge definitions
      const { data: badges } = await loadBadgeDefinitions();
      setBadgeDefinitions(badges || []);

      // Load festival attendees
      const attendees = users.filter(user => 
        festival.attendances?.some(attendance => 
          attendance.user_id === user.id && 
          ['have_ticket', 'thinking_about_it'].includes(attendance.status)
        )
      );
      setFestivalUsers(attendees);
    } catch (error) {
      console.error('Error loading badge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (badgeId, userId) => {
    if (!festival?.id) return;

    try {
      const { error } = await voteForBadge({
        festivalId: festival.id,
        badgeId,
        votedForId: userId
      });

      if (!error) {
        // Update local state
        setUserVotes(prev => ({
          ...prev,
          [badgeId]: userId
        }));

        // Show success feedback
        const { toast } = require('../store/toastStore.js');
        toast.success('Voto registrado', 'Tu voto ha sido registrado correctamente');
      }
    } catch (error) {
      console.error('Error voting for badge:', error);
      const { toast } = require('../store/toastStore.js');
      toast.error('Error', 'No se pudo registrar tu voto');
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedBadge || !selectedUser || !festival?.id) return;

    try {
      const { error } = await awardBadge({
        userId: selectedUser.id,
        badgeId: selectedBadge.id,
        festivalId: festival.id,
        votesReceived: 1 // This would be calculated from actual votes
      });

      if (!error) {
        const { toast } = require('../store/toastStore.js');
        toast.success('Insignia otorgada', `Se ha otorgado la insignia "${selectedBadge.name}" a ${selectedUser.name}`);
        
        // Reset selection
        setSelectedBadge(null);
        setSelectedUser(null);
        
        // Close modal
        onClose();
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
      const { toast } = require('../store/toastStore.js');
      toast.error('Error', 'No se pudo otorgar la insignia');
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-slate-400';
      case 'rare': return 'from-blue-400 to-cyan-400';
      case 'epic': return 'from-purple-400 to-pink-400';
      case 'legendary': return 'from-yellow-400 to-orange-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const getRarityName = (rarity) => {
    switch (rarity) {
      case 'common': return 'Común';
      case 'rare': return 'Rara';
      case 'epic': return 'Épica';
      case 'legendary': return 'Legendaria';
      default: return 'Común';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full mx-4 border border-slate-600/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Otorgar Insignias</h2>
          <p className="text-slate-400">Vota y otorga insignias a los participantes del evento</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Cargando...</h4>
            <p className="text-slate-400">Preparando sistema de insignias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Badge Selection */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary-400" />
                Seleccionar Insignia
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {badgeDefinitions.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                      selectedBadge?.id === badge.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-slate-700/50 bg-slate-800/50 hover:border-primary-500/50'
                    }`}
                  >
                    {/* Rarity indicator */}
                    <div className={`absolute top-2 right-2 w-3 h-3 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full`}></div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${badge.color_gradient} rounded-xl flex items-center justify-center`}>
                        <span className="text-xl">{badge.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm">{badge.name}</h4>
                        <p className="text-slate-400 text-xs line-clamp-2">{badge.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full`}></div>
                          <span className="text-slate-500 text-xs">{getRarityName(badge.rarity)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* User Selection and Voting */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-400" />
                Participantes
              </h3>
              
              {selectedBadge ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <h4 className="text-white font-semibold mb-2">Insignia seleccionada:</h4>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${selectedBadge.color_gradient} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg">{selectedBadge.icon}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{selectedBadge.name}</div>
                        <div className="text-slate-400 text-sm">{selectedBadge.description}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {festivalUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          selectedUser?.id === user.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {(user.name || user.nickname || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.name || user.nickname}</div>
                              <div className="text-slate-400 text-sm">{user.city}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVote(selectedBadge.id, user.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                userVotes[selectedBadge.id] === user.id
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
                              }`}
                              title="Votar por este usuario"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => setSelectedUser(user)}
                              className={`p-2 rounded-lg transition-colors ${
                                selectedUser?.id === user.id
                                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
                              }`}
                              title="Seleccionar para otorgar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedUser && (
                    <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-xl p-4 border border-primary-500/30">
                      <h4 className="text-white font-semibold mb-2">Usuario seleccionado:</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {(selectedUser.name || selectedUser.nickname || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{selectedUser.name || selectedUser.nickname}</div>
                          <div className="text-slate-400 text-sm">{selectedUser.city}</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleAwardBadge}
                        className="w-full mt-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all duration-300"
                      >
                        Otorgar Insignia "{selectedBadge.name}"
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Selecciona una insignia</h4>
                  <p className="text-slate-400">Elige una insignia para ver los participantes</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeAwardModal; 