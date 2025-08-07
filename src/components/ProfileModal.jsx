import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, CameraIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import { updateUserProfile, uploadAvatar } from '../lib/supabase.js';
import UserAvatar from './UserAvatar.jsx';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, userProfile, setUser, users, loadUsers } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Debug: Log cuando cambia el estado de carga
  useEffect(() => {
    console.log('Estado de carga de avatar cambiado:', isLoadingAvatar, 'Progreso:', uploadProgress);
  }, [isLoadingAvatar, uploadProgress]);
  const [error, setError] = useState('');
  const [nexusSearchTerm, setNexusSearchTerm] = useState('');
  const [showNexusDropdown, setShowNexusDropdown] = useState(false);
  const [selectedNexusUser, setSelectedNexusUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    city: '',
    phone: '',
    instagram: '',
    bio: '',
    twitter: '',
    nexus_person: '',
    key_phrase: '',
    avatar_url: ''
  });

  // Cargar datos del perfil cuando se abre el modal
  useEffect(() => {
    if (isOpen && userProfile) {
      console.log('Loading profile data into form:', userProfile); // Debug
      setFormData({
        name: userProfile.name || '',
        nickname: userProfile.nickname || '',
        city: userProfile.city || '',
        phone: userProfile.phone || '',
        instagram: userProfile.instagram || '',
        bio: userProfile.bio || '',
        twitter: userProfile.twitter || '',
        nexus_person: userProfile.nexus_person || '',
        key_phrase: userProfile.key_phrase || '',
        avatar_url: userProfile.avatar_url || ''
      });
      
      // Set selected nexus user if exists
      if (userProfile.nexus_person) {
        const nexusUser = users.find(u => u.name === userProfile.nexus_person);
        setSelectedNexusUser(nexusUser || null);
      } else {
        setSelectedNexusUser(null);
      }
      
      setError('');
    }
  }, [isOpen, userProfile, users]);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen && users.length === 0) {
      loadUsers();
    }
  }, [isOpen, users.length, loadUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNexusDropdown && !event.target.closest('.nexus-dropdown')) {
        setShowNexusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNexusDropdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNexusUserSelect = (selectedUser) => {
    setSelectedNexusUser(selectedUser);
    setFormData(prev => ({
      ...prev,
      nexus_person: selectedUser.name
    }));
    setShowNexusDropdown(false);
    setNexusSearchTerm('');
  };

  const handleNexusUserRemove = () => {
    setSelectedNexusUser(null);
    setFormData(prev => ({
      ...prev,
      nexus_person: ''
    }));
  };

  const handleCustomNexusPerson = (customText) => {
    setSelectedNexusUser({
      id: 'custom',
      name: customText,
      nickname: null,
      avatar_url: null
    });
    setFormData(prev => ({
      ...prev,
      nexus_person: customText
    }));
    setNexusSearchTerm('');
    setShowNexusDropdown(false);
  };

  // Filter users for nexus person selection
  const filteredNexusUsers = users.filter(u => 
    u.id !== user?.id && // Exclude current user
    (u.name.toLowerCase().includes(nexusSearchTerm.toLowerCase()) ||
     (u.nickname && u.nickname.toLowerCase().includes(nexusSearchTerm.toLowerCase())))
  );

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    console.log('Iniciando subida de avatar...');
    setIsLoadingAvatar(true);
    setUploadProgress(0);

    // Simular progreso durante la subida
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev >= 90 ? prev : prev + Math.random() * 15;
        console.log('Progreso:', newProgress);
        return newProgress;
      });
    }, 200);

    try {
      const { data, error } = await uploadAvatar(user.id, file);
      
      if (error) {
        throw error;
      }

      // Completar el progreso
      setUploadProgress(100);
      console.log('Subida completada al 100%');

      // Actualizar el formData con la nueva URL
      setFormData(prev => ({
        ...prev,
        avatar_url: data.publicUrl
      }));

      toast.success('Avatar subido', 'Tu nueva foto de perfil se ha cargado correctamente.');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir imagen', error.message || 'No se pudo cargar la imagen. Inténtalo de nuevo.');
    } finally {
      clearInterval(progressInterval);
      setIsLoadingAvatar(false);
      // Resetear progreso después de un momento
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Submitting profile data:', formData); // Debug
      
      // Actualizar perfil usando la función helper
      const { data, error } = await updateUserProfile(user.id, formData);

      if (error) {
        throw error;
      }

      console.log('Profile updated successfully:', data); // Debug

      // Actualizar el estado global con los nuevos datos
      setUser(user, data);

      toast.success('Perfil actualizado', 'Tus cambios se han guardado correctamente.');
      onClose();

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Error al actualizar el perfil. Inténtalo de nuevo.');
      toast.error('Error al guardar', 'No se pudieron guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setError('');
  };

  if (!isOpen || !user) return null;

  // Si no hay perfil aún, mostrar loading
  if (!userProfile) {
    return (
      <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={handleClose}>
        <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 sm:max-w-md w-full rounded-xl shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Cargando perfil...</h3>
            <p className="text-slate-300 text-sm">Sincronizando tu información rockera</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={handleClose}>
      <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 sm:max-w-2xl w-full max-h-[90vh] flex flex-col rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">
            🎸 Mi Perfil Festivalero
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-y-auto flex-1 min-h-0 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <UserAvatar 
                  user={{ name: formData.name, nickname: formData.nickname, avatar_url: formData.avatar_url }} 
                  size="3xl" 
                  className="border-4 border-primary-500 shadow-lg"
                />
                
                <label className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 rounded-full p-2 cursor-pointer transition-colors shadow-lg border-2 border-slate-900">
                  <CameraIcon className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isLoadingAvatar}
                  />
                </label>
              </div>
              
              {isLoadingAvatar && (
                <div className="mt-3 space-y-2 max-w-xs mx-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Subiendo imagen...</span>
                    <span className="text-primary-400 font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {/* Debug info */}
                  <div className="text-xs text-slate-500">
                    Debug: isLoadingAvatar={isLoadingAvatar.toString()}, progress={uploadProgress}
                  </div>
                </div>
              )}
            </div>

            {/* Datos básicos */}
            <div className="border-b border-slate-700/50 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-400">📝 Datos Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nickname/Apodo *
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="¿Cómo te llaman?"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="¿De dónde eres?"
                  />
                </div>
              </div>
            </div>

            {/* Información Rockera */}
            <div className="border-b border-slate-700/50 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-400">👤 Sobre mí</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Biografía
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="input resize-none"
                    placeholder="Cuéntanos sobre ti, tus gustos musicales..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                      <span>Persona que te conectó</span>
                      <span className="ml-2 text-primary-400">🌳</span>
                    </label>
                    
                    {selectedNexusUser ? (
                      <div className="flex items-center space-x-2 p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg">
                        {selectedNexusUser.id === 'custom' ? (
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">✓</span>
                          </div>
                        ) : (
                          <UserAvatar 
                            user={selectedNexusUser} 
                            size="sm" 
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate">
                            {selectedNexusUser.name}
                          </div>
                          {selectedNexusUser.nickname && (
                            <div className="text-primary-400 text-xs truncate">
                              @{selectedNexusUser.nickname}
                            </div>
                          )}
                          {selectedNexusUser.id === 'custom' && (
                            <div className="text-primary-400 text-xs truncate">
                              Texto personalizado
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleNexusUserRemove}
                          className="text-slate-400 hover:text-white transition-colors p-1"
                          aria-label="Remover persona nexo"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={nexusSearchTerm}
                            onChange={(e) => {
                              setNexusSearchTerm(e.target.value);
                              setShowNexusDropdown(true);
                            }}
                            onFocus={() => setShowNexusDropdown(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && nexusSearchTerm.trim()) {
                                handleCustomNexusPerson(nexusSearchTerm.trim());
                              }
                            }}
                            className="input pl-10"
                            placeholder="Buscar usuario o escribir 'Fundador'..."
                          />
                        </div>
                        
                        {showNexusDropdown && (
                          <div className="nexus-dropdown absolute z-10 w-full mt-1 bg-slate-800/95 backdrop-blur-lg border border-slate-600/50 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {/* Opciones especiales */}
                            {nexusSearchTerm.trim() && (
                              <div className="border-b border-slate-600/50">
                                <button
                                  type="button"
                                  onClick={() => handleCustomNexusPerson(nexusSearchTerm.trim())}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700/50 transition-colors text-left border-l-4 border-primary-500"
                                >
                                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">✓</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium text-sm truncate">
                                      Usar: "{nexusSearchTerm.trim()}"
                                    </div>
                                    <div className="text-primary-400 text-xs truncate">
                                      Texto personalizado
                                    </div>
                                  </div>
                                </button>
                              </div>
                            )}
                            
                            {/* Opciones rápidas */}
                            {!nexusSearchTerm.trim() && (
                              <div className="border-b border-slate-600/50">
                                <button
                                  type="button"
                                  onClick={() => handleCustomNexusPerson('Fundador')}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700/50 transition-colors text-left"
                                >
                                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">👑</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium text-sm truncate">
                                      Fundador
                                    </div>
                                    <div className="text-yellow-400 text-xs truncate">
                                      Eres uno de los fundadores
                                    </div>
                                  </div>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleCustomNexusPerson(userProfile?.name || 'Mi Nombre')}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700/50 transition-colors text-left"
                                >
                                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">🔄</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium text-sm truncate">
                                      {userProfile?.name || 'Mi Nombre'}
                                    </div>
                                    <div className="text-green-400 text-xs truncate">
                                      Auto-referencia
                                    </div>
                                  </div>
                                </button>
                              </div>
                            )}
                            
                            {/* Usuarios existentes */}
                            {filteredNexusUsers.length === 0 ? (
                              <div className="p-3 text-center text-slate-400 text-sm">
                                {nexusSearchTerm ? 'No se encontraron usuarios' : 'No hay otros usuarios aún'}
                              </div>
                            ) : (
                              filteredNexusUsers.map(user => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => handleNexusUserSelect(user)}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700/50 transition-colors text-left"
                                >
                                  <UserAvatar 
                                    user={user} 
                                    size="sm" 
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium text-sm truncate">
                                      {user.name}
                                    </div>
                                    {user.nickname && (
                                      <div className="text-primary-400 text-xs truncate">
                                        @{user.nickname}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <p className="text-blue-300 text-xs">
                      💡 <strong>Consejo:</strong> Si no recuerdas quién te introdujo o eres uno de los fundadores, 
                      puedes escribir tu propio nombre, "Fundador", o cualquier texto personalizado.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Frase clave rockera
                    </label>
                    <input
                      type="text"
                      name="key_phrase"
                      value={formData.key_phrase}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Tu frase o lema favorito"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="border-b border-slate-700/50 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-400">📱 Contacto</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Teléfono (WhatsApp)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="+34 XXX XXX XXX"
                />
              </div>
            </div>

            {/* Redes sociales */}
            <div className="border-b border-slate-700/50 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-400">🌐 Redes Sociales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="@tu_usuario"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Twitter/X
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="@tu_usuario"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <div className="flex space-x-3">
            <button 
              onClick={handleClose} 
              className="flex-1 btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isLoading || isLoadingAvatar}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 