import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';
import { updateUserProfile } from '../lib/supabase.js';
import { toast } from '../store/toastStore.js';

const NexusPersonModal = ({ isOpen, onClose, onSkip }) => {
  const { user, userProfile, users, loadUsers, updateUserProfile } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      loadUsers();
    }
  }, [isOpen, users.length, loadUsers]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleSave = async () => {
    if (!selectedUser || !user) return;

    setIsLoading(true);
    try {
      const { error } = await updateUserProfile(user.id, {
        nexus_person: selectedUser.name
      });

      if (error) {
        toast.error('Error al guardar', 'No se pudo guardar la persona nexo. Inténtalo de nuevo.');
      } else {
        toast.success('¡Conectado!', `Te has conectado a través de ${selectedUser.name}`);
        
        // Update the user profile in the store
        const updatedProfile = { ...userProfile, nexus_person: selectedUser.name };
        updateUserProfile(updatedProfile);
        
        onClose();
      }
    } catch (error) {
      toast.error('Error inesperado', 'Ha ocurrido un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.id !== user?.id && // Exclude current user
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.nickname && u.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 sm:max-w-lg w-full max-h-[90vh] flex flex-col rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">
              🔗 Conecta con la Familia
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              ¿Quién te invitó a Festival&Friends?
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/50"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0 p-6">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o nickname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Users List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-slate-400">
                    {searchTerm ? 'No se encontraron usuarios' : 'No hay otros usuarios aún'}
                  </p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${selectedUser?.id === user.id 
                        ? 'bg-primary-500/20 border-primary-500/50 text-primary-200' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600/50'
                      }
                    `}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-primary-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center border-2 border-primary-500/30">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{user.name}</h3>
                      {user.nickname && (
                        <p className="text-primary-400 text-sm font-medium truncate">
                          @{user.nickname}
                        </p>
                      )}
                      {user.city && (
                        <p className="text-slate-500 text-xs truncate">
                          📍 {user.city}
                        </p>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {selectedUser?.id === user.id && (
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-5 w-5 text-primary-400" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <p className="text-blue-200 text-sm">
                💡 <strong>¿Por qué conectar?</strong> Esto nos ayuda a crear el árbol de conexiones 
                y ver cómo se expande nuestra familia festivalera.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <div className="flex space-x-3">
            <button 
              onClick={handleSkip}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-lg transition-colors border border-slate-600/50 hover:border-slate-500/50"
            >
              Enlazar más tarde
            </button>
            <button 
              onClick={handleSave}
              disabled={!selectedUser || isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors border border-primary-500/50 hover:border-primary-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusPersonModal; 