import React from 'react';
import { Connection } from '../types';

interface SplineWiresProps {
  connections: Connection[];
  pinPositions: Record<string, { x: number; y: number }>;
  isSimulating: boolean;
  wireStyle: 'glow' | 'minimal' | 'cyber';
  activeConnectionId: string | null;
  onSelectConnection?: (id: string | null) => void;
  selectedNodeId?: string | null;
}

const SplineWiresComponent: React.FC<SplineWiresProps> = ({
  connections,
  pinPositions,
  isSimulating,
  wireStyle,
  activeConnectionId,
  onSelectConnection,
  selectedNodeId,
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Soft Depth Drop Shadow */}
        <filter id="wire-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.8" />
        </filter>

        {/* Ambient Spline Neon Glow Filter */}
        <filter id="wire-glow-filter" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Intense Traveling Energy Pulse Glow */}
        <filter id="intense-pulse" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((conn, idx) => {
        const fromPos = pinPositions[conn.fromPinId];
        const toPos = pinPositions[conn.toPinId];

        if (!fromPos || !toPos) {
          return null;
        }

        const x1 = fromPos.x;
        const y1 = fromPos.y;
        const x2 = toPos.x;
        const y2 = toPos.y;

        // Adaptive natural Hermite spline curvature
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curvature = Math.min(Math.max(distance * 0.45, 75), 210);

        const cp1x = x1 + curvature;
        const cp1y = y1;
        const cp2x = x2 - curvature;
        const cp2y = y2;

        const pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        const baseColor = conn.color || '#e11d48';
        const isSelected = activeConnectionId === conn.id;
        const isRelated = selectedNodeId
          ? conn.fromNodeId === selectedNodeId || conn.toNodeId === selectedNodeId
          : true;
        const groupOpacity = selectedNodeId ? (isRelated ? 1 : 0.18) : 1;

        return (
          <g
            key={conn.id}
            style={{ opacity: groupOpacity }}
            className="cursor-pointer pointer-events-auto transition-opacity duration-200"
            onClick={() => onSelectConnection && onSelectConnection(conn.id)}
          >
            {/* Wider transparent hit zone for effortless clicking/hovering */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="pointer-events-stroke"
            />

            {/* 1. Ambient depth drop shadow for 3D realism on carbon fiber */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0, 0, 0, 0.75)"
              strokeWidth={isSelected ? 6 : 4.5}
              strokeLinecap="round"
              filter="url(#wire-shadow)"
            />

            {/* 2. Radiant energy glow tube */}
            {wireStyle === 'glow' && (
              <path
                d={pathData}
                fill="none"
                stroke={baseColor}
                strokeWidth={isSelected ? 8 : 5}
                strokeOpacity={isSelected ? 0.45 : 0.2}
                filter="url(#wire-glow-filter)"
                strokeLinecap="round"
              />
            )}

            {/* 3. Primary superconductor spline core */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ffffff' : baseColor}
              strokeWidth={isSelected ? 2.2 : 1.6}
              strokeOpacity={isSelected ? 0.98 : 0.72}
              strokeDasharray={wireStyle === 'cyber' ? '6, 6' : undefined}
              strokeLinecap="round"
              className="transition-all duration-150"
            />

            {/* 4. Hyper-luminous white central filament */}
            <path
              d={pathData}
              fill="none"
              stroke="#ffffff"
              strokeWidth={0.8}
              strokeOpacity={isSelected ? 0.85 : 0.45}
              strokeLinecap="round"
            />

            {/* Hardware Socket Terminals at Pins */}
            {/* Origin Socket */}
            <circle cx={x1} cy={y1} r={4.5} fill="none" stroke={baseColor} strokeWidth={1.2} strokeOpacity={0.6} />
            <circle cx={x1} cy={y1} r={2.2} fill="#ffffff" />

            {/* Target Socket */}
            <circle cx={x2} cy={y2} r={4.5} fill="none" stroke={baseColor} strokeWidth={1.2} strokeOpacity={0.6} />
            <circle cx={x2} cy={y2} r={2.2} fill="#ffffff" />
          </g>
        );
      })}
    </svg>
  );
};

export const SplineWires = React.memo(SplineWiresComponent);
