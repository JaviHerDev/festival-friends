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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getRedirectUrl()}/auth/callback`
      }
    });
    
    if (error) {
      return { data, error };
    }
    
    // Si el usuario se crea exitosamente, crear su perfil
    if (data.user) {
      console.log('Creating user profile for:', data.user.id); // Debug
      
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name: userData.name || '',
        nickname: userData.nickname || '',
        city: userData.city || '',
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
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // No retornamos el error aquí porque el usuario sí se creó en auth
        // Solo logueamos el error para debugging
      } else {
        console.log('User profile created successfully'); // Debug
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
    
    // Si no existe, crearlo
    const profileData = {
      id: user.id,
      email: user.email,
      name: defaultData.name || 'Usuario Rock',
      nickname: defaultData.nickname || user.email?.split('@')[0] || 'rockstar',
      city: defaultData.city || 'Tu Ciudad',
      phone: defaultData.phone || '',
      instagram: defaultData.instagram || '',
      bio: defaultData.bio || '',
      twitter: defaultData.twitter || '',
      nexus_person: defaultData.nexus_person || '',
      key_phrase: defaultData.key_phrase || '',
      avatar_url: defaultData.avatar_url || '',
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