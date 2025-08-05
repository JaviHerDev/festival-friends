import { useState, useEffect } from 'react';
import { Trophy, Award, Star, Crown, Calendar } from 'lucide-react';
import useStore from '../store/useStore.js';

const UserBadges = ({ user, badges = [] }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const { loadUserBadges, userBadges } = useStore();

  useEffect(() => {
    if (user?.id) {
      loadUserBadges(user.id);
    }
  }, [user?.id, loadUserBadges]);

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

  const renderBadgeDetail = (badge) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setSelectedBadge(null)}
      ></div>
      
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-slate-600/50 shadow-2xl">
        <button
          onClick={() => setSelectedBadge(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className={`w-24 h-24 bg-gradient-to-r ${badge.badge_definitions?.color_gradient || 'from-gray-500 to-slate-500'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
            <span className="text-4xl">{badge.badge_definitions?.icon || '🏆'}</span>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{badge.badge_definitions?.name || 'Insignia'}</h3>
          <p className="text-slate-300 mb-4">{badge.badge_definitions?.description || 'Descripción no disponible'}</p>
          
          <div className="space-y-3">
            {badge.festivals && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Evento</span>
                  <span className="text-white font-semibold">{badge.festivals.name}</span>
                </div>
              </div>
            )}
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Obtenida</span>
                <span className="text-white font-semibold">
                  {new Date(badge.awarded_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Rareza</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 bg-gradient-to-r ${getRarityColor(badge.badge_definitions?.rarity)} rounded-full`}></div>
                  <span className="text-white font-semibold">{getRarityName(badge.badge_definitions?.rarity)}</span>
                </div>
              </div>
            </div>

            {badge.votes_received > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Votos recibidos</span>
                  <span className="text-white font-semibold">{badge.votes_received}</span>
                </div>
              </div>
            )}

            {badge.users && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Otorgada por</span>
                  <span className="text-white font-semibold">{badge.users.name || badge.users.nickname}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-primary-400" />
          Insignias ({userBadges.length})
        </h3>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Total: {userBadges.length}</span>
          <span>•</span>
          <span>Legendarias: {userBadges.filter(b => b.badge_definitions?.rarity === 'legendary').length}</span>
        </div>
      </div>

      {userBadges.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Sin insignias aún</h4>
          <p className="text-slate-400">Participa en eventos para ganar insignias</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userBadges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className="group relative bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 transform hover:scale-105"
            >
              {/* Rarity indicator */}
              <div className={`absolute top-2 right-2 w-3 h-3 bg-gradient-to-r ${getRarityColor(badge.badge_definitions?.rarity)} rounded-full`}></div>
              
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${badge.badge_definitions?.color_gradient || 'from-gray-500 to-slate-500'} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{badge.badge_definitions?.icon || '🏆'}</span>
                </div>
                
                <h4 className="text-white font-semibold mb-2 group-hover:text-primary-300 transition-colors">
                  {badge.badge_definitions?.name || 'Insignia'}
                </h4>
                
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {badge.badge_definitions?.description || 'Descripción no disponible'}
                </p>
                
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(badge.awarded_at).toLocaleDateString('es-ES')}</span>
                </div>

                {badge.festivals && (
                  <div className="mt-2 text-xs text-slate-500">
                    {badge.festivals.name}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Badge Stats */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-bold text-white mb-4">Estadísticas de Insignias</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{userBadges.length}</div>
            <div className="text-slate-400 text-sm">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{userBadges.filter(b => b.badge_definitions?.rarity === 'legendary').length}</div>
            <div className="text-slate-400 text-sm">Legendarias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{userBadges.filter(b => b.badge_definitions?.rarity === 'epic').length}</div>
            <div className="text-slate-400 text-sm">Épicas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{userBadges.filter(b => b.badge_definitions?.rarity === 'rare').length}</div>
            <div className="text-slate-400 text-sm">Raras</div>
          </div>
        </div>
      </div>

      {selectedBadge && renderBadgeDetail(selectedBadge)}
    </div>
  );
};

export default UserBadges; 