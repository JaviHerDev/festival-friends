import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  X, 
  Check, 
  Trash2, 
  CheckCheck,
  Calendar,
  Users,
  UserPlus,
  Bell,
  MessageCircle,
  RefreshCw,
  Archive,
  Filter
} from 'lucide-react';
import useStore from '../store/useStore.js';

const NotificationPanel = ({ onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    loadNotifications 
  } = useStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [swipedNotification, setSwipedNotification] = useState(null);
  const [pullToRefresh, setPullToRefresh] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    loadNotifications();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pull to refresh functionality
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    
    touchStartRef.current = e.touches[0];
    touchStartYRef.current = e.touches[0].clientY;
  }, [isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartYRef.current;
    
    // Only allow pull down when at the top
    if (containerRef.current?.scrollTop === 0 && deltaY > 0) {
      e.preventDefault();
      const pullDistance = Math.min(deltaY * 0.5, 100);
      setPullToRefresh(pullDistance);
    }
  }, [isMobile]);

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile || !touchStartRef.current) return;
    
    if (pullToRefresh > 50) {
      // Trigger refresh
      setIsRefreshing(true);
      await loadNotifications();
      setIsRefreshing(false);
    }
    
    setPullToRefresh(0);
    touchStartRef.current = null;
    touchStartYRef.current = null;
  }, [isMobile, pullToRefresh, loadNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  // Swipe gesture handlers
  const handleSwipeStart = (e, notificationId) => {
    if (!isMobile) return;
    touchStartRef.current = e.touches[0];
    setSwipedNotification(notificationId);
  };

  const handleSwipeMove = (e, notificationId) => {
    if (!isMobile || swipedNotification !== notificationId) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.clientX;
    
    // Limit swipe distance
    const swipeDistance = Math.max(-80, Math.min(0, deltaX));
    const element = e.currentTarget;
    element.style.transform = `translateX(${swipeDistance}px)`;
  };

  const handleSwipeEnd = (e, notificationId) => {
    if (!isMobile || swipedNotification !== notificationId) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.clientX;
    
    if (deltaX < -50) {
      // Swipe left - show delete action
      const element = e.currentTarget;
      element.style.transform = 'translateX(-80px)';
    } else {
      // Reset position
      const element = e.currentTarget;
      element.style.transform = 'translateX(0)';
    }
    
    setSwipedNotification(null);
    touchStartRef.current = null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace un momento';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'festival_created':
        return <Calendar className="h-5 w-5 text-primary-400" />;
      case 'attendance_changed':
        return <Users className="h-5 w-5 text-green-400" />;
      case 'user_joined':
        return <UserPlus className="h-5 w-5 text-blue-400" />;
      case 'survey_available':
        return <MessageCircle className="h-5 w-5 text-purple-400" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'festival_created':
        return 'border-l-primary-500 bg-primary-500/5';
      case 'attendance_changed':
        return 'border-l-green-500 bg-green-500/5';
      case 'user_joined':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'survey_available':
        return 'border-l-purple-500 bg-purple-500/5';
      default:
        return 'border-l-slate-500 bg-slate-500/5';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 rounded-xl shadow-2xl max-h-[85vh] flex flex-col notification-panel">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-primary-500/20 rounded-lg flex-shrink-0">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">Notificaciones</h3>
              <p className="text-xs sm:text-sm text-slate-400 truncate">Gestiona tus alertas y mensajes</p>
            </div>
                                {unreadCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium flex-shrink-0 notification-badge">
                        {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                      </span>
                    )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50 flex-shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Mobile Filter Tabs */}
        {isMobile && notifications.length > 0 && (
          <div className="flex border-b border-slate-700/30 bg-slate-800/20">
            {[
              { key: 'all', label: 'Todas', count: notifications.length },
              { key: 'unread', label: 'Sin leer', count: unreadCount },
              { key: 'read', label: 'Leídas', count: notifications.length - unreadCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 flex items-center justify-center py-3 px-2 text-sm font-medium transition-colors relative ${
                  filter === tab.key
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? 'bg-primary-500/20 text-primary-300' : 'bg-slate-700/50 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center p-3 sm:p-4 border-b border-slate-700/30 bg-slate-800/20">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-700/50"
              >
                <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Marcar todas como leídas</span>
                <span className="sm:hidden">Marcar leídas</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-700/50"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
            
            <div className="text-xs sm:text-sm text-slate-500">
              <span className="hidden sm:inline">
                {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}
                {unreadCount > 0 && (
                  <span className="text-primary-400 ml-2">
                    • {unreadCount} sin leer
                  </span>
                )}
              </span>
              <span className="sm:hidden">
                {filteredNotifications.length}/{notifications.length}
              </span>
            </div>
          </div>
        )}

        {/* Pull to refresh indicator */}
        {isMobile && pullToRefresh > 0 && (
          <div className="flex items-center justify-center py-2 bg-slate-800/30">
            <RefreshCw className={`h-4 w-4 text-primary-400 ${pullToRefresh > 50 ? 'animate-spin' : ''}`} />
            <span className="ml-2 text-xs text-slate-400">
              {pullToRefresh > 50 ? 'Suelta para actualizar' : 'Desliza hacia abajo'}
            </span>
          </div>
        )}

        {/* Notifications list */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto min-h-0 pull-to-refresh"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <div className="p-4 bg-slate-800/50 rounded-full mb-4 sm:mb-6">
                <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-slate-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
                {filter === 'all' ? 'No hay notificaciones' : 
                 filter === 'unread' ? 'No hay notificaciones sin leer' : 
                 'No hay notificaciones leídas'}
              </h4>
              <p className="text-slate-400 text-sm max-w-sm">
                {filter === 'all' ? 'Te avisaremos cuando haya novedades sobre festivales, amigos y eventos' :
                 filter === 'unread' ? '¡Perfecto! Estás al día con todas tus notificaciones' :
                 'Las notificaciones leídas aparecerán aquí'}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium"
                >
                  Ver todas las notificaciones
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative transition-all duration-200 border-l-4 swipeable notification-item ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'bg-slate-800/20' : ''}`}
                  onTouchStart={(e) => handleSwipeStart(e, notification.id)}
                  onTouchMove={(e) => handleSwipeMove(e, notification.id)}
                  onTouchEnd={(e) => handleSwipeEnd(e, notification.id)}
                >
                  {/* Swipe action overlay */}
                  {isMobile && (
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500/90 flex items-center justify-center rounded-r-lg">
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className="p-4 sm:p-6 relative bg-slate-900/95">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 p-2 bg-slate-800/50 rounded-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm sm:text-base font-semibold text-white line-clamp-2">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2 sm:mb-3 line-clamp-3">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center space-x-2">
                          <span>{formatDate(notification.created_at)}</span>
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-primary-400 hover:text-primary-300 transition-colors p-2 rounded-lg hover:bg-primary-500/10"
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel; 