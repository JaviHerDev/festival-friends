'use client'

import { useState, useEffect } from 'react';
import FestivalsList from './FestivalsList.jsx';
import CreateFestivalModal from './CreateFestivalModal.jsx';
import FestivalDetailsModal from './FestivalDetailsModal.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';



const FestivalsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [isDraftConfirmationOpen, setIsDraftConfirmationOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore state from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    
    // Restore modal states
    const savedCreateModal = localStorage.getItem('festivals_create_modal_open') === 'true';
    const savedDetailsModal = localStorage.getItem('festivals_details_modal_open') === 'true';
    const savedFestival = localStorage.getItem('festivals_selected_festival');
    
    if (savedCreateModal) setIsCreateModalOpen(true);
    if (savedDetailsModal) setIsDetailsModalOpen(true);
    if (savedFestival) {
      try {
        setSelectedFestival(JSON.parse(savedFestival));
      } catch (error) {
        console.error('Error parsing saved festival:', error);
        localStorage.removeItem('festivals_selected_festival');
      }
    }
  }, []);

  // Persist modal state to localStorage (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('festivals_create_modal_open', isCreateModalOpen.toString());
    }
  }, [isCreateModalOpen, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('festivals_details_modal_open', isDetailsModalOpen.toString());
    }
  }, [isDetailsModalOpen, isHydrated]);

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
    // Clear draft when manually closing modal (only for new festivals)
    if (!selectedFestival && isHydrated) {
      const hasDraft = localStorage.getItem('festival_form_draft');
      if (hasDraft) {
        // Show confirmation modal instead of browser alert
        setIsDraftConfirmationOpen(true);
        return; // Don't close modal yet
      }
    }
    
    setIsCreateModalOpen(false);
    setSelectedFestival(null);
  };

  const handleDraftConfirmation = (keepDraft) => {
    if (isHydrated) {
      if (!keepDraft) {
        localStorage.removeItem('festival_form_draft');
        console.log('🗑️ Form draft discarded by user');
      } else {
        console.log('💾 Form draft kept by user choice');
      }
    }
    
    setIsCreateModalOpen(false);
    setSelectedFestival(null);
    setIsDraftConfirmationOpen(false);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFestival(null);
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

      <ConfirmationModal
        isOpen={isDraftConfirmationOpen}
        onClose={() => setIsDraftConfirmationOpen(false)}
        onConfirm={() => handleDraftConfirmation(false)}
        title="💾 Guardar Progreso"
        message="¿Quieres guardar tu progreso para continuar más tarde?\n\nSi eliges 'Descartar', se perderán los datos del formulario."
        confirmText="Descartar"
        cancelText="Guardar"
        confirmVariant="danger"
      />
    </>
  );
};

export default FestivalsPage; 