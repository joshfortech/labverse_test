import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle, FileText, HelpCircle, Target, Timer, Ruler, Lightbulb, LineChart } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Slider } from '../../../components/ui/slider';
import { Label } from '../../../components/ui/label';
import { ProgressRing } from '../../../components/common/ProgressRing';
import { ExperimentGuide, type GuideStep } from '../../../components/common/ExperimentGuide';
import { TutorialOverlay } from '../../../components/lab/TutorialOverlay';
import { useTutorialStore, type StepRequirement } from '../../../stores/useTutorialStore';
import { useLabStore } from '../../../stores/labStore';
import { useAuthStore } from '../../../stores/authStore';
import { createExperimentSession } from '../../../lib/supabase';
import { useToast } from '../../../components/common/Toast';
import { cn, formatTime, calculatePeriod, calculateGravityFromSlope, PHYSICS_CONSTANTS } from '../../../lib/utils';
import { WAECGraph, type GraphPoint } from '../../../components/common/WAECGraph';
import type { PendulumDataPoint } from '../../../types';

const overviewSteps: GuideStep[] = [
  {
    icon: <Target size={20} />,
    title: 'Set the Pendulum Length',
    description: 'Use the slider to set the length of the pendulum string. Start with a short length (e.g., 0.30 m) and gradually increase it. You will test 5 different lengths.',
    tip: 'WAEC requires at least 5 different lengths for a complete set of readings.',
  },
  {
    icon: <Ruler size={20} />,
    title: 'Set the Release Angle',
    description: 'Choose an angle between 5° and 30°. The angle should remain constant throughout all your trials. A small angle (10-15°) ensures simple harmonic motion.',
    tip: 'Keep the same angle for all lengths — only the length changes between trials.',
  },
  {
    icon: <Play size={20} />,
    title: 'Release and Time 20 Oscillations',
    description: 'Click "Release & Start" to begin. The pendulum will swing exactly 20 complete oscillations. Watch the oscillation counter and timer — it stops automatically at 20.',
    tip: 'One complete oscillation = left → right → back to start. The timer stops automatically!',
  },
  {
    icon: <Plus size={20} />,
    title: 'Record Your Data',
    description: 'After the timer stops, click "Record Data" to save the reading. This stores the length, time for 20 oscillations, period (T), and T² in your observation table.',
    tip: 'Repeat for all 5 lengths. You need at least 2 data points to calculate g.',
  },
  {
    icon: <FileText size={20} />,
    title: 'Analyze & Submit',
    description: 'Once you have 5 readings, click "Submit Worksheet". The system calculates your experimental g from the T² vs L slope. Acceptable range: 9.6 – 10.0 m/s².',
    tip: 'The formula: g = 4π²/S where S is the slope of T² vs L graph.',
  },
];

