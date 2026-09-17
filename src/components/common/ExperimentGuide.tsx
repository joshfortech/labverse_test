import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, X, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export interface GuideStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
}

interface ExperimentGuideProps {
  experimentId: string;
  title: string;
  subtitle: string;
  objective: string;
  steps: GuideStep[];
  color?: 'green' | 'blue' | 'orange' | 'purple';
  estimatedTime?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

const colorMap = {
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    light: 'bg-emerald-100',
    ring: 'ring-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    stepBg: 'bg-emerald-50',
    stepBorder: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    light: 'bg-blue-100',
    ring: 'ring-blue-500',
    gradient: 'from-blue-500 to-indigo-600',
    stepBg: 'bg-blue-50',
    stepBorder: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    accent: 'bg-orange-600',
    accentHover: 'hover:bg-orange-700',
    light: 'bg-orange-100',
    ring: 'ring-orange-500',
    gradient: 'from-orange-500 to-red-500',
    stepBg: 'bg-orange-50',
    stepBorder: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    accent: 'bg-purple-600',
    accentHover: 'hover:bg-purple-700',
    light: 'bg-purple-100',
    ring: 'ring-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    stepBg: 'bg-purple-50',
    stepBorder: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
  },
};

const STORAGE_PREFIX = 'labverse-guide-seen-';

export const ExperimentGuide: React.FC<ExperimentGuideProps> = ({
  experimentId,
  title,
  subtitle,
  objective,
  steps,
  color = 'green',
  estimatedTime = '15-20 min',
  difficulty = 'Intermediate',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const colors = colorMap[color];
  const storageKey = `${STORAGE_PREFIX}${experimentId}`;

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const handleClose = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
      localStorage.setItem(storageKey, 'true');
    }, 200);
  }, [storageKey]);

  const handleStartExperiment = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleReopen = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
    setIsAnimating(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep]);

  if (!isOpen) {
    return (
      <Button
        onClick={handleReopen}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 z-40 shadow-lg gap-2 bg-white hover:bg-slate-50 border-slate-200"
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">Lab Guide</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          isAnimating ? 'opacity-0' : 'opacity-100'
        )}
        onClick={handleClose}
      />

      <Card
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-200',
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        {/* Header with gradient */}
        <div className={cn('bg-gradient-to-r p-6 text-white', colors.gradient)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-white/80 text-sm">{subtitle}</p>
              </div>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="iconSm"
              className="text-white hover:bg-white/20"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Meta info */}
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              {difficulty}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              ~{estimatedTime}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className={cn('h-full transition-all duration-300', colors.accent)}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {currentStep === 0 ? (
            /* Welcome / Objective step */
            <div className="space-y-4">
              <div className={cn('p-4 rounded-xl border', colors.bg, colors.border)}>
                <div className="flex items-start gap-3">
                  <Sparkles className={cn('h-5 w-5 mt-0.5 shrink-0', colors.text)} />
                  <div>
                    <h3 className={cn('font-bold text-sm mb-1', colors.text)}>Your Mission</h3>
                    <p className="text-sm text-slate-700">{objective}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">What you'll do:</h4>
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      idx === currentStep
                        ? `${colors.stepBg} ${colors.stepBorder}`
                        : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shrink-0',
                        colors.accent
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={cn('shrink-0', colors.text)}>{step.icon}</span>
                      <span className="font-medium text-slate-800 text-sm truncate">{step.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Individual step detail */
            <div className={cn('transition-opacity duration-150', isAnimating ? 'opacity-0' : 'opacity-100')}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-2xl text-white text-lg font-bold shrink-0',
                    colors.accent
                  )}
                >
                  {currentStep}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{steps[currentStep - 1]?.title}</h3>
                  <p className="text-xs text-slate-500">Step {currentStep} of {steps.length - 1}</p>
                </div>
              </div>

              <p className="text-slate-700 mb-4 leading-relaxed">
                {steps[currentStep - 1]?.description}
              </p>

              {steps[currentStep - 1]?.tip && (
                <div className={cn('p-4 rounded-xl border', colors.bg, colors.border)}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <p className={cn('text-sm font-medium', colors.text)}>
                      {steps[currentStep - 1]?.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrev}
              variant="outline"
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </Button>

            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentStep(idx);
                      setIsAnimating(false);
                    }, 150);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    idx === currentStep
                      ? `${colors.accent} w-6`
                      : 'bg-slate-300 hover:bg-slate-400'
                  )}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className={cn('gap-2 text-white', colors.accent, colors.accentHover)}>
                Next
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleStartExperiment} className={cn('gap-2 text-white', colors.accent, colors.accentHover)}>
                <Sparkles size={16} />
                Let's Go!
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExperimentGuide;
