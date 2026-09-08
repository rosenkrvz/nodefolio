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

export const SplineWires: React.FC<SplineWiresProps> = ({
  connections,
  pinPositions,
  isSimulating,
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
      <defs>
        {/* Soft Crimson Ambient Glow */}
        <filter id="wire-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="intense-pulse" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

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

        // Spline curvature calculations
        const deltaX = Math.abs(x2 - x1);
        const controlDistance = Math.max(60, deltaX * 0.5);

        const cp1x = x1 + controlDistance;
        const cp1y = y1;
        const cp2x = x2 - controlDistance;
        const cp2y = y2;

        const pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        const baseColor = conn.color || '#e11d48';
        const isSelected = activeConnectionId === conn.id;
        const isRelated = selectedNodeId
          ? conn.fromNodeId === selectedNodeId || conn.toNodeId === selectedNodeId
          : true;
        const groupOpacity = selectedNodeId ? (isRelated ? 1 : 0.2) : 1;

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
              strokeWidth={16}
              className="pointer-events-stroke"
            />

            {/* Ambient subtle glow layer */}
            {wireStyle === 'glow' && (
              <path
                d={pathData}
                fill="none"
                stroke={baseColor}
                strokeWidth={isSelected ? 5 : 3.5}
                strokeOpacity={isSelected ? 0.4 : 0.15}
                filter="url(#wire-glow-filter)"
                strokeLinecap="round"
              />
            )}

            {/* Primary spline line */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ffffff' : baseColor}
              strokeWidth={isSelected ? 2 : 1.5}
              strokeOpacity={isSelected ? 0.95 : 0.55}
              strokeDasharray={wireStyle === 'cyber' ? '6, 6' : undefined}
              strokeLinecap="round"
              className="transition-all duration-150"
            />

            {/* Animated signal pulses flowing along spline */}
            {(conn.animated || isSimulating) && (
              <>
                {/* Secondary flowing energy line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  strokeDasharray="6, 32"
                  strokeOpacity={0.7}
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-76"
                    dur={isSimulating ? '1.5s' : '4s'}
                    repeatCount="indefinite"
                  />
                </path>

                {/* Traveling packet */}
                <circle r={isSelected ? 3.5 : 2.5} fill="#ffffff" filter="url(#intense-pulse)">
                  <animateMotion
                    path={pathData}
                    dur={isSimulating ? '1.8s' : '4.5s'}
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                </circle>

                {/* Second staggered packet */}
                {isSimulating && (
                  <circle r={2} fill={baseColor} filter="url(#wire-glow-filter)">
                    <animateMotion
                      path={pathData}
                      dur="2.2s"
                      begin="1.1s"
                      repeatCount="indefinite"
                      rotate="auto"
                    />
                  </circle>
                )}
              </>
            )}

            {/* Origin & target contact dots */}
            <circle cx={x1} cy={y1} r={2.5} fill={baseColor} />
            <circle cx={x2} cy={y2} r={2.5} fill={baseColor} />
          </g>
        );
      })}
    </svg>
  );
};
