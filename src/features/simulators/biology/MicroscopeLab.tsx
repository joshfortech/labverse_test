import React, { useState, useCallback, useEffect } from 'react';
import { MicroscopeViewer, LabelingPanel } from '../../../components/lab/MicroscopeViewer';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Slider } from '../../../components/ui/slider';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { ProgressRing } from '../../../components/common/ProgressRing';
import { useLabStore } from '../../../stores/labStore';
import { useAuthStore } from '../../../stores/authStore';
import { createExperimentSession } from '../../../lib/supabase';
import { useToast } from '../../../components/common/Toast';
import { cn, MICROSCOPE_SLIDES } from '../../../lib/utils';
import type { SlideType, MicroscopeLabel } from '../../../types';
import { CheckCircle, RotateCcw, Microscope, Zap, FileText } from 'lucide-react';

export const MicroscopeLab: React.FC = () => {
  const { microscopeState, updateMicroscopeState, resetMicroscopeState, saveAllStates } = useLabStore();
  const { user } = useAuthStore();
  const { show } = useToast();
  
  const { magnification, coarseFocus, fineFocus, lightIntensity, stained, activeSlide, identifiedParts, availableLabels } = microscopeState;
  
  const [selectedLabel, setSelectedLabel] = useState<MicroscopeLabel | null>(null);

  const slideData = MICROSCOPE_SLIDES[activeSlide];
  const labels = slideData?.labels || [];
  const placedLabels = labels.filter((l: MicroscopeLabel) => l.isPlaced).length;
  const totalLabels = labels.length;

  const handleLabelPlace = useCallback((_labelId: string, x: number, y: number) => {
    if (!selectedLabel || selectedLabel.isPlaced) return;
    
    const updatedLabels = labels.map((l: MicroscopeLabel) => 
      l.id === selectedLabel.id ? { ...l, isPlaced: true, x, y } : l
    );
    
    updateMicroscopeState({ 
      identifiedParts: [...identifiedParts, selectedLabel.name],
      availableLabels: updatedLabels,
    });
    setSelectedLabel(null);
    saveAllStates();
  }, [selectedLabel, labels, identifiedParts, updateMicroscopeState, saveAllStates]);

  const handleLabelSelect = useCallback((label: MicroscopeLabel) => {
    if (label.isPlaced) return;
    setSelectedLabel(label);
  }, []);

  const handleSlideChange = useCallback((slide: SlideType) => {
    updateMicroscopeState({ 
      activeSlide: slide,
      identifiedParts: [],
      availableLabels: MICROSCOPE_SLIDES[slide].labels,
      stained: false,
    });
    setSelectedLabel(null);
    saveAllStates();
  }, [updateMicroscopeState, saveAllStates]);

  const handleStainChange = useCallback((checked: boolean) => {
    updateMicroscopeState({ stained: checked });
    saveAllStates();
  }, [updateMicroscopeState, saveAllStates]);

  const handleReset = useCallback(() => {
    resetMicroscopeState();
    setSelectedLabel(null);
    saveAllStates();
  }, [resetMicroscopeState, saveAllStates]);

  useEffect(() => {
    if (availableLabels.length === 0) {
      updateMicroscopeState({ availableLabels: labels });
    }
  }, []);

  const handleSubmitWorksheet = async () => {
    if (!user) {
      show({ type: 'error', title: 'Not logged in', message: 'Please log in to submit worksheets.' });
      return;
    }
    if (placedLabels === 0) {
      show({ type: 'warning', title: 'No data', message: 'Identify at least one structure before submitting.' });
      return;
    }

    const completionRate = totalLabels > 0 ? (placedLabels / totalLabels) * 100 : 0;
    const score = Math.round(completionRate * 0.8 + (stained ? 20 : 0));

    const sessionData = {
      slide: activeSlide,
      magnification,
      stained,
      identifiedParts,
      placedLabels,
      totalLabels,
      completionRate,
      score,
    };

    try {
      const { error } = await createExperimentSession({
        user_id: user.id,
        practical_id: 'microscope',
        status: 'completed',
        state_data: sessionData,
        score,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      show({ type: 'success', title: 'Worksheet submitted!', message: `Score: ${score}% | ${placedLabels}/${totalLabels} structures identified` });
    } catch (err) {
      show({ type: 'error', title: 'Submission failed', message: 'Could not save to server. Data saved locally.' });
      saveAllStates();
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Labverse Biology: Microscopy Practical</h2>
              <p className="text-sm text-slate-500">Identify and label cellular structures under the microscope</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              WAEC Code: BIO-PR-01
            </span>
          </div>

          <MicroscopeViewer
            state={microscopeState}
            onStateChange={updateMicroscopeState}
            onLabelPlace={handleLabelPlace}
          />

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Label className="text-xs text-slate-500 block mb-1">Magnification</Label>
              <Select value={magnification} onValueChange={(v: string) => updateMicroscopeState({ magnification: v as '4x' | '10x' | '40x' | '100x' })}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select magnification" />
                </SelectTrigger>
                <SelectContent>
                  {['4x', '10x', '40x', '100x'].map((m: string) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Label className="text-xs text-slate-500 block mb-1">Slide Specimen</Label>
              <Select value={activeSlide} onValueChange={(v: string) => handleSlideChange(v as SlideType)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select slide" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MICROSCOPE_SLIDES) as SlideType[]).map((slide: SlideType) => (
                    <SelectItem key={slide} value={slide}>{MICROSCOPE_SLIDES[slide].name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Switch
                checked={stained}
                onCheckedChange={handleStainChange}
                id="stain-toggle"
              />
              <Label htmlFor="stain-toggle" className="text-sm font-medium text-slate-700 cursor-pointer">
                Iodine Stain
              </Label>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <ProgressRing
                progress={(placedLabels / totalLabels) * 100}
                size={40}
                strokeWidth={4}
                color="green"
                showPercentage
              />
              <div>
                <p className="text-xs text-slate-500">Structures Identified</p>
                <p className="font-mono font-bold text-slate-900">{placedLabels}/{totalLabels}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <Tabs defaultValue="identify" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="identify" className="data-[state=active]:bg-lab-green data-[state=active]:text-white">
                <Microscope className="h-4 w-4 mr-2" /> Identify Structures
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-lab-green data-[state=active]:text-white">
                <Zap className="h-4 w-4 mr-2" /> Specimen Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identify" className="p-4">
              <LabelingPanel
                labels={labels}
                onLabelSelect={handleLabelSelect}
                selectedLabel={selectedLabel ?? undefined}
                placedCount={placedLabels}
                totalCount={totalLabels}
              />
            </TabsContent>

            <TabsContent value="info" className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">{slideData?.name} - {slideData?.magnification}</h4>
                  <p className="text-sm text-slate-600">
                    {activeSlide === 'onion_epidermis' && 'Onion epidermal cells are ideal for observing plant cell structure. The large, transparent cells clearly show the cell wall, membrane, cytoplasm, nucleus, and central vacuole. Iodine stain highlights the nucleus and cytoplasm.'}
                    {activeSlide === 'leaf_stomata' && 'Leaf stomata are pores on the leaf surface regulated by guard cells. They control gas exchange and transpiration. Under high magnification, chloroplasts in guard cells and surrounding epidermal cells are visible.'}
                    {activeSlide === 'cheek_cell' && 'Human cheek cells are squamous epithelial cells. They lack a cell wall and have a prominent nucleus. Methylene blue stain is typically used to visualize the nucleus and cytoplasm.'}
                    {activeSlide === 'spirogyra' && 'Spirogyra is a filamentous green algae. Its cells contain spiral chloroplasts with pyrenoids. The nucleus is suspended in the center by cytoplasmic strands. Conjugation tubes may be observed during reproduction.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {labels.map((label: MicroscopeLabel) => (
                    <div 
                      key={label.id} 
                      className={cn(
                        'p-3 rounded-lg text-sm',
                        label.isPlaced ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('w-2 h-2 rounded-full', label.isPlaced ? 'bg-emerald-600' : 'bg-slate-300')} />
                        <span className={cn('font-medium', label.isPlaced ? 'text-emerald-800' : 'text-slate-700')}>{label.name}</span>
                      </div>
                      <p className="text-xs text-slate-500">{label.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-4">
          <h3 className="font-bold text-slate-800 mb-4">Microscope Controls</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Coarse Focus</span>
                <span className="font-mono text-lab-green">{coarseFocus}%</span>
              </Label>
              <Slider
                value={[coarseFocus]}
                onValueChange={([v]: [number]) => updateMicroscopeState({ coarseFocus: v })}
                max={100}
                step={1}
                className="h-2"
              />
            </div>

            <div>
              <Label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Fine Focus</span>
                <span className="font-mono text-lab-blue">{fineFocus}%</span>
              </Label>
              <Slider
                value={[fineFocus]}
                onValueChange={([v]: [number]) => updateMicroscopeState({ fineFocus: v })}
                max={100}
                step={1}
                className="h-2"
              />
            </div>

            <div>
              <Label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Light Intensity</span>
                <span className="font-mono text-amber-600">{lightIntensity}%</span>
              </Label>
              <Slider
                value={[lightIntensity]}
                onValueChange={([v]: [number]) => updateMicroscopeState({ lightIntensity: v })}
                max={100}
                step={1}
                className="h-2"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw size={16} className="mr-2" /> Reset Microscope
            </Button>
            <Button onClick={handleSubmitWorksheet} className="bg-slate-900 hover:bg-slate-800">
              <FileText size={16} className="mr-2" /> Submit Worksheet
            </Button>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-green-900 text-sm mb-1">Labverse WAEC Microscopy Guide</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Start with low power (4x/10x) to locate specimen</li>
                <li>• Use coarse focus first, then fine focus</li>
                <li>• Adjust diaphragm for optimal contrast</li>
                <li>• Apply iodine stain for plant cells (starch)</li>
                <li>• Draw what you see at correct magnification</li>
                <li>• Label: Cell wall, membrane, cytoplasm, nucleus, vacuole</li>
                <li>• Calculate drawing magnification</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-slate-800 mb-3">Microscope Parts Reference</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['Eyepiece', '10x magnification'],
              ['Objective', '4x, 10x, 40x, 100x'],
              ['Stage', 'Holds slide'],
              ['Coarse Focus', 'Large distance adjustments'],
              ['Fine Focus', 'Precise focusing'],
              ['Diaphragm', 'Controls light aperture'],
              ['Mirror/Light', 'Illumination source'],
              ['Base/Arm', 'Support and carrying'],
            ].map(([part, desc], i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-lab-green" />
                <div>
                  <p className="font-medium text-slate-900">{part}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MicroscopeLab;
