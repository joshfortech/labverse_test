import React, { useEffect, useRef } from 'react';
import { useTutorialStore } from '../../stores/useTutorialStore';
import { CheckCircle2, X, MousePointer } from 'lucide-react';

export const TutorialOverlay: React.FC = () => {
  const { isActive, steps, currentStepIndex, feedbackMessage, completedStepId, resetTutorial } = useTutorialStore();
  const prevTargetRef = useRef<string | null>(null);
  const styleInjectedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      if (prevTargetRef.current) {
        const el = document.getElementById(prevTargetRef.current);
        if (el) el.classList.remove('tutorial-highlight');
        prevTargetRef.current = null;
      }
      return;
    }

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    if (prevTargetRef.current && prevTargetRef.current !== currentStep.targetId) {
      const prevEl = document.getElementById(prevTargetRef.current);
      if (prevEl) prevEl.classList.remove('tutorial-highlight');
    }

    const targetEl = document.getElementById(currentStep.targetId);
    if (targetEl) {
      targetEl.classList.add('tutorial-highlight');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      prevTargetRef.current = currentStep.targetId;
    }

    return () => {
      if (targetEl) targetEl.classList.remove('tutorial-highlight');
    };
  }, [isActive, currentStepIndex, steps]);

  useEffect(() => {
    if (!isActive || styleInjectedRef.current) return;
    const el = document.createElement('style');
    el.id = 'tutorial-overlay-styles';
    el.textContent = `
      .tutorial-highlight {
        position: relative !important;
        z-index: 50 !important;
        pointer-events: auto !important;
        box-shadow: 0 0 0 4px #10b981, 0 0 0 8px rgba(16, 185, 129, 0.25) !important;
        border-radius: 12px !important;
        transition: box-shadow 0.3s ease !important;
      }
      .tutorial-highlight::after {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 14px;
        border: 2px dashed #10b981;
        animation: tutorial-pulse-ring 1.5s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes tutorial-pulse-ring {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.02); }
      }
      .tutorial-success-flash {
        animation: tutorial-flash 0.6s ease-out;
      }
      @keyframes tutorial-flash {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
        50% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
    `;
    document.head.appendChild(el);
    styleInjectedRef.current = true;
    return () => { el.remove(); styleInjectedRef.current = false; };
  }, [isActive]);

  useEffect(() => {
    if (!completedStepId) return;
    const el = document.getElementById(completedStepId);
    if (el) {
      el.classList.add('tutorial-success-flash');
      setTimeout(() => el.classList.remove('tutorial-success-flash'), 700);
    }
  }, [completedStepId]);

  if (!isActive || !steps[currentStepIndex]) return null;

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/35 pointer-events-none transition-opacity duration-300" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border-2 border-emerald-500 max-w-lg w-full mx-4 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
            WAEC Step {currentStepIndex + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-2">
            {feedbackMessage && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-pulse">
                <CheckCircle2 size={14} /> {feedbackMessage}
              </span>
            )}
            <button
              onClick={resetTutorial}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              aria-label="Exit tutorial"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm font-semibold text-slate-800 mb-2 leading-relaxed">
          {currentStep.instruction}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <MousePointer size={14} className="text-emerald-600 shrink-0" />
          <span>Perform the highlighted action to automatically continue.</span>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
