'use client'

import { useEffect, useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Lightbox = ({ isOpen, onClose, imageUrl, imageAlt = 'Imagen' }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Reset zoom when opening
      setIsZoomed(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        aria-label="Cerrar"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Image container */}
      <div className="relative max-w-full max-h-full">
        <img
          src={imageUrl}
          alt={imageAlt}
          className={`transition-all duration-300 rounded-lg shadow-2xl cursor-pointer ${
            isZoomed 
              ? 'max-w-none max-h-none w-auto h-auto' 
              : 'max-w-full max-h-full object-contain'
          }`}
          draggable={false}
          onClick={handleImageClick}
        />
        
        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {isZoomed ? 'Haz clic para reducir' : 'Haz clic para ampliar'}
        </div>
      </div>

      {/* Overlay click to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
        aria-label="Cerrar lightbox"
      />
    </div>
  );
};

export default Lightbox; 