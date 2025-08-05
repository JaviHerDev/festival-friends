import { useEffect } from 'react';
import { 
  X, 
  Check, 
  Trash2, 
  CheckCheck,
  Calendar,
  Users,
  UserPlus,
  Bell,
  MessageCircle
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

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Bell className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Notificaciones</h3>
              <p className="text-sm text-slate-400">Gestiona tus alertas y mensajes</p>
            </div>
            {unreadCount > 0 && (
              <span className="bg-primary-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center p-4 border-b border-slate-700/30 bg-slate-800/20">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-slate-700/50"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Marcar todas como leídas</span>
            </button>
            <div className="text-sm text-slate-500">
              {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}
              {unreadCount > 0 && (
                <span className="text-primary-400 ml-2">
                  • {unreadCount} sin leer
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="p-4 bg-slate-800/50 rounded-full mb-6">
                <Bell className="h-16 w-16 text-slate-600" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No hay notificaciones</h4>
              <p className="text-slate-400 text-sm max-w-sm">
                Te avisaremos cuando haya novedades sobre festivales, amigos y eventos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-slate-800/30 transition-all duration-200 border-l-4 ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'bg-slate-800/20' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 p-2 bg-slate-800/50 rounded-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-base font-semibold text-white">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center space-x-2">
                        <span>{formatDate(notification.created_at)}</span>
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-primary-400 hover:text-primary-300 transition-colors p-2 rounded-lg hover:bg-primary-500/10"
                          title="Marcar como leída"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                        title="Eliminar notificación"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
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