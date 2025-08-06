'use client'

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  confirmVariant = 'danger' // 'danger' | 'primary' | 'secondary'
}) => {
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

  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white';
      case 'secondary':
        return 'bg-slate-600 hover:bg-slate-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 sm:max-w-lg w-full max-h-[90vh] flex flex-col rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="p-6">
            <p className="text-slate-300 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-600/50">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmationModal; 