import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StepRequirement {
  id: string;
  targetId: string;
  instruction: string;
  correctiveHint: string;
  validate: (state: Record<string, unknown>) => boolean;
  waecNote?: string;
  repeatNote?: string;
}

interface TutorialState {
  isOpen: boolean;
  currentStepIndex: number;
  steps: StepRequirement[];
  lastError: string | null;
  _debounceTimer: ReturnType<typeof setTimeout> | null;
  startTutorial: (steps: StepRequirement[]) => void;
  toggleTutorial: (open?: boolean) => void;
  validateAndAdvance: (currentState: Record<string, unknown>) => boolean;
  debouncedAdvance: (currentState: Record<string, unknown>, delay?: number) => void;
  cancelDebouncedAdvance: () => void;
  clearError: () => void;
  resetTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      isOpen: true,
      currentStepIndex: 0,
      steps: [],
      lastError: null,
      _debounceTimer: null,

      startTutorial: (steps) => {
        const { _debounceTimer } = get();
        if (_debounceTimer) clearTimeout(_debounceTimer);
        set({ steps, currentStepIndex: 0, isOpen: true, lastError: null, _debounceTimer: null });
      },

      toggleTutorial: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      validateAndAdvance: (currentState) => {
        const { steps, currentStepIndex } = get();
        const currentStep = steps[currentStepIndex];
        if (!currentStep) return false;

        if (currentStep.validate(currentState)) {
          const nextIndex = currentStepIndex + 1;
          set({
            currentStepIndex: nextIndex,
            lastError: null,
            isOpen: nextIndex < steps.length,
          });
          return true;
        } else {
          set({ lastError: currentStep.correctiveHint });
          return false;
        }
      },

      debouncedAdvance: (currentState, delay = 1500) => {
        const { _debounceTimer } = get();
        if (_debounceTimer) clearTimeout(_debounceTimer);
        const timer = setTimeout(() => {
          get().validateAndAdvance(currentState);
          set({ _debounceTimer: null });
        }, delay);
        set({ _debounceTimer: timer });
      },

      cancelDebouncedAdvance: () => {
        const { _debounceTimer } = get();
        if (_debounceTimer) {
          clearTimeout(_debounceTimer);
          set({ _debounceTimer: null });
        }
      },

      clearError: () => set({ lastError: null }),

      resetTutorial: () => {
        const { _debounceTimer } = get();
        if (_debounceTimer) clearTimeout(_debounceTimer);
        set({ currentStepIndex: 0, isOpen: false, lastError: null, steps: [], _debounceTimer: null });
      },
    }),
    {
      name: 'labverse_tutorial_progress',
    }
  )
);
