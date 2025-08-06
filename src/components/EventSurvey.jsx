import { useState, useEffect } from 'react';
import { Star, Trophy, Users, Calendar, Music, Heart, Award, Ghost, Beer, Crown } from 'lucide-react';
import useStore from '../store/useStore.js';
import { supabase } from '../lib/supabase.js';

const EventSurvey = ({ event, isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [badgeNominations, setBadgeNominations] = useState({});
  const [eventParticipants, setEventParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const { users, loadBadgeDefinitions, badgeDefinitions, loadUsers, festivals, loadFestivals } = useStore();

  useEffect(() => {
    if (isOpen && event?.id) {
      console.log('Loading survey data for event:', event.name, event.id);
      loadData();
    }
  }, [isOpen, event?.id]);

  // Asegurar que las insignias se carguen cuando se abre la encuesta
  useEffect(() => {
    if (isOpen && badgeDefinitions.length === 0) {
      console.log('🔄 Loading badge definitions for survey...');
      loadBadgeDefinitions();
    }
  }, [isOpen, badgeDefinitions.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users if not already loaded
      if (users.length === 0) {
        await loadUsers();
      }
      
      // Verify users are loaded
      if (users.length === 0) {
        console.error('No users loaded from store');
        return;
      }
      
      // Load badge definitions
      const { data: badgeData, error: badgeError } = await loadBadgeDefinitions();
      console.log('🔍 Badge definitions loaded:', badgeData?.length || 0, 'badges');
      if (badgeError) {
        console.error('❌ Error loading badge definitions:', badgeError);
      }
      if (badgeData && badgeData.length > 0) {
        console.log('📋 Available badges:', badgeData.map(b => ({ name: b.name, key: b.badge_key, active: b.is_active })));
      }
      
      // Obtener las asistencias del festival directamente
      console.log('🔍 Loading attendances for festival:', event.id, event.name);
      
      const { data: attendancesData, error: attendancesError } = await supabase
        .from('festival_attendances')
        .select(`
          user_id,
          status,
          user:users(id, name, nickname, avatar_url, city)
        `)
        .eq('festival_id', event.id);
      
      if (attendancesError) {
        console.error('❌ Error loading attendances:', attendancesError);
        return;
      }
      
      console.log('🎪 Attendances loaded:', attendancesData?.length || 0, 'attendances');
      if (attendancesData && attendancesData.length > 0) {
        console.log('📋 Attendance details:');
        attendancesData.forEach(att => {
          console.log(`  - User: ${att.user?.name || 'Unknown'} (${att.user_id}), Status: ${att.status}`);
        });
      } else {
        console.log('⚠️ No attendances found for this festival');
      }
      
      const festivalWithAttendances = {
        ...event,
        attendances: attendancesData || []
      };
      
      console.log('🎪 Festival data loaded:', {
        name: festivalWithAttendances.name,
        id: festivalWithAttendances.id,
        attendancesCount: festivalWithAttendances.attendances?.length || 0
      });
      
      if (festivalWithAttendances.attendances && festivalWithAttendances.attendances.length > 0) {
        console.log('📋 Attendance details:');
        festivalWithAttendances.attendances.forEach(att => {
          console.log(`  - User ID: ${att.user_id}, Status: ${att.status}, User: ${att.user?.name || 'Unknown'}`);
        });
      }
      
      // Verify festival has attendances
      if (!festivalWithAttendances.attendances || festivalWithAttendances.attendances.length === 0) {
        console.error('No attendances found for festival:', festivalWithAttendances.name);
        setEventParticipants([]);
        return;
      }
      
      // Get event participants directly from attendances data
      console.log('🎪 Attendances in festival:', festivalWithAttendances.attendances.length);
      console.log('📋 Raw attendances data:', festivalWithAttendances.attendances);
      
      const attendees = festivalWithAttendances.attendances
        .filter(attendance => {
          const hasUser = !!attendance.user;
          if (!hasUser) {
            console.log('❌ Attendance without user data:', attendance);
          }
          return hasUser;
        })
        .map(attendance => {
          console.log('✅ Processing user:', attendance.user);
          return attendance.user;
        });
      
      console.log('✅ Event participants found:', attendees.length);
      console.log('👥 Participants:', attendees.map(u => ({ 
        id: u.id, 
        name: u.name, 
        nickname: u.nickname, 
        status: festivalWithAttendances.attendances.find(a => a.user_id === u.id)?.status 
      })));
      
      setEventParticipants(attendees);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

    // Generic survey questions that work for any event
  const surveyQuestions = [
    {
      id: 'overall_rating',
      question: '¿Cómo valorarías el evento en general?',
      type: 'rating',
      maxRating: 5
    },
    {
      id: 'enjoyment_level',
      question: '¿Qué tan divertido te lo has pasado?',
      type: 'select',
      options: ['¡Increíble!', 'Muy bien', 'Bien', 'Regular', 'No me ha gustado']
    },
    {
      id: 'best_moment',
      question: '¿Cuál ha sido tu momento favorito?',
      type: 'text',
      placeholder: 'Describe tu momento más épico...'
    },
    {
      id: 'atmosphere_rating',
      question: '¿Cómo valorarías el ambiente del evento?',
      type: 'rating',
      maxRating: 5
    },
    {
      id: 'would_recommend',
      question: '¿Recomendarías este evento a un amigo?',
      type: 'select',
      options: ['¡Por supuesto!', 'Probablemente', 'No estoy seguro', 'No lo recomendaría']
    },
    {
      id: 'organization_rating',
      question: '¿Cómo valorarías la organización del evento?',
      type: 'rating',
      maxRating: 5
    },
    {
      id: 'improvements',
      question: '¿Qué mejorarías para la próxima edición?',
      type: 'text',
      placeholder: 'Tus sugerencias nos ayudan a mejorar...'
    },
    {
      id: 'would_attend_again',
      question: '¿Asistirías a otro evento similar?',
      type: 'select',
      options: ['¡Definitivamente!', 'Probablemente', 'No estoy seguro', 'No creo']
    }
  ];

  // Badge questions that appear after survey questions
  const getBadgeQuestions = () => {
    console.log('🔍 Getting badge questions. Badge definitions:', badgeDefinitions?.length || 0);
    
    if (!badgeDefinitions || badgeDefinitions.length === 0) {
      console.log('❌ No badge definitions available');
      return [];
    }
    
    console.log('📋 All badge definitions:', badgeDefinitions.map(b => ({ 
      name: b.name, 
      key: b.badge_key, 
      active: b.is_active,
      id: b.id 
    })));
    
    // Filter out only app_creator and wacho_patron badges
    const assignableBadges = badgeDefinitions.filter(badge => {
      const isWachoPatron = badge.badge_key === 'wacho_patron';
      const isAppCreator = badge.badge_key === 'app_creator';
      
      if (isWachoPatron) {
        console.log('🚫 Excluding badge:', badge.name, 'with key:', badge.badge_key);
      }
      if (isAppCreator) {
        console.log('🚫 Excluding badge:', badge.name, 'with key:', badge.badge_key);
      }
      
      const isAssignable = !isWachoPatron && !isAppCreator;
      console.log(`✅ Badge "${badge.name}" is assignable:`, isAssignable);
      
      return isAssignable;
    });
    
    console.log('🏆 All assignable badges:', assignableBadges.map(b => b.name));
    console.log('📝 Total assignable badges:', assignableBadges.length);
    
    // Shuffle the badges and take 8 random ones
    const shuffledBadges = [...assignableBadges].sort(() => Math.random() - 0.5);
    const randomBadges = shuffledBadges.slice(0, 8);
    
    console.log('🎲 Random badges selected:', randomBadges.map(b => b.name));
    
    const badgeQuestions = randomBadges.map(badge => ({
      id: `badge_${badge.id}`,
      question: `¿Quién merece la insignia "${badge.name}"?`,
      type: 'badge',
      badge: badge,
      description: badge.description
    }));
    
    console.log('❓ Badge questions created:', badgeQuestions.length);
    return badgeQuestions;
  };

  const badgeQuestions = getBadgeQuestions();
  const allQuestions = [...surveyQuestions, ...badgeQuestions];
  console.log('📊 Total questions:', allQuestions.length, 'Survey questions:', surveyQuestions.length, 'Badge questions:', badgeQuestions.length);
  console.log('🏆 Badge questions details:', badgeQuestions.map(q => ({ id: q.id, question: q.question, badge: q.badge?.name })));

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };



  const handleNext = () => {
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      // Clear search when moving to next question
      setParticipantSearch('');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Clear search when moving to previous question
      setParticipantSearch('');
    }
  };

  const handleSubmit = () => {
    // Validate that all survey questions are answered
    const unansweredSurveyQuestions = surveyQuestions.filter(q => !answers[q.id]);
    
    if (unansweredSurveyQuestions.length > 0) {
      alert('Por favor, responde todas las preguntas de la encuesta antes de enviar.');
      return;
    }

    // Process badge nominations from answers
    const processedBadgeNominations = {};
    getBadgeQuestions().forEach(badgeQuestion => {
      const selectedUserId = answers[badgeQuestion.id];
      if (selectedUserId) {
        processedBadgeNominations[badgeQuestion.badge.id] = selectedUserId;
      }
    });

    const surveyData = {
      eventId: event?.id,
      answers: Object.fromEntries(
        Object.entries(answers).filter(([key]) => !key.startsWith('badge_'))
      ),
      badgeNominations: processedBadgeNominations,
      submittedAt: new Date().toISOString()
    };
    
    console.log('Enviando encuesta:', surveyData);
    onSubmit(surveyData);
    onClose();
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'select':
        return (
          <div className="space-y-2 sm:space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-left text-sm sm:text-base ${
                  answers[question.id] === option
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-800/50 text-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex justify-center space-x-1 sm:space-x-2">
            {Array.from({ length: question.maxRating }, (_, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(question.id, i + 1)}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                  answers[question.id] >= i + 1
                    ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                    : 'text-slate-400 border-slate-600'
                } border-2`}
              >
                <Star className="w-6 h-6 sm:w-8 sm:h-8" fill={answers[question.id] >= i + 1 ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-3 sm:p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-300 placeholder-slate-500 focus:border-primary-500 focus:outline-none resize-none text-sm sm:text-base"
            rows={3}
          />
        );

      case 'badge':
        console.log('🎯 Rendering badge question:', question.badge?.name);
        console.log('👥 Event participants:', eventParticipants.length);
        console.log('📋 Event participants data:', eventParticipants);
        console.log('🔍 Search term:', participantSearch);
        
        const filteredParticipants = eventParticipants.filter(participant => {
          const searchTerm = participantSearch.toLowerCase();
          const name = (participant.name || '').toLowerCase();
          const nickname = (participant.nickname || '').toLowerCase();
          const city = (participant.city || '').toLowerCase();
          
          const matches = name.includes(searchTerm) || 
                 nickname.includes(searchTerm) || 
                 city.includes(searchTerm);
          
          console.log(`🔍 User ${participant.name}: matches="${matches}" (name:${name.includes(searchTerm)}, nick:${nickname.includes(searchTerm)}, city:${city.includes(searchTerm)})`);
          
          return matches;
        });
        
        console.log('🔍 Filtered participants:', filteredParticipants.length);

        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${question.badge.color_gradient} rounded-xl flex items-center justify-center text-xl sm:text-2xl`}>
                  {question.badge.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-semibold text-sm sm:text-base">{question.badge.name}</h4>
                  <p className="text-slate-400 text-xs sm:text-sm">{question.badge.description}</p>
                </div>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar participantes..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full p-2 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
              />
              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </div>
            
            {eventParticipants.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Sin participantes</h4>
                <p className="text-slate-400 text-sm sm:text-base">No hay participantes registrados para asignar esta insignia</p>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Sin resultados</h4>
                <p className="text-slate-400 text-sm sm:text-base">No se encontraron participantes con "{participantSearch}"</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                <div className="text-xs sm:text-sm text-slate-400 mb-2">
                  {filteredParticipants.length} de {eventParticipants.length} participantes
                </div>
                {filteredParticipants.map((participant) => (
                  <button
                    key={participant.id}
                    onClick={() => handleAnswer(question.id, participant.id)}
                    className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 ${
                      answers[question.id] === participant.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {participant.avatar_url ? (
                      <img
                        src={participant.avatar_url}
                        alt={participant.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 border-2 border-primary-500/30"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm text-white font-semibold">
                          {(participant.name || participant.nickname || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-white font-medium text-sm sm:text-base truncate">
                        {participant.name || 'Usuario'}
                      </div>
                      {participant.nickname && (
                        <div className="text-primary-400 text-xs sm:text-sm truncate">
                          @{participant.nickname}
                        </div>
                      )}
                      {participant.city && (
                        <div className="text-slate-400 text-xs sm:text-sm truncate">
                          📍 {participant.city}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto border border-slate-600/50 shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Encuesta del Evento</h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base">Ayúdanos a mejorar contando tu experiencia</p>
        </div>

        {/* Progress bar */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-2">
            <span>
              {currentStep < allQuestions.length 
                ? `Pregunta ${currentStep + 1} de ${allQuestions.length}`
                : 'Completado'
              }
            </span>
            <span>
              {currentStep < allQuestions.length 
                ? `${Math.round(((currentStep + 1) / allQuestions.length) * 100)}%`
                : '100%'
              }
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ 
                width: currentStep < allQuestions.length 
                  ? `${((currentStep + 1) / allQuestions.length) * 100}%`
                  : '100%'
              }}
            ></div>
          </div>
        </div>

        {/* Content */}
        {currentStep < allQuestions.length ? (
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4">
                {allQuestions[currentStep].question}
              </h3>
              {renderQuestion(allQuestions[currentStep])}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-3 sm:pt-4 md:pt-6">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-slate-700/50 text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-all duration-300 text-xs sm:text-sm md:text-base"
              >
                Anterior
              </button>
              <button
                onClick={currentStep === allQuestions.length - 1 ? handleSubmit : handleNext}
                disabled={!answers[allQuestions[currentStep].id]}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-purple-700 transition-all duration-300 text-xs sm:text-sm md:text-base"
              >
                {currentStep === allQuestions.length - 1 ? 'Enviar Encuesta' : 'Siguiente'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">¡Encuesta Completada!</h3>
            <p className="text-slate-400 text-sm sm:text-base">Gracias por compartir tu experiencia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSurvey; 