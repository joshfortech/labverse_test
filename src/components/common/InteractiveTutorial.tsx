import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronLeft, X, SkipForward, MousePointer } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  tip?: string;
  targetSelector: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  waitForClick?: boolean;
  waitForCondition?: () => boolean;
  manualAdvance?: boolean;
  actionLabel?: string;
}

interface InteractiveTutorialProps {
  steps: TutorialStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  color?: 'green' | 'blue' | 'orange' | 'purple';
  experimentId: string;
}

const colorStyles = {
  green: {
    ring: 'ring-emerald-400',
    ringShadow: '0 0 0 9999px rgba(16, 185, 129, 0.18)',
    tooltip: 'bg-emerald-900 text-white',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    pulse: 'animate-[pulse-ring_1.5s_ease-out_infinite]',
  },
  blue: {
    ring: 'ring-blue-400',
    ringShadow: '0 0 0 9999px rgba(59, 130, 246, 0.18)',
    tooltip: 'bg-blue-900 text-white',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    pulse: 'animate-[pulse-ring_1.5s_ease-out_infinite]',
  },
  orange: {
    ring: 'ring-orange-400',
    ringShadow: '0 0 0 9999px rgba(249, 115, 22, 0.18)',
    tooltip: 'bg-orange-900 text-white',
    accent: 'bg-orange-600',
    accentHover: 'hover:bg-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    pulse: 'animate-[pulse-ring_1.5s_ease-out_infinite]',
  },
  purple: {
    ring: 'ring-purple-400',
    ringShadow: '0 0 0 9999px rgba(168, 85, 247, 0.18)',
    tooltip: 'bg-purple-900 text-white',
    accent: 'bg-purple-600',
    accentHover: 'hover:bg-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    pulse: 'animate-[pulse-ring_1.5s_ease-out_infinite]',
  },
};

function getTargetRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return rect;
}

function getTooltipPosition(
  targetRect: DOMRect,
  preferred: 'top' | 'bottom' | 'left' | 'right',
  tooltipWidth: number,
  tooltipHeight: number
): { x: number; y: number; actualPosition: string } {
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const positions = {
    top: {
      x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      y: targetRect.top - tooltipHeight - gap,
    },
    bottom: {
      x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      y: targetRect.bottom + gap,
    },
    left: {
      x: targetRect.left - tooltipWidth - gap,
      y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
    },
    right: {
      x: targetRect.right + gap,
      y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
    },
  };

  let pos = positions[preferred];
  let actual = preferred;

  if (pos.x < 16) {
    pos = positions.right;
    actual = 'right';
  } else if (pos.x + tooltipWidth > vw - 16) {
    pos = positions.left;
    actual = 'left';
  }
  if (pos.y < 16) {
    pos = positions.bottom;
    actual = 'bottom';
  } else if (pos.y + tooltipHeight > vh - 16) {
    pos = positions.top;
    actual = 'top';
  }

  return { x: Math.max(16, pos.x), y: Math.max(16, pos.y), actualPosition: actual };
}

