import { create } from 'zustand';
import { supabase, getCurrentUser, getUserProfile, syncUserProfile, testConnection } from '../lib/supabase.js';

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  userProfile: null,
  isLoading: false,
  authListener: null,
  
  // UI state
  isLoginModalOpen: false,
  isProfileModalOpen: false,
  notifications: [],
  unreadNotifications: 0,
  
  // Data state
  festivals: [],
  users: [],
  badges: [],
  badgeDefinitions: [],
  userBadges: [],
  
  // Auth actions
  initializeAuth: async () => {
    console.log('🔍 Initializing auth...'); // Debug
    set({ isLoading: true });
    
    // Emergency timeout - no matter what, stop loading after 3 seconds
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 Emergency timeout - stopping auth initialization'); // Debug
      set({ user: null, userProfile: null, isLoading: false });
    }, 3000);
    
    try {
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        console.log('⚠️ Supabase connection failed - initializing without auth'); // Debug
        set({ user: null, userProfile: null, isLoading: false });
        clearTimeout(emergencyTimeout);
        return;
      }

      // Obtener el usuario actual con timeout incorporado
      const user = await getCurrentUser();
      
      if (user) {
        console.log('✅ User found:', user.id); // Debug
        console.log('📋 User details:', { id: user.id, email: user.email }); // Debug
        
        // Para usuarios autenticados, intentar obtener perfil pero no bloquear
        try {
          console.log('📋 Getting user profile...'); // Debug
          const { data: profile, error } = await getUserProfile(user.id);
          
          if (profile && !error) {
            console.log('✅ Profile found:', profile); // Debug
            set({ user, userProfile: profile, isLoading: false });
          } else {
            console.log('⚠️ Profile not found, using basic user data'); // Debug
            set({ user, userProfile: null, isLoading: false });
          }
        } catch (profileError) {
          console.error('❌ Profile loading failed:', profileError);
          // Continuar con usuario básico
          set({ user, userProfile: null, isLoading: false });
        }
      } else {
        console.log('❌ No user authenticated'); // Debug
        set({ user: null, userProfile: null, isLoading: false });
      }

      // Initialize automatic survey closure check
      get().initializeSurveyClosureCheck();
      

      
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      set({ user: null, userProfile: null, isLoading: false });
    } finally {
      clearTimeout(emergencyTimeout);
    }
    
    console.log('🏁 Auth initialization finished'); // Debug  
  },

  // Force auth check
  forceAuthCheck: async () => {
    console.log('🔄 Force auth check...'); // Debug
    set({ isLoading: true });
    
    try {
      const user = await getCurrentUser();
      console.log('🔄 Force check result:', user ? `User ${user.id}` : 'No user'); // Debug
      
      if (user) {
        const { data: profile } = await getUserProfile(user.id);
        set({ user, userProfile: profile, isLoading: false });
      } else {
        set({ user: null, userProfile: null, isLoading: false });
      }
    } catch (error) {
      console.error('❌ Force auth check failed:', error);
      set({ user: null, userProfile: null, isLoading: false });
    }
  },

  // Force re-authentication
  forceReAuth: async () => {
    console.log('🔄 Force re-authentication...');
    set({ isLoading: true });
    
    try {
      // Clear current session
      await supabase.auth.signOut();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error after re-auth:', sessionError);
        set({ user: null, userProfile: null, isLoading: false });
        return { data: null, error: sessionError };
      }
      
      if (session?.user) {
        console.log('✅ Re-authentication successful:', session.user.id);
        
        // Get user profile
        const { data: profile, error: profileError } = await getUserProfile(session.user.id);
        
        set({ 
          user: session.user, 
          userProfile: profile || null, 
          isLoading: false 
        });
        
        return { data: session.user, error: null };
      } else {
        console.log('❌ No session found after re-auth');
        set({ user: null, userProfile: null, isLoading: false });
        return { data: null, error: 'No session found' };
      }
    } catch (error) {
      console.error('❌ Force re-auth failed:', error);
      set({ user: null, userProfile: null, isLoading: false });
      return { data: null, error };
    }
  },

  // Setup auth listener
  setupAuthListener: () => {
    console.log('🎧 Setting up auth listener...'); // Debug
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.id); // Debug
      
      // Handle different auth events
      if (event === 'SIGNED_UP' && session?.user) {
        const user = session.user;
        console.log('🎉 New user registered:', user.id);
        
        // Update state
        set({ user, isLoading: false });
        
        // Load user profile
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            console.log('✅ Profile loaded for new user:', profile);
            set({ userProfile: profile });
            
            // Notify about new user registration (assignment to Juergas Rock is handled by DB trigger)
            await get().notifyNewUserRegistration(profile);
          }
        } catch (error) {
          console.error('❌ Error loading profile for new user:', error);
        }
        
        // Setup realtime subscriptions
        get().setupRealtimeSubscriptions();
        
      } else if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        console.log('✅ User authenticated:', user.id);
        
        // Update state instead of reloading
        set({ user, isLoading: false });
        
        // Load user profile if not already loaded
        const currentState = get();
        if (!currentState.userProfile || currentState.userProfile.id !== user.id) {
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (profile) {
              console.log('✅ Profile loaded for auth change:', profile);
              set({ userProfile: profile });
            }
          } catch (error) {
            console.error('❌ Error loading profile on auth change:', error);
          }
        }
        
        // Setup realtime subscriptions after login
        get().setupRealtimeSubscriptions();
        
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ User signed out');
        set({ 
          user: null, 
          userProfile: null, 
          notifications: [], 
          unreadNotifications: 0, 
          isLoading: false,
          festivals: [] // Clear festivals too
        });
        
        // Cleanup realtime subscriptions
        get().cleanupRealtimeSubscriptions();
        
        // Redirect to home page only if not already there (check if window is available)
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Just update the user object, don't reload anything
        console.log('🔄 Token refreshed for user:', session.user.id);
        set({ user: session.user });
        
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        // Initial session detected, update state if needed
        console.log('🎯 Initial session detected:', session.user.id);
        const currentState = get();
        if (!currentState.user) {
          set({ user: session.user });
          // Setup realtime subscriptions for initial session
          get().setupRealtimeSubscriptions();
        }
      }
    });

    set({ authListener: subscription });
    return subscription;
  },

  // Cleanup auth listener
  cleanupAuthListener: () => {
    const { authListener } = get();
    if (authListener) {
      console.log('🧹 Cleaning up auth listener'); // Debug
      authListener.unsubscribe();
      set({ authListener: null });
    }
  },
  
  setUser: (user, profile) => {
    console.log('Setting user and profile:', { user: user?.id, profile: profile?.id }); // Debug
    set({ user, userProfile: profile });
    if (user) {
      get().loadNotifications();
    }
  },

  updateUserProfile: (updatedProfile) => {
    set({ userProfile: updatedProfile });
  },
  
  logout: async () => {
    set({ user: null, userProfile: null, notifications: [], unreadNotifications: 0 });
  },
  
  // UI actions
  setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
  setProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
  
  // Notifications
  loadNotifications: async () => {
    const { user } = get();
    if (!user) {
      console.log('❌ No user found, skipping notifications load');
      return;
    }
    
    console.log('📡 Loading notifications for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error loading notifications:', error);
        return;
      }
      
      if (data) {
        const unread = data.filter(n => !n.read).length;
        console.log(`✅ Loaded ${data.length} notifications (${unread} unread)`);
        set({ notifications: data, unreadNotifications: unread });
      }
    } catch (err) {
      console.error('❌ Exception loading notifications:', err);
    }
  },
  
  markNotificationAsRead: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (!error) {
      const { notifications } = get();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      const unread = updated.filter(n => !n.read).length;
      set({ notifications: updated, unreadNotifications: unread });
    }
  },

  markAllNotificationsAsRead: async () => {
    const { user } = get();
    if (!user) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    if (!error) {
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, read: true }));
      set({ notifications: updated, unreadNotifications: 0 });
    }
  },

  createNotification: async (notificationData) => {
    console.log('📝 Creating notification:', notificationData);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating notification:', error);
        return { data: null, error };
      }
      
      if (data) {
        console.log('✅ Notification created successfully:', data);
        // Si la notificación es para el usuario actual, actualizar el estado
        const { user } = get();
        if (user && data.user_id === user.id) {
          const { notifications } = get();
          const updated = [data, ...notifications];
          const unread = updated.filter(n => !n.read).length;
          set({ notifications: updated, unreadNotifications: unread });
        }
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Exception creating notification:', err);
      return { data: null, error: err };
    }
  },

  // Notificaciones automáticas para eventos
  notifyFestivalCreated: async (festival, creatorName) => {
    const { users } = get();
    
    // Notificar a todos los usuarios excepto al creador
    const notifications = users
      .filter(user => user.id !== festival.created_by)
      .map(user => ({
        user_id: user.id,
        type: 'festival_created',
        title: '🎪 Nuevo Festival Creado',
        message: `${creatorName} ha creado "${festival.name}"`,
        data: {
          festival_id: festival.id,
          festival_name: festival.name,
          creator_id: festival.created_by,
          creator_name: creatorName
        },
        read: false
      }));

    // Crear todas las notificaciones
    for (const notification of notifications) {
      await get().createNotification(notification);
    }
  },

  // Helper function para obtener texto del estado de asistencia
  getStatusText: (status) => {
    switch (status) {
      case 'have_ticket':
        return 'Tengo la entrada';
      case 'thinking_about_it':
        return 'Me lo estoy pensando';
      case 'not_going':
        return 'No voy';
      default:
        return status;
    }
  },

  notifyAttendanceChanged: async (festival, user, newStatus, oldStatus = null) => {
    const { userProfile } = get();
    const userName = userProfile?.name || userProfile?.nickname || 'Un rockero';
    
    // Notificar al creador del festival
    if (festival.created_by !== user.id) {
      await get().createNotification({
        user_id: festival.created_by,
        type: 'attendance_changed',
        title: '🎫 Cambio de Asistencia',
        message: `${userName} ha cambiado su estado a "${get().getStatusText(newStatus)}" en "${festival.name}"`,
        data: {
          festival_id: festival.id,
          festival_name: festival.name,
          user_id: user.id,
          user_name: userName,
          new_status: newStatus,
          old_status: oldStatus
        },
        read: false
      });
    }

    // Notificar a otros asistentes del mismo festival
    const { festivals } = get();
    const currentFestival = festivals.find(f => f.id === festival.id);
    
    if (currentFestival?.attendances) {
      const otherAttendees = currentFestival.attendances
        .filter(att => att.user_id !== user.id && att.user_id !== festival.created_by)
        .map(att => att.user_id);

      for (const attendeeId of otherAttendees) {
        await get().createNotification({
          user_id: attendeeId,
          type: 'attendance_changed',
          title: '🎫 Cambio de Asistencia',
          message: `${userName} ha cambiado su estado a "${get().getStatusText(newStatus)}" en "${festival.name}"`,
          data: {
            festival_id: festival.id,
            festival_name: festival.name,
            user_id: user.id,
            user_name: userName,
            new_status: newStatus,
            old_status: oldStatus
          },
          read: false
        });
      }
    }
  },

  notifyUserJoined: async (newUser) => {
    const { users } = get();
    
    // Notificar a usuarios existentes sobre el nuevo miembro
    const notifications = users
      .filter(user => user.id !== newUser.id)
      .map(user => ({
        user_id: user.id,
        type: 'user_joined',
        title: '👋 Nuevo Rockero',
        message: `${newUser.name} se ha unido a Festival & Friends`,
        data: {
          new_user_id: newUser.id,
          new_user_name: newUser.name,
          new_user_nickname: newUser.nickname
        },
        read: false
      }));

    for (const notification of notifications) {
      await get().createNotification(notification);
    }
  },

  deleteNotification: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (!error) {
      const { notifications } = get();
      const updated = notifications.filter(n => n.id !== notificationId);
      const unread = updated.filter(n => !n.read).length;
      set({ notifications: updated, unreadNotifications: unread });
    }
    
    return { error };
  },
  
  // Festivals
  loadFestivals: async () => {
    try {
      const { data, error } = await supabase
        .from('festivals')
        .select(`
          *,
          created_by_user:users!festivals_created_by_fkey(name, nickname),
          attendances:festival_attendances(
            user_id,
            status,
            user:users(name, nickname, avatar_url)
          )
        `)
        .order('created_at', { ascending: false }); // Orden por defecto: creación descendente
      
      if (error) {
        console.error('❌ Error loading festivals:', error);
        return;
      }

      if (data) {
        set({ festivals: data });
      } else {
        set({ festivals: [] });
      }
    } catch (error) {
      console.error('❌ Exception loading festivals:', error);
      set({ festivals: [] });
    }
  },
  
  // Users
  loadUsers: async () => {
    console.log('👥 Starting to load users...'); // Debug log
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (!error && data) {
      console.log('✅ Users loaded successfully:', data.length, 'users'); // Debug log
      console.log('📋 Sample user:', data[0]); // Debug log
      set({ users: data });
    } else {
      console.error('❌ Error loading users:', error); // Debug log
    }
  },

  // Función para notificar sobre un nuevo usuario registrado (solo se llama cuando realmente se registra alguien)
  notifyNewUserRegistration: async (newUser) => {
    const { users } = get();
    
    // Solo notificar si realmente es un usuario nuevo (no está en la lista actual)
    const isActuallyNew = !users.some(existingUser => existingUser.id === newUser.id);
    
    if (isActuallyNew) {
      await get().notifyUserJoined(newUser);
      // NOTA: La asignación automática a Juergas Rock se maneja por el trigger de la base de datos
      // No es necesario llamar a assignToJuergasRock aquí
    }
  },

  // Verificar si la asignación automática a Juergas Rock está activa
  // Para desactivar la asignación automática, cambia la fecha en assignmentDeadline
  // Ejemplo: new Date('2024-12-31T23:59:59Z') - se desactiva el 31 de diciembre de 2024
  isJuergasRockAssignmentActive: () => {
    // CAMBIAR ESTA FECHA cuando quieras desactivar la asignación automática
    const assignmentDeadline = new Date('2024-12-31T23:59:59Z');
    const now = new Date();
    return now <= assignmentDeadline;
  },

  // Asignar automáticamente a nuevos usuarios al festival "Juergas Rock"
  assignToJuergasRock: async (userId) => {
    try {
      console.log('🎸 Assigning user to Juergas Rock:', userId);
      
      // Verificar si la asignación automática está activa
      if (!get().isJuergasRockAssignmentActive()) {
        console.log('⏰ Automatic assignment to Juergas Rock has expired. Skipping assignment.');
        return { data: null, error: null };
      }
      
      console.log('✅ Automatic assignment to Juergas Rock is still active. Proceeding with assignment.');
      
      // Buscar el festival "Juergas Rock"
      let { data: juergasRock, error: festivalError } = await supabase
        .from('festivals')
        .select('id, name')
        .ilike('name', '%juergas rock%')
        .single();
      
      if (festivalError) {
        console.log('⚠️ Juergas Rock festival not found, creating it...');
        
        // Crear el festival "Juergas Rock" si no existe
        const { data: newFestival, error: createError } = await supabase
          .from('festivals')
          .insert({
            name: 'Juergas Rock',
            description: 'El festival más épico de la comunidad Festival&Friends. ¡Donde los rockeros se reúnen para vivir la música!',
            location: 'Madrid, España',
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días desde ahora
            end_date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(), // 32 días desde ahora
            category: 'rock',
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id, name')
          .single();
        
        if (createError) {
          console.error('❌ Error creating Juergas Rock festival:', createError);
          return { error: createError };
        }
        
        console.log('✅ Juergas Rock festival created:', newFestival);
        juergasRock = newFestival;
      }
      
      // Verificar si el usuario ya tiene asistencia registrada
      const { data: existingAttendance, error: checkError } = await supabase
        .from('festival_attendances')
        .select('id, status')
        .eq('user_id', userId)
        .eq('festival_id', juergasRock.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing attendance:', checkError);
        return { error: checkError };
      }
      
      if (existingAttendance) {
        console.log('ℹ️ User already has attendance for Juergas Rock:', existingAttendance.status);
        return { data: existingAttendance, error: null };
      }
      
      // Asignar automáticamente como "have_ticket" (con entrada)
      console.log('🎫 Inserting attendance with status: have_ticket for user:', userId, 'festival:', juergasRock.id);
      
      const { data: attendance, error: assignError } = await supabase
        .from('festival_attendances')
        .insert({
          user_id: userId,
          festival_id: juergasRock.id,
          status: 'have_ticket', // Siempre asignar como que tiene entrada
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (assignError) {
        console.error('❌ Error assigning user to Juergas Rock:', assignError);
        return { error: assignError };
      }
      
      console.log('✅ User assigned to Juergas Rock successfully:', attendance);
      console.log('🎫 Attendance status saved as:', attendance.status);
      
      // Recargar festivales para actualizar la UI
      await get().loadFestivals();
      
      // Verificar que el estado se guardó correctamente
      const { data: verifyAttendance, error: verifyError } = await supabase
        .from('festival_attendances')
        .select('id, status')
        .eq('user_id', userId)
        .eq('festival_id', juergasRock.id)
        .single();
      
      if (verifyError) {
        console.error('❌ Error verifying attendance status:', verifyError);
      } else {
        console.log('✅ Attendance status verified:', verifyAttendance.status);
        if (verifyAttendance.status !== 'have_ticket') {
          console.error('❌ ATTENTION: Status was not saved as have_ticket! Actual status:', verifyAttendance.status);
        }
      }
      
      return { data: attendance, error: null };
      
    } catch (err) {
      console.error('❌ Exception assigning user to Juergas Rock:', err);
      return { data: null, error: err };
    }
  },
  
  // Festival CRUD operations
  createFestival: async (festivalData) => {
    const { user } = get();
    if (!user) return { error: { message: 'Usuario no autenticado' } };

    const { data, error } = await supabase
      .from('festivals')
      .insert({
        ...festivalData,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (!error && data) {
      await get().loadFestivals();
      
      // Notificar a todos los usuarios sobre el nuevo festival
      const creatorName = get().userProfile?.name || get().userProfile?.nickname || 'Un rockero';
      await get().notifyFestivalCreated(data, creatorName);
    }

    return { data, error };
  },

  updateFestival: async (festivalId, festivalData) => {
    const { user } = get();
    if (!user) return { error: { message: 'Usuario no autenticado' } };

    const { data, error } = await supabase
      .from('festivals')
      .update({
        ...festivalData,
        updated_at: new Date().toISOString()
      })
      .eq('id', festivalId)
      .select()
      .single();

    if (!error) {
      await get().loadFestivals();
    }

    return { data, error };
  },

  deleteFestival: async (festivalId) => {
    const { user } = get();
    if (!user) {
      console.log('❌ User not authenticated');
      return { error: { message: 'Usuario no autenticado' } };
    }

    console.log('🗑️ Attempting to delete festival:', festivalId, 'user:', user.id);

    try {
      // Delete the festival - all related data will be automatically deleted via CASCADE
      const { error } = await supabase
        .from('festivals')
        .delete()
        .eq('id', festivalId);

      if (error) {
        console.log('❌ Error deleting festival:', error);
        return { error };
      }

      console.log('✅ Festival and all related data deleted successfully');
      
      // Reload festivals to update the UI
      await get().loadFestivals();
      
      return { error: null };
    } catch (error) {
      console.log('❌ Exception deleting festival:', error);
      return { error };
    }
  },

  // Festival attendance
  updateAttendance: async (festivalId, status) => {
    const { user } = get();
    if (!user) return { error: { message: 'Usuario no autenticado' } };
    
    try {
      // First, check if attendance already exists
      const { data: existingAttendance } = await supabase
        .from('festival_attendances')
        .select('id')
        .eq('user_id', user.id)
        .eq('festival_id', festivalId)
        .single();

      let result;
      
      if (existingAttendance) {
        // Update existing attendance
        result = await supabase
          .from('festival_attendances')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('festival_id', festivalId);
      } else {
        // Insert new attendance
        result = await supabase
          .from('festival_attendances')
          .insert({
            user_id: user.id,
            festival_id: festivalId,
            status,
            updated_at: new Date().toISOString()
          });
      }
      
      if (!result.error) {
        // Reload festivals to get updated attendance data
        await get().loadFestivals();
        
        // Notificar sobre el cambio de asistencia
        const { festivals } = get();
        const festival = festivals.find(f => f.id === festivalId);
        if (festival) {
          const oldStatus = existingAttendance ? existingAttendance.status : null;
          await get().notifyAttendanceChanged(festival, user, status, oldStatus);
        }
        
        console.log('✅ Attendance updated successfully');
      } else {
        console.error('❌ Error updating attendance:', result.error);
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('❌ Exception updating attendance:', error);
      return { error };
    }
  },

  // Get user attended events
  getUserAttendedEvents: async (userId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_attended_events', { user_uuid: userId });

      if (error) {
        console.error('❌ Error fetching user attended events:', error);
        return { data: [], error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Exception fetching user attended events:', error);
      return { data: [], error };
    }
  },

  // Delete user (only by themselves or admin)
  deleteUser: async (userId) => {
    const { user } = get();
    if (!user) return { error: { message: 'Usuario no autenticado' } };

    // Check if user can delete (is themselves or admin)
    if (userId !== user.id && user.role !== 'admin') {
      return { error: { message: 'No tienes permisos para eliminar este usuario' } };
    }

    // Prevent admin from deleting themselves
    if (userId === user.id && user.role === 'admin') {
      return { error: { message: 'No puedes eliminar tu propia cuenta de administrador' } };
    }

    try {
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Error deleting user profile:', profileError);
        return { error: { message: 'Error al eliminar el perfil del usuario' } };
      }

      // If admin is deleting another user, don't sign out
      // If user is deleting themselves, sign out
      if (userId === user.id) {
        await supabase.auth.signOut();
        set({ 
          user: null, 
          userProfile: null, 
          notifications: [], 
          unreadNotifications: 0,
          festivals: [],
          users: []
        });
      } else {
        // Reload users list if admin deleted someone
        await get().loadUsers();
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Exception deleting user:', error);
      return { error: { message: 'Error inesperado al eliminar el usuario' } };
    }
  },

  // Setup realtime subscriptions
  setupRealtimeSubscriptions: () => {
    const { user } = get();
    if (!user) return;

    console.log('🔔 Setting up realtime subscriptions...'); // Debug

    // Subscribe to notifications for current user
    const notificationsSubscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notification change:', payload); // Debug
          
          if (payload.eventType === 'INSERT') {
            // New notification received
            const { notifications } = get();
            const newNotification = payload.new;
            const updated = [newNotification, ...notifications];
            const unread = updated.filter(n => !n.read).length;
            set({ notifications: updated, unreadNotifications: unread });
            
            // Show toast notification
            const { toast } = require('../store/toastStore.js');
            toast.info(newNotification.title, newNotification.message);
          } else if (payload.eventType === 'UPDATE') {
            // Notification updated (e.g., marked as read)
            const { notifications } = get();
            const updated = notifications.map(n => 
              n.id === payload.new.id ? payload.new : n
            );
            const unread = updated.filter(n => !n.read).length;
            set({ notifications: updated, unreadNotifications: unread });
          } else if (payload.eventType === 'DELETE') {
            // Notification deleted
            const { notifications } = get();
            const updated = notifications.filter(n => n.id !== payload.old.id);
            const unread = updated.filter(n => !n.read).length;
            set({ notifications: updated, unreadNotifications: unread });
          }
        }
      )
      .subscribe();

    // Subscribe to festival changes
    const festivalsSubscription = supabase
      .channel('festivals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'festivals'
        },
        (payload) => {
          console.log('🎪 Festival change:', payload); // Debug
          get().loadFestivals();
        }
      )
      .subscribe();

    // Subscribe to attendance changes
    const attendanceSubscription = supabase
      .channel('attendance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'festival_attendances'
        },
        (payload) => {
          console.log('🎫 Attendance change:', payload); // Debug
          get().loadFestivals();
        }
      )
      .subscribe();

    // Store subscriptions for cleanup
    set({ 
      realtimeSubscriptions: {
        notifications: notificationsSubscription,
        festivals: festivalsSubscription,
        attendance: attendanceSubscription
      }
    });
  },

  // Cleanup realtime subscriptions
  cleanupRealtimeSubscriptions: () => {
    const { realtimeSubscriptions } = get();
    if (realtimeSubscriptions) {
      Object.values(realtimeSubscriptions).forEach(subscription => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      });
      set({ realtimeSubscriptions: null });
    }
  },

  // Badge functions
  loadBadgeDefinitions: async () => {
    try {
      // Cargar todas las insignias (no solo las activas)
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .order('rarity', { ascending: false })
        .order('name');

      if (error) {
        console.error('❌ Error loading badge definitions:', error);
        return { data: null, error };
      }

      console.log('🔍 All badge definitions loaded:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📋 Badge details:');
        data.forEach(badge => {
          console.log(`  - ${badge.name} (${badge.badge_key}) - Active: ${badge.is_active}`);
        });
      }

      set({ badgeDefinitions: data || [] });
      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception loading badge definitions:', err);
      return { data: null, error: err };
    }
  },

  loadUserBadges: async (userId = null) => {
    try {
      const targetUserId = userId || get().user?.id;
      if (!targetUserId) {
        console.error('❌ No user ID provided for loading badges');
        return { data: null, error: 'No user ID' };
      }

      console.log('🔍 Loading badges for user:', targetUserId); // Debug log

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge_definitions (
            id,
            badge_key,
            name,
            description,
            icon,
            color_gradient,
            rarity,
            category
          ),
          festivals (
            id,
            name,
            start_date
          ),
          users!user_badges_awarded_by_fkey (
            id,
            name,
            nickname
          )
        `)
        .eq('user_id', targetUserId)
        .order('awarded_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading user badges:', error);
        return { data: null, error };
      }

      console.log('✅ Badges loaded for user', targetUserId, ':', data?.length || 0, 'badges'); // Debug log
      if (data && data.length > 0) {
        console.log('📋 Sample badge data:', data[0]); // Debug log
      }

      // Update store based on whether we're loading current user or another user
      if (userId && userId !== get().user?.id) {
        // Loading another user's badges
        set({ userBadges: data || [] });
      } else {
        // Loading current user's badges
        set({ userBadges: data || [] });
      }

      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception loading user badges:', err);
      return { data: null, error: err };
    }
  },

  awardBadge: async (badgeData) => {
    try {
      const { user } = get();
      if (!user) {
        console.error('❌ No authenticated user');
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: badgeData.userId,
          badge_id: badgeData.badgeId,
          festival_id: badgeData.festivalId,
          awarded_by: user.id,
          votes_received: badgeData.votesReceived || 0
        })
        .select(`
          *,
          badge_definitions (
            id,
            badge_key,
            name,
            description,
            icon,
            color_gradient,
            rarity,
            category
          ),
          festivals (
            id,
            name,
            start_date
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error awarding badge:', error);
        return { data: null, error };
      }

      // Reload user badges
      await get().loadUserBadges(badgeData.userId);

      // Create notification for the user who received the badge
      if (badgeData.userId !== user.id) {
        await get().createNotification({
          user_id: badgeData.userId,
          type: 'general',
          title: '¡Nueva insignia!',
          message: `Has ganado la insignia "${data.badge_definitions.name}"`,
          data: {
            badge_id: data.id,
            festival_id: badgeData.festivalId
          }
        });
      }

      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception awarding badge:', err);
      return { data: null, error: err };
    }
  },

  // Debug function to check auth status
  debugAuthStatus: async () => {
    try {
      const { user } = get();
      console.log('🔍 Current user in store:', user);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 Supabase session:', session);
      console.log('🔍 Session error:', sessionError);
      
      if (session?.user) {
        console.log('🔍 Session user ID:', session.user.id);
        console.log('🔍 Session user email:', session.user.email);
      }
      
      return { user, session, error: sessionError };
    } catch (err) {
      console.error('❌ Debug auth error:', err);
      return { user: null, session: null, error: err };
    }
  },

  voteForBadge: async (voteData) => {
    try {
      const { user } = get();
      if (!user) {
        console.error('❌ No authenticated user');
        return { data: null, error: 'No authenticated user' };
      }

      console.log('🔍 Voting for badge with user:', user.id);
      console.log('🔍 Vote data:', voteData);

      // Check if user already voted for this badge in this festival
      const { data: existingVote, error: checkError } = await supabase
        .from('badge_votes')
        .select('id')
        .eq('festival_id', voteData.festivalId)
        .eq('badge_id', voteData.badgeId)
        .eq('voter_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing vote:', checkError);
        return { data: null, error: checkError };
      }

      let result;
      if (existingVote) {
        // Update existing vote
        const { data, error } = await supabase
          .from('badge_votes')
          .update({ voted_for_id: voteData.votedForId })
          .eq('id', existingVote.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating vote:', error);
          return { data: null, error };
        }
        result = data;
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('badge_votes')
          .insert({
            festival_id: voteData.festivalId,
            badge_id: voteData.badgeId,
            voter_id: user.id,
            voted_for_id: voteData.votedForId
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating vote:', error);
          return { data: null, error };
        }
        result = data;
      }

      return { data: result, error: null };
    } catch (err) {
      console.error('❌ Exception voting for badge:', err);
      return { data: null, error: err };
    }
  },

  getSurveyTextResponses: async (festivalId) => {
    try {
      // First, get the survey ID for this festival
      const { data: surveys, error: surveyError } = await supabase
        .from('festival_surveys')
        .select('id')
        .eq('festival_id', festivalId)
        .eq('is_active', true);

      if (surveyError) {
        console.error('❌ Error getting survey:', surveyError);
        return { data: [], error: null };
      }

      if (!surveys || surveys.length === 0) {
        // No survey exists for this festival
        return { data: [], error: null };
      }

      const survey = surveys[0];

      // Get all survey responses with user information
      const { data, error } = await supabase
        .from('survey_responses')
        .select(`
          id,
          responses,
          created_at,
          users (
            id,
            name,
            nickname
          )
        `)
        .eq('survey_id', survey.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting survey responses:', error);
        return { data: [], error };
      }

      // Process responses to extract text answers
      const textResponses = data.map(response => {
        const textAnswers = {};
        const responses = response.responses || {};
        
        // Extract text-based questions
        const textQuestions = [
          'best_moment',
          'improvements'
        ];

        textQuestions.forEach(question => {
          if (responses[question]) {
            textAnswers[question] = responses[question];
          }
        });

        return {
          id: response.id,
          userId: response.users?.id,
          userName: response.users?.name || response.users?.nickname || 'Usuario Anónimo',
          userNickname: response.users?.nickname,
          textAnswers,
          createdAt: response.created_at
        };
      }).filter(response => Object.keys(response.textAnswers).length > 0);

      return { data: textResponses, error: null };
    } catch (err) {
      console.error('❌ Exception getting survey text responses:', err);
      return { data: [], error: err };
    }
  },

  getBadgeWinners: async (festivalId) => {
    try {
      const { data, error } = await supabase
        .from('badge_votes')
        .select(`
          badge_id,
          voted_for_id,
          badge_definitions (
            id,
            badge_key,
            name,
            description,
            icon,
            color_gradient,
            rarity
          )
        `)
        .eq('festival_id', festivalId);

      if (error) {
        console.error('❌ Error getting badge winners:', error);
        return { data: null, error };
      }

      // Group votes by badge and count them
      const badgeVotes = {};
      data.forEach(vote => {
        const badgeKey = vote.badge_definitions.badge_key;
        if (!badgeVotes[badgeKey]) {
          badgeVotes[badgeKey] = {};
        }
        
        const userId = vote.voted_for_id;
        if (!badgeVotes[badgeKey][userId]) {
          badgeVotes[badgeKey][userId] = {
            userId: userId,
            votes: 0,
            badge: vote.badge_definitions
          };
        }
        badgeVotes[badgeKey][userId].votes++;
      });

      // Get winners (users with most votes for each badge)
      const winners = {};
      const userIds = new Set();
      
      Object.entries(badgeVotes).forEach(([badgeKey, userVotes]) => {
        const sortedUsers = Object.values(userVotes).sort((a, b) => b.votes - a.votes);
        if (sortedUsers.length > 0) {
          winners[badgeKey] = sortedUsers[0];
          userIds.add(sortedUsers[0].userId);
        }
      });

      // Get user information for winners
      if (userIds.size > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name, nickname')
          .in('id', Array.from(userIds));

        if (usersError) {
          console.error('❌ Error getting user information:', usersError);
        } else {
          // Add user information to winners
          Object.values(winners).forEach(winner => {
            const userInfo = users.find(u => u.id === winner.userId);
            if (userInfo) {
              winner.user = userInfo;
            }
          });
        }
      }

      return { data: winners, error: null };
    } catch (err) {
      console.error('❌ Exception getting badge winners:', err);
      return { data: null, error: err };
    }
  },

  // Process survey results and assign badges to winners
  processSurveyResultsAndAssignBadges: async (festivalId) => {
    try {
      console.log('🔍 Processing survey results and assigning badges for festival:', festivalId);
      
      // Get festival information
      const { data: festival, error: festivalError } = await supabase
        .from('festivals')
        .select('id, name, end_date')
        .eq('id', festivalId)
        .single();

      if (festivalError) {
        console.error('❌ Error getting festival:', festivalError);
        return { data: null, error: festivalError };
      }

      // Get badge winners
      const { data: winners, error: winnersError } = await get().getBadgeWinners(festivalId);
      
      if (winnersError) {
        console.error('❌ Error getting badge winners:', winnersError);
        return { data: null, error: winnersError };
      }

      if (!winners || Object.keys(winners).length === 0) {
        console.log('ℹ️ No badge winners found for festival:', festivalId);
        return { data: [], error: null };
      }

      console.log('🔍 Found badge winners:', winners);

      // Assign badges to winners and send notifications
      const assignedBadges = [];
      
      for (const [badgeKey, winner] of Object.entries(winners)) {
        try {
          // Check if user already has this badge for this festival
          const { data: existingBadge, error: checkError } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', winner.userId)
            .eq('badge_id', winner.badge.id)
            .eq('festival_id', festivalId)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error checking existing badge:', checkError);
            continue;
          }

          if (existingBadge) {
            console.log('ℹ️ User already has badge:', winner.userId, winner.badge.name);
            continue;
          }

          // Assign the badge
          const { data: assignedBadge, error: assignError } = await supabase
            .from('user_badges')
            .insert({
              user_id: winner.userId,
              badge_id: winner.badge.id,
              festival_id: festivalId,
              awarded_by: null, // System assignment
              votes_received: winner.votes,
              awarded_at: new Date().toISOString()
            })
            .select(`
              *,
              badge_definitions (
                id,
                badge_key,
                name,
                description,
                icon,
                color_gradient,
                rarity
              )
            `)
            .single();

          if (assignError) {
            console.error('❌ Error assigning badge:', assignError);
            continue;
          }

          console.log('✅ Badge assigned successfully:', assignedBadge);

          // Send notification to the winner
          const winnerName = winner.user?.name || winner.user?.nickname || 'Un usuario';
          const badgeName = winner.badge.name;
          const festivalName = festival.name;

          await get().createNotification({
            user_id: winner.userId,
            type: 'badge_awarded',
            title: '🏆 ¡Nueva insignia ganada!',
            message: `Has ganado la insignia "${badgeName}" en los resultados de la encuesta del festival "${festivalName}"`,
            data: {
              badge_id: assignedBadge.id,
              badge_name: badgeName,
              festival_id: festivalId,
              festival_name: festivalName,
              votes_received: winner.votes,
              awarded_at: assignedBadge.awarded_at
            },
            read: false
          });

          assignedBadges.push({
            user: winner.user,
            badge: assignedBadge,
            votes: winner.votes
          });

        } catch (error) {
          console.error('❌ Error processing badge assignment for', badgeKey, ':', error);
        }
      }

      console.log('✅ Processed badge assignments:', assignedBadges);
      return { data: assignedBadges, error: null };

    } catch (err) {
      console.error('❌ Exception processing survey results:', err);
      return { data: null, error: err };
    }
  },

  // Close survey and process results
  closeSurveyAndProcessResults: async (festivalId) => {
    try {
      console.log('🔍 Closing survey and processing results for festival:', festivalId);
      
      // Get festival information
      const { data: festival, error: festivalError } = await supabase
        .from('festivals')
        .select('id, name')
        .eq('id', festivalId)
        .single();

      if (festivalError) {
        console.error('❌ Error getting festival:', festivalError);
        return { data: null, error: festivalError };
      }

      // Close the survey by setting is_active to false
      const { data: survey, error: surveyError } = await supabase
        .from('festival_surveys')
        .select('id')
        .eq('festival_id', festivalId)
        .single();

      if (surveyError) {
        console.error('❌ Error getting survey:', surveyError);
        return { data: null, error: surveyError };
      }

      // Update survey to inactive
      const { error: updateError } = await supabase
        .from('festival_surveys')
        .update({ is_active: false, closed_at: new Date().toISOString() })
        .eq('id', survey.id);

      if (updateError) {
        console.error('❌ Error closing survey:', updateError);
        return { data: null, error: updateError };
      }

      console.log('✅ Survey closed successfully');

      // Process survey results and assign badges
      const { data: assignedBadges, error: processError } = await get().processSurveyResultsAndAssignBadges(festivalId);
      
      if (processError) {
        console.error('❌ Error processing survey results:', processError);
        return { data: null, error: processError };
      }

      // Send notification to all participants about survey closure
      const { data: participants, error: participantsError } = await supabase
        .from('survey_responses')
        .select('user_id')
        .eq('survey_id', survey.id);

      if (!participantsError && participants && participants.length > 0) {
        const participantIds = [...new Set(participants.map(p => p.user_id))];
        
        for (const participantId of participantIds) {
          await get().createNotification({
            user_id: participantId,
            type: 'survey_closed',
            title: '📊 Encuesta cerrada',
            message: `La encuesta del festival "${festival.name}" ha sido cerrada y los resultados han sido procesados.`,
            data: {
              festival_id: festivalId,
              festival_name: festival.name,
              closed_at: new Date().toISOString()
            },
            read: false
          });
        }
      }

      console.log('✅ Survey closure process completed successfully');
      return { data: { assignedBadges, festival }, error: null };

    } catch (err) {
      console.error('❌ Exception closing survey:', err);
      return { data: null, error: err };
    }
  },

  // Check and close expired surveys automatically
  checkAndCloseExpiredSurveys: async () => {
    try {
      console.log('🔍 Checking for expired surveys...');
      
      // Get all active surveys
      const { data: activeSurveys, error: surveysError } = await supabase
        .from('festival_surveys')
        .select(`
          id,
          festival_id,
          is_active,
          festivals (
            id,
            name,
            end_date
          )
        `)
        .eq('is_active', true);

      if (surveysError) {
        console.error('❌ Error getting active surveys:', surveysError);
        return { data: null, error: surveysError };
      }

      if (!activeSurveys || activeSurveys.length === 0) {
        console.log('ℹ️ No active surveys found');
        return { data: [], error: null };
      }

      const now = new Date();
      const expiredSurveys = [];
      const closedSurveys = [];

      for (const survey of activeSurveys) {
        if (!survey.festivals) continue;

        const endDate = new Date(survey.festivals.end_date);
        const surveyEndDate = new Date(endDate.getTime() + (12 * 24 * 60 * 60 * 1000)); // 12 días después
        
        if (now > surveyEndDate) {
          console.log(`🔍 Survey for festival ${survey.festivals.name} has expired`);
          expiredSurveys.push(survey);
          
          // Close the survey automatically
          const { data: closedSurvey, error: closeError } = await get().closeSurveyAndProcessResults(survey.festival_id);
          
          if (closeError) {
            console.error(`❌ Error closing expired survey for festival ${survey.festivals.name}:`, closeError);
          } else {
            console.log(`✅ Successfully closed expired survey for festival ${survey.festivals.name}`);
            closedSurveys.push(closedSurvey);
          }
        }
      }

      console.log(`✅ Checked ${activeSurveys.length} surveys, closed ${closedSurveys.length} expired surveys`);
      return { data: closedSurveys, error: null };

    } catch (err) {
      console.error('❌ Exception checking expired surveys:', err);
      return { data: null, error: err };
    }
  },

  // Initialize automatic survey closure check
  initializeSurveyClosureCheck: () => {
    console.log('🔍 Initializing automatic survey closure check...');
    
    // Clear any existing interval
    const { surveyClosureIntervalId } = get();
    if (surveyClosureIntervalId) {
      clearInterval(surveyClosureIntervalId);
    }
    
    // Check immediately when the app starts
    get().checkAndCloseExpiredSurveys();
    
    // Set up periodic check every hour
    const intervalId = setInterval(() => {
      console.log('🔍 Running periodic survey closure check...');
      get().checkAndCloseExpiredSurveys();
    }, 60 * 60 * 1000); // 1 hour
    
    // Store the interval ID so it can be cleared if needed
    set({ surveyClosureIntervalId: intervalId });
    
    console.log('✅ Automatic survey closure check initialized');
  },

  // Clean up survey closure interval
  cleanupSurveyClosureCheck: () => {
    const { surveyClosureIntervalId } = get();
    if (surveyClosureIntervalId) {
      clearInterval(surveyClosureIntervalId);
      set({ surveyClosureIntervalId: null });
      console.log('✅ Survey closure check cleaned up');
    }
  },

  // Manual check for expired surveys (for admin use)
  manualCheckExpiredSurveys: async () => {
    try {
      console.log('🔍 Manual check for expired surveys initiated...');
      const { data, error } = await get().checkAndCloseExpiredSurveys();
      
      if (error) {
        console.error('❌ Error in manual survey check:', error);
        return { data: null, error };
      }
      
      console.log('✅ Manual survey check completed:', data);
      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception in manual survey check:', err);
      return { data: null, error: err };
    }
  },

  // Get total survey responses count
  getTotalSurveyResponses: async () => {
    try {
      console.log('🔍 Getting total survey responses count...');
      
      const { data, error } = await supabase
        .from('survey_responses')
        .select('id, survey_id')
        .eq('user_id', get().user?.id);

      if (error) {
        console.error('❌ Error getting survey responses:', error);
        return { data: 0, error };
      }

      const totalResponses = data?.length || 0;
      console.log('✅ Total survey responses:', totalResponses);
      return { data: totalResponses, error: null };
    } catch (err) {
      console.error('❌ Exception getting survey responses:', err);
      return { data: 0, error: err };
    }
  },

  // Survey functions
  // Check authentication token
  checkAuthToken: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        return { data: null, error };
      }
      
      if (session?.access_token) {
        console.log('✅ Auth token found:', session.access_token.substring(0, 20) + '...');
        return { data: session.access_token, error: null };
      } else {
        console.log('❌ No auth token found');
        return { data: null, error: 'No auth token' };
      }
    } catch (err) {
      console.error('❌ Error checking auth token:', err);
      return { data: null, error: err };
    }
  },

  // Improved survey submission with better error handling
  submitSurveyResponse: async (surveyData) => {
    try {
      const { user } = get();
      if (!user) {
        console.error('❌ No authenticated user');
        return { data: null, error: 'No authenticated user' };
      }

      console.log('🔍 Submitting survey with user:', user.id);
      console.log('🔍 Survey data:', surveyData);

      // Check auth token before proceeding
      const { data: token, error: tokenError } = await get().checkAuthToken();
      if (tokenError) {
        console.error('❌ Auth token error:', tokenError);
        return { data: null, error: 'Authentication error' };
      }

      // First, create or get the survey for this festival
      const { data: existingSurvey, error: surveyError } = await supabase
        .from('festival_surveys')
        .select('id')
        .eq('festival_id', surveyData.eventId)
        .single();

      let surveyId;
      if (surveyError && surveyError.code === 'PGRST116') {
        // Survey doesn't exist, create it
        console.log('🔍 Creating new survey for festival:', surveyData.eventId);
        const { data: newSurvey, error: createError } = await supabase
          .from('festival_surveys')
          .insert({
            festival_id: surveyData.eventId,
            questions: {
              overall_rating: '¿Cómo valorarías el evento en general?',
              enjoyment_level: '¿Qué tan divertido te lo has pasado?',
              best_moment: '¿Cuál ha sido tu momento favorito?',
              atmosphere_rating: '¿Cómo valorarías el ambiente del evento?',
              would_recommend: '¿Recomendarías este evento a un amigo?',
              organization_rating: '¿Cómo valorarías la organización del evento?',
              improvements: '¿Qué mejorarías para la próxima edición?',
              would_attend_again: '¿Asistirías a otro evento similar?'
            }
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating survey:', createError);
          return { data: null, error: createError };
        }
        surveyId = newSurvey.id;
        console.log('✅ Survey created with ID:', surveyId);
      } else if (surveyError) {
        console.error('❌ Error getting survey:', surveyError);
        return { data: null, error: surveyError };
      } else {
        surveyId = existingSurvey.id;
        console.log('✅ Using existing survey ID:', surveyId);
      }

      // Check if user already submitted a survey for this festival
      const { data: existingResponse, error: checkError } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('user_id', user.id)
        .eq('survey_id', surveyId)
        .single();

      if (existingResponse) {
        console.error('❌ User already submitted survey for this festival');
        return { data: null, error: 'Ya has enviado una encuesta para este evento' };
      }

      // Submit the survey response
      console.log('🔍 Submitting survey response...');
      const { data: response, error: responseError } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: surveyId,
          user_id: user.id,
          responses: surveyData.answers
        })
        .select()
        .single();

      if (responseError) {
        console.error('❌ Error submitting survey response:', responseError);
        return { data: null, error: responseError };
      }

      console.log('✅ Survey response submitted successfully:', response.id);

      // Process badge nominations if any
      if (surveyData.badgeNominations && Object.keys(surveyData.badgeNominations).length > 0) {
        console.log('🔍 Processing badge nominations:', surveyData.badgeNominations);
        
        for (const [badgeId, userId] of Object.entries(surveyData.badgeNominations)) {
          console.log(`🔍 Processing badge ${badgeId} for user ${userId}`);
          
          const voteResult = await get().voteForBadge({
            festivalId: surveyData.eventId,
            badgeId,
            votedForId: userId
          });
          
          if (voteResult.error) {
            console.error(`❌ Error voting for badge ${badgeId}:`, voteResult.error);
            // Continue with other badges even if one fails
          } else {
            console.log(`✅ Successfully voted for badge ${badgeId}`);
          }
        }
      }

      // Update festival statistics
      console.log('🔍 Updating festival statistics...');
      const statsResult = await get().updateFestivalStatistics(surveyData.eventId);
      if (statsResult.error) {
        console.error('❌ Error updating festival statistics:', statsResult.error);
        // Don't fail the entire submission for stats errors
      } else {
        console.log('✅ Festival statistics updated successfully');
      }

      return { data: response, error: null };
    } catch (err) {
      console.error('❌ Exception submitting survey response:', err);
      return { data: null, error: err };
    }
  },

  checkSurveySubmitted: async (festivalId) => {
    try {
      const { user } = get();
      if (!user) {
        console.log('🔍 No user authenticated, skipping survey check');
        return { data: false, error: null };
      }

      console.log('🔍 Checking survey submission for user:', user.id, 'festival:', festivalId);

      // First, get the survey ID for this festival
      const { data: surveys, error: surveyError } = await supabase
        .from('festival_surveys')
        .select('id')
        .eq('festival_id', festivalId)
        .eq('is_active', true);

      if (surveyError) {
        console.error('❌ Error getting survey:', surveyError);
        return { data: false, error: null };
      }

      if (!surveys || surveys.length === 0) {
        // No survey exists for this festival
        console.log('🔍 No survey exists for this festival');
        return { data: false, error: null };
      }

      const survey = surveys[0];
      console.log('🔍 Found survey ID:', survey.id);

      // Now check if user has submitted a response for this survey
      const { data, error } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('user_id', user.id)
        .eq('survey_id', survey.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No survey submitted
        console.log('🔍 No survey submitted by user');
        return { data: false, error: null };
      }

      if (error) {
        console.error('❌ Error checking survey submission:', error);
        // Return false instead of error to avoid breaking the UI
        return { data: false, error: null };
      }

      console.log('🔍 Survey already submitted by user');
      return { data: !!data, error: null };
    } catch (err) {
      console.error('❌ Exception checking survey submission:', err);
      // Return false instead of error to avoid breaking the UI
      return { data: false, error: null };
    }
  },

  updateFestivalStatistics: async (festivalId) => {
    try {
      // First, get the survey ID for this festival
      const { data: surveys, error: surveyError } = await supabase
        .from('festival_surveys')
        .select('id')
        .eq('festival_id', festivalId)
        .eq('is_active', true);

      if (surveyError) {
        console.error('❌ Error getting survey:', surveyError);
        return { data: { survey_responses: 0 }, error: null };
      }

      if (!surveys || surveys.length === 0) {
        // No survey exists for this festival
        return { data: { survey_responses: 0 }, error: null };
      }

      const survey = surveys[0];

      // Get survey responses for this survey
      const { data: surveyResponses, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', survey.id);

      if (responsesError) {
        console.error('❌ Error getting survey responses:', responsesError);
        return { data: null, error: responsesError };
      }

      // Get badge winners
      const { data: badgeWinners, error: badgeError } = await get().getBadgeWinners(festivalId);
      if (badgeError) {
        console.error('❌ Error getting badge winners:', badgeError);
        return { data: null, error: badgeError };
      }

      // Calculate statistics
      const totalResponses = surveyResponses.length;
      const averageRating = surveyResponses.length > 0 
        ? surveyResponses.reduce((sum, response) => {
            const rating = response.responses?.overall_rating || 0;
            return sum + rating;
          }, 0) / totalResponses
        : 0;

      // Get enjoyment level and recommendation rankings from survey responses
      const enjoymentVotes = {};
      const recommendationVotes = {};
      
      surveyResponses.forEach(response => {
        const responses = response.responses || {};
        
        if (responses.enjoyment_level) {
          enjoymentVotes[responses.enjoyment_level] = (enjoymentVotes[responses.enjoyment_level] || 0) + 1;
        }
        
        if (responses.would_recommend) {
          recommendationVotes[responses.would_recommend] = (recommendationVotes[responses.would_recommend] || 0) + 1;
        }
      });

      const enjoymentRanking = Object.entries(enjoymentVotes)
        .map(([name, votes]) => ({ name, votes, percentage: Math.round((votes / totalResponses) * 100) }))
        .sort((a, b) => b.votes - a.votes);

      const recommendationRanking = Object.entries(recommendationVotes)
        .map(([name, votes]) => ({ name, votes, percentage: Math.round((votes / totalResponses) * 100) }))
        .sort((a, b) => b.votes - a.votes);

      const topEnjoyment = enjoymentRanking[0]?.name || null;
      const topRecommendation = recommendationRanking[0]?.name || null;

      // Get total participants (festival attendees)
      const { data: attendees, error: attendeeError } = await supabase
        .from('festival_attendances')
        .select('user_id')
        .eq('festival_id', festivalId)
        .in('status', ['have_ticket', 'thinking_about_it']);

      if (attendeeError) {
        console.error('❌ Error getting attendees:', attendeeError);
        return { data: null, error: attendeeError };
      }

      const totalParticipants = attendees.length;
      const responseRate = totalParticipants > 0 ? Math.round((totalResponses / totalParticipants) * 100) : 0;

      // Insert or update statistics
      const { data, error } = await supabase
        .from('festival_statistics')
        .upsert({
          festival_id: festivalId,
          total_participants: totalParticipants,
          survey_responses: totalResponses,
          response_rate: responseRate,
          average_rating: Math.round(averageRating * 100) / 100,
          top_enjoyment: topEnjoyment,
          top_recommendation: topRecommendation,
          badge_winners: badgeWinners,
          enjoyment_ranking: enjoymentRanking,
          recommendation_ranking: recommendationRanking
        }, {
          onConflict: 'festival_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating festival statistics:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('❌ Exception updating festival statistics:', err);
      return { data: null, error: err };
    }
  },

  // Test login function for debugging
  testLogin: async () => {
    try {
      console.log('🔍 Attempting test login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'javiman3.jh@gmail.com',
        password: 'test123456'
      });
      
      if (error) {
        console.error('❌ Test login failed:', error);
        return { data: null, error };
      }
      
      console.log('✅ Test login successful:', data.user.id);
      set({ user: data.user, isLoading: false });
      
      // Get user profile
      const { data: profile, error: profileError } = await getUserProfile(data.user.id);
      if (profile && !profileError) {
        set({ userProfile: profile });
        console.log('✅ User profile loaded:', profile);
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('❌ Test login exception:', err);
      return { data: null, error: err };
    }
  },

  // Global app statistics functions (public - no user required)
  getGlobalAppStats: async () => {
    try {
      console.log('🔍 Getting global app statistics (public)...');
      
      // Get total festivals
      const { data: festivals, error: festivalsError } = await supabase
        .from('festivals')
        .select('id');
      
      if (festivalsError) {
        console.error('❌ Error getting festivals count:', festivalsError);
        return { data: null, error: festivalsError };
      }
      
      const totalFestivals = festivals?.length || 0;
      
      // Get total users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');
      
      if (usersError) {
        console.error('❌ Error getting users count:', usersError);
        return { data: null, error: usersError };
      }
      
      const totalUsers = users?.length || 0;
      
      // Get total cities represented
      const { data: cities, error: citiesError } = await supabase
        .from('users')
        .select('city')
        .not('city', 'is', null);
      
      if (citiesError) {
        console.error('❌ Error getting cities count:', citiesError);
        return { data: null, error: citiesError };
      }
      
      const uniqueCities = new Set(cities?.map(user => user.city).filter(city => city && city.trim() !== ''));
      const totalCities = uniqueCities.size;
      
      // Get total badges awarded (instead of connections)
      const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('id');
      
      if (badgesError) {
        console.error('❌ Error getting badges count:', badgesError);
        return { data: null, error: badgesError };
      }
      
      const totalBadges = badges?.length || 0;
      
      const stats = {
        totalFestivals,
        totalUsers,
        totalCities,
        totalBadges
      };
      
      console.log('✅ Global app statistics (public):', stats);
      return { data: stats, error: null };
    } catch (err) {
      console.error('❌ Exception getting global app statistics:', err);
      return { data: null, error: err };
    }
  },

  // Simple gallery images function
  getGalleryImages: async () => {
    try {
      console.log('🔍 Loading gallery images...');
      
      // Direct list of festival images (excluding Wacho)
      const festivalImages = [
        'IMG-20250804-WA0004.jpg',
        'IMG-20250802-WA0023.jpg',
        'IMG-20250803-WA0040.jpg',
        'IMG-20250801-WA0015.jpg',
        'IMG-20250802-WA0025.jpg',
        'IMG-20250502-WA0022.jpg',
        'IMG-20250504-WA0107.jpg',
        'IMG-20250504-WA0024.jpg',
        'IMG-20250504-WA0014.jpg'
      ];
      
      const imageUrls = festivalImages.map(name => ({
        name: name,
        url: `https://mvlrmnxatfpfjnrwzukz.supabase.co/storage/v1/object/public/frontimages/${name}`
      }));
      
      console.log('✅ Gallery images loaded:', imageUrls.length);
      return { data: imageUrls, error: null };
    } catch (err) {
      console.error('❌ Error loading gallery images:', err);
      return { data: [], error: err };
    }
  },

  // Check available notification types
  checkNotificationTypes: async () => {
    try {
      console.log('🔍 Checking available notification types...');
      
      // Try to get the enum values by querying existing notifications
      const { data: existingNotifications, error } = await supabase
        .from('notifications')
        .select('type')
        .limit(10);
      
      if (error) {
        console.error('❌ Error checking notification types:', error);
        return { data: null, error };
      }
      
      const types = [...new Set(existingNotifications?.map(n => n.type) || [])];
      console.log('📋 Available notification types:', types);
      
      return { data: types, error: null };
    } catch (err) {
      console.error('❌ Exception checking notification types:', err);
      return { data: null, error: err };
    }
  },

  // Assign Wacho Patron badge to user
  assignWachoPatronBadge: async () => {
    try {
      const { user } = get();
      
      if (!user) {
        console.error('❌ No user logged in');
        return { data: null, error: 'No user logged in' };
      }

      console.log('🔍 Assigning Wacho Patron badge to user:', user.id);

      // First, check if the badge definition exists
      const { data: badgeDefinition, error: badgeError } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('badge_key', 'wacho_patron')
        .single();

      if (badgeError) {
        console.error('❌ Error checking badge definition:', badgeError);
        console.log('🔍 Creating badge definition for wacho_patron...');
        
        // Create the badge definition if it doesn't exist
        const { data: newBadgeDef, error: createError } = await supabase
          .from('badge_definitions')
          .insert({
            badge_key: 'wacho_patron',
            name: 'Padrino/a de Wacho',
            description: 'Apadrinó al Wacho en su momento de necesidad',
            icon: '🤝',
            color_gradient: 'from-red-500 to-pink-500',
            rarity: 'legendary',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating badge definition:', createError);
          return { data: null, error: createError };
        }

        console.log('✅ Badge definition created:', newBadgeDef);
      } else {
        console.log('✅ Badge definition found:', badgeDefinition);
      }

      // Check if user already has the Wacho Patron badge
      const { data: existingBadge, error: checkError } = await supabase
        .from('user_badges')
        .select(`
          id,
          badge_definitions!inner (
            id,
            badge_key,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('badge_definitions.badge_key', 'wacho_patron')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing Wacho Patron badge:', checkError);
        return { data: null, error: checkError };
      }

      if (existingBadge) {
        console.log('ℹ️ User already has Wacho Patron badge');
        return { data: existingBadge, error: null };
      }

      // Get the badge definition ID
      const { data: badgeDef, error: badgeDefError } = await supabase
        .from('badge_definitions')
        .select('id')
        .eq('badge_key', 'wacho_patron')
        .single();

      if (badgeDefError) {
        console.error('❌ Error getting badge definition ID:', badgeDefError);
        return { data: null, error: badgeDefError };
      }

      console.log('🔍 Badge definition ID:', badgeDef.id);

      // Assign the Wacho Patron badge
      console.log('🔍 Inserting user badge record...');
      const { data: assignedBadge, error: assignError } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeDef.id,
          festival_id: null, // Not festival-specific
          awarded_by: null, // System assignment
          votes_received: null, // Not vote-based
          awarded_at: new Date().toISOString()
        })
        .select(`
          *,
          badge_definitions (
            id,
            badge_key,
            name,
            description,
            icon,
            color_gradient,
            rarity
          )
        `)
        .single();

      if (assignError) {
        console.error('❌ Error assigning Wacho Patron badge:', assignError);
        return { data: null, error: assignError };
      }

      console.log('✅ Wacho Patron badge assigned successfully:', assignedBadge);

      // Verify the badge was assigned by checking again
      const { data: verifyBadge, error: verifyError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_id', badgeDef.id)
        .single();

      if (verifyError) {
        console.error('❌ Error verifying badge assignment:', verifyError);
      } else {
        console.log('✅ Badge assignment verified:', verifyBadge);
      }

      // Check available notification types first
      const { data: availableTypes } = await get().checkNotificationTypes();
      
      // Use a valid notification type
      const notificationType = availableTypes?.includes('badge') ? 'badge' : 
                              availableTypes?.includes('achievement') ? 'achievement' : 
                              availableTypes?.includes('general') ? 'general' : 
                              'general'; // fallback
      
      console.log('🔍 Sending notification with type:', notificationType);
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: notificationType,
          title: '¡Nueva Insignia Ganada!',
          message: `Has ganado la insignia "Padrino/a de Wacho" por apadrinar al Wacho en su momento de necesidad. ¡Eres un verdadero héroe de la comunidad festivalera! 🎸`,
          data: {
            badge_id: 'wacho_patron',
            badge_name: 'Padrino/a de Wacho',
            icon: '🤝'
          },
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('❌ Error sending notification:', notificationError);
      } else {
        console.log('✅ Notification sent successfully');
      }

      return { data: assignedBadge, error: null };
    } catch (err) {
      console.error('❌ Exception assigning Wacho Patron badge:', err);
      return { data: null, error: err };
    }
  },
}));

export default useStore; 