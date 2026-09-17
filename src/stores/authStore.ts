import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, AuthState } from '../types';
import { supabase, getProfile, signOut as supabaseSignOut } from '../lib/supabase';

interface AuthStore extends AuthState {
  setUser: (user: UserProfile | null) => void;
  setSession: (session: unknown | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),

      signOut: async () => {
        await supabaseSignOut();
        set({ user: null, session: null });
      },

      initializeAuth: async () => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await getProfile(session.user.id);
          set({ user: profile, session, loading: false });
        } else {
          set({ user: null, session: null, loading: false });
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await getProfile(session.user.id);
            set({ user: profile, session, loading: false });
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, session: null, loading: false });
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            const { data: profile } = await getProfile(session.user.id);
            set({ user: profile, session });
          }
        });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .update(updates as never)
          .eq('id', user.id)
          .select()
          .single();
        
        if (data && !error) {
          set({ user: data });
        }
      },
    }),
    {
      name: 'labverse-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);