import React from 'react';
import { cn } from '../../lib/utils';

interface BuretteProps {
  volume: number;
  maxVolume?: number;
  width?: number;
  height?: number;
  liquidColor?: string;
  showScale?: boolean;
  className?: string;
}

export const Burette: React.FC<BuretteProps> = ({
  volume,
  maxVolume = 50,
  width = 60,
  height = 300,
  liquidColor = '#CBD5E1',
  showScale = true,
  className,
}) => {
  const fillPercentage = Math.max(0, Math.min(1, volume / maxVolume));
  const liquidHeight = fillPercentage * (height - 40);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="bg-slate-50 rounded-lg">
        <defs>
          <linearGradient id="buretteGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Burette tube */}
        <rect x={width * 0.25} y={10} width={width * 0.5} height={height - 20} fill="url(#buretteGlass)" stroke="#94A3B8" strokeWidth="1.5" rx={2} />
        
        {/* Liquid */}
        <rect
          x={width * 0.25 + 2}
          y={10 + (height - 40) - liquidHeight}
          width={width * 0.5 - 4}
          height={liquidHeight}
          fill="url(#liquidGradient)"
          rx={1}
        />

        {/* Meniscus */}
        <path
          d={`M${width * 0.25 + 2} ${10 + (height - 40) - liquidHeight} Q${width * 0.5} ${10 + (height - 40) - liquidHeight - 3} ${width * 0.75 - 2} ${10 + (height - 40) - liquidHeight}`}
          fill="none"
          stroke={liquidColor}
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Scale markings */}
        {showScale && Array.from({ length: maxVolume + 1 }, (_, i) => i).map((i) => {
          const y = 10 + (height - 40) - (i / maxVolume) * (height - 40);
          const isMajor = i % 5 === 0;
          return (
            <React.Fragment key={i}>
              <line
                x1={width * 0.15}
                x2={width * 0.25}
                y1={y}
                y2={y}
                stroke="#64748B"
                strokeWidth={isMajor ? 1.5 : 0.5}
                opacity={isMajor ? 1 : 0.5}
              />
              <line
                x1={width * 0.85}
                x2={width * 0.75}
                y1={y}
                y2={y}
                stroke="#64748B"
                strokeWidth={isMajor ? 1.5 : 0.5}
                opacity={isMajor ? 1 : 0.5}
              />
              {isMajor && (
                <text
                  x={width * 0.1}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                  fill="#475569"
                >
                  {maxVolume - i}
                </text>
              )}
            </React.Fragment>
          )
        })}

        {/* Stopcock */}
        <circle cx={width / 2} cy={height - 15} r={8} fill="#0F172A" />
        <rect x={width / 2 - 6} y={height - 15} width={12} height={10} fill="#1E293B" rx={1} />
        <line x1={width / 2} y1={height - 10} x2={width / 2} y2={height - 5} stroke="#334155" strokeWidth={2} />
      </svg>

      <div className="mt-2 text-center">
        <p className="text-xs text-slate-500">Burette Reading</p>
        <p className="font-mono text-lg font-bold text-slate-900">{(maxVolume - volume).toFixed(2)} mL</p>
      </div>
    </div>
  );
};

interface ConicalFlaskProps {
  volume: number;
  maxVolume?: number;
  liquidColor?: string;
  hasIndicator?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const ConicalFlask: React.FC<ConicalFlaskProps> = ({
  volume,
  maxVolume = 100,
  liquidColor = '#FDE047',
  hasIndicator = false,
  width = 100,
  height = 140,
  className,
}) => {
  const fillPercentage = Math.max(0, Math.min(1, volume / maxVolume));
  const liquidHeight = fillPercentage * (height - 30);

  const effectiveColor = hasIndicator ? liquidColor : '#E2E8F0';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="flaskGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="flaskLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={effectiveColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={effectiveColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Flask body */}
        <path
          d={`M${width * 0.1} ${height * 0.2} L${width * 0.05} ${height * 0.85} Q${width * 0.05} ${height * 0.95} ${width * 0.15} ${height * 0.95} L${width * 0.85} ${height * 0.95} Q${width * 0.95} ${height * 0.95} ${width * 0.95} ${height * 0.85} L${width * 0.9} ${height * 0.2} Z`}
          fill="url(#flaskGlass)"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />

        {/* Liquid */}
        {volume > 0 && (
          <path
            d={`M${width * 0.12} ${height * 0.85 - liquidHeight} L${width * 0.08} ${height * 0.85} Q${width * 0.08} ${height * 0.93} ${width * 0.16} ${height * 0.93} L${width * 0.84} ${height * 0.93} Q${width * 0.92} ${height * 0.93} ${width * 0.92} ${height * 0.85} L${width * 0.88} ${height * 0.85 - liquidHeight} Z`}
            fill="url(#flaskLiquid)"
          />
        )}

        {/* Neck */}
        <rect x={width * 0.4} y={0} width={width * 0.2} height={height * 0.2} fill="url(#flaskGlass)" stroke="#94A3B8" strokeWidth="1.5" />
      </svg>

      <div className="mt-2 text-center">
        <p className="text-xs text-slate-500">Conical Flask</p>
        <p className="font-mono text-sm font-bold text-slate-900">{volume.toFixed(2)} mL</p>
      </div>
    </div>
  );
};