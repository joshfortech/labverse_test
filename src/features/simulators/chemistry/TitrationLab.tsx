import React, { useState, useCallback } from 'react';
import { RefreshCw, Droplet, AlertTriangle, CheckCircle, Minus, Trash2, Save, FlaskConical, Droplets, FileText, HelpCircle, Beaker, Target, Lightbulb } from 'lucide-react';
import { Burette, ConicalFlask } from '../../../components/lab/Burette';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Slider } from '../../../components/ui/slider';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { ExperimentGuide, type GuideStep } from '../../../components/common/ExperimentGuide';
import { TutorialOverlay } from '../../../components/lab/TutorialOverlay';
import { useTutorialStore, type StepRequirement } from '../../../stores/useTutorialStore';
import { useLabStore } from '../../../stores/labStore';
import { useAuthStore } from '../../../stores/authStore';
import { createExperimentSession } from '../../../lib/supabase';
import { useToast } from '../../../components/common/Toast';
import { calculateTiter, areConcordant, averageConcordantTiters, TITRATION_CONSTANTS, calculateMolarity } from '../../../lib/utils';
import type { TitrationTrial } from '../../../types';

const COLOR_YELLOW = '#FDE047';
const COLOR_ORANGE = '#F97316';
const COLOR_PINK = '#EF4444';
const COLOR_CLEAR = '#E2E8F0';

const guideSteps: GuideStep[] = [
  {
    icon: <Droplet size={20} />,
    title: 'Add the Indicator',
    description: 'Click "Add Methyl Orange Indicator" to add 2-3 drops to the conical flask containing 25.00 cm³ of Na₂CO₃ solution. The solution turns yellow (alkaline, pH > 4.4).',
    tip: 'Always add indicator BEFORE starting titration. Methyl Orange turns yellow in alkaline Na₂CO₃.',
  },
  {
    icon: <Beaker size={20} />,
    title: 'Start Your Trial',
    description: 'Click "Start Trial" to mark the initial burette reading at 0.00 cm³. This records where you begin dispensing HCl.',
    tip: 'The initial reading is automatically set to 0.00 cm³.',
  },
  {
    icon: <Minus size={20} />,
    title: 'Dispense HCl Dropwise',
    description: 'Use the 1.0 mL button for bulk addition, then switch to 0.1 mL near the endpoint. Watch the color — yellow means alkaline, orange means endpoint!',
    tip: 'Near endpoint: add ONE DROP (0.1 mL) at a time. The endpoint is the first permanent orange color.',
  },
  {
    icon: <Target size={20} />,
    title: 'Detect the Endpoint',
    description: 'The endpoint is reached when the solution turns from yellow to orange. The orange color must persist for at least 30 seconds. This means all Na₂CO₃ has reacted with HCl.',
    tip: 'Endpoint = first permanent orange. If pink, you overshot — still record it.',
  },
  {
    icon: <Save size={20} />,
    title: 'End Trial & Record',
    description: 'Click "End Trial" to mark the final burette reading, then "Record Trial" to save. Repeat until you get 2 concordant titers (within ±0.20 cm³).',
    tip: 'Concordant titers = readings within 0.20 cm³. You need at least 2 concordant readings.',
  },
];

