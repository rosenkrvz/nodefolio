import React from 'react';
import {
  Plus,
  Minus,
  Maximize,
  Grid,
  Activity,
  Sliders,
  ArrowUp,
} from './icons';

interface CanvasControlsDockProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  wireStyle: 'glow' | 'minimal' | 'cyber';
  onCycleWireStyle: () => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onReturnToCover?: () => void;
  onOpenAddNode?: () => void;
}

const CanvasControlsDockComponent: React.FC<CanvasControlsDockProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  showGrid,
  onToggleGrid,
  wireStyle,
  onCycleWireStyle,
  isSimulating,
  onToggleSimulate,
  onReturnToCover,
  onOpenAddNode,
}) => {
  const repeatTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startRepeating = React.useCallback((action: () => void) => {
    action();
    if (repeatTimerRef.current) clearTimeout(repeatTimerRef.current);
    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);

    repeatTimerRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        action();
      }, 55);
    }, 260);
  }, []);

  const stopRepeating = React.useCallback(() => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      stopRepeating();
    };
  }, [stopRepeating]);

  return (
    <aside aria-label="Canvas view and zoom controls" className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-1 p-1 rounded-md bg-[#16181e]/95 backdrop-blur-md border border-[#2e333d] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.08)] font-body">
      {/* Add Your Own Node Button */}
      {onOpenAddNode && (
        <>
          <button
            type="button"
            onClick={onOpenAddNode}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 transition-colors cursor-pointer"
            title="Add Your Own Research Node (Community Easter Egg)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-white/[0.06] my-0.5" />
        </>
      )}

      {/* Zoom In */}
      <button
        type="button"
        onPointerDown={(e) => {
          if (e.button === 0) startRepeating(onZoomIn);
        }}
        onPointerUp={stopRepeating}
        onPointerLeave={stopRepeating}
        className="w-7 h-7 rounded-[4px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#252830] transition-colors cursor-pointer active:scale-95"
        title="Zoom In (Click or hold for continuous 1% stepping)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Current Scale Display */}
      <div className="text-[10px] font-semibold text-center text-zinc-400 py-0.5 select-none font-mono">
        {Math.round(scale * 100)}%
      </div>

      {/* Zoom Out */}
      <button
        type="button"
        onPointerDown={(e) => {
          if (e.button === 0) startRepeating(onZoomOut);
        }}
        onPointerUp={stopRepeating}
        onPointerLeave={stopRepeating}
        className="w-7 h-7 rounded-[4px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#252830] transition-colors cursor-pointer active:scale-95"
        title="Zoom Out (Click or hold for continuous 1% stepping)"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="w-full h-px bg-[#2d323c] my-0.5" />

      {/* Fit to View */}
      <button
        type="button"
        onClick={onFitScreen}
        className="w-7 h-7 rounded-[4px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#252830] transition-colors cursor-pointer"
        title="Recenter Network"
      >
        <Maximize className="w-3.5 h-3.5" />
      </button>

      {/* Toggle Dotted Grid */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`w-7 h-7 rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${
          showGrid
            ? 'text-white bg-[#222733] border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
            : 'text-zinc-400 hover:text-white hover:bg-[#252830]'
        }`}
        title="Toggle Grid Canvas"
      >
        <Grid className="w-3.5 h-3.5" />
      </button>

      {/* Wire Spline Style */}
      <button
        type="button"
        onClick={onCycleWireStyle}
        className="w-7 h-7 rounded-[4px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#252830] transition-colors cursor-pointer"
        title={`Spline Cable Style: ${wireStyle}`}
      >
        <Sliders className="w-3.5 h-3.5 text-rose-400/80" />
      </button>

      {/* Signal Flow Toggle */}
      <button
        type="button"
        onClick={onToggleSimulate}
        className={`w-7 h-7 rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${
          isSimulating
            ? 'text-white bg-[#222733] border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
            : 'text-zinc-400 hover:text-white hover:bg-[#252830]'
        }`}
        title={isSimulating ? 'Signal Pulse Active' : 'Toggle Signal Pulse'}
      >
        <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'text-rose-400 animate-pulse' : ''}`} />
      </button>

      {onReturnToCover && (
        <>
          <div className="w-full h-px bg-[#2d323c] my-0.5" />
          {/* Return to Cover */}
          <button
            type="button"
            onClick={onReturnToCover}
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
            title="Return to Portfolio Cover"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </aside>
  );
};

export const CanvasControlsDock = React.memo(CanvasControlsDockComponent);
