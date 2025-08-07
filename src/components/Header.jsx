import { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  Home,
  Calendar,
  Users,
  MapPin,
  Search
} from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import LoginModal from './LoginModal.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import ProfileModal from './ProfileModal.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import SearchBar from './SearchBar.jsx';
import FestivalDetailsModal from './FestivalDetailsModal.jsx';

import ToastContainer from './ToastContainer.jsx';
import { signOut } from '../lib/supabase.js';
import UserAvatar from './UserAvatar.jsx';

const Header = () => {
  const { user, userProfile, isLoginModalOpen, setLoginModalOpen, isProfileModalOpen, setProfileModalOpen, unreadNotifications, logout, initializeAuth, setupAuthListener, cleanupAuthListener } = useStore();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isFestivalDetailsModalOpen, setIsFestivalDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Get current path for active menu highlighting
  const [currentPath, setCurrentPath] = useState('/');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      
      // Detect mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Handle search close
  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  // Handle search button click (mobile)
  const handleSearchClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    setIsSearchOpen(!isSearchOpen);
  };

  // Handle notifications click (mobile)
  const handleNotificationsClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    setIsNotificationPanelOpen(true);
  };

  // Handle user click from search
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsUserProfileModalOpen(true);
  };

  // Handle festival click from search
  const handleFestivalClick = (festival) => {
    setSelectedFestival(festival);
    setIsFestivalDetailsModalOpen(true);
  };

  useEffect(() => {
    const initialize = async () => {
      console.log('🚀 Header initializing...'); // Debug
      
      // Initialize auth first
      await initializeAuth();
      
      // Setup auth listener for future changes
      setupAuthListener();
      
      setIsInitialized(true);
      console.log('✅ Header initialized'); // Debug
    };
    initialize();

    // Handle login buttons from landing page
    const handleLoginButtons = (e) => {
      if (e.target.dataset.openLogin === 'true') {
        e.preventDefault();
        setLoginModalOpen(true);
      }
    };
    document.addEventListener('click', handleLoginButtons);

    // Handle demo toast triggers from landing page
    const handleDemoToast = (e) => {
      const { type, title, description } = e.detail;
      switch (type) {
        case 'success':
          toast.success(title, description);
          break;
        case 'error':
          toast.error(title, description);
          break;
        case 'warning':
          toast.warning(title, description);
          break;
        case 'info':
          toast.info(title, description);
          break;
      }
    };
    document.addEventListener('demo-toast', handleDemoToast);

    return () => {
      document.removeEventListener('click', handleLoginButtons);
      document.removeEventListener('demo-toast', handleDemoToast);
      cleanupAuthListener(); // Cleanup auth listener
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    toast.info('Sesión cerrada', 'Has cerrado sesión correctamente. ¡Hasta la próxima! 🤘');
  };

  const handleOpenProfile = () => {
    setProfileModalOpen(true);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Cerrar menú móvil al hacer click en enlaces
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items configuration
  const navigationItems = [
    { 
      href: '/', 
      label: 'Inicio', 
      icon: '🏠', 
      iconComponent: Home,
      description: 'Página principal',
      badge: null
    },
    { 
      href: '/festivals', 
      label: 'Festivales', 
      icon: '🎪', 
      iconComponent: Calendar,
      description: 'Descubre y crea festivales',
      badge: null
    },
    { 
      href: '/friends', 
      label: 'Amigos', 
      icon: '👥', 
      iconComponent: Users,
      description: 'Gestiona tus amigos',
      badge: null
    },
    { 
      href: '/connections', 
      label: 'Conexiones', 
      icon: '🌳', 
      iconComponent: MapPin,
      description: 'Visualiza tu red social',
      badge: null
    }
  ];

  // Check if a navigation item is active
  const isActive = (href) => {
    if (!isHydrated) return false;
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  // Skeleton loader while initializing
  if (!isInitialized) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="h-8 w-32 sm:w-48 bg-slate-700/50 rounded animate-pulse"></div>
              </div>
              
              {/* Right side - skeleton */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="h-8 w-8 bg-slate-700/50 rounded-full animate-pulse"></div>
                <div className="hidden sm:block h-8 w-20 bg-slate-700/50 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center space-x-2 select-none">
                <span className="text-2xl sm:text-3xl">🎸</span>
                <span className="flex items-center">
                  <span className="gradient-text text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-none">Festival</span>
                  <span className="text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-none mx-1">&</span>
                  <span className="gradient-text text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-none">Friends</span>
                </span>
              </a>
            </div>

            {/* Navigation - Desktop */}
            {user && !isMobile && (
              <nav className="hidden md:flex space-x-2">
                {navigationItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a 
                      key={item.href}
                      href={item.href} 
                      title={item.description}
                      className={`group relative flex items-center px-3 py-2 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                        active 
                          ? 'text-white bg-gradient-to-r from-primary-600/40 to-primary-500/30 border border-primary-400/50 shadow-xl shadow-primary-500/30 backdrop-blur-sm' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-lg hover:scale-105'
                      }`}
                    >
                      {/* Active background glow */}
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 to-transparent menu-active-pulse"></div>
                      )}
                      
                      {/* Icon */}
                      <span className={`text-xl transition-all duration-300 relative z-10 mr-3 ${
                        active ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-110'
                      }`}>
                        {item.icon}
                      </span>
                      
                      {/* Label */}
                      <span className={`relative z-10 font-semibold text-sm ${
                        active ? 'drop-shadow-sm' : ''
                      }`}>
                        {item.label}
                      </span>
                      
                      {/* Badge */}
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Active indicator bar */}
                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 rounded-full menu-active-pulse"></div>
                      )}
                      
                      {/* Active glow effect */}
                      {active && (
                        <div className="absolute inset-0 rounded-xl bg-primary-500/15 menu-active-glow"></div>
                      )}
                      
                      {/* Hover glow effect */}
                      {!active && (
                        <div className="absolute inset-0 rounded-xl bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                    </a>
                  );
                })}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  {/* Search button - Mobile */}
                  {isMobile && (
                    <button
                      onClick={handleSearchClick}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  )}

                  {/* Search button - Desktop */}
                  {!isMobile && (
                    <button
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  )}

                  {/* Notifications */}
                  <button
                    onClick={handleNotificationsClick}
                    className="relative p-2 sm:p-2.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50 active:scale-95 touch-manipulation notification-button"
                    aria-label={`Notificaciones ${unreadNotifications > 0 ? `(${unreadNotifications} sin leer)` : ''}`}
                  >
                    {unreadNotifications > 0 ? (
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400 fill-current" />
                    ) : (
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center shadow-lg border border-red-400/30 notification-badge">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                    
                    {/* Mobile pulse effect for unread notifications */}
                    {unreadNotifications > 0 && isMobile && (
                      <span className="absolute inset-0 bg-primary-400/20 rounded-lg animate-ping"></span>
                    )}
                  </button>

                  {/* User menu - Desktop */}
                  <div className="hidden sm:block relative user-menu">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 group"
                    >
                      <UserAvatar 
                        user={userProfile} 
                        size="lg" 
                        className="group-hover:bg-primary-500 transition-colors"
                      />
                      
                      <div className="text-left">
                        <div className="text-sm font-medium text-white line-clamp-1 group-hover:text-primary-300 transition-colors">
                          {userProfile?.name || 'Usuario'}
                        </div>
                        {userProfile?.nickname && (
                          <div className="text-xs text-slate-400 line-clamp-1">
                            @{userProfile.nickname}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Desktop Dropdown menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 dropdown-menu rounded-xl z-50 shadow-2xl border border-slate-600/50">
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-slate-700/50">
                            <div className="text-sm font-medium text-white">
                              {userProfile?.name || 'Usuario'}
                            </div>
                            {userProfile?.nickname && (
                              <div className="text-xs text-slate-400">
                                @{userProfile.nickname}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={handleOpenProfile}
                            className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 w-full text-left transition-colors"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Mi Perfil
                          </button>
                          <div className="border-t border-slate-700/50 my-1"></div>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full text-left transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="sm:hidden relative p-2 text-slate-400 hover:text-white transition-all duration-300 group"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${
                        isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                      }`}></div>
                      <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${
                        isMobileMenuOpen ? 'opacity-0' : ''
                      }`}></div>
                      <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${
                        isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                      }`}></div>
                    </div>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-primary-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="btn-primary text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
                >
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobile && isSearchOpen && (
            <div className="pb-4 relative">
              {/* Close button for mobile */}
              <button
                onClick={handleSearchClose}
                className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>
              
              <SearchBar 
                isOpen={isSearchOpen} 
                onClose={handleSearchClose} 
                isMobile={true}
                onUserClick={handleUserClick}
                onFestivalClick={handleFestivalClick}
              />
            </div>
          )}
        </div>

        {/* Desktop Search Overlay */}
        {user && !isMobile && isSearchOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
            <div className="w-full max-w-2xl mx-4 relative">
              {/* Close button */}
              <button
                onClick={handleSearchClose}
                className="absolute -top-12 right-0 p-2 text-white hover:text-primary-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <SearchBar 
                isOpen={isSearchOpen} 
                onClose={handleSearchClose} 
                isMobile={false}
                onUserClick={handleUserClick}
                onFestivalClick={handleFestivalClick}
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Overlay */}
        {user && isMobileMenuOpen && (
          <div className="sm:hidden">
            {/* Backdrop - starts below header */}
            <div 
              className="fixed top-16 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile menu */}
            <div className="absolute top-16 left-0 right-0 mobile-menu z-50">
              <div className="px-4 py-6 space-y-6">
                {/* User Profile Section */}
                <div className="flex items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 mb-6">
                  <UserAvatar 
                    user={userProfile} 
                    size="2xl" 
                  />
                  
                  <div className="flex-1 min-w-0 ml-4">
                    <div className="text-base font-semibold text-white truncate">
                      {userProfile?.name || 'Usuario'}
                    </div>
                    {userProfile?.nickname && (
                      <div className="text-sm text-slate-400 truncate">
                        @{userProfile.nickname}
                      </div>
                    )}
                    {userProfile?.city && (
                      <div className="text-xs text-slate-500 truncate mt-1">
                        📍 {userProfile.city}
                      </div>
                    )}
                  </div>
                  
                  {/* Online indicator */}
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-3">
                  {navigationItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <a 
                        key={item.href}
                        href={item.href} 
                        onClick={handleMobileNavClick}
                        className={`group flex items-center p-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                          active 
                            ? 'text-white bg-gradient-to-r from-primary-600/40 to-primary-500/30 border border-primary-400/50 shadow-xl shadow-primary-500/30' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-lg'
                        }`}
                      >
                        {/* Active background glow */}
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 to-transparent menu-active-pulse"></div>
                        )}
                        
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 relative z-10 mr-4 ${
                          active 
                            ? 'bg-primary-500/20 scale-110 drop-shadow-lg' 
                            : 'bg-slate-700/50 group-hover:bg-primary-500/10 group-hover:scale-110'
                        }`}>
                          <span className="text-xl">
                            {item.icon}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 relative z-10">
                          <div className={`font-semibold ${
                            active ? 'drop-shadow-sm' : ''
                          }`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                        
                        {/* Badge */}
                        {item.badge && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                        
                        {/* Active indicator */}
                        {active && (
                          <div className="ml-auto relative z-10">
                            <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full menu-active-pulse shadow-lg shadow-primary-500/50"></div>
                          </div>
                        )}
                        
                        {/* Active glow effect */}
                        {active && (
                          <div className="absolute inset-0 rounded-xl bg-primary-500/15 menu-active-glow"></div>
                        )}
                        
                        {/* Hover glow effect */}
                        {!active && (
                          <div className="absolute inset-0 rounded-xl bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </a>
                    );
                  })}
                </nav>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t border-slate-700/50">
                  <button
                    onClick={handleOpenProfile}
                    className="group flex items-center w-full p-4 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-700/50 group-hover:bg-primary-500/10 rounded-lg mr-4 transition-colors">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Mi Perfil</div>
                      <div className="text-xs text-slate-400">Editar información personal</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="group flex items-center w-full p-4 text-slate-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-700/50 group-hover:bg-red-500/10 rounded-lg mr-4 transition-colors">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Cerrar Sesión</div>
                      <div className="text-xs text-slate-400">Salir de tu cuenta</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <LoginModal />
      {isNotificationPanelOpen && (
        <NotificationPanel onClose={() => setIsNotificationPanelOpen(false)} />
      )}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />

      <UserProfileModal 
        isOpen={isUserProfileModalOpen} 
        onClose={() => {
          setIsUserProfileModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <FestivalDetailsModal 
        festival={selectedFestival}
        isOpen={isFestivalDetailsModalOpen} 
        onClose={() => {
          setIsFestivalDetailsModalOpen(false);
          setSelectedFestival(null);
        }} 
      />

      <ToastContainer />
    </>
  );
};

export default Header; 