const titrationTutorialSteps: StepRequirement[] = [
  {
    id: 'add-indicator',
    targetId: 'titration-add-indicator',
    instruction: 'Click "Add Methyl Orange Indicator" to add indicator to the Na₂CO₃ solution in the flask.',
    correctiveHint: 'Click the "Add Methyl Orange Indicator" button. Without indicator, you cannot see the color change at the endpoint.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      return s.indicatorAdded === true;
    },
    waecNote: 'Methyl Orange is the standard indicator for this titration. It turns yellow in alkaline Na₂CO₃ and orange at the endpoint (pH 4.4).',
  },
  {
    id: 'start-trial',
    targetId: 'titration-start-trial',
    instruction: 'Click "Start Trial" to mark the initial burette reading at 0.00 cm³.',
    correctiveHint: 'Click the "Start Trial" button. You must start a trial before dispensing any acid.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      const ct = s.currentTrial as Record<string, unknown> | undefined;
      return ct?.initial !== undefined;
    },
    waecNote: 'Always start from 0.00 cm³ for the initial reading. This simplifies calculation — the final reading equals the volume delivered.',
  },
  {
    id: 'dispense-1ml',
    targetId: 'titration-dispense-1ml',
    instruction: 'Click the "1.0 mL" button to add HCl in bulk. Watch the color — yellow means still alkaline.',
    correctiveHint: 'Click the "1.0 mL" button. The solution stays yellow until near the endpoint. Keep adding.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      return typeof s.titrantAdded === 'number' && s.titrantAdded > 0;
    },
    waecNote: 'Use bulk addition (1.0 mL) when far from the endpoint to save time. Switch to 0.1 mL drops when the color starts to change.',
  },
  {
    id: 'dispense-01ml',
    targetId: 'titration-dispense-01ml',
    instruction: 'Switch to "0.1 mL" drops for precise control. Add drop by drop until the color changes.',
    correctiveHint: 'Click the "0.1 mL" button. Near the endpoint, add one drop at a time and watch carefully for orange.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      return typeof s.titrantAdded === 'number' && s.titrantAdded > 0;
    },
    waecNote: 'WAEC requires precise endpoint detection. Near the endpoint, add ONE DROP (0.1 mL) at a time and swirl. The first permanent orange is the endpoint.',
  },
  {
    id: 'end-trial',
    targetId: 'titration-end-trial',
    instruction: 'The solution has turned orange (endpoint). Click "End Trial" to record the final burette reading.',
    correctiveHint: 'Click "End Trial" to mark the final reading. This records how much HCl you delivered.',
    validate: (state) => {
      const s = state as Record<string, unknown>;
      const ct = s.currentTrial as Record<string, unknown> | undefined;
      return ct?.initial !== undefined && ct?.final !== undefined;
    },
    waecNote: 'Read the burette at eye level (bottom of meniscus). Record to 2 decimal places (e.g., 21.50 cm³).',
  },
  {
    id: 'repeat',
    targetId: 'titration-reset',
    instruction: 'You have recorded 1 trial. To complete the WAEC practical, you need at least 2 concordant titers. Click "Reset Apparatus" to start fresh, then click the Tutorial button again for the next trial.',
    correctiveHint: 'Click "Reset Apparatus" to clear the data, then restart the tutorial for the next trial.',
    validate: () => true,
    waecNote: 'WAEC requires at least 2 concordant titers (within ±0.20 cm³). Concordant titers prove your technique is consistent.',
    repeatNote: 'Click "Reset Apparatus" now, then click the Tutorial button in the header to walk through the next trial. Repeat until you have 2 concordant titers. If you overshoot (pink), still record it and try again.',
  },
];

