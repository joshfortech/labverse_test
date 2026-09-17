import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
  color?: 'green' | 'blue' | 'orange' | 'red';
}

const colorClasses = {
  green: 'text-lab-green',
  blue: 'text-lab-blue',
  orange: 'text-lab-orange',
  red: 'text-red-600',
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  className,
  color = 'green',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-slate-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn('transition-all duration-1000 ease-out', colorClasses[color])}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold tabular-nums', colorClasses[color])}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

interface SubjectProgressProps {
  subject: 'physics' | 'chemistry' | 'biology';
  completed: number;
  total: number;
  onClick?: () => void;
}

export const SubjectProgressCard: React.FC<SubjectProgressProps> = ({
  subject,
  completed,
  total,
  onClick,
}) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const colors = {
    physics: 'blue',
    chemistry: 'orange',
    biology: 'green',
  } as const;

  const icons = {
    physics: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    chemistry: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14.042v.821m-5.071-5.071l1.414 1.414M15 10h2.5M15 14h2.5M5.636 5.636l1.414 1.414M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.5 9.5l4.5 4.5" />
      </svg>
    ),
    biology: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  };

  const labels = {
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
  };

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-lab-green/50 cursor-pointer',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', `bg-${colors[subject]}-100`)}>
          {icons[subject]}
        </div>
        <ProgressRing
          progress={progress}
          size={56}
          strokeWidth={6}
          color={colors[subject]}
          showPercentage
        />
      </div>
      <div className="mt-4">
        <h3 className="font-semibold text-slate-900">{labels[subject]}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {completed} of {total} practicals completed
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full transition-all duration-1000 ease-out', `bg-${colors[subject]}-600`)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};