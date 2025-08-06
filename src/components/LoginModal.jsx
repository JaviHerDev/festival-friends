import { useState, useRef } from 'react';
import { X, Mail, Lock, User, MapPin, Phone, Instagram, Twitter, FileText, Camera, Upload } from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import { signIn, signUp, getUserProfile, uploadAvatar } from '../lib/supabase.js';

const LoginModal = () => {
  const { isLoginModalOpen, setLoginModalOpen, setUser } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nickname: '',
    city: '',
    phone: '',
    instagram: '',
    bio: '',
    twitter: '',
    key_phrase: ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Error', 'Por favor selecciona una imagen válida.');
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Error', 'La imagen debe ser menor a 5MB.');
        return;
      }
      
      setAvatarFile(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data, error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError('Credenciales incorrectas');
      toast.error('Error al iniciar sesión', 'Verifica tu email y contraseña e inténtalo de nuevo.');
    } else if (data.user) {
      const { data: profile } = await getUserProfile(data.user.id);
      setUser(data.user, profile);
      toast.success(`¡Bienvenido${profile?.name ? `, ${profile.name}` : ''}!`, 'Has iniciado sesión correctamente.');
      setLoginModalOpen(false);
      resetForm();
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let avatarUrl = '';

    const { data, error } = await signUp(
      formData.email, 
      formData.password,
      {
        name: formData.name,
        nickname: formData.nickname,
        city: formData.city,
        phone: formData.phone,
        instagram: formData.instagram,
        bio: formData.bio,
        twitter: formData.twitter,
        key_phrase: formData.key_phrase,
        avatar_url: avatarUrl
      }
    );
    
    if (error) {
      setError(error.message);
      toast.error('Error al crear la cuenta', error.message || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.');
    } else {
      // Subir avatar si se seleccionó uno
      if (avatarFile && data?.user) {
        setIsUploadingAvatar(true);
        const { data: uploadData, error: uploadError } = await uploadAvatar(data.user.id, avatarFile);
        
        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.warning('Advertencia', 'La cuenta se creó pero no se pudo subir el avatar. Puedes actualizarlo más tarde.');
        } else {
          // Actualizar el perfil con la URL del avatar
          avatarUrl = uploadData.publicUrl;
        }
        setIsUploadingAvatar(false);
      }
      
      setError('');
      toast.success('¡Cuenta creada exitosamente!', 'Revisa tu email para confirmar tu cuenta y poder iniciar sesión.', { duration: 7000 });
      setLoginModalOpen(false);
      setIsSignUp(false);
      resetForm();
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      nickname: '',
      city: '',
      phone: '',
      instagram: '',
      bio: '',
      twitter: '',
      key_phrase: ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setLoginModalOpen(false);
    setIsSignUp(false);
    setError('');
    resetForm();
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={handleClose}>
      <div className="relative w-full max-w-lg max-h-[95vh] overflow-hidden">
        {/* Modal Container */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-700/50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isSignUp ? 'Únete a la comunidad festivalera' : 'Accede a tu cuenta'}
                </p>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Form Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
              
              {isSignUp && (
                <div className="space-y-5">
                  {/* Datos básicos */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Datos personales</h3>
                    
                    {/* Avatar */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Foto de perfil
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div 
                            onClick={handleAvatarClick}
                            className="w-20 h-20 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-600/50 hover:border-primary-500/50 cursor-pointer transition-all duration-200 flex items-center justify-center overflow-hidden group"
                          >
                            {avatarPreview ? (
                              <img 
                                src={avatarPreview} 
                                alt="Avatar preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <Camera className="h-6 w-6 text-slate-500 group-hover:text-primary-400 mx-auto mb-1" />
                                <span className="text-xs text-slate-500 group-hover:text-primary-400">Subir</span>
                              </div>
                            )}
                          </div>
                          {avatarPreview && (
                            <button
                              type="button"
                              onClick={removeAvatar}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 mb-2">
                            Haz clic para subir una foto de perfil
                          </p>
                          <p className="text-xs text-slate-500">
                            JPG, PNG o GIF • Máximo 5MB
                          </p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required={isSignUp}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Apodo
                        </label>
                        <input
                          type="text"
                          name="nickname"
                          value={formData.nickname}
                          onChange={handleInputChange}
                          required={isSignUp}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                          placeholder="¿Cómo te llaman?"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required={isSignUp}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                          placeholder="¿De dónde eres?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Contacto</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                        placeholder="+34 XXX XXX XXX"
                      />
                    </div>
                  </div>

                  {/* Redes sociales */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Redes sociales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Instagram
                        </label>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                          placeholder="@usuario"
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
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                          placeholder="@usuario"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Información adicional</h3>
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
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm resize-none"
                          placeholder="Cuéntanos sobre ti..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Frase favorita
                        </label>
                        <input
                          type="text"
                          name="key_phrase"
                          value={formData.key_phrase}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                          placeholder="Tu frase o lema favorito"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Credenciales */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Credenciales</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isUploadingAvatar}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading || isUploadingAvatar ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isUploadingAvatar ? 'Subiendo avatar...' : 'Procesando...'}</span>
                  </div>
                ) : (
                  <span>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  resetForm();
                }}
                className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 