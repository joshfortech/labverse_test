import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const { user, session, loading, initializeAuth, signOut } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, schoolName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, school_name: schoolName } },
    });
    return { data, error };
  }, []);

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return {
    user,
    session,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};

export const useSimulation = <T>(initialState: T, storageKey: string) => {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (e) {
        console.warn('Failed to save simulation state:', e);
      }
      return newState;
    });
  }, [storageKey]);

  const resetState = useCallback(() => {
    setState(initialState);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed to clear simulation state:', e);
    }
  }, [initialState, storageKey]);

  return [state, updateState, resetState] as const;
};

export const useStopwatch = () => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const tick = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    setElapsed(prev => prev + delta);
    animationRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const reset = useCallback(() => {
    pause();
    setElapsed(0);
    setLaps([]);
    lastTimeRef.current = 0;
  }, [pause]);

  const lap = useCallback(() => {
    if (elapsed > 0) {
      setLaps(prev => [...prev, elapsed]);
    }
  }, [elapsed]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return { elapsed, isRunning, laps, start, pause, reset, lap };
};