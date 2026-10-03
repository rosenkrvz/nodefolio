import React, { useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Minus,
  Maximize,
  Grid,
  Activity,
  Sliders,
  Layers,
  Search,
} from '../icons';
import { playSound } from '../../lib/sound';

export type WorkspaceToolMode = 'select' | 'pan';

interface WorkspaceCADToolRailProps {
  activeTool: WorkspaceToolMode;
  onSelectTool: (tool: WorkspaceToolMode) => void;
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
  onOpenAddNode?: () => void;
  onToggleCategoryFilter?: () => void;
  showLayersMenu?: boolean;
}

export const WorkspaceCADToolRail: React.FC<WorkspaceCADToolRailProps> = ({
  activeTool,
  onSelectTool,
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
  onOpenAddNode,
}) => {
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRepeating = useCallback((action: () => void) => {
    action();
    if (repeatTimerRef.current) clearTimeout(repeatTimerRef.current);
    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);

    repeatTimerRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        action();
      }, 55);
    }, 260);
  }, []);

  const stopRepeating = useCallback(() => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRepeating();
    };
  }, [stopRepeating]);

  return (
    <aside
      aria-label="Workspace CAD Tool Rail (T-Panel)"
      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-1 p-1 bg-[#151820]/95 backdrop-blur-md border border-[#2b313d] rounded-[3px] shadow-[0_8px_32px_rgba(0,0,0,0.65),0_0_12px_rgba(244,63,94,0.06)] font-mono select-none"
    >
      {/* Tool: Select / Inspect Mode */}
      <button
        type="button"
        onClick={() => {
          playSound('click');
          onSelectTool('select');
        }}
        className={`w-7 h-7 rounded-[2px] flex items-center justify-center transition-all cursor-pointer ${
          activeTool === 'select'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
        }`}
        title="Select / Interact Tool [W]"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.5 1.5l10 5.5-5 1.5-2 5-3-12z" />
        </svg>
      </button>

      {/* Tool: Pan / Drag Viewport */}
      <button
        type="button"
        onClick={() => {
          playSound('click');
          onSelectTool('pan');
        }}
        className={`w-7 h-7 rounded-[2px] flex items-center justify-center transition-all cursor-pointer ${
          activeTool === 'pan'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
        }`}
        title="Pan / Navigate Viewport [H]"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a1 1 0 0 1 1 1v4h1V3a1 1 0 0 1 2 0v5a4 4 0 0 1-8 0V4a1 1 0 0 1 2 0v3h1V2a1 1 0 0 1 1-1z" />
        </svg>
      </button>

      <div className="w-full h-px bg-[#2b313d] my-0.5" />

      {/* Recenter & Fit to Screen */}
      <button
        type="button"
        onClick={() => {
          playSound('secondaryClick');
          onFitScreen();
        }}
        className="w-7 h-7 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        title="Frame All Nodes [Home]"
      >
        <Maximize className="w-3.5 h-3.5" />
      </button>

      {/* Grid Canvas Toggle */}
      <button
        type="button"
        onClick={() => {
          playSound('toggle');
          onToggleGrid();
        }}
        className={`w-7 h-7 rounded-[2px] flex items-center justify-center transition-all cursor-pointer ${
          showGrid
            ? 'bg-[#222736] text-white border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
        }`}
        title="Toggle Coordinate Grid [G]"
      >
        <Grid className="w-3.5 h-3.5" />
      </button>

      {/* Cable Style Cycle */}
      <button
        type="button"
        onClick={() => {
          playSound('select');
          onCycleWireStyle();
        }}
        className="w-7 h-7 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer relative"
        title={`Spline Cable Style: ${wireStyle}`}
      >
        <Sliders className="w-3.5 h-3.5 text-rose-400/90" />
      </button>

      {/* Force-directed Physics Simulate */}
      <button
        type="button"
        onClick={() => {
          playSound('connect');
          onToggleSimulate();
        }}
        className={`w-7 h-7 rounded-[2px] flex items-center justify-center transition-all cursor-pointer ${
          isSimulating
            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
        }`}
        title="Force Simulation Physics [S]"
      >
        <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
      </button>

      <div className="w-full h-px bg-[#2b313d] my-0.5" />

      {/* Zoom In */}
      <button
        type="button"
        onPointerDown={(e) => {
          if (e.button === 0) startRepeating(onZoomIn);
        }}
        onPointerUp={stopRepeating}
        onPointerLeave={stopRepeating}
        className="w-7 h-7 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer active:scale-95"
        title="Zoom In (Click or hold)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Precise Zoom Stepper Display */}
      <div className="text-[9.5px] font-bold text-center text-zinc-300 py-0.5 select-none font-mono">
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
        className="w-7 h-7 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer active:scale-95"
        title="Zoom Out (Click or hold)"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* Add Custom Note Button */}
      {onOpenAddNode && (
        <>
          <div className="w-full h-px bg-[#2b313d] my-0.5" />
          <button
            type="button"
            onClick={() => {
              playSound('open');
              onOpenAddNode();
            }}
            className="w-7 h-7 rounded-[2px] flex items-center justify-center text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 transition-colors cursor-pointer"
            title="Add Custom Research Note"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </aside>
  );
};
