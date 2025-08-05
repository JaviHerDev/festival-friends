import { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';
import { getCurrentUser } from '../lib/supabase.js';

const ProtectedRoute = ({ children, redirectTo = '/' }) => {
  const { user, isLoading, setUser } = useStore();
  const [localLoading, setLocalLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      console.log('🔐 ProtectedRoute: Starting local auth check...'); // Debug
      setLocalLoading(true);
      
      try {
        // Double-check auth state locally
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          console.log('✅ ProtectedRoute: Local auth check found user:', currentUser.id); // Debug
          if (!user) {
            // Update store if it doesn't have the user yet
            setUser(currentUser, null);
          }
          setLocalLoading(false);
        } else {
          console.log('❌ ProtectedRoute: Local auth check - no user found'); // Debug
          setLocalLoading(false);
          
          // Wait a moment then redirect
          setTimeout(() => {
            console.log('🔄 ProtectedRoute: Redirecting to', redirectTo); // Debug
            if (typeof window !== 'undefined') {
              window.location.href = redirectTo;
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ ProtectedRoute: Local auth check failed:', error);
        setLocalLoading(false);
        
        // On error, redirect
        setTimeout(() => {
          console.log('🔄 ProtectedRoute: Auth error, redirecting to', redirectTo); // Debug
          if (typeof window !== 'undefined') {
            window.location.href = redirectTo;
          }
        }, 1000);
      }
    };

    // Only run local check if mounted and either loading is done or taking too long
    if (mounted) {
      if (!isLoading && !user) {
        // Global auth is done but no user - do local check
        checkAuth();
      } else if (user) {
        // We have a user, no need for local check
        console.log('✅ ProtectedRoute: User already available from store'); // Debug
        setLocalLoading(false);
      } else {
        // Still loading globally, wait a bit then do local check anyway
        const timer = setTimeout(() => {
          if (isLoading) {
            console.log('⏰ ProtectedRoute: Global auth taking too long, doing local check'); // Debug
            checkAuth();
          }
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [mounted, isLoading, user, redirectTo, setUser]);

  // Update local loading when global loading finishes
  useEffect(() => {
    if (!isLoading && user) {
      setLocalLoading(false);
    }
  }, [isLoading, user]);

  // Show loading while checking auth
  if (!mounted || isLoading || localLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/80">
            {!mounted ? 'Inicializando...' : 
             isLoading ? 'Verificando autenticación...' : 
             'Validando acceso...'}
          </p>
        </div>
      </div>
    );
  }

  // If we get here and no user, show redirect message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/80">Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  console.log('✅ ProtectedRoute: Access granted, showing content'); // Debug
  return <>{children}</>;
};

export default ProtectedRoute; 