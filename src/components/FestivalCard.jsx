import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye, Image, ClipboardList, BarChart3 } from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import Lightbox from './Lightbox.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import useSurveyModalStore from '../store/surveyModalStore.js';

const FestivalCard = ({ festival, onEdit, onViewDetails }) => {
  const { user, updateAttendance, deleteFestival, checkSurveySubmitted } = useStore();
  const { openSurvey, openSurveyStats } = useSurveyModalStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [localCurrentStatus, setLocalCurrentStatus] = useState('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [hasSubmittedSurvey, setHasSubmittedSurvey] = useState(false);
  const [isCheckingSurvey, setIsCheckingSurvey] = useState(false);
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

  // Get user's current attendance status
  const userAttendance = festival.attendances?.find(a => a.user_id === user?.id);
  const currentStatus = localCurrentStatus || userAttendance?.status || '';

  // Update local status when festival changes
  useEffect(() => {
    if (festival) {
      const userAttendance = festival.attendances?.find(a => a.user_id === user?.id);
      setLocalCurrentStatus(userAttendance?.status || '');
    }
  }, [festival, user?.id]);

  // Check if user has already submitted survey for ended festivals
  useEffect(() => {
    const checkSurveyStatus = async () => {
      if (festival && user && isFestivalEnded() && getSurveyStatus().status === 'available') {
        setIsCheckingSurvey(true);
        try {
          console.log('🔍 Checking survey status for festival:', festival.id, 'user:', user.id);
          const { data: hasSubmitted } = await checkSurveySubmitted(festival.id);
          setHasSubmittedSurvey(hasSubmitted || false);
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

    checkSurveyStatus();
  }, [festival, user, checkSurveySubmitted]);

  // Listen for survey submission to update local state
  useEffect(() => {
    const { showSurvey } = useSurveyModalStore.getState();
    if (!showSurvey && hasSubmittedSurvey === false && festival && user && isFestivalEnded()) {
      // Survey modal was closed, check if user submitted
      const checkIfSubmitted = async () => {
        try {
          console.log('🔍 Re-checking survey status after modal close');
          const { data: hasSubmitted } = await checkSurveySubmitted(festival.id);
          setHasSubmittedSurvey(hasSubmitted || false);
        } catch (error) {
          console.error('Error checking survey status after submission:', error);
        }
      };
      checkIfSubmitted();
    }
  }, [useSurveyModalStore.getState().showSurvey, festival, user, hasSubmittedSurvey]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStatusChange = async (status) => {
    if (isUpdating || !user) return;
    
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
      // Show success message
      toast.success('¡Actualizado!', 'Tu asistencia se ha actualizado correctamente');
    }
    
    setIsUpdating(false);
    setSelectedStatus('');
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

  const handleDelete = () => {
    setIsDeleteConfirmationOpen(true);
    setShowMenu(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      console.log('🗑️ Attempting to delete festival:', festival.id);
      
      const result = await deleteFestival(festival.id);
      
      if (result.error) {
        toast.error('Error', result.error.message || 'No se pudo eliminar el festival');
        console.error('❌ Error deleting festival:', result.error);
      } else {
        toast.success('¡Eliminado!', 'Festival eliminado correctamente');
        console.log('✅ Festival deleted successfully');
        // Close the confirmation modal
        setIsDeleteConfirmationOpen(false);
      }
    } catch (error) {
      console.error('❌ Exception deleting festival:', error);
      toast.error('Error', 'Error inesperado al eliminar el festival');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(festival);
    }
  };

  const handleViewDetails = () => {
    setShowMenu(false);
    if (onViewDetails) {
      onViewDetails(festival);
    }
  };

  // Check if user can edit/delete (is creator or admin)
  const canModify = user && (festival.created_by === user.id || user.role === 'admin');

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

  const getSurveyStatus = () => {
    if (!isFestivalEnded()) {
      return { status: 'not_available', text: 'Evento en curso' };
    }

    const endDate = new Date(festival.end_date);
    const surveyEndDate = new Date(endDate.getTime() + (12 * 24 * 60 * 60 * 1000)); // 12 días después
    const now = new Date();

    if (now > surveyEndDate) {
      return { status: 'closed', text: 'Encuesta cerrada' };
    }

    const timeLeft = surveyEndDate - now;
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (daysLeft > 0) {
      return { 
        status: 'available', 
        text: `Encuesta disponible - ${daysLeft}d ${hoursLeft}h restantes` 
      };
    } else {
      return { 
        status: 'available', 
        text: `Encuesta disponible - ${hoursLeft}h restantes` 
      };
    }
  };

  const getSurveyStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-600';
      case 'closed':
        return 'bg-transparent';
      case 'not_available':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const attendanceCounts = {
    have_ticket: festival.attendances?.filter(a => a.status === 'have_ticket').length || 0,
    thinking_about_it: festival.attendances?.filter(a => a.status === 'thinking_about_it').length || 0,
    not_going: festival.attendances?.filter(a => a.status === 'not_going').length || 0,
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-2 border-primary-500/30 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-400/50 transition-all duration-300 no-animation-mobile no-hover-mobile no-scale-mobile">
      {/* Festival image/header */}
      <div className="relative mb-6">
        {festival.poster_url ? (
          <div className="relative group">
            <img
              src={festival.poster_url}
              alt={festival.name}
              className="w-full h-52 sm:h-56 object-cover object-top rounded-xl border border-slate-600/30 shadow-lg"
              onClick={() => setIsLightboxOpen(true)}
            />
            
            {/* View poster button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-3 left-3 px-3 py-2 bg-black/60 hover:bg-black/80 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg backdrop-blur-sm"
            >
              <Image className="h-4 w-4" />
              <span>Ver cartel</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-52 sm:h-56 bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-xl border border-slate-600/30 flex items-center justify-center shadow-lg">
            <div className="text-7xl">{getCategoryIcon(festival.category)}</div>
          </div>
        )}

        {/* Options menu */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 bg-black/60 hover:bg-black/80 rounded-lg transition-all duration-300 backdrop-blur-sm shadow-lg"
            >
              <MoreVertical className="h-4 w-4 text-white" />
            </button>

            {showMenu && (
              <div className="absolute top-10 left-0 dropdown-menu rounded-lg z-10 min-w-[160px]">
                <div className="py-1">
                  <button
                    onClick={handleViewDetails}
                    className="btn-primary flex items-center px-3 py-2 text-sm w-full text-left mx-1 mb-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </button>
                  
                  {canModify && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 w-full text-left transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </button>
                      
                      <div className="border-t border-slate-600/50 my-1"></div>
                      
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full text-left transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Festival info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-white line-clamp-2 flex-1 pr-3">
            {festival.name}
          </h3>
          {festival.category && (
            <span className="px-3 py-2 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium flex-shrink-0 border border-primary-500/30 backdrop-blur-sm">
              {getCategoryIcon(festival.category)} {getCategoryName(festival.category)}
            </span>
          )}
        </div>

        {/* Description */}
        {festival.description && (
          <p className="text-sm sm:text-base text-white/85 line-clamp-3 p-4 bg-slate-700/40 border border-slate-600/40 rounded-xl backdrop-blur-sm shadow-inner">
            {festival.description}
          </p>
        )}

        <div className="space-y-3 text-sm sm:text-base text-white/85">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-primary-400 flex-shrink-0" />
              <span className="font-medium">
                {formatDate(festival.start_date)}
                {festival.start_date !== festival.end_date && 
                  ` - ${formatDate(festival.end_date)}`
                }
              </span>
            </div>
            {isFestivalEnded() && (
              <span className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
                <span>✅</span>
                <span>Finalizado</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0" />
            <span className="line-clamp-1 font-medium">{festival.location}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-primary-400 flex-shrink-0" />
            <span className="font-medium">
              {attendanceCounts.have_ticket + attendanceCounts.thinking_about_it} interesados
            </span>
          </div>
        </div>



        {/* Survey Section */}
        {isFestivalEnded() && getSurveyStatus().status === 'available' && (
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white/90 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Encuesta del Festival
              </h4>
              <div className="px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-400 rounded-full text-xs font-medium">
                Disponible
              </div>
            </div>
            
            {/* Time remaining */}
            <div className="mb-3 px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-300">
                <span>⏰</span>
                <span>{getSurveyStatus().text.split(' - ')[1]}</span>
              </div>
            </div>
            
            {isCheckingSurvey ? (
              <div className="w-full px-4 py-3 bg-slate-700/50 text-slate-400 rounded-lg text-sm font-medium flex items-center justify-center space-x-3 border border-slate-600/50">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                <span>Verificando participación...</span>
              </div>
            ) : hasSubmittedSurvey ? (
              <div className="w-full px-4 py-3 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium flex items-center justify-center space-x-3">
                <span>✅</span>
                <span>Ya participaste en la encuesta</span>
              </div>
            ) : (
              <button
                onClick={() => openSurvey(festival)}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-green-500/25"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Participar en la Encuesta</span>
              </button>
            )}
          </div>
        )}

        {/* Attendance buttons */}
        <div className="space-y-3">
          {!isFestivalEnded() && (
            <>
              {/* Selection Section */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                  Tu estado de asistencia
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleStatusChange('have_ticket')}
                    disabled={isUpdating}
                    className={`relative group p-3 sm:p-4 rounded-xl text-sm font-medium no-animation-mobile no-hover-mobile no-scale-mobile transition-all duration-200 ${
                      currentStatus === 'have_ticket'
                        ? 'bg-white/80 text-slate-800 font-bold shadow-lg border-2 border-green-500 backdrop-blur-sm'
                        : 'bg-slate-800/80 text-white/90 hover:bg-slate-700/80 border-2 border-slate-600/50 backdrop-blur-sm'
                    } ${isUpdating && selectedStatus === 'have_ticket' ? 'opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center space-y-1.5">
                      <span className="text-xl sm:text-2xl">🎫</span>
                      <span className={`text-xs text-center ${
                      currentStatus === 'have_ticket'
                        ? 'font-bold' : 'font-medium'}`}>
                        {isUpdating && selectedStatus === 'have_ticket' ? '...' : 'Tengo entrada'}
                      </span>
                    </div>
                    {currentStatus === 'have_ticket' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('thinking_about_it')}
                    disabled={isUpdating}
                    className={`relative group p-3 sm:p-4 rounded-xl text-sm font-medium no-animation-mobile no-hover-mobile no-scale-mobile transition-all duration-200 ${
                      currentStatus === 'thinking_about_it'
                        ? 'bg-white/80 text-slate-800 font-bold shadow-lg border-2 border-yellow-500 backdrop-blur-sm'
                        : 'bg-slate-800/80 text-white/90 hover:bg-slate-700/80 border-2 border-slate-600/50 backdrop-blur-sm'
                    } ${isUpdating && selectedStatus === 'thinking_about_it' ? 'opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center space-y-1.5">
                      <span className="text-xl sm:text-2xl">🤔</span>
                      <span className={`text-xs text-center ${
                      currentStatus === 'thinking_about_it'
                        ? 'font-bold' : 'font-medium'}`}>
                        {isUpdating && selectedStatus === 'thinking_about_it' ? '...' : 'Me lo pienso'}
                      </span>
                    </div>
                    {currentStatus === 'thinking_about_it' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('not_going')}
                    disabled={isUpdating}
                    className={`relative group p-3 sm:p-4 rounded-xl text-sm font-medium no-animation-mobile no-hover-mobile no-scale-mobile transition-all duration-200 ${
                      currentStatus === 'not_going'
                        ? 'bg-white/80 text-slate-800 font-bold shadow-lg border-2 border-red-500 backdrop-blur-sm'
                        : 'bg-slate-800/80 text-white/90 hover:bg-slate-700/80 border-2 border-slate-600/50 backdrop-blur-sm'
                    } ${isUpdating && selectedStatus === 'not_going' ? 'opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center space-y-1.5">
                      <span className="text-xl sm:text-2xl">❌</span>
                      <span className={`text-xs text-center ${
                      currentStatus === 'not_going'
                        ? 'font-bold' : 'font-medium'}`}>
                        {isUpdating && selectedStatus === 'not_going' ? '...' : 'No voy'}
                      </span>
                    </div>
                    {currentStatus === 'not_going' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Statistics Section */}
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>
                  Estadísticas de asistencia
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-700/30 border border-slate-600/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-xl">🎫</span>
                      <span className="text-green-400 font-bold text-lg">{attendanceCounts.have_ticket}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">Con entrada</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/30 border border-slate-600/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-xl">🤔</span>
                      <span className="text-yellow-400 font-bold text-lg">{attendanceCounts.thinking_about_it}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">Pensándolo</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/30 border border-slate-600/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-xl">❌</span>
                      <span className="text-red-400 font-bold text-lg">{attendanceCounts.not_going}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">No van</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* View details button */}
        <button 
          onClick={handleViewDetails}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/25 no-animation-mobile no-hover-mobile no-scale-mobile"
        >
          Ver Detalles
        </button>
      </div>

      {/* Survey results button - when survey is closed */}
      {isFestivalEnded() && getSurveyStatus().status === 'closed' && (
        <button
          onClick={() => openSurveyStats(festival)}
          className="w-full mt-2 px-3 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-green-500/25"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Ver Resultados de la Encuesta</span>
        </button>
      )}

      {/* Lightbox for poster */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={festival?.poster_url}
        imageAlt={`Cartel de ${festival?.name}`}
      />

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="🗑️ Eliminar Festival"
        message="¿Estás seguro de que quieres eliminar este festival? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </div>
  );
};

export default FestivalCard; 