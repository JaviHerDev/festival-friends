import { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, MapPin, Phone, Instagram, Twitter, FileText, Camera, Upload, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import { signIn, signUp, getUserProfile, uploadAvatar, updateUserProfile, resetPassword } from '../lib/supabase.js';
import UserAvatar from './UserAvatar.jsx';

// Funciones de validación
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, message: 'El email es requerido' };
  if (!emailRegex.test(email)) return { isValid: false, message: 'Formato de email inválido' };
  return { isValid: true, message: '' };
};

const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'La contraseña es requerida' };
  if (password.length < 6) return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  if (password.length > 50) return { isValid: false, message: 'La contraseña no puede exceder 50 caracteres' };
  return { isValid: true, message: '' };
};

const validateName = (name) => {
  if (!name) return { isValid: false, message: 'El nombre es requerido' };
  if (name.length < 2) return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  if (name.length > 50) return { isValid: false, message: 'El nombre no puede exceder 50 caracteres' };
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return { isValid: false, message: 'El nombre solo puede contener letras y espacios' };
  return { isValid: true, message: '' };
};

const validateNickname = (nickname) => {
  if (!nickname) return { isValid: false, message: 'El nickname es requerido' };
  if (nickname.length < 3) return { isValid: false, message: 'El nickname debe tener al menos 3 caracteres' };
  if (nickname.length > 20) return { isValid: false, message: 'El nickname no puede exceder 20 caracteres' };
  if (!/^[a-zA-Z0-9_]+$/.test(nickname)) return { isValid: false, message: 'El nickname solo puede contener letras, números y guiones bajos' };
  return { isValid: true, message: '' };
};

const validateCity = (city) => {
  if (!city) return { isValid: false, message: 'La ciudad es requerida' };
  if (city.length < 2) return { isValid: false, message: 'La ciudad debe tener al menos 2 caracteres' };
  if (city.length > 50) return { isValid: false, message: 'La ciudad no puede exceder 50 caracteres' };
  return { isValid: true, message: '' };
};

const validatePhone = (phone) => {
  if (!phone) return { isValid: true, message: '' }; // Opcional
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,15}$/;
  if (!phoneRegex.test(phone)) return { isValid: false, message: 'Formato de teléfono inválido' };
  return { isValid: true, message: '' };
};

const validateInstagram = (instagram) => {
  if (!instagram) return { isValid: true, message: '' }; // Opcional
  if (instagram.length > 30) return { isValid: false, message: 'El Instagram no puede exceder 30 caracteres' };
  if (!/^[a-zA-Z0-9._]+$/.test(instagram)) return { isValid: false, message: 'El Instagram solo puede contener letras, números, puntos y guiones bajos' };
  return { isValid: true, message: '' };
};

const validateTwitter = (twitter) => {
  if (!twitter) return { isValid: true, message: '' }; // Opcional
  if (twitter.length > 15) return { isValid: false, message: 'El Twitter no puede exceder 15 caracteres' };
  if (!/^[a-zA-Z0-9_]+$/.test(twitter)) return { isValid: false, message: 'El Twitter solo puede contener letras, números y guiones bajos' };
  return { isValid: true, message: '' };
};

const validateBio = (bio) => {
  if (!bio) return { isValid: true, message: '' }; // Opcional
  if (bio.length > 200) return { isValid: false, message: 'La bio no puede exceder 200 caracteres' };
  return { isValid: true, message: '' };
};

const validateKeyPhrase = (keyPhrase) => {
  if (!keyPhrase) return { isValid: true, message: '' }; // Opcional
  if (keyPhrase.length > 100) return { isValid: false, message: 'La frase clave no puede exceder 100 caracteres' };
  return { isValid: true, message: '' };
};

