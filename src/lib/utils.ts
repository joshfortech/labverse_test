import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { PHYSICS_CONSTANTS, TITRATION_CONSTANTS, MICROSCOPE_SLIDES } from '../types';
export type { Subject, PendulumState, PendulumDataPoint, TitrationState, TitrationTrial, MicroscopeState, MicroscopeLabel, Magnification, SlideType, MicroscopeSlideData } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function calculatePeriod(length: number, gravity: number = 9.81): number {
  return 2 * Math.PI * Math.sqrt(length / gravity);
}

export function calculateGravityFromSlope(slope: number): number {
  return (4 * Math.PI * Math.PI) / slope;
}

export function calculateTiter(initial: number, final: number): number {
  return Number((final - initial).toFixed(2));
}

export function areConcordant(titers: number[], tolerance: number = 0.20): boolean {
  if (titers.length < 2) return false;
  const sorted = [...titers].sort((a, b) => a - b);
  return sorted[sorted.length - 1] - sorted[0] <= tolerance;
}

export function averageConcordantTiters(titers: number[], tolerance: number = 0.20): number | null {
  if (titers.length < 2) return null;
  const sorted = [...titers].sort((a, b) => a - b);
  const concordant: number[] = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const group = sorted.filter(t => Math.abs(t - sorted[i]) <= tolerance);
    if (group.length >= 2 && group.length > concordant.length) {
      concordant.push(...group);
    }
  }
  
  if (concordant.length === 0) return null;
  const unique = [...new Set(concordant)];
  return Number((unique.reduce((a, b) => a + b, 0) / unique.length).toFixed(2));
}

export function calculateMolarity(titer: number, baseConc: number, baseVol: number, _acidVol: number): number {
  return Number(((baseConc * baseVol) / titer).toFixed(4));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export const STORAGE_KEYS = {
  PENDULUM_STATE: 'labverse_pendulum_state',
  TITRATION_STATE: 'labverse_titration_state',
  MICROSCOPE_STATE: 'labverse_microscope_state',
  USER_PREFERENCES: 'labverse_user_preferences',
  OFFLINE_QUEUE: 'labverse_offline_queue',
} as const;

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}