import { useEffect } from 'react';
import Toast from './Toast.jsx';
import useToastStore from '../store/toastStore.js';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  // Limpiar toasts al desmontar el componente (opcional)
  useEffect(() => {
    // Cleanup function si es necesario
    return () => {
      // useToastStore.getState().clearAllToasts();
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-50 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4 sm:px-0">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Exportar solo el componente - el toast object ya está en toastStore.js
export default ToastContainer; 