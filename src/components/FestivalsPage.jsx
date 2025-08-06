'use client'

import { useState, useEffect } from 'react';
import FestivalsList from './FestivalsList.jsx';
import CreateFestivalModal from './CreateFestivalModal.jsx';
import FestivalDetailsModal from './FestivalDetailsModal.jsx';



const FestivalsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

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
      <div className="flex justify-between items-center mb-8">
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          + Crear Festival
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