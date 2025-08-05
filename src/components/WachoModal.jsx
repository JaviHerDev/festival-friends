import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase.js';

const WachoModal = ({ isOpen, onClose, onBadgeEarned }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-slate-600/50 shadow-2xl transform transition-all duration-300 scale-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Badge Image */}
        <div className="text-center mb-6">
          <div className="w-40 h-40 mx-auto bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center border-4 border-primary-400/30 shadow-2xl mb-4 overflow-hidden animate-bounce">
            <img 
              src={supabase.storage.from('frontimages').getPublicUrl('wacho.jpg').data.publicUrl}
              alt="Wacho"
              className="w-full h-full object-cover animate-pulse"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span className="text-6xl absolute animate-bounce" style={{ display: 'none' }}>🏆</span>
          </div>
        </div>
        
        {/* Text Content */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">
            ¡Felicidades!
          </h3>
          <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-xl p-4 border border-primary-500/30">
            <h4 className="text-xl font-bold text-primary-300 mb-2">
              Has ganado la Insignia
            </h4>
            <p className="text-3xl font-bold text-white mb-2">
              "Padrino de Wacho"
            </p>
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center border-2 border-red-400/30 shadow-lg">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Gracias por apadrinar al Wacho. Ahora tendrá whisky y M para sobrevivir hasta el próximo festival. 
              ¡Eres un verdadero héroe de la comunidad festivalera! 🎸
            </p>
          </div>
          
          <button
            onClick={() => {
              // The badge is already assigned when the modal opens
              // Just close the modal
              onClose();
            }}
            className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            ¡Gracias! 🤘
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WachoModal; 