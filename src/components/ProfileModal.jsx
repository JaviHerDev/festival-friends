import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, CameraIcon } from '@heroicons/react/24/outline';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import { updateUserProfile, uploadAvatar } from '../lib/supabase.js';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, userProfile, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [error, setError] = useState('');
  
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
      setError('');
    }
  }, [isOpen, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoadingAvatar(true);

    try {
      const { data, error } = await uploadAvatar(user.id, file);
      
      if (error) {
        throw error;
      }

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
      setIsLoadingAvatar(false);
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
            🎸 Mi Perfil Rockero
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
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center border-4 border-primary-500 shadow-lg">
                    <UserIcon className="h-12 w-12 text-white" />
                  </div>
                )}
                
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
                <p className="text-sm text-slate-400 mt-2">Subiendo imagen...</p>
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
              <h3 className="text-lg font-semibold mb-4 text-primary-400">📲 Redes Sociales</h3>
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

            {/* Información adicional */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary-400">🎸 Información Rockera</h3>
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
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Persona que te conectó
                    </label>
                    <input
                      type="text"
                      name="nexus_person"
                      value={formData.nexus_person}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="¿Quién te invitó al grupo?"
                    />
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