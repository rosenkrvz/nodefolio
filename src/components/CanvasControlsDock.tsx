import React from 'react';
import {
  Plus,
  Minus,
  Maximize,
  Grid,
  Activity,
  Sparkles,
} from 'lucide-react';

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
}

export const CanvasControlsDock: React.FC<CanvasControlsDockProps> = ({
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
}) => {
  return (
    <aside aria-label="Canvas view and zoom controls" className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 p-1 rounded-xl bg-[#181c21]/85 backdrop-blur-md border border-white/[0.08] shadow-2xl">
      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Zoom In"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Current Scale Display */}
      <div className="text-xs font-body font-semibold text-center text-zinc-300 py-0.5 select-none">
        {Math.round(scale * 100)}%
      </div>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Zoom Out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="w-full h-px bg-white/[0.06] my-0.5" />

      {/* Fit to View */}
      <button
        type="button"
        onClick={onFitScreen}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Recenter Network"
      >
        <Maximize className="w-3.5 h-3.5" />
      </button>

      {/* Toggle Dotted Grid */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
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
        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title={`Spline Cable Style: ${wireStyle}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-rose-400/80" />
      </button>

      {/* Signal Flow Toggle */}
      <button
        type="button"
        onClick={onToggleSimulate}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          isSimulating ? 'text-rose-400 bg-rose-500/15' : 'text-zinc-500 hover:text-white hover:bg-white/[0.08]'
        }`}
        title={isSimulating ? 'Signal Pulse Active' : 'Toggle Signal Pulse'}
      >
        <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
      </button>
    </aside>
  );
};
