import { create } from 'zustand';

export interface TutorialStep {
  id: string;
  targetId: string;
  instruction: string;
  hintOnTrack: string;
  validationCheck: (state: Record<string, unknown>) => boolean;
}

interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  feedbackMessage: string | null;
  completedStepId: string | null;
  startTutorial: (steps: TutorialStep[]) => void;
  validateAndAdvance: (currentState: Record<string, unknown>) => boolean;
  setFeedback: (msg: string | null) => void;
  resetTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,
  steps: [],
  feedbackMessage: null,
  completedStepId: null,
  startTutorial: (steps) =>
    set({ steps, currentStepIndex: 0, isActive: true, feedbackMessage: null, completedStepId: null }),
  validateAndAdvance: (currentState) => {
    const { steps, currentStepIndex } = get();
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return false;

    if (currentStep.validationCheck(currentState)) {
      set({ completedStepId: currentStep.id, feedbackMessage: currentStep.hintOnTrack });
      setTimeout(() => {
        const nextIndex = currentStepIndex + 1;
        set({
          currentStepIndex: nextIndex,
          isActive: nextIndex < steps.length,
          feedbackMessage: null,
          completedStepId: null,
        });
      }, 1200);
      return true;
    }
    return false;
  },
  setFeedback: (msg) => set({ feedbackMessage: msg }),
  resetTutorial: () =>
    set({ currentStepIndex: 0, isActive: false, steps: [], feedbackMessage: null, completedStepId: null }),
}));
