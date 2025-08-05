import { useState, useEffect } from 'react';
import { BarChart3, Users, Trophy, Star, TrendingUp, Award, Music, Calendar, Heart, MessageSquare } from 'lucide-react';
import useStore from '../store/useStore.js';
import { supabase } from '../lib/supabase.js';

const SurveyStats = ({ event, surveyData, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [textResponses, setTextResponses] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [isClosingSurvey, setIsClosingSurvey] = useState(false);
  const [surveyClosed, setSurveyClosed] = useState(false);
  const { updateFestivalStatistics, getBadgeWinners, getSurveyTextResponses, closeSurveyAndProcessResults, user } = useStore();

  useEffect(() => {
    if (isOpen && event?.id) {
      loadFestivalStats();
    }
  }, [isOpen, event?.id]);

  const loadFestivalStats = async () => {
    setLoading(true);
    try {
      // Update statistics first
      await updateFestivalStatistics(event.id);
      
      // Get badge winners
      const { data: badgeWinners } = await getBadgeWinners(event.id);
      
      // Get text responses
      const { data: responses } = await getSurveyTextResponses(event.id);
      setTextResponses(responses || []);
      
      // Get real statistics from the database
      const { data: festivalStats, error: statsError } = await supabase
        .from('festival_statistics')
        .select('*')
        .eq('festival_id', event.id)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching festival statistics:', statsError);
      }
      
      // Get survey ID to fetch rating distribution
      const { data: survey } = await supabase
        .from('festival_surveys')
        .select('id, is_active')
        .eq('festival_id', event.id)
        .single();
      
      // Check if survey is closed
      if (survey) {
        setSurveyClosed(!survey.is_active);
      }
      
      // Calculate rating distribution from real survey responses
      if (survey?.id) {
        const { data: surveyResponses } = await supabase
          .from('survey_responses')
          .select('responses')
          .eq('survey_id', survey.id);
        
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        if (surveyResponses && surveyResponses.length > 0) {
          surveyResponses.forEach(response => {
            const rating = response.responses?.overall_rating;
            if (rating && rating >= 1 && rating <= 5) {
              distribution[rating] = (distribution[rating] || 0) + 1;
            }
          });
        }
        
        setRatingDistribution(distribution);
        console.log('🔍 Rating distribution loaded:', distribution);
      }
      
      // Use real data from database, fallback to calculated stats if needed
      const realStats = {
        totalParticipants: festivalStats?.total_participants || event.attendees?.length || 0,
        surveyResponses: festivalStats?.survey_responses || surveyData?.length || 0,
        responseRate: festivalStats?.response_rate || (event.attendees?.length > 0 ? Math.round(((surveyData?.length || 0) / event.attendees.length) * 100) : 0),
        averageRating: festivalStats?.average_rating || 0,
        topEnjoyment: festivalStats?.top_enjoyment || 'Sin datos',
        topRecommendation: festivalStats?.top_recommendation || 'Sin datos',
        badgeStats: badgeWinners || {},
        enjoymentRanking: festivalStats?.enjoyment_ranking || [],
        recommendationRanking: festivalStats?.recommendation_ranking || []
      };
      
      console.log('🔍 Real festival stats loaded:', realStats);
      setStats(realStats);
    } catch (error) {
      console.error('Error loading festival stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSurvey = async () => {
    if (!user || !event?.id) return;
    
    // Check if user is the festival creator or has admin privileges
    if (event.created_by !== user.id) {
      const { toast } = require('../store/toastStore.js');
      toast.error('Error', 'Solo el creador del festival puede cerrar la encuesta');
      return;
    }

    const confirmed = confirm('¿Estás seguro de que quieres cerrar la encuesta? Esta acción no se puede deshacer y procesará automáticamente las insignias para los ganadores.');
    
    if (!confirmed) return;

    setIsClosingSurvey(true);
    try {
      const { data, error } = await closeSurveyAndProcessResults(event.id);
      
      if (error) {
        console.error('Error closing survey:', error);
        const { toast } = require('../store/toastStore.js');
        toast.error('Error', 'No se pudo cerrar la encuesta');
        return;
      }

      console.log('Survey closed successfully:', data);
      setSurveyClosed(true);
      
      // Reload stats to show updated information
      await loadFestivalStats();
      
      const { toast } = require('../store/toastStore.js');
      toast.success('Encuesta cerrada', 'La encuesta ha sido cerrada y las insignias han sido asignadas a los ganadores');
      
    } catch (error) {
      console.error('Error closing survey:', error);
      const { toast } = require('../store/toastStore.js');
      toast.error('Error', 'No se pudo cerrar la encuesta');
    } finally {
      setIsClosingSurvey(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats?.totalParticipants || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Participantes</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats?.surveyResponses || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Respuestas</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats?.averageRating || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Valoración Media</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats?.responseRate || 0}%</div>
              <div className="text-slate-400 text-xs sm:text-sm">Tasa Respuesta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-400" />
            Nivel de Diversión
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {(stats?.enjoymentRanking || []).length > 0 ? (
              (stats?.enjoymentRanking || []).slice(0, 3).map((enjoyment, index) => (
                <div key={enjoyment.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' : 
                      index === 1 ? 'bg-gray-400 text-black' : 
                      'bg-orange-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-white font-medium text-sm sm:text-base">{enjoyment.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm sm:text-base">{enjoyment.votes} votos</div>
                    <div className="text-slate-400 text-xs sm:text-sm">{enjoyment.percentage}%</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">Sin datos de diversión aún</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-400" />
            Recomendación
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {(stats?.recommendationRanking || []).length > 0 ? (
              (stats?.recommendationRanking || []).map((recommendation, index) => (
                <div key={recommendation.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' : 
                      index === 1 ? 'bg-gray-400 text-black' : 
                      'bg-orange-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-white font-medium text-sm sm:text-base">{recommendation.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{recommendation.votes} votos</div>
                    <div className="text-slate-400 text-sm">{recommendation.percentage}%</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">Sin datos de recomendación aún</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">🏆 Ganadores de Insignias</h3>
        <p className="text-slate-400">Los miembros más destacados del evento</p>
      </div>

      {/* Survey closure info section */}
      {!surveyClosed && (
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/50">
                        <p className="text-slate-300 mb-3">
                La encuesta se cerrará automáticamente 12 días después del final del festival. 
                Una vez cerrada, los resultados se procesarán automáticamente y las insignias se asignarán a los ganadores.
              </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-400">📅</span>
                          <span className="text-sm text-slate-400">Fecha de cierre:</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {(() => {
                            const endDate = new Date(event.end_date);
                            const surveyEndDate = new Date(endDate.getTime() + (12 * 24 * 60 * 60 * 1000));
                            return surveyEndDate.toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            });
                          })()}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-green-400">✅</span>
                        <span className="text-xs text-slate-400">Procesamiento automático de resultados</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-purple-400">🏆</span>
                        <span className="text-xs text-slate-400">Asignación automática de insignias</span>
                      </div>
                    </div>
        
      )}

      {surveyClosed && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Encuesta Cerrada Automáticamente</h4>
            <p className="text-slate-300">
              La encuesta ha sido cerrada automáticamente por tiempo y las insignias han sido asignadas a los ganadores.
            </p>
          </div>
        </div>
      )}

      {Object.keys(stats?.badgeStats || {}).length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            {surveyClosed ? 'Sin votaciones registradas' : 'Sin votaciones aún'}
          </h4>
          <p className="text-slate-400">
            {surveyClosed 
              ? 'No se registraron votaciones para insignias en esta encuesta'
              : 'Las insignias aparecerán cuando los usuarios voten'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats?.badgeStats || {}).map(([badgeId, badge]) => (
            <div key={badgeId} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{badge.badge?.icon || '🏆'}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{badge.badge?.name || 'Insignia'}</h4>
                <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-xl p-4 border border-primary-500/30 mb-4">
                  <div className="text-2xl font-bold text-primary-300 mb-1">
                    {badge.user?.name || badge.user?.nickname || 'Usuario'}
                  </div>
                  <div className="text-slate-400 text-sm">{badge.votes} votos</div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                  <Award className="w-4 h-4" />
                  <span>
                    {surveyClosed 
                      ? 'Insignia asignada' 
                      : 'Líder en votaciones'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTextResponses = () => {
    const questionLabels = {
      best_moment: 'Momento Favorito',
      improvements: 'Mejoras Sugeridas'
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">💬 Respuestas de Texto</h3>
          <p className="text-sm sm:text-base text-slate-400">Comentarios y sugerencias de los participantes</p>
        </div>

        {textResponses.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">No hay respuestas de texto</h4>
            <p className="text-slate-400">Aún no se han recibido comentarios en las encuestas</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {textResponses.map((response, index) => (
              <div key={response.id} className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-base">
                        {response.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {response.userName}
                        {response.userNickname && (
                          <span className="text-slate-400 ml-2">(@{response.userNickname})</span>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs sm:text-sm">
                        {new Date(response.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(response.textAnswers).map(([question, answer]) => (
                    <div key={question} className="bg-slate-700/30 rounded-lg p-3 sm:p-4">
                      <div className="text-slate-300 font-medium text-sm sm:text-base mb-2">
                        {questionLabels[question] || question}
                      </div>
                      <div className="text-white text-sm sm:text-base leading-relaxed">
                        "{answer}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderResponses = () => {
    const totalResponses = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">📊 Respuestas Detalladas</h3>
          <p className="text-sm sm:text-base text-slate-400">Análisis completo de las respuestas</p>
        </div>

        {totalResponses === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Sin respuestas aún</h4>
            <p className="text-slate-400">Las estadísticas detalladas aparecerán cuando se envíen encuestas</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Distribución de Valoraciones</h4>
            <div className="space-y-2 sm:space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-1 sm:space-x-2 w-12 sm:w-16">
                      <span className="text-white font-medium text-sm sm:text-base">{rating}</span>
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-2 sm:h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right w-16 sm:w-20">
                      <div className="text-white font-semibold text-sm sm:text-base">{count}</div>
                      <div className="text-slate-400 text-xs sm:text-sm">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-400">Total de respuestas:</span>
                <span className="text-white font-semibold">{totalResponses}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
                <span className="text-slate-400">Valoración promedio:</span>
                <span className="text-white font-semibold">
                  {totalResponses > 0 ? (Object.entries(ratingDistribution).reduce((sum, [rating, count]) => sum + (rating * count), 0) / totalResponses).toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto border border-slate-600/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Estadísticas del Evento</h2>
          <p className="text-sm sm:text-base text-slate-400">Resultados de la encuesta y análisis de participación</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Cargando estadísticas...</h4>
            <p className="text-slate-400">Calculando resultados del evento</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 sm:mb-8">
              <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', name: 'Resumen', icon: BarChart3 },
                  { id: 'badges', name: 'Insignias', icon: Trophy },
                  { id: 'responses', name: 'Respuestas', icon: TrendingUp },
                  { id: 'text', name: 'Comentarios', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'badges' && renderBadges()}
            {activeTab === 'responses' && renderResponses()}
            {activeTab === 'text' && renderTextResponses()}
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyStats; 