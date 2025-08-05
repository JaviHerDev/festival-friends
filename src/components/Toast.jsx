import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const Toast = ({ id, type = 'info', title, description, onClose, action }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrada con animación
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    // Tiempo para la animación de salida
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "glass border backdrop-blur-md shadow-lg";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500/50 bg-green-500/10`;
      case 'error':
        return `${baseStyles} border-red-500/50 bg-red-500/10`;
      case 'warning':
        return `${baseStyles} border-yellow-500/50 bg-yellow-500/10`;
      case 'info':
      default:
        return `${baseStyles} border-blue-500/50 bg-blue-500/10`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 flex-shrink-0";
    
    switch (type) {
          case 'success':
      return <CheckCircle className={`${iconClass} text-green-400`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-red-400`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-yellow-400`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-blue-400`} />;
    }
  };

  const getTextColors = () => {
    switch (type) {
      case 'success':
        return { title: 'text-green-100', description: 'text-green-200' };
      case 'error':
        return { title: 'text-red-100', description: 'text-red-200' };
      case 'warning':
        return { title: 'text-yellow-100', description: 'text-yellow-200' };
      case 'info':
      default:
        return { title: 'text-blue-100', description: 'text-blue-200' };
    }
  };

  const textColors = getTextColors();

  return (
    <div className={`
      ${getToastStyles()}
      rounded-lg p-3 sm:p-4 mb-3 transition-all duration-300 ease-out
      ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      w-full
    `}>
      <div className="flex items-start space-x-2 sm:space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`text-xs sm:text-sm font-semibold ${textColors.title}`}>
              {title}
            </p>
          )}
          {description && (
            <p className={`text-xs sm:text-sm ${textColors.description} ${title ? 'mt-1' : ''}`}>
              {description}
            </p>
          )}
          {action && (
            <div className="mt-2">
              <button 
                onClick={action.onClick} 
                className="text-xs font-medium text-white bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={handleClose} 
          className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
        >
                          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast; 