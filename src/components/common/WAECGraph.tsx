import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Trash2, TrendingDown } from 'lucide-react';

export interface GraphPoint {
  x: number;
  y: number;
  id: string;
}

interface WAECGraphProps {
  title: string;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xStep: number;
  yStep: number;
  dataPoints: GraphPoint[];
  onPointsChange: (points: GraphPoint[]) => void;
  showBestFit?: boolean;
  slope?: number | null;
  intercept?: number | null;
  equation?: string | null;
}

const PADDING = { top: 50, right: 50, bottom: 70, left: 80 };
const GRID_COLOR = '#E2E8F0';
const AXIS_COLOR = '#1E293B';
const POINT_COLOR = '#2563EB';
const BESTFIT_COLOR = '#DC2626';

const GRAPH_WIDTH = 800;
const GRAPH_HEIGHT = 520;

export const WAECGraph: React.FC<WAECGraphProps> = ({
  title,
  xLabel,
  yLabel,
  xUnit,
  yUnit,
  xMin,
  xMax,
  yMin,
  yMax,
  xStep,
  yStep,
  dataPoints,
  onPointsChange,
  showBestFit = true,
  slope,
  intercept,
  equation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const plotWidth = GRAPH_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = GRAPH_HEIGHT - PADDING.top - PADDING.bottom;

  const toCanvasX = useCallback((x: number) => {
    return PADDING.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  }, [xMin, xMax, plotWidth]);

  const toCanvasY = useCallback((y: number) => {
    return PADDING.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;
  }, [yMin, yMax, plotHeight]);

  const canvasToData = useCallback((canvasX: number, canvasY: number) => {
    const x = xMin + ((canvasX - PADDING.left) / plotWidth) * (xMax - xMin);
    const y = yMin + ((PADDING.top + plotHeight - canvasY) / plotHeight) * (yMax - yMin);
    return { x, y };
  }, [xMin, xMax, yMin, yMax, plotWidth, plotHeight]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = GRAPH_WIDTH;
    canvas.height = GRAPH_HEIGHT;

    ctx.clearRect(0, 0, GRAPH_WIDTH, GRAPH_HEIGHT);

    ctx.fillStyle = '#FAFBFC';
    ctx.fillRect(0, 0, GRAPH_WIDTH, GRAPH_HEIGHT);

    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;

    for (let x = xMin; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, PADDING.top);
      ctx.lineTo(cx, PADDING.top + plotHeight);
      ctx.stroke();
    }

    for (let y = yMin; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(PADDING.left, cy);
      ctx.lineTo(PADDING.left + plotWidth, cy);
      ctx.stroke();
    }

    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(PADDING.left, PADDING.top);
    ctx.lineTo(PADDING.left, PADDING.top + plotHeight);
    ctx.lineTo(PADDING.left + plotWidth, PADDING.top + plotHeight);
    ctx.stroke();

    ctx.fillStyle = AXIS_COLOR;
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = xMin; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.fillText(Number.isInteger(x) ? x.toString() : x.toFixed(1), cx, PADDING.top + plotHeight + 8);
      ctx.beginPath();
      ctx.moveTo(cx, PADDING.top + plotHeight);
      ctx.lineTo(cx, PADDING.top + plotHeight + 5);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.lineWidth = 2;
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = yMin; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.fillText(Number.isInteger(y) ? y.toString() : y.toFixed(1), PADDING.left - 10, cy);
      ctx.beginPath();
      ctx.moveTo(PADDING.left, cy);
      ctx.lineTo(PADDING.left - 5, cy);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.lineWidth = 2;
    }

    ctx.save();
    ctx.translate(22, PADDING.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = AXIS_COLOR;
    ctx.fillText(`${yLabel} (${yUnit})`, 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = AXIS_COLOR;
    ctx.fillText(`${xLabel} (${xUnit})`, PADDING.left + plotWidth / 2, GRAPH_HEIGHT - 25);

    if (showBestFit && slope != null && intercept != null) {
      ctx.strokeStyle = BESTFIT_COLOR;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      const y1 = slope * xMin + intercept;
      const y2 = slope * xMax + intercept;
      ctx.moveTo(toCanvasX(xMin), toCanvasY(y1));
      ctx.lineTo(toCanvasX(xMax), toCanvasY(y2));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = BESTFIT_COLOR;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const eqText = equation || `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`;
      ctx.fillText(eqText, PADDING.left + 12, PADDING.top + 8);

      if (slope !== 0) {
        const midX = (xMin + xMax) / 2;
        const midY = slope * midX + intercept;
        const rise = slope * (xMax - xMin) * 0.25;
        const run = (xMax - xMin) * 0.25;

        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(toCanvasX(midX), toCanvasY(midY));
        ctx.lineTo(toCanvasX(midX + run), toCanvasY(midY));
        ctx.lineTo(toCanvasX(midX + run), toCanvasY(midY + rise));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#64748B';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`run = ${run.toFixed(2)}`, toCanvasX(midX + run / 2), toCanvasY(midY) + 4);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`rise = ${rise.toFixed(2)}`, toCanvasX(midX + run) + 4, toCanvasY(midY + rise / 2));
      }
    }

    dataPoints.forEach((point) => {
      const cx = toCanvasX(point.x);
      const cy = toCanvasY(point.y);
      const isHovered = hoveredPoint === point.id;

      if (isHovered) {
        ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = POINT_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, isHovered ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, isHovered ? 7 : 5, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.fillStyle = AXIS_COLOR;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, GRAPH_WIDTH / 2, 10);
  }, [dataPoints, hoveredPoint, toCanvasX, toCanvasY, xMin, xMax, yMin, yMax, xStep, yStep, plotWidth, plotHeight, xLabel, yLabel, xUnit, yUnit, showBestFit, slope, intercept, equation, title]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = GRAPH_WIDTH / rect.width;
    const scaleY = GRAPH_HEIGHT / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    return { canvasX, canvasY };
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const { canvasX, canvasY } = coords;

    if (canvasX < PADDING.left || canvasX > PADDING.left + plotWidth) return;
    if (canvasY < PADDING.top || canvasY > PADDING.top + plotHeight) return;

    const { x, y } = canvasToData(canvasX, canvasY);

    const snappedX = Math.round(x / xStep) * xStep;
    const snappedY = Math.round(y / yStep) * yStep;

    const clampedX = Math.max(xMin, Math.min(xMax, snappedX));
    const clampedY = Math.max(yMin, Math.min(yMax, snappedY));

    const newPoint: GraphPoint = {
      x: Number(clampedX.toFixed(2)),
      y: Number(clampedY.toFixed(3)),
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    onPointsChange([...dataPoints, newPoint]);
  }, [dataPoints, onPointsChange, canvasToData, plotWidth, plotHeight, xMin, xMax, yMin, yMax, xStep, yStep, getCanvasCoords]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const { canvasX, canvasY } = coords;

    let closest: string | null = null;
    let minDist = 20;

    dataPoints.forEach((point) => {
      const px = toCanvasX(point.x);
      const py = toCanvasY(point.y);
      const dist = Math.sqrt((canvasX - px) ** 2 + (canvasY - py) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = point.id;
      }
    });

    setHoveredPoint(closest);
  }, [dataPoints, toCanvasX, toCanvasY, getCanvasCoords]);

  const handleRemovePoint = useCallback((id: string) => {
    onPointsChange(dataPoints.filter((p) => p.id !== id));
  }, [dataPoints, onPointsChange]);

  const handleClearAll = useCallback(() => {
    onPointsChange([]);
  }, [onPointsChange]);

  const calculateStats = useCallback(() => {
    if (dataPoints.length < 2) return null;
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((s, p) => s + p.x, 0);
    const sumY = dataPoints.reduce((s, p) => s + p.y, 0);
    const sumXY = dataPoints.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = dataPoints.reduce((s, p) => s + p.x * p.x, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    const sXY = sumXY - n * meanX * meanY;
    const sX2 = sumX2 - n * meanX * meanX;
    const bestSlope = sX2 !== 0 ? sXY / sX2 : 0;
    const bestIntercept = meanY - bestSlope * meanX;
    return { slope: bestSlope, intercept: bestIntercept };
  }, [dataPoints]);

  const stats = calculateStats();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{dataPoints.length} points plotted</span>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={dataPoints.length === 0}>
            <Trash2 size={14} className="mr-1" /> Clear All
          </Button>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
          className="w-full max-w-[800px] cursor-crosshair border border-slate-200 rounded-lg bg-white shadow-sm"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />
      </div>

      <p className="text-xs text-slate-500 mt-3 text-center">
        Click anywhere on the graph to plot a data point. Points snap to the nearest grid line.
      </p>

      {stats && showBestFit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-600" />
            <span className="text-sm font-bold text-red-800">Line of Best Fit (Least Squares)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-red-600">Slope (S):</span>
              <span className="ml-1 font-mono font-bold text-red-900">{stats.slope.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-red-600">Intercept (c):</span>
              <span className="ml-1 font-mono font-bold text-red-900">{stats.intercept.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-red-600">Equation:</span>
              <span className="ml-1 font-mono font-bold text-red-900">
                y = {stats.slope.toFixed(3)}x {stats.intercept >= 0 ? '+' : ''}{stats.intercept.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}

      {dataPoints.length > 0 && (
        <div className="mt-4 max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <th className="p-2 text-left font-mono text-xs">#</th>
                <th className="p-2 text-left font-mono text-xs">{xLabel} ({xUnit})</th>
                <th className="p-2 text-left font-mono text-xs">{yLabel} ({yUnit})</th>
                <th className="p-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="font-mono divide-y divide-slate-100">
              {dataPoints.map((point, idx) => (
                <tr key={point.id} className="hover:bg-slate-50">
                  <td className="p-2 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="p-2 text-xs">{point.x.toFixed(2)}</td>
                  <td className="p-2 font-bold text-blue-600 text-xs">{point.y.toFixed(3)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleRemovePoint(point.id)}
                      className="text-red-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default WAECGraph;
