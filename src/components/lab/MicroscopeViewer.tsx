import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ZoomIn, ZoomOut, Eye, RotateCcw } from 'lucide-react';
import { SpecimenRenderer } from './SpecimenRenderer';
import type { MicroscopeState, MicroscopeLabel } from '../../types';
import { MICROSCOPE_SLIDES } from '../../types';

interface MicroscopeViewerProps {
  state: MicroscopeState;
  onStateChange: (state: Partial<MicroscopeState>) => void;
  onLabelPlace: (labelId: string, x: number, y: number) => void;
}

export const MicroscopeViewer: React.FC<MicroscopeViewerProps> = ({
  state,
  onStateChange,
  onLabelPlace,
}) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const magnifications = ['4x', '10x', '40x', '100x'] as const;
  const currentMagIndex = magnifications.indexOf(state.magnification);
  const baseScale = (currentMagIndex + 1) * 0.5;

  useEffect(() => {
    setScale(baseScale);
    setTranslate({ x: 0, y: 0 });
  }, [state.magnification]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setScale((prev) => Math.max(0.5, Math.min(5, prev - e.deltaY * 0.005)));
    } else {
      setTranslate((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
      if (viewerRef.current) viewerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (viewerRef.current) viewerRef.current.style.cursor = 'grab';
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onLabelPlace?.('temp', x, y);
  };

  const resetView = () => {
    setScale(baseScale);
    setTranslate({ x: 0, y: 0 });
  };

  const slideLabels = MICROSCOPE_SLIDES[state.activeSlide]?.labels || [];
  const placedLabels = slideLabels.filter((l) => l.isPlaced);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden relative">
      <div
        ref={viewerRef}
        className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-grab"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 transition-transform duration-100"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            id="microscope-specimen-view"
            data-tutorial="specimen-view"
            className="w-full h-full"
            onClick={handleImageClick}
          >
            <SpecimenRenderer
              slide={state.activeSlide}
              coarseFocus={state.coarseFocus}
              fineFocus={state.fineFocus}
              lightIntensity={state.lightIntensity}
              stained={state.stained}
            />
          </div>

          {placedLabels.map((label) => (
            <div
              key={label.id}
              className="absolute flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur rounded border border-lab-green text-xs font-medium text-lab-green shadow-lg pointer-events-none animate-in zoom-in-95"
              style={{
                left: `${label.x}%`,
                top: `${label.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-lab-green" />
              {label.name}
            </div>
          ))}
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <Button variant="ghost" size="iconSm" onClick={() => setScale((s) => Math.min(5, s + 0.2))} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4 text-white" />
          </Button>
          <Button variant="ghost" size="iconSm" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4 text-white" />
          </Button>
          <Button variant="ghost" size="iconSm" onClick={resetView} aria-label="Reset view">
            <RotateCcw className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="absolute bottom-3 left-3 text-white/70 text-xs font-mono">
          {state.magnification} | {Math.round(scale * 100)}%
        </div>

        {state.coarseFocus < 20 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/40 text-sm font-medium bg-black/30 px-3 py-1 rounded-lg">
              Adjust coarse focus to see specimen
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <Label className="text-white w-24">Magnification</Label>
          <select
            value={state.magnification}
            onChange={(e) => onStateChange({ magnification: e.target.value as '4x' | '10x' | '40x' | '100x' })}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-lab-green"
          >
            {magnifications.map((mag) => (
              <option key={mag} value={mag}>{mag}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Coarse Focus</span>
              <span>{state.coarseFocus}%</span>
            </div>
            <Slider
              value={[state.coarseFocus]}
              onValueChange={([v]) => onStateChange({ coarseFocus: v })}
              max={100}
              step={1}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Fine Focus</span>
              <span>{state.fineFocus}%</span>
            </div>
            <Slider
              value={[state.fineFocus]}
              onValueChange={([v]) => onStateChange({ fineFocus: v })}
              max={100}
              step={1}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Light Intensity</span>
              <span>{state.lightIntensity}%</span>
            </div>
            <Slider
              value={[state.lightIntensity]}
              onValueChange={([v]) => onStateChange({ lightIntensity: v })}
              max={100}
              step={1}
              className="h-2"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <Label className="text-white flex items-center gap-2 cursor-pointer">
            <Switch
              checked={state.stained}
              onCheckedChange={(checked) => onStateChange({ stained: checked })}
              aria-label="Apply iodine stain"
            />
            <span>Iodine Stain</span>
          </Label>
          <Label className="text-white flex items-center gap-2 cursor-pointer">
            <Switch
              checked={state.showLabels ?? false}
              onCheckedChange={(checked) => onStateChange({ showLabels: checked })}
              aria-label="Show labels"
            />
            <Eye className="h-4 w-4" />
          </Label>
        </div>
      </div>
    </div>
  );
};

interface LabelingPanelProps {
  labels: MicroscopeLabel[];
  onLabelSelect: (label: MicroscopeLabel) => void;
  selectedLabel?: MicroscopeLabel;
  placedCount: number;
  totalCount: number;
}

export const LabelingPanel: React.FC<LabelingPanelProps> = ({
  labels,
  onLabelSelect,
  selectedLabel,
  placedCount,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900" id="microscope-label-panel" data-tutorial="label-panel">Identify Structures</h3>
        <div className="text-sm font-mono text-slate-500">
          {placedCount}/{totalCount}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => onLabelSelect(label)}
            className={cn(
              'w-full text-left p-3 rounded-lg border transition-colors',
              label.isPlaced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : selectedLabel?.id === label.id
                ? 'bg-blue-50 border-blue-200 text-blue-800 ring-2 ring-blue-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            )}
            disabled={label.isPlaced}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{label.name}</span>
              {label.isPlaced ? (
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : selectedLabel?.id === label.id ? (
                <span className="text-xs text-blue-600 font-medium">Selected</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs opacity-70">{label.description}</p>
          </button>
        ))}
      </div>

      {selectedLabel && !selectedLabel.isPlaced && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-sm text-blue-800">
              Now click on the specimen image to place <strong>{selectedLabel.name}</strong>
            </p>
          </div>
        </div>
      )}

      {!selectedLabel && placedCount < totalCount && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-600">
            Select a structure above, then click on the specimen to identify it.
          </p>
        </div>
      )}

      {placedCount === totalCount && totalCount > 0 && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-800 font-medium">
            All {totalCount} structures identified! You can submit your worksheet.
          </p>
        </div>
      )}
    </div>
  );
};
