import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { Button } from '../ui/button';

interface StopwatchProps {
  initialTime?: number;
  onLap?: (time: number) => void;
  autoStart?: boolean;
  precision?: 2 | 3;
}

export const Stopwatch: React.FC<StopwatchProps> = ({
  initialTime = 0,
  onLap,
  autoStart = false,
  precision = 2,
}) => {
  const [elapsed, setElapsed] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [laps, setLaps] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / Math.pow(10, 3 - precision));
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(precision, '0')}`;
  };

  const tick = (timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    setElapsed((prev) => prev + delta);
    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(tick);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
    lastTimeRef.current = 0;
  };
  const lap = () => {
    if (elapsed > 0 && onLap) {
      onLap(elapsed);
      setLaps((prev) => [...prev, elapsed]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="relative">
        <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tabular-nums">
          {formatTime(elapsed)}
        </div>
        {isRunning && (
          <div className="absolute inset-0 animate-pulse bg-lab-green/10 rounded-xl" />
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isRunning && elapsed === 0 ? (
          <Button size="lg" onClick={start} className="w-20">
            <Play className="h-5 w-5" />
          </Button>
        ) : isRunning ? (
          <>
            <Button size="lg" variant="outline" onClick={pause} className="w-20">
              <Pause className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="secondary" onClick={lap} className="w-20">
              <Flag className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" onClick={start} className="w-20">
              <Play className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={reset} className="w-20">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {laps.length > 0 && (
        <div className="w-full mt-4 max-h-32 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 mb-2">Laps</p>
          <div className="space-y-1">
            {laps.map((lapTime, index) => (
              <div key={index} className="flex justify-between text-xs font-mono text-slate-600 px-2 py-1 bg-white rounded-lg border border-slate-100">
                <span>Lap {index + 1}</span>
                <span>{formatTime(lapTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PendulumStopwatchProps {
  oscillations: number;
  targetOscillations: number;
  onComplete?: (time: number) => void;
}

export const PendulumStopwatch: React.FC<PendulumStopwatchProps> = ({
  oscillations,
  targetOscillations = 20,
  onComplete,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const tick = (timestamp: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    setElapsed((prev) => prev + delta);
    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (oscillations >= targetOscillations && isRunning) {
      setIsRunning(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      onComplete?.(elapsed);
    }
  }, [oscillations, isRunning, targetOscillations, elapsed, onComplete]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(tick);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isRunning]);

  const toggle = () => setIsRunning((prev) => !prev);
  const reset = () => { setIsRunning(false); setElapsed(0); lastTimeRef.current = 0; };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-center mb-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Timer (20 Oscillations)</p>
        <div className="font-mono text-3xl font-bold text-slate-900 tabular-nums">{formatTime(elapsed)}</div>
        <div className="mt-1 text-sm text-slate-500">
          Oscillations: <span className="font-bold text-lab-green">{oscillations}/{targetOscillations}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button className="flex-1" onClick={toggle} disabled={oscillations >= targetOscillations}>
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button variant="outline" onClick={reset} disabled={elapsed === 0 && !isRunning}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};