const tutorialSteps: StepRequirement[] = [
  {
    id: 'set-length',
    targetId: 'pendulum-length-slider',
    instruction: 'Drag the Length slider to set the pendulum string length. Any value between 0.20 m and 1.20 m works.',
    correctiveHint: 'Drag the Length slider to change the value. The slider is highlighted in green — just move it.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      return typeof s.length === 'number' && s.length >= 0.2 && s.length <= 1.2;
    },
    waecNote: 'WAEC requires plotting a T² vs L graph. You need at least 5 different lengths to draw a reliable straight line through the data points.',
  },
  {
    id: 'set-angle',
    targetId: 'pendulum-angle-slider',
    instruction: 'Drag the Release Angle slider to set the angle. 10° to 15° is ideal for simple harmonic motion.',
    correctiveHint: 'Drag the Release Angle slider. Any value between 5° and 30° is acceptable.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      return typeof s.angle === 'number' && s.angle >= 5 && s.angle <= 30;
    },
    waecNote: 'The angle must stay constant across all trials — only the length changes between trials. Small angles (≤15°) ensure the motion approximates simple harmonic motion.',
  },
  {
    id: 'release',
    targetId: 'pendulum-start-btn',
    instruction: 'Click "Release & Start" to begin the pendulum swing. The timer will run for exactly 20 oscillations.',
    correctiveHint: 'Click the green "Release & Start" button to release the pendulum.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      return s.isRunning === true;
    },
    waecNote: 'WAEC specifies timing 20 complete oscillations to reduce the effect of reaction time on the measured period. The timer stops automatically at 20.',
  },
  {
    id: 'record',
    targetId: 'pendulum-record-btn',
    instruction: 'After the pendulum stops (20 oscillations complete), click "Record Data" to save your measurement.',
    correctiveHint: 'Wait for the pendulum to stop swinging, then click "Record Data". The button will enable once oscillations are complete.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      const history = s.history as PendulumDataPoint[] | undefined;
      return !!history && history.length >= 1;
    },
    waecNote: 'Record L to 2 d.p., t₂₀ to 2 d.p., T to 3 d.p., T² to 3 d.p. These values go into your observation table.',
  },
  {
    id: 'repeat',
    targetId: 'pendulum-reset-btn',
    instruction: 'You have recorded 1 data point. To complete the WAEC practical, you need 5 different lengths. Click "Reset" to clear the data, then click the Tutorial button again to walk through the next trial.',
    correctiveHint: 'Click the "Reset" button to clear your data, then restart the tutorial for the next length.',
    validate: () => true,
    waecNote: 'WAEC requires 5 different lengths (e.g., 0.30, 0.50, 0.70, 0.90, 1.10 m) with the same angle. Plot T² vs L and draw a line of best fit to calculate g = 4π²/S.',
    repeatNote: 'Click "Reset" now, then click the Tutorial button in the header to walk through the next trial. After 5 trials, use the digital graph at the bottom of the page to plot your points and draw a line of best fit.',
  },
];

