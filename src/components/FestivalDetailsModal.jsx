'use client'

import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Star, Trophy, Award, CheckCircle, ChevronDown, ChevronUp, Eye, Image } from 'lucide-react';
import useStore from '../store/useStore.js';
import UserAvatar from './UserAvatar.jsx';
import EventSurvey from './EventSurvey.jsx';
import Lightbox from './Lightbox.jsx';

const FestivalDetailsModal = ({ isOpen, onClose, festival }) => {
  const { user, updateFestivalAttendance, submitSurveyResponse, loadSurveyResponses, surveyResponses, totalSurveyResponses } = useStore();
  const [localFestival, setLocalFestival] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [showFullAttendees, setShowFullAttendees] = useState(false);
  const [showFullThinking, setShowFullThinking] = useState(false);
  const [showFullNotGoing, setShowFullNotGoing] = useState(false);
  const [showAllAttendances, setShowAllAttendances] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (festival) {
      setLocalFestival(festival);
    }
  }, [festival]);

  useEffect(() => {
    if (isOpen && localFestival) {
      checkSurveyStatus();
    }
  }, [isOpen, localFestival]);

  const checkSurveyStatus = async () => {
    if (!localFestival || !user) return;

    try {
      // Check if user has already submitted a survey for this festival
      const { data: existingSurvey } = await loadSurveyResponses(localFestival.id);
      
      if (existingSurvey && existingSurvey.length > 0) {
        const userSurvey = existingSurvey.find(survey => survey.user_id === user.id);
        if (userSurvey) {
          setSurveySubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error checking survey status:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (status) => {
    if (!localFestival || !user) return;

    setLoading(true);
    try {
      const { error } = await updateFestivalAttendance(localFestival.id, status);
      
      if (!error) {
        // Update local state
        const updatedAttendances = localFestival.attendances?.filter(a => a.user_id !== user.id) || [];
        updatedAttendances.push({
          user_id: user.id,
          status: status,
          user: user
        });
        
        setLocalFestival({
          ...localFestival,
          attendances: updatedAttendances
        });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveySubmit = async (surveyData) => {
    if (!localFestival || !user) return;

    try {
      const { error } = await submitSurveyResponse(localFestival.id, surveyData);
      
      if (!error) {
        setSurveySubmitted(true);
        setShowSurvey(false);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'have_ticket':
        return 'bg-green-600 hover:bg-green-700';
      case 'thinking_about_it':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'not_going':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'have_ticket':
        return '🎫 Tengo entrada';
      case 'thinking_about_it':
        return '🤔 Pensándolo';
      case 'not_going':
        return '❌ No voy';
      default:
        return '❓ Sin decidir';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'rock': '🎸',
      'pop': '🎤',
      'electronic': '🎧',
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
    const endDate = new Date(localFestival?.end_date);
    const now = new Date();
    return endDate < now;
  };

  // Check if survey is available (7 days after festival ends)
  const isSurveyAvailable = () => {
    if (!isFestivalEnded()) return false;
    
    const endDate = new Date(localFestival?.end_date);
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

  // Get current user's attendance status
  const userAttendance = localFestival.attendances?.find(a => a.user_id === user?.id);
  const currentStatus = userAttendance?.status || '';

  // Calculate total attendees
  const totalAttendees = attendeesWithTickets.length + attendeesThinking.length + attendeesNotGoing.length;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl">
          {/* Header */}
          <div className="relative p-4 sm:p-6 lg:p-8 border-b border-slate-700/50">
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-stretch space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              {/* Festival Image */}
              <div className="relative flex-shrink-0">
                {localFestival.poster_url ? (
                  <div className="relative">
                    <img
                      src={localFestival.poster_url}
                      alt={localFestival.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover rounded-xl border-2 border-slate-700/50"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl border-2 border-slate-700/50 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl lg:text-5xl">{getCategoryIcon(localFestival.category)}</span>
                  </div>
                )}
              </div>

              {/* Festival Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col justify-center">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                  {localFestival.name}
                </h2>
                
                <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                  <div className="flex flex-col justify-center sm:justify-start space-y-1 text-xs sm:text-sm lg:text-base text-slate-300">
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-400 flex-shrink-0" />
                      <span className="font-medium">Inicio:</span>
                      <span>{formatDate(localFestival.start_date)}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-400 flex-shrink-0" />
                      <span className="font-medium">Fin:</span>
                      <span>{formatDate(localFestival.end_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs sm:text-sm lg:text-base text-slate-300">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-400 flex-shrink-0" />
                    <span className="truncate">{localFestival.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs sm:text-sm lg:text-base text-slate-300">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-400 flex-shrink-0" />
                    <span>{totalInterested} personas interesadas</span>
                  </div>
                  
                  {/* Category Badge and View Poster Button */}
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                    <div className="px-3 py-2 sm:px-2 sm:py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm sm:text-xs font-medium transition-colors flex items-center justify-center space-x-2 sm:space-x-1">
                      <span className="text-sm sm:text-xs">{getCategoryIcon(localFestival.category)}</span>
                      <span className="text-sm sm:text-xs">{getCategoryName(localFestival.category)}</span>
                    </div>
                    
                    {localFestival.poster_url && (
                      <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="px-3 py-2 sm:px-2 sm:py-1 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-full text-sm sm:text-xs font-medium transition-colors flex items-center justify-center space-x-2 sm:space-x-1"
                      >
                        <Image className="h-4 w-4 sm:h-3 sm:w-3" />
                        <span className="text-sm sm:text-xs">Ver cartel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Description */}
            {localFestival.description && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Descripción</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {localFestival.description}
                </p>
              </div>
            )}

            {/* Attendance Status */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Tu estado</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => handleStatusChange('have_ticket')}
                  disabled={loading}
                  className={`flex items-center justify-center space-x-2 py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                    currentStatus === 'have_ticket' 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <span>🎫</span>
                  <span>Tengo entrada</span>
                  {currentStatus === 'have_ticket' && <CheckCircle className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => handleStatusChange('thinking_about_it')}
                  disabled={loading}
                  className={`flex items-center justify-center space-x-2 py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                    currentStatus === 'thinking_about_it' 
                      ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/25' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <span>🤔</span>
                  <span>Pensándolo</span>
                  {currentStatus === 'thinking_about_it' && <CheckCircle className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => handleStatusChange('not_going')}
                  disabled={loading}
                  className={`flex items-center justify-center space-x-2 py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                    currentStatus === 'not_going' 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/25' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <span>❌</span>
                  <span>No voy</span>
                  {currentStatus === 'not_going' && <CheckCircle className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Attendees */}
            {(attendeesWithTickets.length > 0 || attendeesThinking.length > 0 || attendeesNotGoing.length > 0) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-white">¿Quién va?</h3>
                  {totalAttendees > 0 && (
                    <button
                      onClick={() => setShowAllAttendances(!showAllAttendances)}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{showAllAttendances ? 'Vista compacta' : 'Ver todas las asistencias'}</span>
                    </button>
                  )}
                </div>
                
                {showAllAttendances ? (
                  // Vista completa de todas las asistencias
                  <div className="space-y-4">
                    {attendeesWithTickets.length > 0 && (
                      <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4">
                        <h4 className="text-sm sm:text-base font-medium text-green-400 mb-3">🎫 Con entrada ({attendeesWithTickets.length})</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {attendeesWithTickets.map(attendance => (
                            <div key={attendance.user_id} className="flex items-center space-x-2 bg-green-600/20 px-3 py-2 rounded-lg">
                              <UserAvatar 
                                user={attendance.user} 
                                size="sm" 
                                showBorder={false}
                                className="h-6 w-6 sm:h-8 sm:w-8"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm sm:text-base text-white font-medium truncate">
                                  {attendance.user?.name || 'Usuario'}
                                </div>
                                {attendance.user?.nickname && (
                                  <div className="text-xs text-primary-400 truncate">
                                    @{attendance.user.nickname}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {attendeesThinking.length > 0 && (
                      <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
                        <h4 className="text-sm sm:text-base font-medium text-yellow-400 mb-3">🤔 Pensándolo ({attendeesThinking.length})</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {attendeesThinking.map(attendance => (
                            <div key={attendance.user_id} className="flex items-center space-x-2 bg-yellow-600/20 px-3 py-2 rounded-lg">
                              <UserAvatar 
                                user={attendance.user} 
                                size="sm" 
                                showBorder={false}
                                className="h-6 w-6 sm:h-8 sm:w-8"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm sm:text-base text-white font-medium truncate">
                                  {attendance.user?.name || 'Usuario'}
                                </div>
                                {attendance.user?.nickname && (
                                  <div className="text-xs text-primary-400 truncate">
                                    @{attendance.user.nickname}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {attendeesNotGoing.length > 0 && (
                      <div className="bg-red-600/10 border border-red-500/20 rounded-xl p-4">
                        <h4 className="text-sm sm:text-base font-medium text-red-400 mb-3">❌ No van ({attendeesNotGoing.length})</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {attendeesNotGoing.map(attendance => (
                            <div key={attendance.user_id} className="flex items-center space-x-2 bg-red-600/20 px-3 py-2 rounded-lg">
                              <UserAvatar 
                                user={attendance.user} 
                                size="sm" 
                                showBorder={false}
                                className="h-6 w-6 sm:h-8 sm:w-8"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm sm:text-base text-white font-medium truncate">
                                  {attendance.user?.name || 'Usuario'}
                                </div>
                                {attendance.user?.nickname && (
                                  <div className="text-xs text-primary-400 truncate">
                                    @{attendance.user.nickname}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Vista compacta con botones de expansión
                  <div>
                    {attendeesWithTickets.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs sm:text-sm font-medium text-green-400">🎫 Con entrada ({attendeesWithTickets.length})</h4>
                          {attendeesWithTickets.length > 8 && (
                            <button
                              onClick={() => setShowFullAttendees(!showFullAttendees)}
                              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              <span>{showFullAttendees ? 'Ver menos' : 'Ver todos'}</span>
                              {showFullAttendees ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {(showFullAttendees ? attendeesWithTickets : attendeesWithTickets.slice(0, 8)).map(attendance => (
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
                          {!showFullAttendees && attendeesWithTickets.length > 8 && (
                            <button
                              onClick={() => setShowFullAttendees(true)}
                              className="px-2 sm:px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-full text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
                            >
                              +{attendeesWithTickets.length - 8} más
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {attendeesThinking.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs sm:text-sm font-medium text-yellow-400">🤔 Pensándolo ({attendeesThinking.length})</h4>
                          {attendeesThinking.length > 8 && (
                            <button
                              onClick={() => setShowFullThinking(!showFullThinking)}
                              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              <span>{showFullThinking ? 'Ver menos' : 'Ver todos'}</span>
                              {showFullThinking ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {(showFullThinking ? attendeesThinking : attendeesThinking.slice(0, 8)).map(attendance => (
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
                          {!showFullThinking && attendeesThinking.length > 8 && (
                            <button
                              onClick={() => setShowFullThinking(true)}
                              className="px-2 sm:px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-full text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
                            >
                              +{attendeesThinking.length - 8} más
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {attendeesNotGoing.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs sm:text-sm font-medium text-red-400">❌ No van ({attendeesNotGoing.length})</h4>
                          {attendeesNotGoing.length > 8 && (
                            <button
                              onClick={() => setShowFullNotGoing(!showFullNotGoing)}
                              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              <span>{showFullNotGoing ? 'Ver menos' : 'Ver todos'}</span>
                              {showFullNotGoing ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {(showFullNotGoing ? attendeesNotGoing : attendeesNotGoing.slice(0, 8)).map(attendance => (
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
                          {!showFullNotGoing && attendeesNotGoing.length > 8 && (
                            <button
                              onClick={() => setShowFullNotGoing(true)}
                              className="px-2 sm:px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-full text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
                            >
                              +{attendeesNotGoing.length - 8} más
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Survey Section */}
            {isSurveyAvailable() && !surveySubmitted && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3">📊 Encuesta del Festival</h3>
                <p className="text-sm sm:text-base text-slate-300 mb-4">
                  ¡El festival ha terminado! Comparte tu experiencia para ayudar a otros festivaleros.
                </p>
                <button
                  onClick={() => setShowSurvey(true)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  📝 Completar Encuesta
                </button>
              </div>
            )}

            {surveySubmitted && (
              <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm sm:text-base text-green-400 font-medium">
                    ✅ Encuesta completada
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-green-300 mt-2">
                  ¡Gracias por compartir tu experiencia! Tus respuestas ayudan a mejorar la comunidad.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-8 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                Cerrar
              </button>
              
              {isSurveyAvailable() && !surveySubmitted && (
                <button
                  onClick={() => setShowSurvey(true)}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  📊 Ver Encuesta
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for festival image */}
      {localFestival?.poster_url && (
        <Lightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageUrl={localFestival.poster_url}
          imageAlt={`Cartel de ${localFestival.name}`}
        />
      )}

      {/* Survey Modal */}
      {showSurvey && (
        <EventSurvey
          event={localFestival}
          isOpen={showSurvey}
          onClose={() => setShowSurvey(false)}
          onSubmit={handleSurveySubmit}
        />
      )}
    </>
  );
};

export default FestivalDetailsModal; 