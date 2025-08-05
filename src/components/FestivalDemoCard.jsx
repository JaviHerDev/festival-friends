import { Calendar, MapPin, Users, MoreVertical, Image } from 'lucide-react';

const FestivalDemoCard = () => {
  return (
    <div className="card hover:scale-105 transition-all duration-300">
      {/* Festival image/header */}
      <div className="relative mb-4">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Rock Am Ring 2024"
            className="w-full h-48 object-cover object-top rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          />
          
          {/* View poster button */}
          <button className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 hover:bg-black/70 text-white rounded-full text-xs font-medium transition-colors flex items-center space-x-1">
            <Image className="h-3 w-3" />
            <span>Ver</span>
          </button>
        </div>
        
        {/* Status badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {/* Attendance status badge */}
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
            🎫
          </div>
        </div>

        {/* Options menu */}
        <div className="absolute top-2 left-2">
          <div className="relative">
            <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors">
              <MoreVertical className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Festival info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">
            Rock Am Ring 2024
          </h3>
          <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-medium ml-2 flex-shrink-0">
            🎸 Rock
          </span>
        </div>

        <div className="space-y-2 text-sm text-white/80">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>7 - 9 jun 2024</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">Nürburgring, Alemania</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>8 interesados</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/70 line-clamp-3">
          Uno de los festivales de rock más importantes de Europa. Tres días de música épica en el legendario circuito de Nürburgring.
        </p>

        {/* Attendance buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button className="px-3 py-2 rounded-lg text-xs font-medium transition-all bg-green-600 text-white">
              🎫 Tengo
            </button>
            
            <button className="px-3 py-2 rounded-lg text-xs font-medium transition-all bg-white/10 text-white/80 hover:bg-yellow-600/20">
              🤔 Tal vez
            </button>
            
            <button className="px-3 py-2 rounded-lg text-xs font-medium transition-all bg-white/10 text-white/80 hover:bg-red-600/20">
              ❌ No voy
            </button>
          </div>

          {/* Attendance counts */}
          <div className="grid grid-cols-3 gap-2 text-xs text-white/60">
            <div className="text-center">🎫 3</div>
            <div className="text-center">🤔 5</div>
            <div className="text-center">❌ 2</div>
          </div>
        </div>

        {/* View details button */}
        <button className="w-full btn-secondary text-sm py-2">
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default FestivalDemoCard; 