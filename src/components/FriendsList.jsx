import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon,
  LinkIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';
import UserProfileModal from './UserProfileModal.jsx';
import { supabase } from '../lib/supabase.js';

const FriendsList = () => {
  const { users, loadUsers, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userBadgesMap, setUserBadgesMap] = useState({});
  const [badgesLoading, setBadgesLoading] = useState(false);

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
  };

  // Carga eficiente de insignias para todos los usuarios
  const loadAllUserBadges = async () => {
    setBadgesLoading(true);
    try {
      const { data: allBadges, error } = await supabase
        .from('user_badges')
        .select(`*, badge_definitions(*)`);
      if (error) throw error;
      const badgesMap = {};
      (allBadges || []).forEach(badge => {
        if (!badgesMap[badge.user_id]) badgesMap[badge.user_id] = [];
        badgesMap[badge.user_id].push(badge);
      });
      setUserBadgesMap(badgesMap);
    } catch (err) {
      setUserBadgesMap({});
    } finally {
      setBadgesLoading(false);
    }
  };

  useEffect(() => {
    const initUsers = async () => {
      await loadUsers();
      setIsLoading(false);
    };
    initUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && !isLoading) {
      loadAllUserBadges();
    }
  }, [users, isLoading]);

  const filteredUsers = users.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.nickname && friend.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.city && friend.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.bio && friend.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.key_phrase && friend.key_phrase.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.nexus_person && friend.nexus_person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-300">Inicia sesión para ver a la familia rockera</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, nickname, ciudad, biografía..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando la familia festivalera...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No se encontraron miembros' : 'Aún no hay otros rockeros'}
          </h3>
          <p className="text-slate-500">
            {searchTerm 
              ? 'Prueba con otros términos de búsqueda'
              : 'Invita a tus amigos a unirse a la familia'
            }
          </p>
        </div>
      )}

      {/* Users grid */}
      {!isLoading && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(friend => (
            <UserCard 
              key={friend.id} 
              user={friend} 
              userBadges={userBadgesMap[friend.id] || []}
              badgesLoading={badgesLoading}
              onOpenProfile={handleOpenProfile} 
            />
          ))}
        </div>
      )}

      {/* Enhanced Stats Dashboard */}
      {!isLoading && users.length > 0 && (
        <div className="pt-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">👥 Resumen de la Comunidad</h3>
            <p className="text-sm text-slate-400">Estadísticas generales de la familia festivalera.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Members */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Miembros totales</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
              </div>
            </div>

            {/* Cities */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {new Set(users.filter(u => u.city).map(u => u.city)).size}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Ciudades representadas</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌍</span>
                </div>
              </div>
            </div>

            {/* Social Media Users */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {users.filter(u => u.instagram || u.twitter).length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">En redes sociales</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📱</span>
                </div>
              </div>
            </div>

            {/* Users with Badges */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {Object.keys(userBadgesMap).filter(userId => 
                      userBadgesMap[userId] && userBadgesMap[userId].length > 0
                    ).length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Con insignias</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {users.filter(u => u.nexus_person).length}
                </div>
                <div className="text-sm text-slate-400 mb-3">Personas nexo</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-xs text-slate-500">Conectores</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {users.filter(u => u.bio && u.bio.trim().length > 0).length}
                </div>
                <div className="text-sm text-slate-400 mb-3">Con biografía</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  <span className="text-xs text-slate-500">Perfiles completos</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {Object.values(userBadgesMap).reduce((total, badges) => total + (badges?.length || 0), 0)}
                </div>
                <div className="text-sm text-slate-400 mb-3">Insignias totales</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-slate-500">Logros ganados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal 
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
      />
    </div>
  );
};

const UserCard = ({ user, userBadges, badgesLoading, onOpenProfile }) => {
  const { user: currentUser } = useStore();
  const isCurrentUser = currentUser?.id === user.id;
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ vertical: 'bottom', horizontal: 'center' });
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar modal de insignia al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedBadge && !event.target.closest('.badge-modal')) {
        setSelectedBadge(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedBadge]);

  const handleBadgeClick = (badge, event) => {
    if (isMobile) {
      setSelectedBadge(badge);
    } else {
      // En desktop, calcular posición del tooltip considerando los límites del contenedor
      const rect = event.currentTarget.getBoundingClientRect();
      const cardContainer = event.currentTarget.closest('.user-card');
      const cardRect = cardContainer ? cardContainer.getBoundingClientRect() : null;
      
      if (cardRect) {
        const spaceBelow = cardRect.bottom - rect.bottom;
        const spaceAbove = rect.top - cardRect.top;
        const spaceLeft = rect.left - cardRect.left;
        const spaceRight = cardRect.right - rect.right;
        
        // Determinar posición vertical
        const verticalPosition = spaceBelow > 120 ? 'bottom' : 'top';
        
        // Determinar posición horizontal
        let horizontalPosition = 'center';
        if (spaceLeft < 80) horizontalPosition = 'left';
        else if (spaceRight < 80) horizontalPosition = 'right';
        
        setTooltipPosition({ vertical: verticalPosition, horizontal: horizontalPosition });
      } else {
        setTooltipPosition({ vertical: 'bottom', horizontal: 'center' });
      }
    }
  };

  const getTooltipClasses = (position) => {
    const baseClasses = "pointer-events-none absolute z-10 opacity-0 group-hover/badge:opacity-100 group-focus/badge:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs rounded px-3 py-2 shadow-lg min-w-[160px] max-w-xs whitespace-normal";
    
    const { vertical, horizontal } = position;
    
    let positioningClasses = '';
    
    if (vertical === 'top') {
      positioningClasses += ' bottom-full mb-2';
    } else {
      positioningClasses += ' top-full mt-2';
    }
    
    if (horizontal === 'left') {
      positioningClasses += ' left-0';
    } else if (horizontal === 'right') {
      positioningClasses += ' right-0';
    } else {
      positioningClasses += ' left-1/2 -translate-x-1/2';
    }
    
    return `${baseClasses} ${positioningClasses}`;
  };
  
  return (
    <div className={`group bg-slate-800/50 border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg user-card ${
      isCurrentUser 
        ? 'border-primary-500/50 bg-primary-500/10 hover:border-primary-400/70 hover:bg-primary-500/20 hover:shadow-primary-500/20' 
        : 'border-slate-700/50 hover:border-primary-500/30 hover:bg-slate-800/70 hover:shadow-primary-500/10'
    }`}>
      
      {/* Header with avatar and basic info */}
      <div className="flex items-start space-x-4 mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary-500/30 group-hover:border-primary-400/50 transition-colors duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center border-2 border-primary-500/30 group-hover:border-primary-400/50 transition-colors duration-300">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
          )}
          
          {/* Online status */}
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          
          {/* City below avatar */}
          {user.city && (
            <div className="flex items-center justify-center space-x-1 text-xs text-slate-400 mt-2">
              <MapPinIcon className="h-3 w-3" />
              <span className="truncate">{user.city}</span>
            </div>
          )}
        </div>

        {/* Name and contact info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors duration-300 truncate">
              {user.name}
            </h3>
            {isCurrentUser && (
              <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                Tú
              </span>
            )}
          </div>
          
          {user.nickname && (
            <p className="text-primary-400 text-sm font-medium truncate">
              @{user.nickname}
            </p>
          )}
          
          {/* Contact icons below name and nickname */}
          <div className="flex items-center space-x-3 mt-2">
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                title="Llamar"
              >
                <PhoneIcon className="w-4 h-4" />
              </a>
            )}
            
            {user.phone && (
              <a
                href={`https://wa.me/${user.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-green-400 transition-colors duration-200"
                title="Contactar por WhatsApp"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            )}
            
            {user.instagram_url && (
              <a
                href={user.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-pink-400 transition-colors duration-200"
                title="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            
            {user.twitter_url && (
              <a
                href={user.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                title="X (Twitter)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio section */}
      {user.bio && (
        <div className="mb-4">
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 group-hover:text-slate-200 transition-colors duration-300">
            {user.bio}
          </p>
        </div>
      )}

      {/* Key phrase */}
      {user.key_phrase && (
        <div className="mb-4 bg-primary-500/10 rounded-lg p-3 border border-primary-500/20">
          <p className="text-xs text-primary-300 italic line-clamp-2">
            💭 "{user.key_phrase}"
          </p>
        </div>
      )}



      {/* Connection info - subtle */}
      {user.nexus_person && (
        <div className="mb-4 text-xs text-slate-400">
          🔗 Conectado a través de <span className="text-primary-300 font-medium">{user.nexus_person}</span>
        </div>
      )}

      {/* Badges section */}
      {badgesLoading ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">🏆 Insignias</span>
            <div className="animate-spin h-3 w-3 border border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      ) : userBadges.length > 0 ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">🏆 Insignias</span>
            <span className="text-xs text-primary-300">{userBadges.length}</span>
          </div>
          <div className="flex flex-row gap-2">
            {userBadges.slice(0, 3).map((badge) => {
              const rarity = badge.badge_definitions?.rarity;
              const dotColor =
                rarity === 'legendary' ? 'bg-yellow-400' :
                rarity === 'epic' ? 'bg-purple-400' :
                rarity === 'rare' ? 'bg-blue-400' :
                'bg-gray-400';
              return (
                <button
                  key={badge.id}
                  tabIndex={0}
                  aria-label={`${badge.badge_definitions?.name}: ${badge.badge_definitions?.description}`}
                  className="relative group/badge p-2 rounded-lg border bg-slate-700/60 hover:scale-110 focus:scale-110 transition-transform outline-none border-slate-600/50 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBadgeClick(badge, e);
                    }
                  }}
                  onClick={(e) => handleBadgeClick(badge, e)}
                  type="button"
                >
                  <span className="text-xl" aria-hidden="true">{badge.badge_definitions?.icon}</span>
                  <span className="sr-only">{badge.badge_definitions?.name}</span>
                  <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${dotColor}`}></span>
                  
                  {/* Tooltip solo en desktop */}
                  {!isMobile && (
                    <div className={getTooltipClasses(tooltipPosition)}>
                      <div className="font-bold mb-1">{badge.badge_definitions?.name}</div>
                      <div>{badge.badge_definitions?.description}</div>
                      <div className="mt-1 text-[10px] text-primary-400 capitalize">{badge.badge_definitions?.rarity}</div>
                    </div>
                  )}
                </button>
              );
            })}
            {userBadges.length > 3 && (
              <div
                tabIndex={0}
                className="relative group/badge p-2 rounded-lg border bg-slate-700/60 text-xs text-slate-400 flex items-center justify-center min-w-[40px] min-h-[40px] border-slate-600/50 outline-none hover:scale-110 focus:scale-110 transition-transform"
                onClick={() => !isMobile && setSelectedBadge({ type: 'additional', badges: userBadges.slice(3) })}
                onKeyDown={e => {
                  if (!isMobile && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setSelectedBadge({ type: 'additional', badges: userBadges.slice(3) });
                  }
                }}
              >
                +{userBadges.length - 3}
                {/* Tooltip solo en desktop */}
                {!isMobile && (
                  <div className="pointer-events-none absolute z-10 left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/badge:opacity-100 group-focus/badge:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs rounded px-3 py-2 shadow-lg max-w-xs min-w-[160px] whitespace-normal">
                    <div className="font-bold mb-1">Insignias adicionales</div>
                    {userBadges.slice(3).map(b => (
                      <div key={b.id} className="flex items-center gap-1 mb-1 last:mb-0">
                        <span className="text-base">{b.badge_definitions?.icon}</span>
                        <span>{b.badge_definitions?.name}</span>
                        <span className="ml-1 text-[10px] text-primary-400 capitalize">{b.badge_definitions?.rarity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}



      {/* View Profile Button - subtle */}
      <button
        onClick={() => onOpenProfile(user)}
        className="w-full btn-primary bg-slate-700/50 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 border border-slate-600/50 hover:border-primary-500/50 text-sm"
      >
        Ver Perfil
      </button>

      {/* Modal de insignia para móvil */}
      {isMobile && selectedBadge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90] p-4 badge-modal">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            {selectedBadge.type === 'additional' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Insignias adicionales</h3>
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedBadge.badges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-2xl">{badge.badge_definitions?.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{badge.badge_definitions?.name}</div>
                        <div className="text-sm text-slate-300">{badge.badge_definitions?.description}</div>
                        <div className="text-xs text-primary-400 capitalize mt-1">{badge.badge_definitions?.rarity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{selectedBadge.badge_definitions?.name}</h3>
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">{selectedBadge.badge_definitions?.icon}</div>
                  <p className="text-slate-300 mb-2">{selectedBadge.badge_definitions?.description}</p>
                  <div className="text-sm text-primary-400 capitalize">{selectedBadge.badge_definitions?.rarity}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList; 