const TooltipArrow: React.FC<{ position: string; color: string }> = ({ position, color }) => {
  const arrowClasses = 'absolute w-3 h-3 rotate-45';
  switch (position) {
    case 'top':
      return <div className={cn(arrowClasses, color, '-bottom-1.5 left-1/2 -translate-x-1/2')} />;
    case 'bottom':
      return <div className={cn(arrowClasses, color, '-top-1.5 left-1/2 -translate-x-1/2')} />;
    case 'left':
      return <div className={cn(arrowClasses, color, '-right-1.5 top-1/2 -translate-y-1/2')} />;
    case 'right':
      return <div className={cn(arrowClasses, color, '-left-1.5 top-1/2 -translate-y-1/2')} />;
    default:
      return null;
  }
};

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip,
  color = 'green',
  experimentId,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipDims, setTooltipDims] = useState({ width: 360, height: 200 });
  const [isStepComplete, setIsStepComplete] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const conditionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevActiveRef = useRef(false);
  const conditionFnRef = useRef<(() => boolean) | undefined>(undefined);

  const styles = colorStyles[color];
  const step = steps[currentStep];

  const storageKey = `labverse-tutorial-done-${experimentId}`;
  const [tutorialDone, setTutorialDone] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });

  // Keep conditionFnRef in sync with latest step's waitForCondition
  useEffect(() => {
    conditionFnRef.current = step?.waitForCondition;
  });

  // Reset everything when isActive transitions from false to true
  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      setCurrentStep(0);
      setIsStepComplete(false);
      setTutorialDone(false);
      localStorage.removeItem(storageKey);
      setTargetRect(null);
    }
    prevActiveRef.current = isActive;
  }, [isActive, storageKey]);

  // Scroll to target element when step changes
  useEffect(() => {
    if (!isActive || tutorialDone) return;
    const selector = steps[currentStep]?.targetSelector;
    if (!selector) return;
    const el = document.querySelector(selector);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }, [isActive, tutorialDone, currentStep, steps]);

  // Track target element rect
  useEffect(() => {
    if (!isActive || tutorialDone || !step) return;

    const selector = step.targetSelector;
    const updateRect = () => {
      const rect = getTargetRect(selector);
      setTargetRect(rect);
    };

    updateRect();
    const interval = setInterval(updateRect, 300);
    return () => clearInterval(interval);
  }, [isActive, tutorialDone, currentStep, step?.targetSelector]);

  // Measure tooltip dimensions
  useEffect(() => {
    if (!isActive || tutorialDone || !step) return;

    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setTooltipDims({ width: rect.width, height: rect.height });
    }
  }, [isActive, tutorialDone, currentStep]);

  // Step interaction: click detection, condition polling, manual advance
  // Uses stable dependencies (primitive values) to avoid re-running every render
  useEffect(() => {
    if (!isActive || tutorialDone || !step) return;

    const selector = step.targetSelector;
    const waitForClick = step.waitForClick;
    const manualAdvance = step.manualAdvance;

    setIsStepComplete(false);

    if (waitForClick) {
      const el = document.querySelector(selector);
      if (!el) return;

      const handleClick = () => {
        setTimeout(() => setIsStepComplete(true), 300);
      };
      el.addEventListener('click', handleClick, { once: true, capture: true });
      return () => el.removeEventListener('click', handleClick, { capture: true });
    }

    // Check if condition is already met
    const checkCondition = () => {
      return conditionFnRef.current ? conditionFnRef.current() : false;
    };

    if (step.waitForCondition) {
      if (checkCondition()) {
        setIsStepComplete(true);
        return;
      }
      conditionRef.current = setInterval(() => {
        if (checkCondition()) {
          setIsStepComplete(true);
          if (conditionRef.current) clearInterval(conditionRef.current);
        }
      }, 500);
      return () => {
        if (conditionRef.current) clearInterval(conditionRef.current);
      };
    }

    if (manualAdvance) {
      return;
    }

    setIsStepComplete(true);
  }, [isActive, tutorialDone, currentStep, step?.targetSelector, step?.waitForClick, step?.manualAdvance]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setIsStepComplete(false);
    } else {
      localStorage.setItem(storageKey, 'true');
      setTutorialDone(true);
      onComplete();
    }
  }, [currentStep, steps.length, onComplete, storageKey]);

  // Auto-advance for non-manual steps
  useEffect(() => {
    if (isStepComplete && !step?.manualAdvance) {
      const timer = setTimeout(handleNext, 600);
      return () => clearTimeout(timer);
    }
  }, [isStepComplete, handleNext, step?.manualAdvance]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setTutorialDone(true);
    onSkip();
  }, [onSkip, storageKey]);

  const tooltipPos = useMemo(() => {
    if (!targetRect) return { x: 0, y: 0, actualPosition: 'bottom' as string };
    return getTooltipPosition(targetRect, step?.position || 'bottom', tooltipDims.width, tooltipDims.height);
  }, [targetRect, tooltipDims, step?.position]);

  if (!isActive || tutorialDone || !step || !targetRect) return null;

  const padding = 8;
  const highlightRect = {
    x: targetRect.left - padding,
    y: targetRect.top - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  const portalContent = (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 101 }}>
        <defs>
          <mask id={`tutorial-mask-${experimentId}`}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={highlightRect.x}
              y={highlightRect.y}
              width={highlightRect.width}
              height={highlightRect.height}
              rx={12}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.5)"
          mask={`url(#tutorial-mask-${experimentId})`}
        />
        <rect
          x={highlightRect.x}
          y={highlightRect.y}
          width={highlightRect.width}
          height={highlightRect.height}
          rx={12}
          fill="none"
          className={styles.ring}
          strokeWidth={3}
          strokeDasharray={isStepComplete ? '0' : '8 4'}
          style={{
            filter: `drop-shadow(0 0 8px ${color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'orange' ? '#f97316' : '#a855f7'})`,
          }}
        />
      </svg>

      <div
        className={cn(
          'absolute pointer-events-auto',
          styles.pulse
        )}
        style={{
          left: highlightRect.x - 4,
          top: highlightRect.y - 4,
          width: highlightRect.width + 8,
          height: highlightRect.height + 8,
          borderRadius: 16,
          border: `2px solid ${color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'orange' ? '#f97316' : '#a855f7'}`,
          zIndex: 102,
        }}
      />

      <div
        ref={tooltipRef}
        className={cn(
          'absolute pointer-events-auto rounded-2xl shadow-2xl max-w-sm w-80 transition-all duration-200',
          styles.tooltip
        )}
        style={{
          left: tooltipPos.x,
          top: tooltipPos.y,
          zIndex: 103,
        }}
      >
        <TooltipArrow position={tooltipPos.actualPosition} color={styles.tooltip} />

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', styles.badge)}>
                Step {currentStep + 1}/{steps.length}
              </span>
              <span className="text-white/70 text-xs font-medium">
                {isStepComplete && step.manualAdvance
                  ? 'Ready to continue'
                  : isStepComplete
                  ? '✓ Done!'
                  : step.actionLabel || 'Follow the guide'}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/50 hover:text-white/80 transition-colors"
              aria-label="Skip tutorial"
            >
              <X size={16} />
            </button>
          </div>

          <h4 className="font-bold text-white text-sm mb-1">{step.title}</h4>
          <p className="text-white/80 text-xs leading-relaxed mb-2">{step.description}</p>

          {step.tip && (
            <div className="bg-white/10 rounded-lg p-2 mb-3">
              <p className="text-white/70 text-xs">💡 {step.tip}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={() => {
                if (currentStep > 0) setCurrentStep((prev) => prev - 1);
              }}
              disabled={currentStep === 0}
              className="text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === currentStep
                      ? 'w-4 bg-white'
                      : i < currentStep
                      ? 'w-1.5 bg-white/60'
                      : 'w-1.5 bg-white/30'
                  )}
                />
              ))}
            </div>

            {isStepComplete && step.manualAdvance ? (
              <button
                onClick={handleNext}
                className={cn(
                  'text-white text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors',
                  styles.accent, styles.accentHover
                )}
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : isStepComplete ? (
              <span className="text-white text-xs font-bold flex items-center gap-1">
                Advancing... <ChevronRight size={14} />
              </span>
            ) : step.waitForClick ? (
              <span className="text-white/60 text-xs flex items-center gap-1">
                <MousePointer size={12} /> Click the highlighted element
              </span>
            ) : step.manualAdvance ? (
              <span className="text-white/60 text-xs flex items-center gap-1">
                <MousePointer size={12} /> {step.actionLabel || 'Perform the action, then click Continue'}
              </span>
            ) : (
              <button
                onClick={handleNext}
                className={cn('text-white/80 hover:text-white text-xs font-medium flex items-center gap-1')}
              >
                Skip step <SkipForward size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
};

export default InteractiveTutorial;
