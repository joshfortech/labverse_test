import React, { useEffect, useRef } from 'react';
import { HelpCircle, AlertCircle, X } from 'lucide-react';
import { useTutorialStore } from '../../stores/useTutorialStore';

export const TutorialOverlay: React.FC = () => {
  const { isOpen, steps, currentStepIndex, lastError, toggleTutorial, resetTutorial } = useTutorialStore();
  const prevTargetRef = useRef<string | null>(null);
  const styleInjectedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !styleInjectedRef.current) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    if (prevTargetRef.current && prevTargetRef.current !== currentStep.targetId) {
      const prevEl = document.getElementById(prevTargetRef.current);
      if (prevEl) {
        prevEl.classList.remove('tutorial-highlight');
        prevEl.style.removeProperty('z-index');
        prevEl.style.removeProperty('pointer-events');
      }
    }

    const targetEl = document.getElementById(currentStep.targetId);
    if (targetEl) {
      targetEl.classList.add('tutorial-highlight');
      targetEl.style.zIndex = '50';
      targetEl.style.pointerEvents = 'auto';
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      prevTargetRef.current = currentStep.targetId;
    }

    return () => {
      if (targetEl) {
        targetEl.classList.remove('tutorial-highlight');
        targetEl.style.removeProperty('z-index');
        targetEl.style.removeProperty('pointer-events');
      }
    };
  }, [isOpen, currentStepIndex, steps]);

  useEffect(() => {
    if (styleInjectedRef.current) return;
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
      @keyframes tutorial-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
      .animate-shake {
        animation: tutorial-shake 0.4s ease-in-out;
      }
    `;
    document.head.appendChild(el);
    styleInjectedRef.current = true;
    return () => {
      el.remove();
      styleInjectedRef.current = false;
    };
  }, []);

  if (!isOpen || !steps[currentStepIndex]) return null;

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/30 pointer-events-none transition-opacity duration-300" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border-2 border-emerald-500 max-w-lg w-full mx-4 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <HelpCircle size={14} /> Step {currentStepIndex + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTutorial(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold underline"
            >
              Minimize
            </button>
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

        {currentStep.waecNote && (
          <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg mb-2 leading-relaxed">
            <span className="font-bold">WAEC:</span> {currentStep.waecNote}
          </p>
        )}

        {currentStep.repeatNote && (
          <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded-lg mb-2 leading-relaxed">
            <span className="font-bold">Repeat:</span> {currentStep.repeatNote}
          </p>
        )}

        {lastError && (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl animate-shake">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>{lastError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;
