import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Slider } from '../../../components/ui/slider';
import { Label } from '../../../components/ui/label';
import { ProgressRing } from '../../../components/common/ProgressRing';
import { useLabStore } from '../../../stores/labStore';
import { useAuthStore } from '../../../stores/authStore';
import { createExperimentSession } from '../../../lib/supabase';
import { useToast } from '../../../components/common/Toast';
import { cn, formatTime, calculatePeriod, calculateGravityFromSlope, PHYSICS_CONSTANTS } from '../../../lib/utils';
import type { PendulumDataPoint } from '../../../types';

export const PendulumLab: React.FC = () => {
  const { pendulumState, updatePendulumState, saveAllStates } = useLabStore();
  const { user } = useAuthStore();
  const { show } = useToast();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsAnimRef = useRef<number | null>(null);
  const drawAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [showGuide] = useState(true);

  const { length, angle, gravity, isRunning, oscillations, elapsedTime, history } = pendulumState;
  const currentAngleRef = useRef(pendulumState.currentAngle);
  const angularVelocityRef = useRef(pendulumState.angularVelocity);

  const degreesToRadians = (deg: number) => (deg * Math.PI) / 180;

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
    }
    updatePendulumState({ isRunning: !isRunning });
  };

  const handleRecord = () => {
    if (oscillations === 0) return;
    const period = elapsedTime / oscillations;
    const periodSquared = Number((period * period).toFixed(4));
    
    const newPoint: PendulumDataPoint = {
      length: Number(length.toFixed(2)),
      time20: Number(elapsedTime.toFixed(2)),
      period: Number(period.toFixed(3)),
      periodSquared,
    };

    updatePendulumState({
      history: [...history, newPoint],
    });

    saveAllStates();
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
  };

  const handleAngleChange = (value: number) => {
    if (isRunning) return;
    updatePendulumState({ angle: value, amplitude: value });
    resetSimulation();
  };

  const theoreticalPeriod = calculatePeriod(length, gravity);
  const theoreticalPeriodSq = Number((theoreticalPeriod * theoreticalPeriod).toFixed(4));
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
    } catch (err) {
      show({ type: 'error', title: 'Submission failed', message: 'Could not save to server. Data saved locally.' });
      saveAllStates();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-slate-50 min-h-screen">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Labverse Physics: Simple Pendulum Practical</h2>
              <p className="text-sm text-slate-500">Determine acceleration due to gravity (g) using T² vs L</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
              WAEC Code: PHY-PR-01
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full bg-slate-100 rounded-xl border border-slate-200"
            style={{ touchAction: 'none' }}
          />

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Length (L)</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{length.toFixed(2)} m</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Oscillations</p>
              <p className="text-2xl font-mono font-bold text-emerald-600">{oscillations}/20</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Timer</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{formatTime(elapsedTime * 1000)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Period (T)</p>
              <p className="text-2xl font-mono font-bold text-blue-600">
                {oscillations > 0 ? (elapsedTime / oscillations).toFixed(3) : theoreticalPeriod.toFixed(3)} s
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Pendulum Length (L)</span>
                <span className="font-mono text-lab-green">{length.toFixed(2)} m</span>
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
            </div>

            <div>
              <Label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Release Angle (θ)</span>
                <span className="font-mono text-lab-blue">{angle}°</span>
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
            </div>

            <div className="flex gap-3 pt-2">
              <Button
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
              <Button
                onClick={handleReset}
                variant="outline"
                className="px-6 py-3"
              >
                <RotateCcw size={18} className="mr-2" /> Reset
              </Button>
              <Button
                onClick={handleRecord}
                disabled={oscillations === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} /> Record Data
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Theoretical vs Experimental</h3>
            <ProgressRing
              progress={history.length >= 5 ? 100 : history.length * 20}
              size={48}
              strokeWidth={4}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-xs text-blue-700 mb-1">Theoretical T</p>
              <p className="font-mono text-xl font-bold text-blue-900">{theoreticalPeriod.toFixed(3)} s</p>
              <p className="text-xs text-blue-700">T² = {theoreticalPeriodSq} s²</p>
            </div>
            {experimentalG && (
              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-xs text-emerald-700 mb-1">Experimental g</p>
                <p className="font-mono text-xl font-bold text-emerald-900">{experimentalG.toFixed(2)} m/s²</p>
                <p className="text-xs text-emerald-700">Error: {Math.abs((experimentalG - PHYSICS_CONSTANTS.g) / PHYSICS_CONSTANTS.g * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-600 mb-2">
              Slope S = ΔT²/ΔL = 4π²/g → g = 4π²/S
            </p>
            {history.length >= 2 && (
              <p className="text-sm font-mono text-slate-900">
                Current slope: {(history[history.length - 1].periodSquared - history[0].periodSquared) / (history[history.length - 1].length - history[0].length) || 0} s²/m
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg">Observation Table</h3>
            <p className="text-xs text-slate-500">Record time for 20 complete oscillations across 5 different lengths.</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 uppercase">
                <tr>
                  <th className="p-3 font-mono">L (m)</th>
                  <th className="p-3 font-mono">t₂₀ (s)</th>
                  <th className="p-3 font-mono">T (s)</th>
                  <th className="p-3 font-mono">T² (s²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 italic">No readings recorded yet. Adjust length and start timer.</td>
                  </tr>
                ) : (
                  history.map((row: PendulumDataPoint, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3">{row.length.toFixed(2)}</td>
                      <td className="p-3">{row.time20.toFixed(2)}</td>
                      <td className="p-3">{row.period.toFixed(3)}</td>
                      <td className="p-3 font-bold text-blue-600">{row.periodSquared.toFixed(4)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {history.length > 0 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <Button variant="outline" onClick={() => updatePendulumState({ history: [] })} disabled={history.length === 0}>
                <Trash2 size={16} className="mr-2" /> Clear All
              </Button>
              <Button onClick={handleSubmitWorksheet} className="bg-slate-900 hover:bg-slate-800">
                <FileText size={16} className="mr-2" /> Submit Worksheet
              </Button>
            </div>
          )}
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm mb-1">Labverse WAEC Guide Tip</h4>
                <p className="text-xs text-emerald-700">
                  Plot T² (vertical) against L (horizontal). The slope S = 4π²/g. 
                  Calculate g = 4π²/S. Acceptable range: 9.6-10.0 m/s².
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PendulumLab;
