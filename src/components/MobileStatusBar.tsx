import React from 'react';

interface MobileStatusBarProps {
  currentNodeIndex?: number;
  totalNodes: number;
  splineCount: number;
  visitorCount?: number;
  presetName?: string;
  activeNodeTitle?: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  currentNodeIndex = 1,
  totalNodes,
  splineCount,
  visitorCount = 0,
  presetName = 'RESEARCH',
}) => {
  const nodeNumStr = String(currentNodeIndex).padStart(2, '0');
  const totalNumStr = String(totalNodes).padStart(2, '0');

  return (
    <footer
      aria-label="Mobile spatial workspace status telemetry"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+6px)] left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#090b10]/95 border border-white/12 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.85)] text-[9px] sm:text-[10px] font-tech text-zinc-300 whitespace-nowrap max-w-[96vw] min-w-0"
    >
      {/* Workspace Tag (Responsive collapse on tiny screens) */}
      <span className="hidden min-[390px]:inline-block px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 font-bold text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-200">
        SPATIAL WORKSPACE
      </span>

      <span className="hidden min-[390px]:inline text-zinc-600">&bull;</span>

      {/* Node Index Counter */}
      <span className="font-bold tracking-wider text-white">
        NODE {nodeNumStr} / {totalNumStr}
      </span>

      {/* Preset Tag (Hidden on narrow viewports) */}
      <span className="text-zinc-600 hidden min-[360px]:inline">&bull;</span>
      <span className="text-zinc-400 font-medium uppercase hidden min-[360px]:inline">
        {presetName}
      </span>

      {visitorCount > 0 && (
        <>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-rose-400 font-semibold">
            +{visitorCount}
          </span>
        </>
      )}

      <span className="text-zinc-600 hidden min-[340px]:inline">&bull;</span>

      {/* Active Splines */}
      <span className="text-zinc-400 hidden min-[340px]:inline">
        {splineCount} SPLINES
      </span>

      <span className="text-zinc-600">&bull;</span>

      {/* Live Beacon */}
      <span className="flex items-center gap-1 font-bold text-rose-500">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        LIVE
      </span>
    </footer>
  );
};
