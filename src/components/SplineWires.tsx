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
  isMobile?: boolean;
}

const SplineWiresComponent: React.FC<SplineWiresProps> = ({
  connections,
  pinPositions,
  wireStyle,
  activeConnectionId,
  onSelectConnection,
  selectedNodeId,
  isMobile = false,
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
                strokeWidth={isMobile ? (isSelected ? 5.5 : 3) : (isSelected ? 8 : 4.5)}
                strokeOpacity={isSelected ? 0.45 : 0.2}
                strokeLinecap="round"
              />
            )}

            {/* Crisp superconductor core spline */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ffffff' : baseColor}
              strokeWidth={isMobile ? (isSelected ? 2 : 1.4) : (isSelected ? 2.5 : 1.8)}
              strokeOpacity={isSelected ? 1 : 0.85}
              strokeDasharray={wireStyle === 'cyber' ? '6, 6' : undefined}
              strokeLinecap="round"
            />

            {/* Precision socket terminals */}
            <circle cx={x1} cy={y1} r={isMobile ? 2.5 : 3} fill="#ffffff" stroke={baseColor} strokeWidth={isMobile ? 1.2 : 1.5} />
            <circle cx={x2} cy={y2} r={isMobile ? 2.5 : 3} fill="#ffffff" stroke={baseColor} strokeWidth={isMobile ? 1.2 : 1.5} />
          </g>
        );
      })}
    </svg>
  );
};

export const SplineWires = React.memo(SplineWiresComponent, (prev, next) => {
  if (
    prev.isMobile !== next.isMobile ||
    prev.isSimulating !== next.isSimulating ||
    prev.wireStyle !== next.wireStyle ||
    prev.activeConnectionId !== next.activeConnectionId ||
    prev.selectedNodeId !== next.selectedNodeId ||
    prev.connections.length !== next.connections.length
  ) {
    return false;
  }

  // Compare actual pin coordinates for the active connections
  for (let i = 0; i < next.connections.length; i++) {
    const conn = next.connections[i];
    const prevFrom = prev.pinPositions[conn.fromPinId];
    const nextFrom = next.pinPositions[conn.fromPinId];
    if (!prevFrom || !nextFrom || prevFrom.x !== nextFrom.x || prevFrom.y !== nextFrom.y) {
      return false;
    }

    const prevTo = prev.pinPositions[conn.toPinId];
    const nextTo = next.pinPositions[conn.toPinId];
    if (!prevTo || !nextTo || prevTo.x !== nextTo.x || prevTo.y !== nextTo.y) {
      return false;
    }
  }

  return true;
});
