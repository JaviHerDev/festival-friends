'use client'

import { useState, useEffect } from 'react';
import FestivalsList from './FestivalsList.jsx';
import CreateFestivalModal from './CreateFestivalModal.jsx';
import FestivalDetailsModal from './FestivalDetailsModal.jsx';
import { PlusIcon } from '@heroicons/react/24/outline';

const FestivalsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Restore state from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    
    // Clean up any residual modal states
    localStorage.removeItem('festivals_create_modal_open');
    localStorage.removeItem('festivals_details_modal_open');
    
    // Only restore selected festival, not modal states
    const savedFestival = localStorage.getItem('festivals_selected_festival');
    
    if (savedFestival) {
      try {
        setSelectedFestival(JSON.parse(savedFestival));
      } catch (error) {
        console.error('Error parsing saved festival:', error);
        localStorage.removeItem('festivals_selected_festival');
      }
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (selectedFestival) {
        localStorage.setItem('festivals_selected_festival', JSON.stringify(selectedFestival));
      } else {
        localStorage.removeItem('festivals_selected_festival');
      }
    }
  }, [selectedFestival, isHydrated]);

  const handleCloseCreateModal = () => {
    console.log('🔍 handleCloseCreateModal called - CLOSING MODAL');
    setIsCreateModalOpen(false);
    setSelectedFestival(null);
    
    // Clean up localStorage
    if (isHydrated) {
      localStorage.removeItem('festivals_create_modal_open');
      localStorage.removeItem('festivals_details_modal_open');
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFestival(null);
    
    // Clean up localStorage
    if (isHydrated) {
      localStorage.removeItem('festivals_create_modal_open');
      localStorage.removeItem('festivals_details_modal_open');
    }
  };

  const handleEditFestival = (festival) => {
    setSelectedFestival(festival);
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (festival) => {
    setSelectedFestival(festival);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            🎪 Festivales
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Descubre y organiza los mejores festivales de música
          </p>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <PlusIcon className="h-5 w-5" />
          <span>{isMobile ? 'Crear Festival' : '+ Crear Festival'}</span>
        </button>
      </div>

      <FestivalsList 
        onEdit={handleEditFestival}
        onViewDetails={handleViewDetails}
      />
      
      <CreateFestivalModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseCreateModal}
        festival={selectedFestival}
      />
      
      <FestivalDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={handleCloseDetailsModal}
        festival={selectedFestival}
      />
    </>
  );
};

export default FestivalsPage; 