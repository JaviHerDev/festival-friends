'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Lightbox = ({ isOpen, onClose, imageUrl, imageAlt = 'Imagen' }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      setImageError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          // Could add navigation to previous image here
          break;
        case 'ArrowRight':
          e.preventDefault();
          // Could add navigation to next image here
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isOpen) return;
      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.1, Math.min(5, scale + delta));
      
      setScale(prev => {
        // Center the image when zooming in/out
        if ((newScale > 1 && prev <= 1) || (newScale <= 1 && prev > 1)) {
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });
    };

    if (isOpen) {
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => document.removeEventListener('wheel', handleWheel);
  }, [isOpen, scale]);

  // Touch gestures
  useEffect(() => {
    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
      } else if (e.touches.length === 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        });
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      
      if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const newScale = Math.max(0.1, Math.min(5, initialScale * (distance / initialDistance)));
        setScale(newScale);
      } else if (e.touches.length === 1 && isDragging) {
        const newX = e.touches[0].clientX - dragStart.x;
        const newY = e.touches[0].clientY - dragStart.y;
        
        // Calculate bounds for touch as well
        const maxOffset = Math.max(0, (scale - 1) * 100);
        
        setPosition({
          x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
          y: Math.max(-maxOffset, Math.min(maxOffset, newY))
        });
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isOpen) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, scale, position, isDragging, dragStart]);

  // Mouse drag with bounds
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging && scale > 1) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Calculate bounds based on image size and scale
        const maxOffset = Math.max(0, (scale - 1) * 100); // Limit movement
        
        setPosition({
          x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
          y: Math.max(-maxOffset, Math.min(maxOffset, newY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, scale, position, isDragging, dragStart]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => {
      const newScale = Math.min(5, prev + 0.25);
      // Center the image when zooming in
      if (newScale > 1 && prev <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(0.1, prev - 0.25);
      // Reset position when zooming out to fit
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !imageUrl) return null;

      return (
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-2 sm:p-4"
        onClick={handleOverlayClick}
      >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white text-sm">Cargando imagen...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <XMarkIcon className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="text-white text-lg font-medium">Error al cargar la imagen</p>
              <p className="text-white/70 text-sm">No se pudo cargar el cartel</p>
            </div>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Cerrar"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center space-x-2">
        <button
          onClick={handleZoomIn}
          disabled={scale >= 5}
          className="bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="Ampliar"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </button>
        
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.1}
          className="bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="Reducir"
        >
          <MagnifyingGlassMinusIcon className="h-5 w-5" />
        </button>
        
        <button
          onClick={handleResetZoom}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          className="bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="Restablecer zoom"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-30 bg-black/50 text-white px-3 py-2 rounded-full text-sm font-medium">
        <div className="flex items-center space-x-2">
          <span>🔍</span>
          <span>{Math.round(scale * 100)}%</span>
          {scale > 1 && (
            <span className="text-xs text-white/70">• Arrastra para mover</span>
          )}
        </div>
      </div>

      {/* Image container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={imageAlt}
          className="transition-transform duration-200 ease-out rounded-lg shadow-2xl select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
          draggable={false}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      {/* Instructions */}
      {scale === 1 && (
        <div className="absolute bottom-4 right-4 z-30 bg-black/50 text-white px-3 py-2 rounded-full text-sm">
          <div className="flex items-center space-x-2">
            <span>🖱️ Rueda para zoom</span>
            <span>•</span>
            <span>⌨️ +/- para zoom</span>
            <span>•</span>
            <span>ESC para cerrar</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lightbox; 