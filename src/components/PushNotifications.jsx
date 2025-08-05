import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';

const PushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useStore();

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!user) {
      toast.error('Error', 'Debes estar autenticado para recibir notificaciones');
      return;
    }

    setIsLoading(true);

    try {
      // Request permission first
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        toast.error('Permiso denegado', 'Necesitas permitir las notificaciones para recibir avisos');
        setIsLoading(false);
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.PUBLIC_VAPID_PUBLIC_KEY || '')
      });

      console.log('✅ Push subscription created:', subscription);

      // Send subscription to server
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: user.id
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        toast.success('Notificaciones activadas', 'Recibirás avisos de nuevos festivales y cambios de asistencia');
      } else {
        throw new Error('Failed to save subscription');
      }

    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      toast.error('Error', 'No se pudieron activar las notificaciones push');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server about unsubscription
        await fetch('/api/push-subscription', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id
          })
        });

        setIsSubscribed(false);
        toast.success('Notificaciones desactivadas', 'Ya no recibirás notificaciones push');
      }
    } catch (error) {
      console.error('❌ Error unsubscribing from push notifications:', error);
      toast.error('Error', 'No se pudieron desactivar las notificaciones push');
    } finally {
      setIsLoading(false);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <div className="flex items-center space-x-2">
      {isSubscribed ? (
        <button
          onClick={unsubscribeFromPushNotifications}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          title="Desactivar notificaciones push"
        >
          <Bell className="h-4 w-4 text-green-400" />
          <span className="hidden sm:inline">Push ON</span>
        </button>
      ) : (
        <button
          onClick={subscribeToPushNotifications}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          title="Activar notificaciones push"
        >
          <BellOff className="h-4 w-4" />
          <span className="hidden sm:inline">Push OFF</span>
        </button>
      )}
      
      <button
        onClick={() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification('Test Notification', {
                body: 'Esta es una notificación de prueba',
                icon: '/favicon.ico',
                badge: '/favicon.ico'
              });
            });
          }
        }}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        title="Probar notificación"
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
};

export default PushNotifications; 