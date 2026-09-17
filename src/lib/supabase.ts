import { createClient } from '@supabase/supabase-js';
import type { Database, Subject } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const getSupabaseUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSupabaseSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const signUp = async (email: string, password: string, fullName: string, schoolName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        school_name: schoolName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as never)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getPracticals = async (subject?: Subject) => {
  let query = supabase.from('practicals').select('*').order('subject', { ascending: true });
  if (subject) {
    query = query.eq('subject', subject);
  }
  const { data, error } = await query;
  return { data, error };
};

export const getPracticalBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('practicals')
    .select('*')
    .eq('slug', slug)
    .single();
  return { data, error };
};

export const createExperimentSession = async (session: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('experiment_sessions')
    .insert(session as never)
    .select()
    .single();
  return { data, error };
};

export const updateExperimentSession = async (id: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('experiment_sessions')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const getUserSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('experiment_sessions')
    .select(`
      *,
      practicals (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getSession = async (id: string) => {
  const { data, error } = await supabase
    .from('experiment_sessions')
    .select(`
      *,
      practicals (*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

export const subscribeToAuthChanges = (callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};