const LoginModal = () => {
  const { isLoginModalOpen, setLoginModalOpen, setUser } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
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
  
  // Estados de validación
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Estado para visibilidad de contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Función para validar un campo específico
  const validateField = (name, value) => {
    const validators = {
      email: validateEmail,
      password: validatePassword,
      name: validateName,
      nickname: validateNickname,
      city: validateCity,
      phone: validatePhone,
      instagram: validateInstagram,
      twitter: validateTwitter,
      bio: validateBio,
      key_phrase: validateKeyPhrase
    };

    const validator = validators[name];
    if (!validator) return { isValid: true, message: '' };

    return validator(value);
  };

  // Función para validar todo el formulario
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validar campos requeridos según el tipo de formulario
    const requiredFields = isSignUp 
      ? ['email', 'password', 'name', 'nickname', 'city']
      : ['email', 'password'];

    requiredFields.forEach(field => {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        errors[field] = validation.message;
        isValid = false;
      }
    });

    // Validar campos opcionales si tienen valor
    Object.keys(formData).forEach(field => {
      if (!requiredFields.includes(field) && formData[field]) {
        const validation = validateField(field, formData[field]);
        if (!validation.isValid) {
          errors[field] = validation.message;
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    setIsFormValid(isValid);
    return isValid;
  };

  // Validar formulario cuando cambian los datos
  useEffect(() => {
    if (Object.keys(touchedFields).length > 0) {
      validateForm();
    }
  }, [formData, isSignUp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Marcar campo como tocado
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar campo específico
    const validation = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message
    }));
  };

  const handleFieldBlur = (name) => {
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    const validation = validateField(name, formData[name]);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      toast.error('Error de validación', 'Por favor corrige los errores en el formulario.');
      return;
    }

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
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      toast.error('Error de validación', 'Por favor corrige los errores en el formulario.');
      return;
    }

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
        setUploadProgress(0);

        // Simular progreso durante la subida
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 15;
          });
        }, 200);

        const { data: uploadData, error: uploadError } = await uploadAvatar(data.user.id, avatarFile);
        
        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.warning('Advertencia', 'La cuenta se creó pero no se pudo subir el avatar. Puedes actualizarlo más tarde.');
        } else {
          // Completar el progreso
          setUploadProgress(100);
          
          // Actualizar el perfil con la URL del avatar
          avatarUrl = uploadData.publicUrl;
          
          // Actualizar el perfil del usuario en Supabase con la URL del avatar
          const { error: updateError } = await updateUserProfile(data.user.id, {
            avatar_url: avatarUrl
          });
          
          if (updateError) {
            console.error('Error updating user profile with avatar:', updateError);
            toast.warning('Advertencia', 'La cuenta se creó y el avatar se subió, pero no se pudo actualizar el perfil. El avatar estará disponible después de confirmar tu email.');
          } else {
            console.log('User profile updated with avatar URL:', avatarUrl);
          }
        }
        
        clearInterval(progressInterval);
        setIsUploadingAvatar(false);
        // Resetear progreso después de un momento
        setTimeout(() => setUploadProgress(0), 1000);
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
    setFieldErrors({});
    setTouchedFields({});
    setIsFormValid(false);
    setShowPassword(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Error', 'Por favor introduce tu email');
      return;
    }

    const emailValidation = validateEmail(resetEmail);
    if (!emailValidation.isValid) {
      toast.error('Error', emailValidation.message);
      return;
    }

    setIsResetLoading(true);
    setError('');

    try {
      const { data, error } = await resetPassword(resetEmail);
      
      if (error) {
        throw error;
      }

      setResetEmailSent(true);
      toast.success('Email enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña');
      
    } catch (error) {
      console.error('Error sending reset email:', error);
      setError('No se pudo enviar el email de restablecimiento. Verifica tu email e inténtalo de nuevo.');
      toast.error('Error', 'No se pudo enviar el email de restablecimiento');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsSignUp(false);
    setResetEmail('');
    setResetEmailSent(false);
    setError('');
  };

  const handleClose = () => {
    // Verificar si hay datos introducidos o campos tocados
    const hasData = Object.values(formData).some(value => value.trim() !== '') || avatarFile;
    const hasTouchedFields = Object.keys(touchedFields).length > 0;
    
    if (hasData || hasTouchedFields) {
      // Si hay datos o campos tocados, preguntar al usuario si está seguro
      if (confirm('¿Estás seguro de que quieres cerrar? Se perderán todos los datos introducidos.')) {
        setLoginModalOpen(false);
        setIsSignUp(false);
        setIsForgotPassword(false);
        setError('');
        resetForm();
      }
    } else {
      // Si no hay datos, cerrar directamente
      setLoginModalOpen(false);
      setIsSignUp(false);
      setIsForgotPassword(false);
      setError('');
      resetForm();
    }
  };

  // Componente para mostrar errores de campo
  const FieldError = ({ error, touched }) => {
    if (!error || !touched) return null;
    return (
      <div className="flex items-center space-x-1 mt-1 text-red-400 text-xs">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  };

  // Componente para mostrar validación exitosa
  const FieldSuccess = ({ isValid, touched }) => {
    if (!isValid || !touched) return null;
    return (
      <div className="flex items-center space-x-1 mt-1 text-green-400 text-xs">
        <CheckCircle className="h-3 w-3 flex-shrink-0" />
        <span>Campo válido</span>
      </div>
    );
  };

  // Función para obtener clases de input según validación
  const getInputClasses = (fieldName) => {
    const baseClasses = "w-full px-3 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all duration-200 text-sm";
    const touched = touchedFields[fieldName];
    const error = fieldErrors[fieldName];
    
    if (touched && error) {
      return `${baseClasses} border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50`;
    } else if (touched && !error && formData[fieldName]) {
      return `${baseClasses} border-green-500/50 focus:ring-green-500/50 focus:border-green-500/50`;
    } else {
      return `${baseClasses} border-slate-600/50 focus:ring-primary-500/50 focus:border-primary-500/50`;
    }
  };

  // Función para obtener clases de textarea según validación
  const getTextareaClasses = (fieldName) => {
    const baseClasses = "w-full px-3 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all duration-200 text-sm resize-none";
    const touched = touchedFields[fieldName];
    const error = fieldErrors[fieldName];
    
    if (touched && error) {
      return `${baseClasses} border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50`;
    } else if (touched && !error && formData[fieldName]) {
      return `${baseClasses} border-green-500/50 focus:ring-green-500/50 focus:border-green-500/50`;
    } else {
      return `${baseClasses} border-slate-600/50 focus:ring-primary-500/50 focus:border-primary-500/50`;
    }
  };

  // Función para calcular progreso de validación
  const getValidationProgress = () => {
    if (!isSignUp) {
      const requiredFields = ['email', 'password'];
      const completedFields = requiredFields.filter(field => 
        !fieldErrors[field] && formData[field]
      );
      return {
        completed: completedFields.length,
        total: requiredFields.length,
        percentage: (completedFields.length / requiredFields.length) * 100
      };
    } else {
      const requiredFields = ['email', 'password', 'name', 'nickname', 'city'];
      const completedFields = requiredFields.filter(field => 
        !fieldErrors[field] && formData[field]
      );
      return {
        completed: completedFields.length,
        total: requiredFields.length,
        percentage: (completedFields.length / requiredFields.length) * 100
      };
    }
  };

  const validationProgress = getValidationProgress();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="relative w-full max-w-lg max-h-[95vh] overflow-hidden">
        {/* Modal Container */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-700/50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  {isForgotPassword ? 'Restablecer contraseña' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isForgotPassword ? 'Recupera el acceso a tu cuenta' : isSignUp ? 'Únete a la comunidad festivalera' : 'Accede a tu cuenta'}
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
            {isForgotPassword ? (
              // Forgot Password Form
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {resetEmailSent ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">¡Email enviado!</h3>
                      <p className="text-slate-400 text-sm">
                        Hemos enviado un enlace de restablecimiento a <strong>{resetEmail}</strong>
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        Revisa tu bandeja de entrada y sigue las instrucciones para crear una nueva contraseña.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                        placeholder="tu@email.com"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isResetLoading}
                      className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      {isResetLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <span>Enviar email de restablecimiento</span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-lg transition-colors"
                    >
                      Volver al inicio de sesión
                    </button>
                  </>
                )}
              </form>
            ) : (
              // Login/SignUp Form
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
                          
                          {/* Barra de progreso */}
                          {isUploadingAvatar && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Subiendo imagen...</span>
                                <span className="text-primary-400 font-medium">{Math.round(uploadProgress)}%</span>
                              </div>
                              <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
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
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('name')}
                          required={isSignUp}
                          className={getInputClasses('name')}
                          placeholder="Tu nombre completo"
                        />
                        <FieldError error={fieldErrors.name} touched={touchedFields.name} />
                        <FieldSuccess isValid={!fieldErrors.name && formData.name} touched={touchedFields.name} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Apodo *
                        </label>
                        <input
                          type="text"
                          name="nickname"
                          value={formData.nickname}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('nickname')}
                          required={isSignUp}
                          className={getInputClasses('nickname')}
                          placeholder="¿Cómo te llaman?"
                        />
                        <FieldError error={fieldErrors.nickname} touched={touchedFields.nickname} />
                        <FieldSuccess isValid={!fieldErrors.nickname && formData.nickname} touched={touchedFields.nickname} />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('city')}
                          required={isSignUp}
                          className={getInputClasses('city')}
                          placeholder="¿De dónde eres?"
                        />
                        <FieldError error={fieldErrors.city} touched={touchedFields.city} />
                        <FieldSuccess isValid={!fieldErrors.city && formData.city} touched={touchedFields.city} />
                      </div>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Contacto</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Teléfono (opcional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('phone')}
                        className={getInputClasses('phone')}
                        placeholder="+34 XXX XXX XXX"
                      />
                      <FieldError error={fieldErrors.phone} touched={touchedFields.phone} />
                      <FieldSuccess isValid={!fieldErrors.phone && formData.phone} touched={touchedFields.phone} />
                    </div>
                  </div>

                  {/* Redes sociales */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Redes sociales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Instagram (opcional)
                        </label>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('instagram')}
                          className={getInputClasses('instagram')}
                          placeholder="usuario_instagram"
                        />
                        <FieldError error={fieldErrors.instagram} touched={touchedFields.instagram} />
                        <FieldSuccess isValid={!fieldErrors.instagram && formData.instagram} touched={touchedFields.instagram} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Twitter/X (opcional)
                        </label>
                        <input
                          type="text"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('twitter')}
                          className={getInputClasses('twitter')}
                          placeholder="usuario_twitter"
                        />
                        <FieldError error={fieldErrors.twitter} touched={touchedFields.twitter} />
                        <FieldSuccess isValid={!fieldErrors.twitter && formData.twitter} touched={touchedFields.twitter} />
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">Información adicional</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Biografía (opcional)
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('bio')}
                          rows={3}
                          className={getTextareaClasses('bio')}
                          placeholder="Cuéntanos sobre ti..."
                        />
                        <FieldError error={fieldErrors.bio} touched={touchedFields.bio} />
                        <FieldSuccess isValid={!fieldErrors.bio && formData.bio} touched={touchedFields.bio} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Frase favorita (opcional)
                        </label>
                        <input
                          type="text"
                          name="key_phrase"
                          value={formData.key_phrase}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('key_phrase')}
                          className={getInputClasses('key_phrase')}
                          placeholder="Tu frase o lema favorito"
                        />
                        <FieldError error={fieldErrors.key_phrase} touched={touchedFields.key_phrase} />
                        <FieldSuccess isValid={!fieldErrors.key_phrase && formData.key_phrase} touched={touchedFields.key_phrase} />
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
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('email')}
                      required
                      className={getInputClasses('email')}
                      placeholder="tu@email.com"
                    />
                    <FieldError error={fieldErrors.email} touched={touchedFields.email} />
                    <FieldSuccess isValid={!fieldErrors.email && formData.email} touched={touchedFields.email} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('password')}
                        required
                        className={`${getInputClasses('password')} pr-12`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FieldError error={fieldErrors.password} touched={touchedFields.password} />
                    <FieldSuccess isValid={!fieldErrors.password && formData.password} touched={touchedFields.password} />
                    
                    {/* Forgot Password Link - Only show in login mode */}
                    {!isSignUp && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          ¿Has olvidado tu contraseña?
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              {isSignUp && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Progreso del formulario</span>
                    <span>{validationProgress.completed}/{validationProgress.total} campos completados</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${validationProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isUploadingAvatar || !isFormValid}
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
              
              {/* Mensaje de validación del formulario */}
              {!isFormValid && Object.keys(touchedFields).length > 0 && (
                <div className="text-center">
                  <p className="text-xs text-slate-400">
                    Por favor completa todos los campos requeridos correctamente
                  </p>
                </div>
              )}
            </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-300 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-slate-700/50"
              >
                Cancelar
              </button>
              
              {!isForgotPassword && (
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    resetForm();
                  }}
                  className="text-primary-400 hover:text-primary-300 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-slate-700/50"
                >
                  {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };
  
export default LoginModal; 