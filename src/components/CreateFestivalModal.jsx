'use client'

import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Image, Tag } from 'lucide-react';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';
import { supabase } from '../lib/supabase.js';

const CreateFestivalModal = ({ isOpen, onClose, festival = null }) => {
  const { createFestival, updateFestival, user } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // Initialize form data with localStorage persistence
  const [formData, setFormData] = useState(() => {
    // If editing an existing festival, don't restore from localStorage
    if (festival) {
      return {
        name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        poster_url: '',
        website_url: '',
        category: 'rock',
        max_capacity: '',
        ticket_price: '',
        organizer_info: ''
      };
    }

    // For new festivals, try to restore from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('festival_form_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('📝 Restored form draft:', parsed);
          
          // Handle both old format (direct formData) and new format (with imagePreview)
          if (parsed.formData) {
            // New format with imagePreview
            setTimeout(() => setImagePreview(parsed.imagePreview || null), 0);
            return parsed.formData;
          } else {
            // Old format (direct formData)
            return parsed;
          }
        } catch (error) {
          console.error('❌ Error parsing saved form data:', error);
        }
      }
    }

    // Default values
    return {
      name: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      poster_url: '',
      website_url: '',
      category: 'rock',
      max_capacity: '',
      ticket_price: '',
      organizer_info: ''
    };
  });

  const categories = [
    { value: 'rock', label: '🎸 Rock', emoji: '🎸' },
    { value: 'pop', label: '🎤 Pop', emoji: '🎤' },
    { value: 'electronic', label: '🎛️ Electrónica', emoji: '🎛️' },
    { value: 'indie', label: '🎵 Indie', emoji: '🎵' },
    { value: 'metal', label: '🤘 Metal', emoji: '🤘' },
    { value: 'folk', label: '🪕 Folk', emoji: '🪕' },
    { value: 'jazz', label: '🎺 Jazz', emoji: '🎺' },
    { value: 'reggae', label: '🌴 Reggae', emoji: '🌴' },
    { value: 'hip_hop', label: '🎤 Hip Hop', emoji: '🎤' },
    { value: 'other', label: '🎪 Otro', emoji: '🎪' }
  ];

  // Auto-save form data to localStorage for new festivals
  useEffect(() => {
    if (!festival && typeof window !== 'undefined') {
      // Only save if form has some content
      const hasContent = Object.values(formData).some(value => value.toString().trim() !== '' && value !== 'rock');
      if (hasContent) {
        const draftData = {
          formData,
          imagePreview
        };
        localStorage.setItem('festival_form_draft', JSON.stringify(draftData));
        console.log('💾 Form draft saved to localStorage');
      }
    }
  }, [formData, imagePreview, festival]);

  // Initialize form when editing
  useEffect(() => {
    if (festival) {
      setFormData({
        name: festival.name || '',
        description: festival.description || '',
        location: festival.location || '',
        start_date: festival.start_date ? festival.start_date.split('T')[0] : '',
        end_date: festival.end_date ? festival.end_date.split('T')[0] : '',
        poster_url: festival.poster_url || '',
        website_url: festival.website_url || '',
        category: festival.category || 'rock',
        max_capacity: festival.max_capacity || '',
        ticket_price: festival.ticket_price || '',
        organizer_info: festival.organizer_info || ''
      });
      // Set image preview if editing and has poster
      setImagePreview(festival.poster_url || null);
    } else {
      // Clear image preview for new festival
      setImagePreview(null);
      // Reset form for new festival
      setFormData({
        name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        poster_url: '',
        website_url: '',
        category: 'rock',
        max_capacity: '',
        ticket_price: '',
        organizer_info: ''
      });
    }
  }, [festival, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadImage = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Error', 'Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Error', 'La imagen no puede ser mayor a 10MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('festival-posters')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        toast.error('Error', 'Error al subir la imagen: ' + error.message);
        setImagePreview(null);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('festival-posters')
        .getPublicUrl(fileName);

      // Update form data with the URL
      setFormData(prev => ({
        ...prev,
        poster_url: publicUrl
      }));

      console.log('✅ Image uploaded successfully:', publicUrl);
      toast.success('¡Subido!', 'Imagen subida correctamente');

    } catch (error) {
      console.error('Exception uploading image:', error);
      toast.error('Error', 'Error inesperado al subir la imagen');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await uploadImage(imageFile);
    } else {
      toast.error('Error', 'Por favor arrastra un archivo de imagen válido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Error', 'El nombre del festival es obligatorio');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Error', 'La ubicación es obligatoria');
      return;
    }
    if (!formData.start_date) {
      toast.error('Error', 'La fecha de inicio es obligatoria');
      return;
    }
    if (!formData.end_date) {
      toast.error('Error', 'La fecha de fin es obligatoria');
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('Error', 'La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    setIsLoading(true);

    try {
      const festivalData = {
        ...formData,
        max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : null,
        ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : null,
      };

      let result;
      if (festival) {
        // Update existing festival
        result = await updateFestival(festival.id, festivalData);
        if (!result.error) {
          toast.success('¡Actualizado!', 'Festival actualizado correctamente');
        }
      } else {
        // Create new festival
        result = await createFestival(festivalData);
        if (!result.error) {
          toast.success('¡Creado!', 'Festival creado correctamente 🎪');
        }
      }

      if (result.error) {
        toast.error('Error', result.error.message || 'Error al guardar el festival');
      } else {
        // Clear draft from localStorage on successful save
        if (typeof window !== 'undefined') {
          localStorage.removeItem('festival_form_draft');
          console.log('🗑️ Form draft cleared from localStorage');
        }
        onClose();
      }
    } catch (error) {
      console.error('Error saving festival:', error);
      toast.error('Error', 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
          <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="p-4 w-full h-full flex items-center justify-center">
        <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-600/70 sm:max-w-lg w-full max-h-[90vh] flex flex-col rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <h2 className="text-xl font-bold text-white">
            {festival ? '✏️ Editar Festival' : '🎪 Crear Festival'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
                            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 min-h-0">
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre del Festival *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ej. FestivalRock 2024"
                className="input"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Ubicación *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="ej. Madrid, España"
                className="input"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Fecha Fin *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el festival, artistas, etc..."
                className="input resize-none"
                rows={3}
              />
            </div>

            {/* Poster Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Image className="h-4 w-4 inline mr-1" />
                Poster del Festival
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <div className="relative w-full h-48 bg-slate-800 rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview del poster" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, poster_url: '' }));
                        }}
                        className="bg-red-600/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* File Upload */}
              <div 
                className="relative"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                />
                <div className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                  ${isDragOver 
                    ? 'border-blue-400 bg-blue-400/10 scale-105' 
                    : 'border-slate-600 hover:border-slate-500'
                  }
                  ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}>
                  {isUploadingImage ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="text-slate-400">Subiendo imagen...</span>
                    </div>
                  ) : (
                    <>
                      <Image className={`h-12 w-12 mx-auto mb-2 transition-colors ${
                        isDragOver ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      <p className={`text-sm mb-1 transition-colors ${
                        isDragOver ? 'text-blue-300' : 'text-slate-400'
                      }`}>
                        {isDragOver 
                          ? '¡Suelta la imagen aquí!' 
                          : imagePreview 
                          ? 'Cambiar imagen' 
                          : 'Haz clic o arrastra una imagen aquí'
                        }
                      </p>
                      <p className="text-slate-500 text-xs">
                        PNG, JPG, WEBP o GIF hasta 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🌐 Sitio Web
              </label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com"
                className="input"
              />
            </div>

            {/* Capacity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🏟️ Capacidad Máx.
                </label>
                <input
                  type="number"
                  name="max_capacity"
                  value={formData.max_capacity}
                  onChange={handleInputChange}
                  placeholder="10000"
                  className="input"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  💰 Precio Entrada (€)
                </label>
                <input
                  type="number"
                  name="ticket_price"
                  value={formData.ticket_price}
                  onChange={handleInputChange}
                  placeholder="50.00"
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Organizer Info */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👤 Información del Organizador
              </label>
              <input
                type="text"
                name="organizer_info"
                value={formData.organizer_info}
                onChange={handleInputChange}
                placeholder="ej. Live Nation, email@contacto.com"
                className="input"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-600/50">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                <span>Guardando...</span>
              </div>
            ) : (
              festival ? 'Actualizar Festival' : 'Crear Festival'
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateFestivalModal; 