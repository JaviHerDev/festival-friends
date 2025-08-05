import { useState } from 'react';
import { Trophy, Award } from 'lucide-react';

const BadgeDisplay = ({ badges = [], compact = false, maxDisplay = 3 }) => {
  const [showAll, setShowAll] = useState(false);

  if (!badges || badges.length === 0) return null;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-slate-400';
      case 'rare': return 'from-blue-400 to-cyan-400';
      case 'epic': return 'from-purple-400 to-pink-400';
      case 'legendary': return 'from-yellow-400 to-orange-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const displayBadges = showAll ? badges : badges.slice(0, maxDisplay);

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        {displayBadges.map((badge, index) => (
          <div
            key={badge.id}
            className={`w-6 h-6 bg-gradient-to-r ${badge.color} rounded-full flex items-center justify-center text-xs relative group cursor-pointer`}
            title={`${badge.name} - ${badge.description}`}
          >
            <span>{badge.icon}</span>
            {/* Rarity indicator */}
            <div className={`absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full border border-slate-800`}></div>
          </div>
        ))}
        {badges.length > maxDisplay && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-6 h-6 bg-slate-700/50 rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-white transition-colors"
            title={`Ver ${badges.length - maxDisplay} insignias más`}
          >
            +{badges.length - maxDisplay}
          </button>
        )}
        {showAll && badges.length > maxDisplay && (
          <button
            onClick={() => setShowAll(false)}
            className="w-6 h-6 bg-slate-700/50 rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-white transition-colors"
            title="Mostrar menos"
          >
            -
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center">
          <Trophy className="w-4 h-4 mr-2 text-primary-400" />
          Insignias ({badges.length})
        </h4>
        {badges.length > maxDisplay && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            {showAll ? 'Mostrar menos' : `Ver todas (${badges.length})`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="group relative bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-primary-500/30 transition-all duration-300"
          >
            {/* Rarity indicator */}
            <div className={`absolute top-1 right-1 w-2 h-2 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full`}></div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${badge.color} rounded-lg flex items-center justify-center text-sm`}>
                {badge.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate group-hover:text-primary-300 transition-colors">
                  {badge.name}
                </div>
                <div className="text-slate-400 text-xs truncate">
                  {badge.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {badges.length === 0 && (
        <div className="text-center py-4">
          <div className="w-8 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Award className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-slate-400 text-xs">Sin insignias aún</p>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay; 