import React from 'react';
import type { SlideType } from '../../types';

interface SpecimenProps {
  slide: SlideType;
  coarseFocus: number;
  fineFocus: number;
  lightIntensity: number;
  stained: boolean;
  width?: number;
  height?: number;
}

function computeFilter(coarseFocus: number, fineFocus: number, lightIntensity: number, stained: boolean): string {
  const focusScore = (coarseFocus * 0.6 + fineFocus * 0.4) / 100;
  const blur = Math.max(0, (1 - focusScore) * 6);
  const contrast = 70 + focusScore * 40 + (stained ? 15 : 0);
  const brightness = 40 + (lightIntensity / 100) * 70 + (stained ? -10 : 0);
  const saturate = stained ? 140 : 80;
  return `blur(${blur.toFixed(1)}px) contrast(${contrast.toFixed(0)}%) brightness(${brightness.toFixed(0)}%) saturate(${saturate}%)`;
}

function computeOverlayOpacity(lightIntensity: number, stained: boolean): number {
  const base = 0.15 + (lightIntensity / 100) * 0.15;
  return stained ? base + 0.1 : base;
}

export const OnionEpidermis: React.FC<SpecimenProps> = ({ coarseFocus, fineFocus, lightIntensity, stained, width = 600, height = 450 }) => {
  const filter = computeFilter(coarseFocus, fineFocus, lightIntensity, stained);
  const overlayOpacity = computeOverlayOpacity(lightIntensity, stained);
  const stainTint = stained ? 'rgba(180, 120, 40, 0.15)' : 'transparent';

  return (
    <svg width={width} height={height} viewBox="0 0 600 450" style={{ filter }}>
      <defs>
        <pattern id="onion-cell-grid" x="0" y="0" width="120" height="90" patternUnits="userSpaceOnUse">
          <rect width="120" height="90" fill="#f0f5e8" stroke="#5a7a3a" strokeWidth="2.5" rx="3" />
        </pattern>
      </defs>
      <rect width="600" height="450" fill="url(#onion-cell-grid)" />

      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const cx = col * 120 + 60 + (row % 2 === 0 ? 0 : 60);
          const cy = row * 90 + 45;
          return (
            <g key={`${row}-${col}`} transform={`translate(${cx}, ${cy})`}>
              <ellipse rx="48" ry="32" fill="none" stroke="#6b8f4a" strokeWidth="1.5" opacity="0.5" />
              <ellipse rx="44" ry="28" fill="#e8f0d8" opacity="0.3" />
              <circle cx="5" cy="-2" r="7" fill={stained ? '#8B4513' : '#7a6a50'} opacity={stained ? 0.85 : 0.5} />
              <circle cx="5" cy="-2" r="3" fill={stained ? '#4a2810' : '#5a4a30'} opacity="0.6" />
              <ellipse rx="30" ry="18" fill="none" stroke="#8aaa6a" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 2" />
              <rect x="-44" y="-28" width="88" height="56" fill="none" stroke="#5a7a3a" strokeWidth="2" rx="4" />
            </g>
          );
        })
      )}

      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3].map((col) => {
          const cx = col * 120 + 120 + (row % 2 === 0 ? 0 : 60);
          const cy = row * 90 + 90;
          return (
            <g key={`n-${row}-${col}`} transform={`translate(${cx}, ${cy})`}>
              <rect x="-44" y="-28" width="88" height="56" fill="none" stroke="#5a7a3a" strokeWidth="2" rx="4" />
              <ellipse rx="40" ry="24" fill="#e8f0d8" opacity="0.2" />
              <circle cx="3" cy="-1" r="6" fill={stained ? '#8B4513' : '#7a6a50'} opacity={stained ? 0.85 : 0.45} />
            </g>
          );
        })
      )}

      <rect width="600" height="450" fill={stainTint} />
      <rect width="600" height="450" fill={`rgba(0,0,0,${overlayOpacity})`} />

      <circle cx="300" cy="225" r="160" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    </svg>
  );
};