export const PendulumLab: React.FC = () => {
  const { pendulumState, updatePendulumState, saveAllStates } = useLabStore();
  const { user } = useAuthStore();
  const { show } = useToast();
  const { isOpen: tutorialIsOpen, validateAndAdvance, debouncedAdvance } = useTutorialStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pendulumSectionRef = useRef<HTMLDivElement>(null);
  const physicsAnimRef = useRef<number | null>(null);
  const drawAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const graphSectionRef = useRef<HTMLDivElement>(null);
  const [showGuide] = useState(true);

  const { length, angle, gravity, isRunning, oscillations, elapsedTime, history } = pendulumState;
  const currentAngleRef = useRef(pendulumState.currentAngle);
  const angularVelocityRef = useRef(pendulumState.angularVelocity);

  const [graphPoints, setGraphPoints] = useState<GraphPoint[]>([]);

  const degreesToRadians = (deg: number) => (deg * Math.PI) / 180;

  useEffect(() => {
    if (history.length > 0 && graphPoints.length === 0) {
      setGraphPoints(history.map((p, i) => ({
        x: p.length,
        y: p.periodSquared,
        id: `auto-${i}`,
      })));
    }
  }, [history]);

  const tryTutorialAdvance = useCallback(() => {
    if (!tutorialIsOpen) return;
    const state = useLabStore.getState().pendulumState;
    validateAndAdvance(state as unknown as Record<string, unknown>);
  }, [tutorialIsOpen, validateAndAdvance]);

  const tryTutorialDebounced = useCallback(() => {
    if (!tutorialIsOpen) return;
    const state = useLabStore.getState().pendulumState;
    debouncedAdvance(state as unknown as Record<string, unknown>);
  }, [tutorialIsOpen, debouncedAdvance]);

  const resetSimulation = useCallback(() => {
    const newAngle = degreesToRadians(angle);
    currentAngleRef.current = newAngle;
    angularVelocityRef.current = 0;
    lastTimeRef.current = 0;
    updatePendulumState({
      isRunning: false,
      oscillations: 0,
      elapsedTime: 0,
      currentAngle: newAngle,
      angularVelocity: 0,
    });
  }, [angle, updatePendulumState]);

  useEffect(() => {
    if (!isRunning) {
      if (physicsAnimRef.current) cancelAnimationFrame(physicsAnimRef.current);
      return;
    }

    let localAngle = currentAngleRef.current;
    let localVelocity = angularVelocityRef.current;
    let localOscillations = oscillations;
    let localElapsed = elapsedTime;

    const step = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.016);
      lastTimeRef.current = timestamp;

      const angularAcceleration = -(gravity / length) * Math.sin(localAngle);
      const newVelocity = localVelocity + angularAcceleration * dt;
      const newAngle = localAngle + newVelocity * dt;

      const prevSign = Math.sign(localVelocity);
      const currSign = Math.sign(newVelocity);
      if (currSign !== 0 && currSign !== prevSign) {
        localOscillations += 1;
      }

      localVelocity = newVelocity;
      localAngle = newAngle;
      localElapsed += dt;

      currentAngleRef.current = localAngle;
      angularVelocityRef.current = localVelocity;

      if (localOscillations >= 20) {
        updatePendulumState({
          isRunning: false,
          oscillations: localOscillations,
          elapsedTime: localElapsed,
          currentAngle: localAngle,
          angularVelocity: localVelocity,
        });
        return;
      }

      physicsAnimRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = 0;
    physicsAnimRef.current = requestAnimationFrame(step);

    const syncInterval = setInterval(() => {
      updatePendulumState({
        oscillations: localOscillations,
        elapsedTime: localElapsed,
        currentAngle: localAngle,
        angularVelocity: localVelocity,
      });
    }, 100);

    return () => {
      if (physicsAnimRef.current) cancelAnimationFrame(physicsAnimRef.current);
      clearInterval(syncInterval);
      updatePendulumState({
        oscillations: localOscillations,
        elapsedTime: localElapsed,
        currentAngle: localAngle,
        angularVelocity: localVelocity,
      });
    };
  }, [isRunning, length, gravity, updatePendulumState, oscillations, elapsedTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const originX = width / 2;
      const originY = 60;
      const scale = Math.min(width, height) * 0.35;
      const pixelLength = length * scale;

      const drawAngle = currentAngleRef.current;
      const bobX = originX + pixelLength * Math.sin(drawAngle);
      const bobY = originY + pixelLength * Math.cos(drawAngle);

      ctx.save();
      ctx.translate(originX, originY);

      if (showGuide) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, pixelLength);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 10; i <= 60; i += 10) {
          const rad = degreesToRadians(i);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(pixelLength * Math.sin(rad), pixelLength * Math.cos(rad));
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bobX - originX, bobY - originY);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      const gradient = ctx.createRadialGradient(bobX - originX - 8, bobY - originY - 8, 2, bobX - originX, bobY - originY, 20);
      gradient.addColorStop(0, '#34D399');
      gradient.addColorStop(1, '#059669');

      ctx.beginPath();
      ctx.arc(bobX - originX, bobY - originY, 20, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#065F46';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bobX - originX - 5, bobY - originY - 5, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      ctx.restore();

      ctx.fillStyle = '#1E293B';
      ctx.fillRect(originX - 80, originY - 55, 160, 10);
      ctx.fillRect(originX - 5, originY - 55, 10, 60);

      drawAnimRef.current = requestAnimationFrame(draw);
    };

    drawAnimRef.current = requestAnimationFrame(draw);
    return () => { if (drawAnimRef.current) cancelAnimationFrame(drawAnimRef.current); };
  }, [length, showGuide]);

  const handleStartStop = () => {
    if (oscillations >= 20 && isRunning) return;
    if (!isRunning) {
      lastTimeRef.current = 0;
      setTimeout(() => {
        pendulumSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    updatePendulumState({ isRunning: !isRunning });
    setTimeout(tryTutorialAdvance, 50);
  };

  const handleRecord = () => {
    if (oscillations === 0) {
      show({ type: 'warning', title: 'No data', message: 'Release the pendulum and wait for oscillations first.' });
      return;
    }
    const period = elapsedTime / oscillations;
    const periodSquared = Number((period * period).toFixed(3));

    const newPoint: PendulumDataPoint = {
      length: Number(length.toFixed(2)),
      time20: Number(elapsedTime.toFixed(2)),
      period: Number(period.toFixed(3)),
      periodSquared,
    };

    updatePendulumState({ history: [...history, newPoint] });
    saveAllStates();
    show({ type: 'success', title: 'Data recorded!', message: `L=${length.toFixed(2)} m, T=${period.toFixed(3)} s, T²=${periodSquared.toFixed(3)} s²` });
    setTimeout(tryTutorialAdvance, 50);
  };

  const handleReset = () => {
    resetSimulation();
    updatePendulumState({ history: [] });
    saveAllStates();
  };

  const handleLengthChange = (value: number) => {
    if (isRunning) return;
    updatePendulumState({ length: value, amplitude: angle });
    resetSimulation();
    tryTutorialDebounced();
  };

  const handleAngleChange = (value: number) => {
    if (isRunning) return;
    updatePendulumState({ angle: value, amplitude: value });
    resetSimulation();
    tryTutorialDebounced();
  };

  const theoreticalPeriod = calculatePeriod(length, gravity);
  const theoreticalPeriodSq = Number((theoreticalPeriod * theoreticalPeriod).toFixed(3));
  const experimentalG = history.length >= 2 ? calculateGravityFromSlope(
    (history[history.length - 1].periodSquared - history[0].periodSquared) /
    (history[history.length - 1].length - history[0].length)
  ) : null;

  const handleSubmitWorksheet = async () => {
    if (!user) {
      show({ type: 'error', title: 'Not logged in', message: 'Please log in to submit worksheets.' });
      return;
    }
    if (history.length === 0) {
      show({ type: 'warning', title: 'No data', message: 'Record at least one data point before submitting.' });
      return;
    }

    const theoPeriod = calculatePeriod(length, gravity);
    const expG = history.length >= 2 ? calculateGravityFromSlope(
      (history[history.length - 1].periodSquared - history[0].periodSquared) /
      (history[history.length - 1].length - history[0].length)
    ) : null;

    const score = expG
      ? Math.max(0, 100 - Math.abs((expG - PHYSICS_CONSTANTS.g) / PHYSICS_CONSTANTS.g * 100) * 5)
      : 50;

    const sessionData = {
      length,
      gravity,
      amplitude: angle,
      dataPoints: history,
      theoreticalPeriod: theoPeriod,
      experimentalG: expG,
      score: Math.round(score),
    };

    try {
      const { error } = await createExperimentSession({
        user_id: user.id,
        practical_id: 'pendulum',
        status: 'completed',
        state_data: sessionData,
        score: Math.round(score),
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;
      show({ type: 'success', title: 'Worksheet submitted!', message: `Score: ${Math.round(score)}%` });
      setTimeout(tryTutorialAdvance, 50);
    } catch (err) {
      show({ type: 'error', title: 'Submission failed', message: 'Could not save to server. Data saved locally.' });
      saveAllStates();
    }
  };

  return (
    <>
      <ExperimentGuide
        experimentId="pendulum"
        title="Simple Pendulum Experiment"
        subtitle="Physics Practical — Determine acceleration due to gravity"
        objective="Determine the acceleration due to gravity (g) by measuring the period of oscillation of a simple pendulum at different lengths and plotting a T² vs L graph."
        steps={overviewSteps}
        color="green"
        estimatedTime="20 min"
        difficulty="Intermediate"
      />

      <TutorialOverlay />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2 space-y-6">
          <div ref={pendulumSectionRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 scroll-mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Labverse Physics: Simple Pendulum Practical</h2>
                <p className="text-sm text-slate-500">Determine acceleration due to gravity (g) using T² vs L</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                  WAEC Code: PHY-PR-01
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => graphSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <LineChart size={14} /> Graph
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useTutorialStore.getState().startTutorial(tutorialSteps)}
                  className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <Lightbulb size={14} /> Tutorial
                </Button>
                <Button variant="ghost" size="iconSm" onClick={() => {
                  localStorage.removeItem('labverse-guide-seen-pendulum');
                  window.location.reload();
                }} title="Replay overview">
                  <HelpCircle size={16} />
                </Button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full bg-slate-100 rounded-xl border border-slate-200"
              style={{ touchAction: 'none' }}
            />

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Length (L)</p>
                <p className="text-xl font-mono font-bold text-slate-900">{length.toFixed(2)} <span className="text-xs font-normal">m</span></p>
              </div>
              <div id="pendulum-oscillation-counter" className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Oscillations</p>
                <p className="text-xl font-mono font-bold text-emerald-600">{oscillations}<span className="text-xs font-normal text-slate-500">/20</span></p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Timer (t₂₀)</p>
                <p className="text-xl font-mono font-bold text-slate-900">{formatTime(elapsedTime * 1000)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Period (T)</p>
                <p className="text-xl font-mono font-bold text-blue-600">
                  {oscillations > 0 ? (elapsedTime / oscillations).toFixed(3) : theoreticalPeriod.toFixed(3)} <span className="text-xs font-normal">s</span>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div id="pendulum-length-slider">
                <Label className="flex justify-between text-sm font-medium text-slate-700 mb-1.5">
                  <span>Pendulum Length (L)</span>
                  <span className="font-mono text-emerald-600 font-bold">{length.toFixed(2)} m</span>
                </Label>
                <Slider
                  value={[length]}
                  onValueChange={([v]: [number]) => handleLengthChange(v)}
                  min={0.2}
                  max={1.2}
                  step={0.05}
                  disabled={isRunning}
                  className="h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0.20 m</span><span>1.20 m</span>
                </div>
              </div>

              <div id="pendulum-angle-slider">
                <Label className="flex justify-between text-sm font-medium text-slate-700 mb-1.5">
                  <span>Release Angle (θ)</span>
                  <span className="font-mono text-blue-600 font-bold">{angle}°</span>
                </Label>
                <Slider
                  value={[angle]}
                  onValueChange={([v]: [number]) => handleAngleChange(v)}
                  min={5}
                  max={30}
                  step={1}
                  disabled={isRunning}
                  className="h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>5° (SHM)</span><span>30°</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  id="pendulum-start-btn"
                  onClick={handleStartStop}
                  disabled={oscillations >= 20}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-colors',
                    isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700',
                    oscillations >= 20 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                  {isRunning ? 'Pause' : oscillations >= 20 ? 'Complete' : 'Release & Start'}
                </Button>
                <Button id="pendulum-reset-btn" onClick={handleReset} variant="outline" className="px-4 py-3">
                  <RotateCcw size={16} className="mr-1" /> Reset
                </Button>
                <Button
                  id="pendulum-record-btn"
                  onClick={handleRecord}
                  disabled={oscillations === 0}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus size={16} /> Record
                </Button>
              </div>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">Theoretical vs Experimental</h3>
              <ProgressRing
                progress={history.length >= 5 ? 100 : history.length * 20}
                size={44}
                strokeWidth={4}
                color="blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 p-3 rounded-xl">
                <p className="text-[10px] text-blue-700 uppercase tracking-wider mb-0.5">Theoretical T</p>
                <p className="font-mono text-lg font-bold text-blue-900">{theoreticalPeriod.toFixed(3)} s</p>
                <p className="text-[10px] text-blue-600">T² = {theoreticalPeriodSq.toFixed(3)} s²</p>
              </div>
              {experimentalG && (
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <p className="text-[10px] text-emerald-700 uppercase tracking-wider mb-0.5">Experimental g</p>
                  <p className="font-mono text-lg font-bold text-emerald-900">{experimentalG.toFixed(2)} m/s²</p>
                  <p className="text-[10px] text-emerald-600">Error: {Math.abs((experimentalG - PHYSICS_CONSTANTS.g) / PHYSICS_CONSTANTS.g * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] text-slate-600 mb-1">Slope S = ΔT²/ΔL = 4π²/g → g = 4π²/S</p>
              {history.length >= 2 && (
                <p className="text-xs font-mono text-slate-900">
                  Current slope: {((history[history.length - 1].periodSquared - history[0].periodSquared) / (history[history.length - 1].length - history[0].length)).toFixed(3)} s²/m
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="pendulum-observation-table">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">Observation Table</h3>
              <p className="text-xs text-slate-500">Record time for 20 complete oscillations across 5 different lengths.</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {history.length}/5 readings
                </span>
                {history.length >= 2 && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Timer size={12} />
                    Ready to calculate g
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-2 font-mono">#</th>
                    <th className="p-2 font-mono">L (m)</th>
                    <th className="p-2 font-mono">t₂₀ (s)</th>
                    <th className="p-2 font-mono">T (s)</th>
                    <th className="p-2 font-mono">T² (s²)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 italic text-xs">
                        No readings recorded yet. Set a length and click "Release & Start".
                      </td>
                    </tr>
                  ) : (
                    history.map((row: PendulumDataPoint, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400">{idx + 1}</td>
                        <td className="p-2">{row.length.toFixed(2)}</td>
                        <td className="p-2">{row.time20.toFixed(2)}</td>
                        <td className="p-2">{row.period.toFixed(3)}</td>
                        <td className="p-2 font-bold text-blue-600">{row.periodSquared.toFixed(3)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <Button variant="outline" onClick={() => updatePendulumState({ history: [] })} disabled={history.length === 0} size="sm">
                  <Trash2 size={14} className="mr-1" /> Clear
                </Button>
                <Button id="pendulum-submit-btn" onClick={handleSubmitWorksheet} className="bg-slate-900 hover:bg-slate-800" size="sm">
                  <FileText size={14} className="mr-1" /> Submit
                </Button>
              </div>
            )}
          </Card>

          <Card className="bg-emerald-50 border-emerald-200">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm mb-1">WAEC Guide Tip</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Plot T² (vertical) against L (horizontal). The slope S = 4π²/g.
                    Calculate g = 4π²/S. Acceptable range: 9.6–10.0 m/s².
                    Record L to 2 d.p., t₂₀ to 2 d.p., T to 3 d.p., T² to 3 d.p.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold text-slate-800 text-sm mb-3">Quick Reference</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Formula:</span>
                <span className="font-mono font-bold text-slate-900">T = 2π√(L/g)</span>
              </div>
              <div className="flex justify-between">
                <span>For g:</span>
                <span className="font-mono font-bold text-slate-900">g = 4π²L/T²</span>
              </div>
              <div className="flex justify-between">
                <span>Expected g:</span>
                <span className="font-mono font-bold text-slate-900">9.81 m/s²</span>
              </div>
              <div className="flex justify-between">
                <span>Max error:</span>
                <span className="font-mono font-bold text-slate-900">±2%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div ref={graphSectionRef} className="p-6 scroll-mt-4">
        <WAECGraph
          title="T² vs L Graph"
          xLabel="Length"
          yLabel="Period Squared"
          xUnit="m"
          yUnit="s²"
          xMin={0}
          xMax={1.4}
          yMin={0}
          yMax={6}
          xStep={0.2}
          yStep={1}
          dataPoints={graphPoints}
          onPointsChange={setGraphPoints}
          showBestFit={true}
        />
      </div>
    </>
  );
};

export default PendulumLab;