export const TitrationLab: React.FC = () => {
  const { titrationState, updateTitrationState, resetTitrationState, saveAllStates } = useLabStore();
  const { user } = useAuthStore();
  const { show } = useToast();
  const { isOpen: tutorialIsOpen, validateAndAdvance } = useTutorialStore();

  const { buretVolume, titrantAdded, conicalVolume, indicatorAdded, flowRate, pH, color, isEndpointReached, trials, currentTrial } = titrationState;

  const [isDispensing, setIsDispensing] = useState(false);

  const equivalenceVolume = TITRATION_CONSTANTS.EQUIVALENCE_VOLUME;
  const endpointTolerance = TITRATION_CONSTANTS.ENDPOINT_TOLERANCE;

  const tryTutorialAdvance = useCallback(() => {
    if (!tutorialIsOpen) return;
    const state = useLabStore.getState().titrationState;
    validateAndAdvance(state as unknown as Record<string, unknown>);
  }, [tutorialIsOpen, validateAndAdvance]);

  const calculateColor = useCallback((added: number, hasIndicator: boolean): string => {
    if (!hasIndicator) return COLOR_CLEAR;
    if (added < equivalenceVolume - endpointTolerance) return COLOR_YELLOW;
    if (added <= equivalenceVolume + endpointTolerance) return COLOR_ORANGE;
    return COLOR_PINK;
  }, [equivalenceVolume, endpointTolerance]);

  const calculatePH = useCallback((added: number): number => {
    if (added < equivalenceVolume * 0.5) return 11.2 - (added / equivalenceVolume) * 3;
    if (added < equivalenceVolume - 0.5) return 8.5 - (added - equivalenceVolume * 0.5) / (equivalenceVolume * 0.5) * 4;
    if (added <= equivalenceVolume + endpointTolerance) return 4.5 - (added - (equivalenceVolume - 0.5)) / (endpointTolerance + 0.5) * 2;
    return 2.5;
  }, [equivalenceVolume, endpointTolerance]);

  const handleAddIndicator = useCallback(() => {
    if (!indicatorAdded) {
      updateTitrationState({
        indicatorAdded: true,
        color: COLOR_YELLOW,
      });
      saveAllStates();
      show({ type: 'info', title: 'Indicator added', message: 'Solution turned yellow — Na₂CO₃ is alkaline.' });
      setTimeout(tryTutorialAdvance, 50);
    }
  }, [indicatorAdded, updateTitrationState, saveAllStates, show, tryTutorialAdvance]);

  const handleDispense = useCallback((amount: number) => {
    if (buretVolume <= 0) return;

    if (!indicatorAdded) {
      show({ type: 'warning', title: 'No indicator', message: 'Add Methyl Orange indicator first!' });
      return;
    }

    setIsDispensing(true);
    const newAdded = titrantAdded + amount;
    const newBuret = Math.max(0, buretVolume - amount);
    const newColor = calculateColor(newAdded, indicatorAdded);
    const newPH = calculatePH(newAdded);
    const newEndpoint = newAdded >= equivalenceVolume - endpointTolerance && newAdded <= equivalenceVolume + endpointTolerance;

    updateTitrationState({
      buretVolume: newBuret,
      titrantAdded: newAdded,
      color: newColor,
      pH: newPH,
      isEndpointReached: newEndpoint,
    });

    if (newEndpoint && indicatorAdded) {
      show({ type: 'success', title: 'Endpoint reached!', message: 'Orange color persists — all Na₂CO₃ has reacted.' });
    }

    setTimeout(() => setIsDispensing(false), 300);
    saveAllStates();
    setTimeout(tryTutorialAdvance, 50);
  }, [buretVolume, titrantAdded, indicatorAdded, calculateColor, calculatePH, equivalenceVolume, endpointTolerance, updateTitrationState, saveAllStates, show, tryTutorialAdvance]);

  const handleRecordTrial = useCallback(() => {
    if (currentTrial.initial === undefined || currentTrial.final === undefined) return;

    const titer = calculateTiter(currentTrial.initial, currentTrial.final);
    const newTrial: TitrationTrial = {
      initial: currentTrial.initial,
      final: currentTrial.final,
      titer,
    };

    updateTitrationState({
      trials: [...trials, newTrial],
      buretVolume: 50.0,
      titrantAdded: 0.0,
      indicatorAdded: false,
      color: COLOR_CLEAR,
      pH: 11.2,
      isEndpointReached: false,
      currentTrial: {},
    });
    saveAllStates();
    show({ type: 'success', title: 'Trial recorded!', message: `Titer: ${titer.toFixed(2)} cm³` });
    setTimeout(tryTutorialAdvance, 50);
  }, [currentTrial, trials, updateTitrationState, saveAllStates, show, tryTutorialAdvance]);

  const handleReset = useCallback(() => {
    resetTitrationState();
    saveAllStates();
  }, [resetTitrationState, saveAllStates]);

  const handleStartTrial = useCallback(() => {
    if (indicatorAdded && titrantAdded === 0) {
      updateTitrationState({ currentTrial: { initial: 0 } });
      show({ type: 'info', title: 'Trial started', message: 'Initial reading: 0.00 cm³. Start adding HCl.' });
      setTimeout(tryTutorialAdvance, 50);
    } else if (!indicatorAdded) {
      show({ type: 'warning', title: 'No indicator', message: 'Add Methyl Orange indicator first!' });
    }
  }, [indicatorAdded, titrantAdded, updateTitrationState, show, tryTutorialAdvance]);

  const handleEndTrial = useCallback(() => {
    if (currentTrial.initial !== undefined) {
      updateTitrationState({ currentTrial: { ...currentTrial, final: titrantAdded } });
      show({ type: 'info', title: 'Trial ended', message: `Final reading: ${titrantAdded.toFixed(2)} cm³. Click "Record Trial" to save.` });
      setTimeout(tryTutorialAdvance, 50);
    }
  }, [currentTrial, titrantAdded, updateTitrationState, show, tryTutorialAdvance]);

  const avgTiter = averageConcordantTiters(trials.map((t: TitrationTrial) => t.titer));

  const handleSubmitWorksheet = async () => {
    if (!user) {
      show({ type: 'error', title: 'Not logged in', message: 'Please log in to submit worksheets.' });
      return;
    }
    if (trials.length === 0) {
      show({ type: 'warning', title: 'No data', message: 'Record at least one trial before submitting.' });
      return;
    }

    const avg = averageConcordantTiters(trials.map((t: TitrationTrial) => t.titer));
    const molarity = avg ? calculateMolarity(avg, 0.1, 25, avg) : 0;
    const errorPercent = avg ? Math.abs((avg - TITRATION_CONSTANTS.EQUIVALENCE_VOLUME) / TITRATION_CONSTANTS.EQUIVALENCE_VOLUME * 100) : 100;
    const score = Math.max(0, Math.round(100 - errorPercent * 2));

    const sessionData = {
      trials: trials.map((t: TitrationTrial) => ({ initial: t.initial, final: t.final, titer: t.titer })),
      avgTiter: avg,
      molarity,
      equivalenceVolume: TITRATION_CONSTANTS.EQUIVALENCE_VOLUME,
      score,
    };

    try {
      const { error } = await createExperimentSession({
        user_id: user.id,
        practical_id: 'titration',
        status: 'completed',
        state_data: sessionData,
        score,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;
      show({ type: 'success', title: 'Worksheet submitted!', message: `Score: ${score}% | Avg Titer: ${avg?.toFixed(2) || 'N/A'} cm³` });
    } catch (err) {
      show({ type: 'error', title: 'Submission failed', message: 'Could not save to server. Data saved locally.' });
      saveAllStates();
    }
  };

  return (
    <>
      <ExperimentGuide
        experimentId="titration"
        title="Acid-Base Titration"
        subtitle="Chemistry Practical — Volumetric Analysis"
        objective="Standardize 0.100 mol/dm³ HCl against Na₂CO₃ using Methyl Orange indicator. Determine the titer value and calculate the molarity of HCl."
        steps={guideSteps}
        color="orange"
        estimatedTime="25 min"
        difficulty="Intermediate"
      />

      <TutorialOverlay />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Labverse Chemistry: Volumetric Analysis</h2>
                <p className="text-sm text-slate-500">Titration of 0.100 mol/dm³ HCl against Na₂CO₃ using Methyl Orange</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                  WAEC Code: CHEM-PR-01
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useTutorialStore.getState().startTutorial(titrationTutorialSteps)}
                  className="gap-1.5 text-orange-700 border-orange-300 hover:bg-orange-50"
                >
                  <Lightbulb size={14} /> Tutorial
                </Button>
                <Button variant="ghost" size="iconSm" onClick={() => {
                  localStorage.removeItem('labverse-guide-seen-titration');
                  window.location.reload();
                }} title="Replay guide">
                  <HelpCircle size={16} />
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 lg:w-1/3">
                <div className="flex items-end gap-3 mb-4">
                  <Burette
                    volume={buretVolume}
                    maxVolume={50}
                    height={380}
                    liquidColor={indicatorAdded ? color : COLOR_CLEAR}
                  />
                  <div className="flex flex-col gap-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-2 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Reading</p>
                      <p className="font-mono text-lg font-bold text-slate-900">{(50 - buretVolume).toFixed(2)} <span className="text-xs">mL</span></p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-2 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Delivered</p>
                      <p className="font-mono text-lg font-bold text-orange-600">{titrantAdded.toFixed(2)} <span className="text-xs">mL</span></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    id="titration-add-indicator"
                    onClick={handleAddIndicator}
                    disabled={indicatorAdded}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Droplet size={18} />
                    {indicatorAdded ? 'Methyl Orange Added' : 'Add Methyl Orange Indicator'}
                  </Button>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Label className="text-xs text-slate-500 block mb-1">Drop Rate</Label>
                    <Slider
                      value={[flowRate * 10]}
                      onValueChange={([v]: [number]) => updateTitrationState({ flowRate: v / 10 })}
                      min={1}
                      max={20}
                      step={1}
                      className="h-2"
                    />
                    <p className="text-xs text-slate-500 text-center">{flowRate.toFixed(1)} mL/s</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      id="titration-dispense-1ml"
                      onClick={() => handleDispense(1.0)}
                      disabled={buretVolume <= 0 || isDispensing}
                      className="flex-1"
                    >
                      <Minus size={16} className="mr-1" /> 1.0 mL
                    </Button>
                    <Button
                      id="titration-dispense-01ml"
                      onClick={() => handleDispense(0.1)}
                      disabled={buretVolume <= 0 || isDispensing}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Droplets size={16} className="mr-1" /> 0.1 mL
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      id="titration-start-trial"
                      onClick={handleStartTrial}
                      disabled={!indicatorAdded || currentTrial.initial !== undefined}
                      variant="outline"
                      className="flex-1"
                    >
                      <FlaskConical size={16} className="mr-1" /> Start Trial
                    </Button>
                    <Button
                      id="titration-end-trial"
                      onClick={handleEndTrial}
                      disabled={currentTrial.initial === undefined || currentTrial.final !== undefined}
                      variant="outline"
                      className="flex-1"
                    >
                      <FlaskConical size={16} className="mr-1" /> End Trial
                    </Button>
                  </div>

                  <Button
                    id="titration-record-trial"
                    onClick={handleRecordTrial}
                    disabled={currentTrial.initial === undefined || currentTrial.final === undefined}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Save size={16} className="mr-1" /> Record Trial
                  </Button>

                  <Button id="titration-reset" onClick={handleReset} variant="outline" className="w-full">
                    <RefreshCw size={16} className="mr-1" /> Reset Apparatus
                  </Button>
                </div>
              </div>

              <div className="flex-1 lg:w-1/3 flex flex-col items-center">
                <ConicalFlask
                  volume={conicalVolume + titrantAdded}
                  maxVolume={150}
                  liquidColor={color}
                  hasIndicator={indicatorAdded}
                  width={160}
                  height={220}
                  className="mb-4"
                />

                <div className="w-full bg-white rounded-xl border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 text-center">Conical Flask Contents</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Na₂CO₃ Volume:</span>
                      <span className="font-mono font-bold text-slate-900">25.00 cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">HCl Added:</span>
                      <span className="font-mono font-bold text-orange-600">{titrantAdded.toFixed(2)} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Volume:</span>
                      <span className="font-mono font-bold text-slate-900">{(conicalVolume + titrantAdded).toFixed(2)} cm³</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Solution pH:</span>
                      <span className="font-mono font-bold text-slate-900">{pH.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Indicator:</span>
                      <span className="font-medium capitalize">{indicatorAdded ? 'Methyl Orange' : 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Color:</span>
                      <span className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: color }} />
                        <span className="font-medium capitalize text-xs">
                          {color === COLOR_CLEAR ? 'Colorless' : color === COLOR_YELLOW ? 'Yellow (alkaline)' : color === COLOR_ORANGE ? 'Orange (endpoint!)' : 'Pink (over-titrated)'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {isEndpointReached && indicatorAdded && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 animate-pulse">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Endpoint Reached! Orange color persists.</span>
                    </div>
                  )}

                  {!indicatorAdded && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm text-amber-800">Add indicator before titration!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">Titration Worksheet</h3>
              <p className="text-xs text-slate-500">Record initial and final burette readings. Concordant titers within ±0.20 cm³.</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {trials.length} trials recorded
                </span>
                {avgTiter && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle size={12} />
                    Concordant titer found!
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-2 font-mono">Trial</th>
                    <th className="p-2 font-mono">Initial (cm³)</th>
                    <th className="p-2 font-mono">Final (cm³)</th>
                    <th className="p-2 font-mono">Titer (cm³)</th>
                    <th className="p-2 font-mono">Concordant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {trials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 italic text-xs">No trials recorded yet. Add indicator, then start a trial.</td>
                    </tr>
                  ) : (
                    trials.map((trial: TitrationTrial, idx: number) => {
                      const isTrialConcordant = trials.length >= 2 && areConcordant(trials.map((t: TitrationTrial) => t.titer));
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2">{idx + 1}</td>
                          <td className="p-2">{trial.initial.toFixed(2)}</td>
                          <td className="p-2">{trial.final.toFixed(2)}</td>
                          <td className="p-2 font-bold text-blue-600">{trial.titer.toFixed(2)}</td>
                          <td className="p-2">
                            {isTrialConcordant && trials.length >= 2 ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {currentTrial.initial !== undefined && (
                    <tr className="bg-blue-50 animate-pulse">
                      <td className="p-2 font-medium">{trials.length + 1} (current)</td>
                      <td className="p-2">{currentTrial.initial.toFixed(2)}</td>
                      <td className="p-2">{currentTrial.final?.toFixed(2) ?? '--'}</td>
                      <td className="p-2 font-bold text-blue-600">
                        {currentTrial.final !== undefined ? calculateTiter(currentTrial.initial, currentTrial.final).toFixed(2) : '--'}
                      </td>
                      <td className="p-2">—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {avgTiter && (
              <div className="p-4 border-t border-slate-200 bg-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Average Concordant Titer</p>
                    <p className="text-2xl font-mono font-bold text-emerald-700">{avgTiter.toFixed(2)} cm³</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-700">Molarity of HCl</p>
                    <p className="text-xl font-mono font-bold text-emerald-900">
                      {((0.1 * 25) / avgTiter).toFixed(4)} mol/dm³
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <Button variant="outline" onClick={handleReset} disabled={trials.length === 0 && titrantAdded === 0} size="sm">
                <Trash2 size={14} className="mr-1" /> Clear
              </Button>
              <Button onClick={handleSubmitWorksheet} className="bg-slate-900 hover:bg-slate-800" size="sm">
                <FileText size={14} className="mr-1" /> Submit
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-bold text-slate-800 mb-4">Real-time Readings</h3>
            <div className="space-y-2">
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between">
                <span className="text-slate-600 text-sm">Burette Reading</span>
                <span className="font-mono text-lg font-bold text-slate-900">{(50 - buretVolume).toFixed(2)} mL</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between">
                <span className="text-slate-600 text-sm">Volume Delivered</span>
                <span className="font-mono text-lg font-bold text-orange-600">{titrantAdded.toFixed(2)} mL</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between">
                <span className="text-slate-600 text-sm">Remaining</span>
                <span className="font-mono text-lg font-bold text-slate-900">{buretVolume.toFixed(2)} mL</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between">
                <span className="text-slate-600 text-sm">pH</span>
                <span className="font-mono text-lg font-bold text-blue-600">{pH.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-orange-50 border-orange-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-orange-900 text-sm mb-1">WAEC Titration Tips</h4>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• Read burette at eye level (bottom of meniscus)</li>
                  <li>• Add 2-3 drops Methyl Orange before starting</li>
                  <li>• Swirl flask continuously during titration</li>
                  <li>• Near endpoint, add dropwise (0.1 mL)</li>
                  <li>• Endpoint: Yellow → Orange (first permanent color)</li>
                  <li>• Concordant titers within ±0.20 cm³</li>
                  <li>• Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold text-slate-800 text-sm mb-3">Quick Reference</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Reaction:</span>
                <span className="font-mono font-bold text-slate-900 text-[10px]">Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂</span>
              </div>
              <div className="flex justify-between">
                <span>Molarity:</span>
                <span className="font-mono font-bold text-slate-900">M₁V₁/ν₁ = M₂V₂/ν₂</span>
              </div>
              <div className="flex justify-between">
                <span>Concordance:</span>
                <span className="font-mono font-bold text-slate-900">±0.20 cm³</span>
              </div>
              <div className="flex justify-between">
                <span>Expected titer:</span>
                <span className="font-mono font-bold text-slate-900">~21.50 cm³</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TitrationLab;
