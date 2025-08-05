import { Bell, CheckCircle, Clock, Trash2 } from 'lucide-react';
import useStore from '../store/useStore.js';

const NotificationStats = () => {
  const { notifications } = useStore();

  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const readNotifications = totalNotifications - unreadNotifications;

  const getNotificationTypeStats = () => {
    const stats = {};
    notifications.forEach(notification => {
      stats[notification.type] = (stats[notification.type] || 0) + 1;
    });
    return stats;
  };

  const typeStats = getNotificationTypeStats();

  const getTypeLabel = (type) => {
    switch (type) {
      case 'festival_created':
        return 'Festivales Creados';
      case 'attendance_changed':
        return 'Cambios de Asistencia';
      case 'user_joined':
        return 'Nuevos Usuarios';
      case 'survey_available':
        return 'Encuestas Disponibles';
      default:
        return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'festival_created':
        return <Bell className="h-4 w-4 text-primary-400" />;
      case 'attendance_changed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'user_joined':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'survey_available':
        return <Trash2 className="h-4 w-4 text-purple-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Bell className="h-5 w-5 text-primary-400" />
        <span>Estadísticas de Notificaciones</span>
      </h3>

      {/* General Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalNotifications}</div>
          <div className="text-sm text-slate-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-400">{unreadNotifications}</div>
          <div className="text-sm text-slate-400">Sin leer</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{readNotifications}</div>
          <div className="text-sm text-slate-400">Leídas</div>
        </div>
      </div>

      {/* Type Stats */}
      {Object.keys(typeStats).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Por tipo:</h4>
          <div className="space-y-2">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(type)}
                  <span className="text-sm text-slate-300">{getTypeLabel(type)}</span>
                </div>
                <span className="text-sm font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalNotifications === 0 && (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay notificaciones aún</p>
          <p className="text-slate-500 text-xs mt-1">Las notificaciones aparecerán aquí cuando haya actividad</p>
        </div>
      )}
    </div>
  );
};

export default NotificationStats; 