export const LeafStomata: React.FC<SpecimenProps> = ({ coarseFocus, fineFocus, lightIntensity, stained, width = 600, height = 450 }) => {
  const filter = computeFilter(coarseFocus, fineFocus, lightIntensity, stained);
  const overlayOpacity = computeOverlayOpacity(lightIntensity, stained);
  const stainTint = stained ? 'rgba(80, 140, 60, 0.12)' : 'transparent';

  return (
    <svg width={width} height={height} viewBox="0 0 600 450" style={{ filter }}>
      <rect width="600" height="450" fill="#d4e8c0" />

      {Array.from({ length: 18 }).map((_, i) => {
        const cx = 50 + (i % 6) * 100 + (Math.floor(i / 6) % 2 === 0 ? 0 : 50);
        const cy = 60 + Math.floor(i / 6) * 120;
        return (
          <g key={i} transform={`translate(${cx}, ${cy})`}>
            <path
              d="M0,-30 Q25,-28 35,-5 Q38,15 20,28 Q0,35 -20,28 Q-38,15 -35,-5 Q-25,-28 0,-30Z"
              fill="#b8d498"
              stroke="#7a9a5a"
              strokeWidth="1.5"
            />
            <path
              d="M0,-28 Q22,-26 32,-5 Q34,14 18,25 Q0,31 -18,25 Q-34,14 -32,-5 Q-22,-26 0,-28Z"
              fill="#c8e4a8"
              opacity="0.5"
            />
            {Array.from({ length: 8 }).map((_, j) => {
              const angle = (j * 45 * Math.PI) / 180;
              const r = 18 + Math.random() * 6;
              return (
                <circle
                  key={j}
                  cx={Math.cos(angle) * r}
                  cy={Math.sin(angle) * r}
                  r={2.5}
                  fill={stained ? '#3a6a20' : '#4a7a30'}
                  opacity={stained ? 0.8 : 0.5}
                />
              );
            })}
          </g>
        );
      })}

      {[
        { x: 150, y: 100 }, { x: 400, y: 180 }, { x: 250, y: 320 }, { x: 480, y: 350 },
        { x: 100, y: 250 }, { x: 350, y: 80 }, { x: 500, y: 120 }, { x: 200, y: 400 },
      ].map((pos, i) => (
        <g key={`stoma-${i}`} transform={`translate(${pos.x}, ${pos.y})`}>
          <ellipse rx="22" ry="8" fill="none" stroke="#5a7a3a" strokeWidth="2" />
          <ellipse rx="18" ry="5" fill="#a0c880" stroke="#6a8a4a" strokeWidth="1.5" />
          <ellipse rx="10" ry="3" fill="#3a5a20" opacity="0.4" />
          <ellipse cx="-24" cy="0" rx="12" ry="7" fill="#90b870" stroke="#6a8a4a" strokeWidth="1" opacity="0.8" />
          <ellipse cx="24" cy="0" rx="12" ry="7" fill="#90b870" stroke="#6a8a4a" strokeWidth="1" opacity="0.8" />
          <circle cx="-24" cy="-2" r="2" fill={stained ? '#2a5a10' : '#4a7a30'} opacity="0.7" />
          <circle cx="-24" cy="3" r="1.8" fill={stained ? '#2a5a10' : '#4a7a30'} opacity="0.6" />
          <circle cx="24" cy="-2" r="2" fill={stained ? '#2a5a10' : '#4a7a30'} opacity="0.7" />
          <circle cx="24" cy="3" r="1.8" fill={stained ? '#2a5a10' : '#4a7a30'} opacity="0.6" />
        </g>
      ))}

      <rect width="600" height="450" fill={stainTint} />
      <rect width="600" height="450" fill={`rgba(0,0,0,${overlayOpacity})`} />
    </svg>
  );
};

export const CheekCell: React.FC<SpecimenProps> = ({ coarseFocus, fineFocus, lightIntensity, stained, width = 600, height = 450 }) => {
  const filter = computeFilter(coarseFocus, fineFocus, lightIntensity, stained);
  const overlayOpacity = computeOverlayOpacity(lightIntensity, stained);
  const stainTint = stained ? 'rgba(60, 80, 160, 0.12)' : 'transparent';

  return (
    <svg width={width} height={height} viewBox="0 0 600 450" style={{ filter }}>
      <rect width="600" height="450" fill="#e8e4e0" />

      {[
        { cx: 150, cy: 130, rx: 55, ry: 40, nucX: 5, nucY: -3 },
        { cx: 350, cy: 100, rx: 48, ry: 35, nucX: -4, nucY: 2 },
        { cx: 480, cy: 200, rx: 52, ry: 38, nucX: 3, nucY: -5 },
        { cx: 200, cy: 300, rx: 50, ry: 36, nucX: -2, nucY: 4 },
        { cx: 400, cy: 330, rx: 54, ry: 39, nucX: 6, nucY: -2 },
        { cx: 100, cy: 380, rx: 45, ry: 32, nucX: -3, nucY: 1 },
        { cx: 520, cy: 380, rx: 47, ry: 34, nucX: 2, nucY: -4 },
        { cx: 300, cy: 210, rx: 50, ry: 37, nucX: 0, nucY: 0 },
      ].map((cell, i) => (
        <g key={i} transform={`translate(${cell.cx}, ${cell.cy})`}>
          <ellipse rx={cell.rx} ry={cell.ry} fill="#f0ece8" stroke="#b0a8a0" strokeWidth="1.5" opacity="0.9" />
          <ellipse rx={cell.rx - 3} ry={cell.ry - 3} fill="none" stroke="#c0b8b0" strokeWidth="0.8" opacity="0.5" />

          {Array.from({ length: 12 }).map((_, j) => {
            const angle = (j * 30 * Math.PI) / 180;
            const r = (cell.rx + cell.ry) / 2 * 0.5 + Math.random() * 8;
            return (
              <circle
                key={j}
                cx={Math.cos(angle) * r}
                cy={Math.sin(angle) * r}
                r={1 + Math.random() * 1.5}
                fill="#d0c8c0"
                opacity="0.4"
              />
            );
          })}

          <ellipse
            cx={cell.nucX}
            cy={cell.nucY}
            rx="12"
            ry="10"
            fill={stained ? '#4060a0' : '#8a7a6a'}
            stroke={stained ? '#2a4080' : '#6a5a4a'}
            strokeWidth="1.5"
            opacity={stained ? 0.85 : 0.6}
          />
          <ellipse
            cx={cell.nucX + 1}
            cy={cell.nucY - 1}
            rx="4"
            ry="3.5"
            fill={stained ? '#2a3a60' : '#5a4a3a'}
            opacity="0.5"
          />
        </g>
      ))}

      <rect width="600" height="450" fill={stainTint} />
      <rect width="600" height="450" fill={`rgba(0,0,0,${overlayOpacity})`} />
    </svg>
  );
};

