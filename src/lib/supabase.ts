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

const OFFLINE_QUEUE_KEY = 'labverse_offline_queue';
const OFFLINE_SESSIONS_KEY = 'labverse_offline_sessions';

interface OfflineQueueItem {
  id: string;
  type: 'session_create' | 'session_update';
  payload: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('Failed to save offline queue:', e);
  }
}

function getOfflineSessions(): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem(OFFLINE_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineSessions(sessions: Record<string, unknown>[]): void {
  try {
    localStorage.setItem(OFFLINE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to save offline sessions:', e);
  }
}

function generateOfflineId(): string {
  return `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isOnline(): boolean {
  return navigator.onLine;
}

async function processOfflineQueue(): Promise<void> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const remaining: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'session_create') {
        const { error } = await supabase
          .from('experiment_sessions')
          .insert(item.payload as never)
          .select()
          .single();
        if (error) throw error;
      } else if (item.type === 'session_update') {
        const { id, ...updates } = item.payload;
        const { error } = await supabase
          .from('experiment_sessions')
          .update(updates as never)
          .eq('id', id as string)
          .select()
          .single();
        if (error) throw error;
      }
    } catch (e) {
      if (item.retries < 3) {
        remaining.push({ ...item, retries: item.retries + 1 });
      }
    }
  }

  saveOfflineQueue(remaining);
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processOfflineQueue();
  });
}

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
  if (!isOnline()) {
    const offlineId = generateOfflineId();
    const offlineSession = {
      ...session,
      id: offlineId,
      created_at: new Date().toISOString(),
    };

    const existingSessions = getOfflineSessions();
    existingSessions.push(offlineSession);
    saveOfflineSessions(existingSessions);

    const queue = getOfflineQueue();
    queue.push({
      id: offlineId,
      type: 'session_create',
      payload: session,
      timestamp: new Date().toISOString(),
      retries: 0,
    });
    saveOfflineQueue(queue);

    return { data: offlineSession as never, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('experiment_sessions')
      .insert(session as never)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    const offlineId = generateOfflineId();
    const offlineSession = {
      ...session,
      id: offlineId,
      created_at: new Date().toISOString(),
    };

    const existingSessions = getOfflineSessions();
    existingSessions.push(offlineSession);
    saveOfflineSessions(existingSessions);

    const queue = getOfflineQueue();
    queue.push({
      id: offlineId,
      type: 'session_create',
      payload: session,
      timestamp: new Date().toISOString(),
      retries: 0,
    });
    saveOfflineQueue(queue);

    return { data: offlineSession as never, error: null };
  }
};

export const updateExperimentSession = async (id: string, updates: Record<string, unknown>) => {
  if (!isOnline()) {
    const queue = getOfflineQueue();
    queue.push({
      id,
      type: 'session_update',
      payload: { id, ...updates },
      timestamp: new Date().toISOString(),
      retries: 0,
    });
    saveOfflineQueue(queue);

    const sessions = getOfflineSessions();
    const idx = sessions.findIndex((s: Record<string, unknown>) => s.id === id);
    if (idx >= 0) {
      sessions[idx] = { ...sessions[idx], ...updates };
      saveOfflineSessions(sessions);
    }

    return { data: { id, ...updates } as never, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('experiment_sessions')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    const queue = getOfflineQueue();
    queue.push({
      id,
      type: 'session_update',
      payload: { id, ...updates },
      timestamp: new Date().toISOString(),
      retries: 0,
    });
    saveOfflineQueue(queue);

    return { data: { id, ...updates } as never, error: null };
  }
};

export const getUserSessions = async (userId: string) => {
  if (!isOnline()) {
    const offlineSessions = getOfflineSessions()
      .filter((s: Record<string, unknown>) => s.user_id === userId)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const aTime = typeof a.created_at === 'string' ? a.created_at : '';
        const bTime = typeof b.created_at === 'string' ? b.created_at : '';
        return bTime.localeCompare(aTime);
      });
    return { data: offlineSessions as never, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('experiment_sessions')
      .select(`
        *,
        practicals (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const offlineSessions = getOfflineSessions()
      .filter((s: Record<string, unknown>) => s.user_id === userId)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const aTime = typeof a.created_at === 'string' ? a.created_at : '';
        const bTime = typeof b.created_at === 'string' ? b.created_at : '';
        return bTime.localeCompare(aTime);
      });

    const merged = [...(data || []), ...offlineSessions];
    return { data: merged as never, error: null };
  } catch (err) {
    const offlineSessions = getOfflineSessions()
      .filter((s: Record<string, unknown>) => s.user_id === userId);
    return { data: offlineSessions as never, error: null };
  }
};

export const getSession = async (id: string) => {
  if (!isOnline()) {
    const offlineSessions = getOfflineSessions();
    const found = offlineSessions.find((s: Record<string, unknown>) => s.id === id);
    return { data: (found as never) || null, error: found ? null : new Error('Session not found') };
  }

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

export const syncOfflineData = async (): Promise<{ synced: number; failed: number }> => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'session_create') {
        const { error } = await supabase
          .from('experiment_sessions')
          .insert(item.payload as never)
          .select()
          .single();
        if (error) throw error;
        synced++;
      } else if (item.type === 'session_update') {
        const { id, ...updates } = item.payload;
        const { error } = await supabase
          .from('experiment_sessions')
          .update(updates as never)
          .eq('id', id as string)
          .select()
          .single();
        if (error) throw error;
        synced++;
      }
    } catch (e) {
      if (item.retries < 3) {
        remaining.push({ ...item, retries: item.retries + 1 });
      } else {
        failed++;
      }
    }
  }

  saveOfflineQueue(remaining);
  return { synced, failed };
};

export const getOfflineQueueStatus = (): { pending: number; sessions: number } => {
  return {
    pending: getOfflineQueue().length,
    sessions: getOfflineSessions().length,
  };
};
