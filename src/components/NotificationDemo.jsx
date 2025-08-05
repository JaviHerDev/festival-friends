import { useState } from 'react';
import { Bell, Calendar, Users, UserPlus, MessageCircle, Zap, Trash2 } from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';

const NotificationDemo = () => {
  const { createNotification, user, festivals } = useStore();
  const [isCreating, setIsCreating] = useState(false);

  const demoNotifications = [
    {
      type: 'festival_created',
      title: '🎪 Nuevo Festival Creado',
      message: 'RockFest 2024 ha sido creado por @rockero_pro',
      icon: <Calendar className="h-4 w-4 text-primary-400" />,
      data: {
        festival_id: festivals?.[0]?.id || 'demo-festival-id',
        festival_name: festivals?.[0]?.name || 'RockFest 2024',
        creator_id: user?.id,
        creator_name: user?.userProfile?.name || 'Rockero Pro',
        creator_nickname: user?.userProfile?.nickname || 'rockero_pro'
      }
    },
    {
      type: 'attendance_changed',
      title: '🎫 Cambio de Asistencia',
      message: '@metalhead ha cambiado su estado a "Tengo la entrada" en RockFest 2024',
      icon: <Users className="h-4 w-4 text-green-400" />,
      data: {
        festival_id: festivals?.[0]?.id || 'demo-festival-id',
        festival_name: festivals?.[0]?.name || 'RockFest 2024',
        user_id: user?.id,
        user_name: user?.userProfile?.name || 'Metal Head',
        user_nickname: user?.userProfile?.nickname || 'metalhead',
        new_status: 'have_ticket',
        old_status: 'thinking_about_it'
      }
    },
    {
      type: 'user_joined',
      title: '👋 Nuevo Rockero',
      message: '@punk_rocker se ha unido a Festival & Friends',
      icon: <UserPlus className="h-4 w-4 text-blue-400" />,
      data: {
        new_user_id: user?.id,
        new_user_name: user?.userProfile?.name || 'Punk Rocker',
        new_user_nickname: user?.userProfile?.nickname || 'punk_rocker',
        join_date: new Date().toISOString()
      }
    },
    {
      type: 'survey_available',
      title: '📋 Encuesta Disponible',
      message: 'Completa la encuesta de RockFest 2023 y gana entradas',
      icon: <MessageCircle className="h-4 w-4 text-purple-400" />,
      data: {
        survey_id: 'demo-survey-id',
        festival_id: festivals?.[0]?.id || 'demo-festival-id',
        festival_name: festivals?.[0]?.name || 'RockFest 2023',
        reward: 'entradas gratis',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      type: 'general',
      title: '🎸 Actualización del Sistema',
      message: 'Hemos mejorado el sistema de notificaciones con nuevas funcionalidades',
      icon: <Zap className="h-4 w-4 text-yellow-400" />,
      data: {
        update_type: 'system_improvement',
        features: ['notificaciones push', 'estadísticas', 'filtros'],
        version: '2.0.0'
      }
    },
    {
      type: 'festival_created',
      title: '🎪 Festival de Metal Anunciado',
      message: '@metal_organizer ha creado "MetalFest 2024" en Madrid',
      icon: <Calendar className="h-4 w-4 text-red-400" />,
      data: {
        festival_id: festivals?.[1]?.id || 'demo-metal-festival-id',
        festival_name: 'MetalFest 2024',
        creator_id: user?.id,
        creator_name: user?.userProfile?.name || 'Metal Organizer',
        creator_nickname: user?.userProfile?.nickname || 'metal_organizer',
        location: 'Madrid, España',
        date: '2024-07-15'
      }
    },
    {
      type: 'attendance_changed',
      title: '🎫 Más Rockeros Confirmados',
      message: '@rockstar y @guitarist han confirmado asistencia a RockFest 2024',
      icon: <Users className="h-4 w-4 text-green-400" />,
      data: {
        festival_id: festivals?.[0]?.id || 'demo-festival-id',
        festival_name: festivals?.[0]?.name || 'RockFest 2024',
        attendees: [
          { id: user?.id, name: user?.userProfile?.name || 'Rock Star', nickname: user?.userProfile?.nickname || 'rockstar', status: 'have_ticket' },
          { id: 'demo-user-2', name: 'Guitar Hero', nickname: 'guitarist', status: 'thinking_about_it' }
        ]
      }
    },
    {
      type: 'user_joined',
      title: '👋 Bienvenida a la Comunidad',
      message: '@new_rocker se ha unido y ya tiene 5 conexiones',
      icon: <UserPlus className="h-4 w-4 text-blue-400" />,
      data: {
        new_user_id: 'demo-new-user',
        new_user_name: 'New Rocker',
        new_user_nickname: 'new_rocker',
        connections_count: 5,
        join_date: new Date().toISOString()
      }
    }
  ];

  const createDemoNotification = async (notification) => {
    if (!user) {
      toast.error('Error', 'Debes estar autenticado para crear notificaciones de prueba');
      return;
    }

    try {
      await createNotification({
        user_id: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: false
      });

      toast.success('Notificación creada', `Se ha creado una notificación de tipo "${notification.type}"`);
    } catch (error) {
      console.error('Error creating demo notification:', error);
      toast.error('Error', 'No se pudo crear la notificación de prueba');
    }
  };

  const createAllDemoNotifications = async () => {
    if (!user) {
      toast.error('Error', 'Debes estar autenticado para crear notificaciones de prueba');
      return;
    }

    setIsCreating(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const notification of demoNotifications) {
        try {
          await createNotification({
            user_id: user.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            read: false
          });
          successCount++;
          
          // Pequeña pausa entre creaciones
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error creating ${notification.type} notification:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success('Notificaciones creadas', `Se crearon ${successCount} notificaciones de ejemplo`);
      }
      
      if (errorCount > 0) {
        toast.error('Algunos errores', `${errorCount} notificaciones no se pudieron crear`);
      }

    } catch (error) {
      console.error('Error creating demo notifications:', error);
      toast.error('Error', 'No se pudieron crear las notificaciones de prueba');
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary-400" />
          <span>Demostración de Notificaciones</span>
        </h3>
        
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm mb-2">Debes iniciar sesión para probar las notificaciones</p>
          <p className="text-slate-500 text-xs">Las notificaciones se crean para tu cuenta de usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Bell className="h-5 w-5 text-primary-400" />
        <span>Demostración de Notificaciones</span>
      </h3>
      
      <p className="text-sm text-slate-400 mb-6">
        Prueba el sistema de notificaciones creando diferentes tipos de notificaciones de ejemplo.
        Las notificaciones aparecerán en el panel de notificaciones y también como toasts en tiempo real.
      </p>

      {/* Botón para crear todas las notificaciones */}
      <div className="mb-6">
        <button
          onClick={createAllDemoNotifications}
          disabled={isCreating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="h-4 w-4" />
          <span>{isCreating ? 'Creando notificaciones...' : 'Crear todas las notificaciones de ejemplo'}</span>
        </button>
      </div>

      {/* Grid de notificaciones individuales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {demoNotifications.map((notification, index) => (
          <button
            key={index}
            onClick={() => createDemoNotification(notification)}
            disabled={isCreating}
            className="flex items-center space-x-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-slate-500/30 transition-all duration-200 group disabled:opacity-50"
          >
            <div className="flex-shrink-0">
              {notification.icon}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">
                {notification.title}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {notification.message}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
        <h4 className="text-sm font-medium text-primary-300 mb-2">Tipos de Notificaciones:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-primary-200">
          <div>• <span className="text-primary-400">festival_created</span> - Nuevos festivales</div>
          <div>• <span className="text-primary-400">attendance_changed</span> - Cambios de asistencia</div>
          <div>• <span className="text-primary-400">user_joined</span> - Nuevos usuarios</div>
          <div>• <span className="text-primary-400">survey_available</span> - Encuestas disponibles</div>
          <div>• <span className="text-primary-400">general</span> - Notificaciones generales</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400">
          💡 <strong>Tip:</strong> Las notificaciones aparecerán en el panel de notificaciones (icono de campana en el header) 
          y también como toasts en tiempo real. Puedes marcarlas como leídas o eliminarlas desde el panel.
        </p>
      </div>
    </div>
  );
};

export default NotificationDemo; 