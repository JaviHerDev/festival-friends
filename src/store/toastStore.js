import { create } from 'zustand';

const useToastStore = create((set, get) => ({
  toasts: [],
  
  // Agregar una nueva notificación toast
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { 
      id, 
      duration: 5000, // Duración por defecto
      ...toast 
    };
    
    set(state => ({ 
      toasts: [newToast, ...state.toasts] 
    }));
    
    // Auto-remover después de la duración especificada
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  },
  
  // Remover una notificación específica
  removeToast: (id) => {
    set(state => ({ 
      toasts: state.toasts.filter(toast => toast.id !== id) 
    }));
  },
  
  // Limpiar todas las notificaciones
  clearAllToasts: () => {
    set({ toasts: [] });
  },
  
  // Métodos helper para diferentes tipos de toast
  success: (title, description, options = {}) => {
    return get().addToast({
      type: 'success',
      title,
      description,
      duration: 5000,
      ...options
    });
  },
  
  error: (title, description, options = {}) => {
    return get().addToast({
      type: 'error',
      title,
      description,
      duration: 7000, // Errores duran más tiempo
      ...options
    });
  },
  
  warning: (title, description, options = {}) => {
    return get().addToast({
      type: 'warning',
      title,
      description,
      duration: 6000,
      ...options
    });
  },
  
  info: (title, description, options = {}) => {
    return get().addToast({
      type: 'info',
      title,
      description,
      duration: 5000,
      ...options
    });
  },
  
  // Método genérico
  message: (message, type = 'info', options = {}) => {
    return get().addToast({
      type,
      title: message,
      description: null,
      ...options
    });
  }
}));

// Exportar tanto el hook como un objeto toast para uso global
export default useToastStore;

// Crear objeto toast global para usar fuera de componentes React
export const toast = {
  success: (title, description, options) => 
    useToastStore.getState().success(title, description, options),
  
  error: (title, description, options) => 
    useToastStore.getState().error(title, description, options),
  
  warning: (title, description, options) => 
    useToastStore.getState().warning(title, description, options),
  
  info: (title, description, options) => 
    useToastStore.getState().info(title, description, options),
  
  message: (message, type, options) => 
    useToastStore.getState().message(message, type, options),
    
  clear: () => 
    useToastStore.getState().clearAllToasts()
}; 