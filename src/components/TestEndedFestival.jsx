import { useState } from 'react';
import FestivalDetailsModal from './FestivalDetailsModal.jsx';

const TestEndedFestival = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Festival de ejemplo que ya ha finalizado
  const endedFestival = {
    id: 'test_ended_festival',
    name: 'Rock Festival 2024 - Test',
    description: 'Un festival épico de rock que ya ha terminado para probar el sistema de encuestas.',
    category: 'rock',
    start_date: '2024-01-10T18:00:00Z',
    end_date: '2024-01-12T23:00:00Z',
    location: 'Madrid, España',
    poster_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    website_url: 'https://example.com',
    organizer_info: 'Organizado por Festival&Friends',
    created_by_user: {
      id: 1,
      name: 'Admin'
    },
    attendances: [
      {
        user_id: 1,
        status: 'have_ticket',
        user: { name: 'Alex Rodríguez', avatar_url: null }
      },
      {
        user_id: 2,
        status: 'have_ticket',
        user: { name: 'Luna Martínez', avatar_url: null }
      },
      {
        user_id: 3,
        status: 'thinking_about_it',
        user: { name: 'Carlos García', avatar_url: null }
      },
      {
        user_id: 4,
        status: 'have_ticket',
        user: { name: 'Ana López', avatar_url: null }
      },
      {
        user_id: 5,
        status: 'not_going',
        user: { name: 'Miguel Torres', avatar_url: null }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🧪 Test Sistema de Encuestas</h1>
          <p className="text-slate-400 text-lg">
            Prueba el sistema de encuestas con un festival que ya ha finalizado
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Festival Finalizado</h2>
            <p className="text-slate-400">
              Este festival ya ha terminado y debería mostrar las opciones de encuesta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">📅 Fechas</h3>
              <div className="space-y-2 text-slate-300">
                <div>Inicio: 10 de enero de 2024</div>
                <div>Fin: 12 de enero de 2024</div>
                <div className="text-red-400 font-semibold">✅ Evento finalizado</div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">👥 Participación</h3>
              <div className="space-y-2 text-slate-300">
                <div>🎫 Con entrada: 3 personas</div>
                <div>🤔 Pensándolo: 1 persona</div>
                <div>❌ No van: 1 persona</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              🎪 Abrir Detalles del Festival
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Al abrir el modal, deberías ver:</p>
            <ul className="mt-2 space-y-1">
              <li>• Botón "📊 Tomar Encuesta del Evento"</li>
              <li>• Botón "📈 Ver Estadísticas"</li>
              <li>• Notificación de encuesta después de 2 segundos</li>
            </ul>
          </div>
        </div>
      </div>

      <FestivalDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        festival={endedFestival}
      />
    </div>
  );
};

export default TestEndedFestival; 