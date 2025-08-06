import { useState } from 'react';
import { Calendar, Users, Trophy, BarChart3, Bell } from 'lucide-react';
import EventSurvey from './EventSurvey.jsx';
import SurveyStats from './SurveyStats.jsx';


const EventPageExample = () => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const event = {
    id: 'rock_festival_2024',
    name: 'Rock Festival 2024',
    date: '2024-01-15',
    status: 'completed',
    artists: ['Metallica', 'Iron Maiden', 'Slayer', 'Megadeth', 'Anthrax'],
    days: ['Viernes', 'Sábado', 'Domingo'],
    participants: 156,
    surveyResponses: 89
  };

  const handleSurveySubmit = (surveyData) => {
    console.log('Encuesta enviada:', surveyData);
    setSurveySubmitted(true);
    // Aquí se guardaría en la base de datos
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Event Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{event.name}</h1>
              <p className="text-slate-400">Evento finalizado • {new Date(event.date).toLocaleDateString('es-ES')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{event.participants}</div>
                <div className="text-slate-400 text-sm">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">{event.surveyResponses}</div>
                <div className="text-slate-400 text-sm">Encuestas</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSurvey(true)}
              disabled={surveySubmitted}
              className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              {surveySubmitted ? '✅ Encuesta Completada' : '📊 Tomar Encuesta'}
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Ver Estadísticas</span>
            </button>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Artistas</h3>
                <p className="text-slate-400 text-sm">{event.artists.length} grupos</p>
              </div>
            </div>
            <div className="space-y-2">
              {event.artists.map((artist, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span className="text-slate-300">{artist}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Participación</h3>
                <p className="text-slate-400 text-sm">Tasa de respuesta</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Encuestas completadas</span>
                <span className="text-white font-semibold">{event.surveyResponses}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${(event.surveyResponses / event.participants) * 100}%` }}
                ></div>
              </div>
              <div className="text-right text-xs text-slate-400">
                {Math.round((event.surveyResponses / event.participants) * 100)}% completado
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Insignias</h3>
                <p className="text-slate-400 text-sm">Asignadas</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Borracho Estrella</span>
                <span className="text-white font-semibold">Alex Rodríguez</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Rey del Baile</span>
                <span className="text-white font-semibold">Luna Martínez</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Mariposa Social</span>
                <span className="text-white font-semibold">Carlos García</span>
              </div>
            </div>
          </div>
        </div>

        {/* Survey Status */}
        {surveySubmitted && (
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">¡Encuesta Completada!</h3>
                <p className="text-slate-300">Gracias por compartir tu experiencia. Tus respuestas nos ayudan a mejorar futuros eventos.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EventSurvey
        event={event}
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        onSubmit={handleSurveySubmit}
      />

      <SurveyStats
        event={event}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />


    </div>
  );
};

export default EventPageExample; 