export const Spirogyra: React.FC<SpecimenProps> = ({ coarseFocus, fineFocus, lightIntensity, stained, width = 600, height = 450 }) => {
  const filter = computeFilter(coarseFocus, fineFocus, lightIntensity, stained);
  const overlayOpacity = computeOverlayOpacity(lightIntensity, stained);
  const stainTint = stained ? 'rgba(100, 160, 60, 0.1)' : 'transparent';

  const filaments = [
    { y: 80, angle: -2, segments: 8 },
    { y: 160, angle: 1, segments: 7 },
    { y: 240, angle: -1, segments: 9 },
    { y: 320, angle: 2, segments: 7 },
    { y: 400, angle: -0.5, segments: 8 },
  ];

  return (
    <svg width={width} height={height} viewBox="0 0 600 450" style={{ filter }}>
      <rect width="600" height="450" fill="#e0ead0" />

      {filaments.map((fil, fi) => (
        <g key={fi} transform={`rotate(${fil.angle}, 300, ${fil.y})`}>
          {Array.from({ length: fil.segments }).map((_, si) => {
            const x = si * 75;
            return (
              <g key={si} transform={`translate(${x}, ${fil.y})`}>
                <rect x="0" y="-18" width="72" height="36" fill="#d0e4b8" stroke="#6a8a4a" strokeWidth="1.5" rx="2" />

                <path
                  d="M8,-14 Q20,-10 25,0 Q30,10 42,8 Q52,6 58,-2 Q62,-10 64,-14"
                  fill="none"
                  stroke={stained ? '#2a6a10' : '#3a8a20'}
                  strokeWidth="3.5"
                  opacity={stained ? 0.85 : 0.6}
                  strokeLinecap="round"
                />
                <path
                  d="M8,-14 Q20,-10 25,0 Q30,10 42,8 Q52,6 58,-2 Q62,-10 64,-14"
                  fill="none"
                  stroke={stained ? '#1a4a08' : '#2a6a10'}
                  strokeWidth="1.5"
                  opacity="0.3"
                  strokeLinecap="round"
                />

                {[20, 35, 50].map((px, pi) => (
                  <circle
                    key={pi}
                    cx={px}
                    cy={pi % 2 === 0 ? -4 : 4}
                    r={3}
                    fill={stained ? '#1a5a08' : '#2a7a18'}
                    opacity={stained ? 0.8 : 0.5}
                  />
                ))}

                <circle cx="36" cy="0" r="8" fill="none" stroke="#6a8a4a" strokeWidth="1" opacity="0.5" />
                <circle cx="36" cy="0" r="4" fill={stained ? '#4a2a10' : '#6a5a3a'} opacity={stained ? 0.7 : 0.4} />
                <circle cx="36" cy="0" r="2" fill={stained ? '#2a1a08' : '#4a3a2a'} opacity="0.5" />

                <line x1="36" y1="0" x2="36" y2="-14" stroke="#6a8a4a" strokeWidth="0.5" opacity="0.4" />
                <line x1="36" y1="0" x2="36" y2="14" stroke="#6a8a4a" strokeWidth="0.5" opacity="0.4" />
                <line x1="36" y1="0" x2="10" y2="0" stroke="#6a8a4a" strokeWidth="0.5" opacity="0.4" />
                <line x1="36" y1="0" x2="62" y2="0" stroke="#6a8a4a" strokeWidth="0.5" opacity="0.4" />
              </g>
            );
          })}
        </g>
      ))}

      <rect width="600" height="450" fill={stainTint} />
      <rect width="600" height="450" fill={`rgba(0,0,0,${overlayOpacity})`} />
    </svg>
  );
};

export const SpecimenRenderer: React.FC<SpecimenProps> = (props) => {
  switch (props.slide) {
    case 'onion_epidermis':
      return <OnionEpidermis {...props} />;
    case 'leaf_stomata':
      return <LeafStomata {...props} />;
    case 'cheek_cell':
      return <CheekCell {...props} />;
    case 'spirogyra':
      return <Spirogyra {...props} />;
    default:
      return <OnionEpidermis {...props} />;
  }
};

export default SpecimenRenderer;
