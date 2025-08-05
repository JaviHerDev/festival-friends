import { useState } from 'react';
import { Bell, Calendar, Trophy, Star, Users } from 'lucide-react';

const SurveyNotification = ({ event, isOpen, onClose, onTakeSurvey }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto border border-slate-600/50 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base">¡Evento Finalizado!</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Cuéntanos tu experiencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Event Info */}
        <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/50 mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span className="text-white font-medium text-sm sm:text-base">{event?.name || 'Rock Festival 2024'}</span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Ayúdanos a mejorar contando tu experiencia y asigna insignias a los participantes
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-slate-300">Valora artistas y días favoritos</span>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Trophy className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span className="text-slate-300">Asigna insignias a participantes</span>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Users className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-slate-300">Contribuye a mejorar futuros eventos</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onTakeSurvey}
            className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
          >
            Tomar Encuesta
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 sm:py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-all duration-300 text-sm sm:text-base"
          >
            Más tarde
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Participantes que han respondido</span>
            <span>67/156</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: '43%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyNotification; 