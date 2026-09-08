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
  wireStyle,
  activeConnectionId,
  onSelectConnection,
  selectedNodeId,
}) => {
  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: 'visible' }}
    >
      {connections.map((conn) => {
        const fromPos = pinPositions[conn.fromPinId];
        const toPos = pinPositions[conn.toPinId];

        if (!fromPos || !toPos) {
          return null;
        }

        const x1 = fromPos.x;
        const y1 = fromPos.y;
        const x2 = toPos.x;
        const y2 = toPos.y;

        // 100% straight linear vector trajectory — zero twisting, zero curve distortion
        const pathData = `M ${x1} ${y1} L ${x2} ${y2}`;
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
            className="cursor-pointer pointer-events-auto transition-opacity duration-150"
            onClick={() => onSelectConnection && onSelectConnection(conn.id)}
          >
            {/* Transparent wide interactive hit zone */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="pointer-events-stroke"
            />

            {/* Ambient vector glow */}
            {wireStyle === 'glow' && (
              <path
                d={pathData}
                fill="none"
                stroke={baseColor}
                strokeWidth={isSelected ? 8 : 4.5}
                strokeOpacity={isSelected ? 0.45 : 0.2}
                strokeLinecap="round"
              />
            )}

            {/* Crisp superconductor core spline */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ffffff' : baseColor}
              strokeWidth={isSelected ? 2.5 : 1.8}
              strokeOpacity={isSelected ? 1 : 0.85}
              strokeDasharray={wireStyle === 'cyber' ? '6, 6' : undefined}
              strokeLinecap="round"
            />

            {/* Precision socket terminals */}
            <circle cx={x1} cy={y1} r={3} fill="#ffffff" stroke={baseColor} strokeWidth={1.5} />
            <circle cx={x2} cy={y2} r={3} fill="#ffffff" stroke={baseColor} strokeWidth={1.5} />
          </g>
        );
      })}
    </svg>
  );
};

export const SplineWires = React.memo(SplineWiresComponent);
