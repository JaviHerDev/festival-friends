'use client'

import { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, MapPinIcon, UserGroupIcon, PhotoIcon, GlobeAltIcon, CurrencyEuroIcon, BuildingOfficeIcon, TagIcon } from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';
import Lightbox from './Lightbox.jsx';
import { toast } from '../store/toastStore.js';
import EventSurvey from './EventSurvey.jsx';
import SurveyStats from './SurveyStats.jsx';
import SurveyNotification from './SurveyNotification.jsx';
import UserAvatar from './UserAvatar.jsx';

const FestivalDetailsModal = ({ isOpen, onClose, festival }) => {
  const { user, updateAttendance, submitSurveyResponse, checkSurveySubmitted } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [localCurrentStatus, setLocalCurrentStatus] = useState('');
  const [showSurvey, setShowSurvey] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [localFestival, setLocalFestival] = useState(null);
  const [hasSubmittedSurvey, setHasSubmittedSurvey] = useState(false);
  const [isCheckingSurvey, setIsCheckingSurvey] = useState(false);

  // Get user's current attendance status
  const userAttendance = festival?.attendances?.find(a => a.user_id === user?.id);
  const currentStatus = localCurrentStatus || userAttendance?.status || '';

  // Update local status when festival changes
  useEffect(() => {
    if (festival) {
      const userAttendance = festival.attendances?.find(a => a.user_id === user?.id);
      setLocalCurrentStatus(userAttendance?.status || '');
      setLocalFestival(festival);
    }
  }, [festival, user?.id]);

  // Check survey status when modal opens or when survey modal closes
  useEffect(() => {
    const checkSurveyStatus = async () => {
      if (festival && user && isFestivalEnded() && isSurveyAvailable()) {
        setIsCheckingSurvey(true);
        try {
          console.log('🔍 Checking survey status for festival:', festival.id, 'user:', user.id);
          const { data: hasSubmitted } = await checkSurveySubmitted(festival.id);
          setHasSubmittedSurvey(hasSubmitted || false);
          
          // Show notification if user hasn't submitted and survey is available
          if (!hasSubmitted && isOpen) {
            const timer = setTimeout(() => {
              setShowNotification(true);
            }, 2000);
            
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error('Error checking survey status:', error);
          setHasSubmittedSurvey(false);
        } finally {
          setIsCheckingSurvey(false);
        }
      } else {
        setHasSubmittedSurvey(false);
      }
    };

    if (isOpen && festival) {
      checkSurveyStatus();
    }
  }, [isOpen, festival, user, checkSurveySubmitted, showSurvey]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStatusChange = async (status) => {
    if (isUpdating || !user || !festival) return;
    
    // Don't update if it's the same status
    if (currentStatus === status) return;
    
    setIsUpdating(true);
    setSelectedStatus(status);
    
    // Update local state immediately for better UX
    setLocalCurrentStatus(status);
    
    const { error } = await updateAttendance(festival.id, status);
    
    if (error) {
      console.error('Error updating attendance:', error);
      // Revert local state if there was an error
      setLocalCurrentStatus(currentStatus);
      // Show error message to user
      toast.error('Error', 'No se pudo actualizar tu asistencia. Inténtalo de nuevo.');
    } else {
      // Update local festival state with new attendance
      if (localFestival) {
        const updatedFestival = { ...localFestival };
        const existingAttendanceIndex = updatedFestival.attendances?.findIndex(a => a.user_id === user.id);
        
        if (existingAttendanceIndex !== -1 && existingAttendanceIndex !== undefined) {
          // Update existing attendance
          updatedFestival.attendances[existingAttendanceIndex] = {
            ...updatedFestival.attendances[existingAttendanceIndex],
            status: status
          };
        } else {
          // Add new attendance
          const newAttendance = {
            id: Date.now().toString(), // Temporary ID
            user_id: user.id,
            festival_id: festival.id,
            status: status,
            user: user
          };
          updatedFestival.attendances = [...(updatedFestival.attendances || []), newAttendance];
        }
        
        setLocalFestival(updatedFestival);
      }
      
      // Show success message
      toast.success('¡Actualizado!', 'Tu asistencia se ha actualizado correctamente');
    }
    
    setIsUpdating(false);
    setSelectedStatus('');
  };

  // Survey handlers
  const handleSurveySubmit = async (surveyData) => {
    try {
      const { data, error } = await submitSurveyResponse(surveyData);
      
      if (error) {
        console.error('Error submitting survey:', error);
        toast.error('Error', 'No se pudo enviar la encuesta. Inténtalo de nuevo.');
        return;
      }
      
      console.log('Survey submitted successfully:', data);
      setShowSurvey(false);
      setHasSubmittedSurvey(true); // Update the survey status
      toast.success('¡Encuesta enviada!', 'Gracias por compartir tu experiencia');
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Error', 'No se pudo enviar la encuesta. Inténtalo de nuevo.');
    }
  };





  const getStatusColor = (status) => {
    switch (status) {
      case 'have_ticket':
        return 'bg-green-600';
      case 'thinking_about_it':
        return 'bg-yellow-600';
      case 'not_going':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'have_ticket':
        return '🎫 Tengo entrada';
      case 'thinking_about_it':
        return '🤔 Me lo estoy pensando';
      case 'not_going':
        return '❌ No voy';
      default:
        return '❓ Sin estado';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'rock': '🎸',
      'pop': '🎤',
      'electronic': '🎛️',
      'indie': '🎵',
      'metal': '🤘',
      'folk': '🪕',
      'jazz': '🎺',
      'reggae': '🌴',
      'hip_hop': '🎤',
      'other': '🎪'
    };
    return icons[category] || '🎪';
  };

  const getCategoryName = (category) => {
    const names = {
      'rock': 'Rock',
      'pop': 'Pop',
      'electronic': 'Electrónica',
      'indie': 'Indie',
      'metal': 'Metal',
      'folk': 'Folk',
      'jazz': 'Jazz',
      'reggae': 'Reggae',
      'hip_hop': 'Hip Hop',
      'other': 'Otro'
    };
    return names[category] || 'Otro';
  };

  // Check if festival has ended
  const isFestivalEnded = () => {
    const endDate = new Date(festival.end_date);
    const now = new Date();
    return endDate < now;
  };

  // Check if survey is available (7 days after festival ends)
  const isSurveyAvailable = () => {
    if (!isFestivalEnded()) return false;
    
    const endDate = new Date(festival.end_date);
    const surveyEndDate = new Date(endDate.getTime() + (12 * 24 * 60 * 60 * 1000)); // 12 días después
    const now = new Date();
    
    return now <= surveyEndDate;
  };

  if (!isOpen || !localFestival) return null;

  const attendanceCounts = {
    have_ticket: localFestival.attendances?.filter(a => a.status === 'have_ticket').length || 0,
    thinking_about_it: localFestival.attendances?.filter(a => a.status === 'thinking_about_it').length || 0,
    not_going: localFestival.attendances?.filter(a => a.status === 'not_going').length || 0,
  };

  const totalInterested = attendanceCounts.have_ticket + attendanceCounts.thinking_about_it;
  const attendeesWithTickets = localFestival.attendances?.filter(a => a.status === 'have_ticket') || [];
  const attendeesThinking = localFestival.attendances?.filter(a => a.status === 'thinking_about_it') || [];
  const attendeesNotGoing = localFestival.attendances?.filter(a => a.status === 'not_going') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="relative">
          {localFestival.poster_url ? (
            <div className="relative">
              <img
                src={localFestival.poster_url}
                alt={localFestival.name}
                className="w-full h-32 sm:h-40 md:h-48 object-cover object-top rounded-t-xl sm:rounded-t-2xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsLightboxOpen(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-xl sm:rounded-t-2xl"></div>
              
              {/* View poster button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 px-2 sm:px-3 py-1 bg-black/50 hover:bg-black/70 text-white rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <PhotoIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Ver cartel</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-32 sm:h-40 md:h-48 bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-t-xl sm:rounded-t-2xl flex items-center justify-center">
              <div className="text-4xl sm:text-6xl md:text-8xl">{getCategoryIcon(localFestival.category)}</div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Title and basic info */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl sm:text-2xl">{getCategoryIcon(localFestival.category)}</span>
              <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs sm:text-sm font-medium">
                {getCategoryName(localFestival.category)}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2">{localFestival.name}</h1>
            <div className="text-slate-400 text-sm sm:text-base">
              Creado por <span className="text-white font-medium">{localFestival.created_by_user?.name}</span>
            </div>
          </div>

          {/* Key details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium text-sm sm:text-base">
                    {formatDate(localFestival.start_date)}
                  </div>
                  {localFestival.start_date !== localFestival.end_date && (
                    <div className="text-slate-400 text-xs sm:text-sm">
                      hasta {formatTime(localFestival.end_date)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                <span className="text-white text-sm sm:text-base">{localFestival.location}</span>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                <span className="text-white text-sm sm:text-base">{totalInterested} interesados</span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {localFestival.max_capacity && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                  <span className="text-white text-sm sm:text-base">Capacidad: {localFestival.max_capacity.toLocaleString()}</span>
                </div>
              )}

              {localFestival.ticket_price && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <CurrencyEuroIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                  <span className="text-white text-sm sm:text-base">Desde {localFestival.ticket_price}€</span>
                </div>
              )}

              {localFestival.website_url && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 flex-shrink-0" />
                  <a 
                    href={localFestival.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 transition-colors text-sm sm:text-base truncate flex items-center"
                  >
                    <span>Sitio web oficial</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {localFestival.description && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Descripción</h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{localFestival.description}</p>
            </div>
          )}

          {/* Organizer info */}
          {localFestival.organizer_info && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Organizador</h3>
              <p className="text-slate-300 text-sm sm:text-base">{localFestival.organizer_info}</p>
            </div>
          )}

          {/* Attendance actions */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">¿Vas a asistir?</h3>
            {isFestivalEnded() ? (
              <div className="text-center py-4 sm:py-6 bg-gray-800/30 rounded-lg mb-4">
                <div className="text-gray-300 text-base sm:text-lg mb-2">✅ Evento finalizado</div>
                <div className="text-gray-500 text-xs sm:text-sm mb-4">
                  Este festival ya ha terminado. No puedes cambiar tu asistencia.
                </div>
                
                {/* Survey buttons for ended festivals */}
                <div className="space-y-2 sm:space-y-3">
                  {isCheckingSurvey ? (
                    <div className="w-full px-3 py-2 bg-slate-700/50 text-slate-400 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                      <span>Verificando participación...</span>
                    </div>
                  ) : hasSubmittedSurvey ? (
                    <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-3 sm:p-4 border border-green-500/30">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-xl sm:text-2xl">✅</span>
                        <span className="text-green-300 font-semibold text-sm sm:text-base">Encuesta Completada</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSurvey(true)}
                      className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                      📊 Tomar Encuesta del Evento
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowStats(true)}
                    className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <span>📈</span>
                    <span>Ver Estadísticas</span>
                  </button>


                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                <button
                  onClick={() => handleStatusChange('have_ticket')}
                  disabled={isUpdating}
                  className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    currentStatus === 'have_ticket'
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-green-600/20'
                  } ${isUpdating && selectedStatus === 'have_ticket' ? 'opacity-50' : ''}`}
                >
                  {isUpdating && selectedStatus === 'have_ticket' ? '...' : '🎫 Tengo entrada'}
                </button>
                
                <button
                  onClick={() => handleStatusChange('thinking_about_it')}
                  disabled={isUpdating}
                  className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    currentStatus === 'thinking_about_it'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-yellow-600/20'
                  } ${isUpdating && selectedStatus === 'thinking_about_it' ? 'opacity-50' : ''}`}
                >
                  {isUpdating && selectedStatus === 'thinking_about_it' ? '...' : '🤔 Tal vez'}
                </button>
                
                <button
                  onClick={() => handleStatusChange('not_going')}
                  disabled={isUpdating}
                  className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    currentStatus === 'not_going'
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-red-600/20'
                  } ${isUpdating && selectedStatus === 'not_going' ? 'opacity-50' : ''}`}
                >
                  {isUpdating && selectedStatus === 'not_going' ? '...' : '❌ No voy'}
                </button>
              </div>
            )}

            {/* Attendance stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
              <div>
                <div className="text-green-400 font-semibold">🎫 {attendanceCounts.have_ticket}</div>
                <div className="text-slate-500">Con entrada</div>
              </div>
              <div>
                <div className="text-yellow-400 font-semibold">🤔 {attendanceCounts.thinking_about_it}</div>
                <div className="text-slate-500">Pensándolo</div>
              </div>
              <div>
                <div className="text-red-400 font-semibold">❌ {attendanceCounts.not_going}</div>
                <div className="text-slate-500">No van</div>
              </div>
            </div>
          </div>

          {/* Attendees */}
          {(attendeesWithTickets.length > 0 || attendeesThinking.length > 0 || attendeesNotGoing.length > 0) && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">¿Quién va?</h3>
              
              {attendeesWithTickets.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-medium text-green-400 mb-2">🎫 Con entrada ({attendeesWithTickets.length})</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {attendeesWithTickets.slice(0, 8).map(attendance => (
                      <div key={attendance.user_id} className="flex items-center space-x-1 sm:space-x-2 bg-green-600/20 px-2 sm:px-3 py-1 rounded-full">
                        <UserAvatar 
                          user={attendance.user} 
                          size="xs" 
                          showBorder={false}
                          className="h-4 w-4 sm:h-6 sm:w-6"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm text-white truncate max-w-16 sm:max-w-20">
                            {attendance.user?.name || 'Usuario'}
                          </span>
                          {attendance.user?.nickname && (
                            <span className="text-xs text-primary-400 truncate max-w-16 sm:max-w-20">
                              @{attendance.user.nickname}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {attendeesWithTickets.length > 8 && (
                      <div className="px-2 sm:px-3 py-1 bg-slate-600 rounded-full text-xs sm:text-sm text-slate-300">
                        +{attendeesWithTickets.length - 8} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {attendeesThinking.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-medium text-yellow-400 mb-2">🤔 Pensándolo ({attendeesThinking.length})</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {attendeesThinking.slice(0, 8).map(attendance => (
                      <div key={attendance.user_id} className="flex items-center space-x-1 sm:space-x-2 bg-yellow-600/20 px-2 sm:px-3 py-1 rounded-full">
                        <UserAvatar 
                          user={attendance.user} 
                          size="xs" 
                          showBorder={false}
                          className="h-4 w-4 sm:h-6 sm:w-6"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm text-white truncate max-w-16 sm:max-w-20">
                            {attendance.user?.name || 'Usuario'}
                          </span>
                          {attendance.user?.nickname && (
                            <span className="text-xs text-primary-400 truncate max-w-16 sm:max-w-20">
                              @{attendance.user.nickname}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {attendeesThinking.length > 8 && (
                      <div className="px-2 sm:px-3 py-1 bg-slate-600 rounded-full text-xs sm:text-sm text-slate-300">
                        +{attendeesThinking.length - 8} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {attendeesNotGoing.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-red-400 mb-2">❌ No van ({attendeesNotGoing.length})</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {attendeesNotGoing.slice(0, 8).map(attendance => (
                      <div key={attendance.user_id} className="flex items-center space-x-1 sm:space-x-2 bg-red-600/20 px-2 sm:px-3 py-1 rounded-full">
                        <UserAvatar 
                          user={attendance.user} 
                          size="xs" 
                          showBorder={false}
                          className="h-4 w-4 sm:h-6 sm:w-6"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm text-white truncate max-w-16 sm:max-w-20">
                            {attendance.user?.name || 'Usuario'}
                          </span>
                          {attendance.user?.nickname && (
                            <span className="text-xs text-primary-400 truncate max-w-16 sm:max-w-20">
                              @{attendance.user.nickname}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {attendeesNotGoing.length > 8 && (
                      <div className="px-2 sm:px-3 py-1 bg-slate-600 rounded-full text-xs sm:text-sm text-slate-300">
                        +{attendeesNotGoing.length - 8} más
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 sm:p-4 md:p-6 border-t border-slate-600/50">
          <button
            onClick={onClose}
            className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Lightbox for poster */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={localFestival?.poster_url}
        imageAlt={`Cartel de ${localFestival?.name}`}
      />

      {/* Survey Modals */}
      <EventSurvey
        event={localFestival}
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        onSubmit={handleSurveySubmit}
      />

      <SurveyStats
        event={localFestival}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />

      <SurveyNotification
        event={localFestival}
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        onTakeSurvey={() => setShowSurvey(true)}
      />
    </div>
  );
};

export default FestivalDetailsModal; 