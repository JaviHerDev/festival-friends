import { supabase } from '../lib/supabase.js';

export const requireAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  
  return user;
};

export const redirectIfAuthenticated = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user && typeof window !== 'undefined') {
    window.location.href = '/festivals';
  }
  
  return user;
}; 