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
  MapPin
} from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import LoginModal from './LoginModal.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import ProfileModal from './ProfileModal.jsx';
import NexusPersonModal from './NexusPersonModal.jsx';
import ToastContainer from './ToastContainer.jsx';
import { signOut } from '../lib/supabase.js';

const Header = () => {
  const { user, userProfile, isLoginModalOpen, setLoginModalOpen, unreadNotifications, logout, initializeAuth, setupAuthListener, cleanupAuthListener } = useStore();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNexusModalOpen, setIsNexusModalOpen] = useState(false);
  const [hasShownNexusModal, setHasShownNexusModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current path for active menu highlighting
  const [currentPath, setCurrentPath] = useState('/');
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
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

  // Check if user needs to set nexus person
  useEffect(() => {
    if (user && userProfile && !hasShownNexusModal) {
      // Check if user doesn't have nexus_person set
      if (!userProfile.nexus_person) {
        // Show modal after a short delay to let the app load
        const timer = setTimeout(() => {
          setIsNexusModalOpen(true);
          setHasShownNexusModal(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, userProfile, hasShownNexusModal]);

  const handleSignOut = async () => {
    await signOut();
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false); // Cerrar menú móvil también
    toast.info('Sesión cerrada', 'Has cerrado sesión correctamente. ¡Hasta la próxima! 🤘');
  };

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false); // Cerrar menú móvil también
  };

  // Cerrar menú móvil al hacer click en enlaces
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items configuration
  const navigationItems = [
    { href: '/', label: 'Inicio', icon: '🏠', iconComponent: Home },
    { href: '/festivals', label: 'Festivales', icon: '🎪', iconComponent: Calendar },
    { href: '/friends', label: 'Amigos', icon: '👥', iconComponent: Users },
    { href: '/connections', label: 'Conexiones', icon: '🌳', iconComponent: MapPin }
  ];

  // Check if a navigation item is active
  const isActive = (href) => {
    if (!isHydrated) return false;
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  // Handle nexus modal
  const handleNexusModalClose = () => {
    setIsNexusModalOpen(false);
  };

  const handleNexusModalSkip = () => {
    toast.info('No hay problema', 'Puedes añadir tu conexión más tarde desde tu perfil.');
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
                  <span className="gradient-text text-xl sm:text-2xl lg:text-3xl font-bold leading-none">Festival</span>
                  <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-none mx-1">&</span>
                  <span className="gradient-text text-xl sm:text-2xl lg:text-3xl font-bold leading-none">Friends</span>
                </span>
              </a>
            </div>

            {/* Navigation - Desktop */}
            {user && (
              <nav className="hidden md:flex space-x-1">
                {navigationItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a 
                      key={item.href}
                      href={item.href} 
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                        active 
                          ? 'text-white bg-gradient-to-r from-primary-600/30 to-primary-500/20 border border-primary-400/40 shadow-lg shadow-primary-500/20 backdrop-blur-sm' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-md'
                      }`}
                    >
                      {/* Active background glow */}
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent menu-active-pulse"></div>
                      )}
                      
                      <span className={`text-lg transition-all duration-300 relative z-10 mr-2 ${
                        active ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-110'
                      }`}>
                        {item.icon}
                      </span>
                      <span className={`relative z-10 font-semibold ${
                        active ? 'drop-shadow-sm' : ''
                      }`}>
                        {item.label}
                      </span>
                      
                      {/* Active indicator bar */}
                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 rounded-full menu-active-pulse"></div>
                      )}
                      
                      {/* Active glow effect */}
                      {active && (
                        <div className="absolute inset-0 rounded-lg bg-primary-500/10 menu-active-glow"></div>
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
                  {/* Notifications */}
                  <button
                    onClick={() => setIsNotificationPanelOpen(true)}
                    className="relative p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    {unreadNotifications > 0 ? (
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400 fill-current" />
                    ) : (
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* User menu - Desktop */}
                  <div className="hidden sm:block relative user-menu">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 group"
                    >
                      {userProfile?.avatar_url ? (
                        <img 
                          src={userProfile.avatar_url} 
                          alt={userProfile.name} 
                          className="h-8 w-8 rounded-full object-cover border-2 border-primary-500 group-hover:border-primary-400 transition-colors"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
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
                    className="sm:hidden p-2 text-slate-400 hover:text-white transition-colors"
                  >
                                {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
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
        </div>

        {/* Mobile Navigation Overlay */}
        {user && isMobileMenuOpen && (
          <div className="sm:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile menu */}
            <div className="absolute top-16 left-0 right-0 mobile-menu z-50">
              <div className="px-4 py-6 space-y-6">
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 pb-6 border-b border-slate-700/50">
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt={userProfile.name} 
                      className="h-12 w-12 rounded-full object-cover border-2 border-primary-500"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium text-white truncate">
                      {userProfile?.name || 'Usuario'}
                    </div>
                    {userProfile?.nickname && (
                      <div className="text-sm text-slate-400 truncate">
                        @{userProfile.nickname}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <a 
                        key={item.href}
                        href={item.href} 
                        onClick={handleMobileNavClick}
                        className={`flex items-center p-3 rounded-lg font-medium transition-all duration-300 relative overflow-hidden ${
                          active 
                            ? 'text-white bg-gradient-to-r from-primary-600/30 to-primary-500/20 border border-primary-400/40 shadow-lg shadow-primary-500/20' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-md'
                        }`}
                      >
                        {/* Active background glow */}
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent menu-active-pulse"></div>
                        )}
                        
                        <span className={`text-xl transition-all duration-300 relative z-10 mr-3 ${
                          active ? 'scale-110 drop-shadow-lg' : ''
                        }`}>
                          {item.icon}
                        </span>
                        <span className={`relative z-10 font-semibold ${
                          active ? 'drop-shadow-sm' : ''
                        }`}>
                          {item.label}
                        </span>
                        
                        {/* Active indicator */}
                        {active && (
                          <div className="ml-auto relative z-10">
                            <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full menu-active-pulse shadow-lg shadow-primary-500/50"></div>
                          </div>
                        )}
                        
                        {/* Active glow effect */}
                        {active && (
                          <div className="absolute inset-0 rounded-lg bg-primary-500/10 menu-active-glow"></div>
                        )}
                      </a>
                    );
                  })}
                </nav>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t border-slate-700/50">
                  <button
                    onClick={handleOpenProfile}
                    className="flex items-center space-x-3 w-full p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Mi Perfil</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
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
        onClose={() => setIsProfileModalOpen(false)} 
      />
      <NexusPersonModal 
        isOpen={isNexusModalOpen}
        onClose={handleNexusModalClose}
        onSkip={handleNexusModalSkip}
      />
      <ToastContainer />
    </>
  );
};

export default Header; 