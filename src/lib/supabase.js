import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://mvlrmnxatfpfjnrwzukz.supabase.co';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bHJtbnhhdGZwZmpucnd6dWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzU0NjAsImV4cCI6MjA2OTkxMTQ2MH0.MEs9gh4YMEZq-NyEn0Xla5ckyhDzFuS7E1BJdFsDtTI';

// Configuración para URLs de redirección
const getRedirectUrl = () => {
  // En desarrollo, usar localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:4322';
  }
  
  // En producción, usar la URL del sitio configurada en astro.config.mjs
  return 'https://festival-friends-liard.vercel.app/';
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test de conexión básico
export const testConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...'); // Debug
    
    // Timeout la prueba de conexión también
    const connectionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 2000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ Supabase connection successful'); // Debug
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
};

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email, password, userData) => {
  try {
    // Preparar los metadatos del usuario para que el trigger los use
    const userMetadata = {
      name: userData.name || 'Usuario Rock',
      nickname: userData.nickname || email.split('@')[0],
      city: userData.city || 'Tu Ciudad',
      phone: userData.phone || '',
      avatar_url: userData.avatar_url || '',
      bio: userData.bio || '',
      instagram: userData.instagram || '',
      twitter: userData.twitter || '',
      nexus_person: userData.nexus_person || '',
      key_phrase: userData.key_phrase || ''
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getRedirectUrl()}/auth/callback`,
        data: userMetadata // Los metadatos se pasan al trigger
      }
    });
    
    if (error) {
      return { data, error };
    }
    
    // El trigger automáticamente creará el perfil
    // Verificamos que se creó correctamente
    if (data.user) {
      console.log('User created successfully:', data.user.id);
      
      // Esperar un momento para que el trigger se ejecute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar que el perfil se creó
      const { data: profile, error: profileError } = await getUserProfile(data.user.id);
      
      if (profileError || !profile) {
        console.warn('Profile not found after creation, attempting manual creation...');
        
        // Intentar crear el perfil manualmente como fallback
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email,
          name: userData.name || 'Usuario Rock',
          nickname: userData.nickname || email.split('@')[0],
          city: userData.city || 'Tu Ciudad',
          phone: userData.phone || '',
          instagram: userData.instagram || '',
          bio: userData.bio || '',
          twitter: userData.twitter || '',
          nexus_person: userData.nexus_person || '',
          key_phrase: userData.key_phrase || '',
          avatar_url: userData.avatar_url || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (insertError) {
          console.error('Error creating user profile manually:', insertError);
        } else {
          console.log('User profile created manually');
        }
      } else {
        console.log('User profile verified successfully');
      }
    }
    
    return { data, error };
  } catch (err) {
    console.error('Error in signUp:', err);
    return { data: null, error: err };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Reset password functionality
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getRedirectUrl()}auth/reset-password`
  });
  return { data, error };
};

// Update password functionality
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  try {
    console.log('📡 Calling supabase.auth.getUser()...'); // Debug
    
    // Primero intentar obtener la sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    } else if (session?.user) {
      console.log('✅ Session found, user:', session.user.id); // Debug
      return session.user;
    }
    
    // Si no hay sesión, intentar getUser como fallback
    console.log('📡 No session found, trying getUser()...'); // Debug
    
    // Timeout wrapper para evitar que se cuelgue
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getCurrentUser timeout')), 3000)
    );
    
    const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Error getting user:', error);
      return null;
    }
    
    console.log('📡 Supabase response received:', user ? 'User found' : 'No user'); // Debug
    return user;
  } catch (error) {
    console.error('❌ getCurrentUser failed:', error.message);
    return null;
  }
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  // Si no se encuentra el perfil, intentar crearlo automáticamente
  if (error && error.code === 'PGRST116') { // No rows returned
    console.log('Profile not found, attempting to create...');
    
    // Llamar a la función de la base de datos para crear el perfil
    const { data: ensureResult, error: ensureError } = await supabase
      .rpc('ensure_user_profile', { user_uuid: userId });
    
    if (ensureError) {
      console.error('Error ensuring user profile:', ensureError);
      return { data: null, error: ensureError };
    }
    
    // Intentar obtener el perfil nuevamente
    const { data: retryData, error: retryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data: retryData, error: retryError };
  }
  
  return { data, error };
};

// Nueva función para sincronizar usuarios que no tienen perfil
export const syncUserProfile = async (user, defaultData = {}) => {
  try {
    console.log('Syncing profile for user:', user.id); // Debug
    
    // Primero verificar si ya existe el perfil
    const { data: existingProfile } = await getUserProfile(user.id);
    
    if (existingProfile) {
      console.log('Profile already exists'); // Debug
      return { data: existingProfile, error: null };
    }
    
    // Si no existe, crearlo usando los metadatos del usuario si están disponibles
    const userMetadata = user.user_metadata || {};
    const profileData = {
      id: user.id,
      email: user.email,
      name: defaultData.name || userMetadata.name || 'Usuario Rock',
      nickname: defaultData.nickname || userMetadata.nickname || user.email?.split('@')[0] || 'rockstar',
      city: defaultData.city || userMetadata.city || 'Tu Ciudad',
      phone: defaultData.phone || userMetadata.phone || '',
      instagram: defaultData.instagram || userMetadata.instagram || '',
      bio: defaultData.bio || userMetadata.bio || '',
      twitter: defaultData.twitter || userMetadata.twitter || '',
      nexus_person: defaultData.nexus_person || userMetadata.nexus_person || '',
      key_phrase: defaultData.key_phrase || userMetadata.key_phrase || '',
      avatar_url: defaultData.avatar_url || userMetadata.avatar_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error('Error syncing user profile:', error);
      return { data: null, error };
    }
    
    console.log('User profile synced successfully:', data); // Debug
    return { data, error: null };
    
  } catch (err) {
    console.error('Error in syncUserProfile:', err);
    return { data: null, error: err };
  }
};

// Nueva función para actualizar el perfil del usuario
export const updateUserProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Nueva función para subir avatar
export const uploadAvatar = async (userId, file) => {
  try {
    // Validar archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('La imagen debe ser menor a 5MB');
    }

    // Crear nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;

    // Subir archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { data: { publicUrl }, error: null };

  } catch (error) {
    return { data: null, error };
  }
};

// Función para eliminar usuario de forma segura
export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user:', userId);
    
    // Primero eliminar archivos del usuario (avatars, etc.)
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', {
        search: userId
      });
    
    if (!listError && files && files.length > 0) {
      const fileNames = files.map(file => file.name);
      const { error: deleteFilesError } = await supabase.storage
        .from('avatars')
        .remove(fileNames);
      
      if (deleteFilesError) {
        console.warn('Error deleting user files:', deleteFilesError);
      }
    }
    
    // Eliminar el usuario de auth.users (el trigger se encargará del resto)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Error deleting user from auth:', error);
      return { error };
    }
    
    console.log('User deleted successfully');
    return { error: null };
    
  } catch (err) {
    console.error('Error in deleteUser:', err);
    return { error: err };
  }
};

// Función para verificar si un usuario existe
export const userExists = async (userId) => {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    return { exists: !error && data.user, error };
  } catch (err) {
    return { exists: false, error: err };
  }
}; 