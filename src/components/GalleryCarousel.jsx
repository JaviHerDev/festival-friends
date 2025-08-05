'use client';

import { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';

const GalleryCarousel = () => {
  const { getGalleryImages } = useStore();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Loading gallery images...');
        
        const { data, error } = await getGalleryImages();
        
        if (error) {
          console.error('❌ Error loading gallery images:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('✅ Gallery images loaded:', data.length);
          setImages(data);
        } else {
          console.log('⚠️ No gallery images found');
        }
      } catch (err) {
        console.error('❌ Exception loading gallery images:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [getGalleryImages]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card aspect-square overflow-hidden animate-pulse">
            <div className="w-full h-full bg-slate-700/50"></div>
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-semibold text-white mb-2">Galería de Festivales</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Próximamente: Imágenes épicas de festivales, conciertos y momentos inolvidables de la comunidad festivalera.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-2xl">🎪</div>
          <div className="text-2xl">🎸</div>
          <div className="text-2xl">🎵</div>
          <div className="text-2xl">🔥</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Carousel */}
      <div className="relative">
        <div className="aspect-video overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50">
          {images.length > 0 && (
            <img 
              src={images[currentIndex].url}
              alt={`Galería ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500 ease-in-out"
            />
          )}
        </div>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
              aria-label="Imagen anterior"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
              aria-label="Imagen siguiente"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Image Counter */}
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
              index === currentIndex 
                ? 'border-primary-500 shadow-lg shadow-primary-500/25' 
                : 'border-slate-700/50 hover:border-slate-600/50'
            }`}
            aria-label={`Ver imagen ${index + 1}`}
          >
            <img 
              src={image.url}
              alt={`Miniatura ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Dots Navigation - Hidden on mobile */}
      {images.length > 1 && (
        <div className="hidden md:flex justify-center space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentIndex 
                  ? 'bg-primary-500 shadow-lg shadow-primary-500/50' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryCarousel; 