import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LabUIState, PendulumState, TitrationState, MicroscopeState, Subject } from '../types';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../lib/utils';

interface LabStore extends LabUIState {
  pendulumState: PendulumState;
  titrationState: TitrationState;
  microscopeState: MicroscopeState;
  
  setSidebarOpen: (open: boolean) => void;
  setActiveSubject: (subject: Subject | null) => void;
  setActivePractical: (practicalId: string | null) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  updatePendulumState: (state: Partial<PendulumState>) => void;
  resetPendulumState: () => void;
  updateTitrationState: (state: Partial<TitrationState>) => void;
  resetTitrationState: () => void;
  updateMicroscopeState: (state: Partial<MicroscopeState>) => void;
  resetMicroscopeState: () => void;
  
  saveAllStates: () => void;
  loadAllStates: () => void;
  clearAllStates: () => void;
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

const defaultPendulumState: PendulumState = {
  length: 0.8,
  angle: 15,
  amplitude: 15,
  gravity: 9.81,
  isRunning: false,
  oscillations: 0,
  elapsedTime: 0,
  history: [],
  currentAngle: degreesToRadians(15),
  angularVelocity: 0,
};

const defaultTitrationState: TitrationState = {
  buretVolume: 50.0,
  titrantAdded: 0.0,
  conicalVolume: 25.0,
  indicatorAdded: false,
  stopcockOpen: false,
  flowRate: 0.1,
  pH: 11.2,
  color: '#E2E8F0',
  isEndpointReached: false,
  trials: [],
  currentTrial: {},
};

const defaultMicroscopeState: MicroscopeState = {
  magnification: '10x',
  coarseFocus: 50,
  fineFocus: 50,
  lightIntensity: 70,
  stained: false,
  activeSlide: 'onion_epidermis',
  identifiedParts: [],
  availableLabels: [],
  showLabels: false,
};

export const useLabStore = create<LabStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      activeSubject: null,
      activePractical: null,
      isFullscreen: false,
      soundEnabled: true,
      theme: 'light',
      
      pendulumState: defaultPendulumState,
      titrationState: defaultTitrationState,
      microscopeState: defaultMicroscopeState,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveSubject: (subject) => set({ activeSubject: subject }),
      setActivePractical: (practicalId) => set({ activePractical: practicalId }),
      setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      updatePendulumState: (state) => set((prev) => ({
        pendulumState: { ...prev.pendulumState, ...state }
      })),

      resetPendulumState: () => set({ pendulumState: defaultPendulumState }),

      updateTitrationState: (state) => set((prev) => ({
        titrationState: { ...prev.titrationState, ...state }
      })),

      resetTitrationState: () => set({ titrationState: defaultTitrationState }),

      updateMicroscopeState: (state) => set((prev) => ({
        microscopeState: { ...prev.microscopeState, ...state }
      })),

      resetMicroscopeState: () => set({ microscopeState: defaultMicroscopeState }),

      saveAllStates: () => {
        const { pendulumState, titrationState, microscopeState } = get();
        saveToLocalStorage(STORAGE_KEYS.PENDULUM_STATE, pendulumState);
        saveToLocalStorage(STORAGE_KEYS.TITRATION_STATE, titrationState);
        saveToLocalStorage(STORAGE_KEYS.MICROSCOPE_STATE, microscopeState);
      },

      loadAllStates: () => {
        const pendulumState = loadFromLocalStorage(STORAGE_KEYS.PENDULUM_STATE, defaultPendulumState);
        const titrationState = loadFromLocalStorage(STORAGE_KEYS.TITRATION_STATE, defaultTitrationState);
        const microscopeState = loadFromLocalStorage(STORAGE_KEYS.MICROSCOPE_STATE, defaultMicroscopeState);
        set({ pendulumState, titrationState, microscopeState });
      },

      clearAllStates: () => {
        localStorage.removeItem(STORAGE_KEYS.PENDULUM_STATE);
        localStorage.removeItem(STORAGE_KEYS.TITRATION_STATE);
        localStorage.removeItem(STORAGE_KEYS.MICROSCOPE_STATE);
        set({ 
          pendulumState: defaultPendulumState, 
          titrationState: defaultTitrationState, 
          microscopeState: defaultMicroscopeState 
        });
      },
    }),
    {
      name: 'labverse-lab-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activeSubject: state.activeSubject,
        activePractical: state.activePractical,
        isFullscreen: state.isFullscreen,
        soundEnabled: state.soundEnabled,
        theme: state.theme,
      }),
    }
  )
);