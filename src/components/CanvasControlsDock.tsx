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
}) => {
  return (
    <aside aria-label="Canvas view and zoom controls" className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 p-1 rounded-xl bg-[#0e1015]/90 backdrop-blur-md border border-white/[0.08] shadow-2xl font-body">
      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Current Scale Display */}
      <div className="text-xs font-semibold text-center text-zinc-300 py-0.5 select-none">
        {Math.round(scale * 100)}%
      </div>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="w-full h-px bg-white/[0.06] my-0.5" />

      {/* Fit to View */}
      <button
        type="button"
        onClick={onFitScreen}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Recenter Network"
      >
        <Maximize className="w-3.5 h-3.5" />
      </button>

      {/* Toggle Dotted Grid */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
          showGrid ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/[0.08]'
        }`}
        title="Toggle Grid Canvas"
      >
        <Grid className="w-3.5 h-3.5" />
      </button>

      {/* Wire Spline Style */}
      <button
        type="button"
        onClick={onCycleWireStyle}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        title={`Spline Cable Style: ${wireStyle}`}
      >
        <Sliders className="w-3.5 h-3.5 text-rose-400/80" />
      </button>

      {/* Signal Flow Toggle */}
      <button
        type="button"
        onClick={onToggleSimulate}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
          isSimulating ? 'text-rose-400 bg-rose-500/15' : 'text-zinc-500 hover:text-white hover:bg-white/[0.08]'
        }`}
        title={isSimulating ? 'Signal Pulse Active' : 'Toggle Signal Pulse'}
      >
        <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
      </button>

      {onReturnToCover && (
        <>
          <div className="w-full h-px bg-white/[0.06] my-0.5" />
          {/* Return to Cover */}
          <button
            type="button"
            onClick={onReturnToCover}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
