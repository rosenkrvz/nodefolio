import React from 'react';
import { Maximize, Activity } from '../icons';
import { playSound } from '../../lib/sound';

interface WorkspaceCADStatusBarProps {
  activePreset: 'network' | 'project' | 'all';
  nodeCount: number;
  visitorCount: number;
  splineCount: number;
  scale: number;
  onFitScreen: () => void;
  isSimulating: boolean;
}

export const WorkspaceCADStatusBar: React.FC<WorkspaceCADStatusBarProps> = ({
  activePreset,
  nodeCount,
  visitorCount,
  splineCount,
  scale,
  onFitScreen,
  isSimulating,
}) => {
  return (
    <footer
      aria-label="Workspace CAD Status & Precision Telemetry Bar"
      className="absolute bottom-0 inset-x-0 h-7 px-3 bg-[#111319]/95 backdrop-blur-md border-t border-[#242934] z-20 hidden md:flex items-center justify-between text-[10px] font-mono text-zinc-400 select-none shadow-md"
    >
      {/* Left: Identification & Live Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 font-bold text-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
          <span className="text-zinc-100 uppercase tracking-wider">SPATIAL WORKSPACE</span>
        </div>

        <span className="text-zinc-600 hidden sm:inline">&bull;</span>
        <span className="text-zinc-300 font-semibold truncate hidden lg:inline">
          SHUBHAM SHARMA &bull; IIT JODHPUR
        </span>

        <span className="text-zinc-600 hidden xl:inline">&bull;</span>
        <span className="text-rose-400/90 font-medium truncate hidden xl:inline">
          {activePreset === 'project' ? 'RESEARCH ECOSYSTEM' : 'OFFICIAL NETWORK'}
        </span>
      </div>

      {/* Center: Keybinding Quick Reference Cheatsheet */}
      <div className="hidden 2xl:flex items-center gap-3 text-zinc-500 text-[9.5px]">
        <span><strong className="text-zinc-400">LMB:</strong> Drag Node</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">Wheel:</strong> Zoom</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">G:</strong> Grid</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">N:</strong> Sidebar</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">S:</strong> Physics</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">Home:</strong> Recenter</span>
      </div>

      {/* Right: Graph Telemetry & Direct Zoom Stepper */}
      <div className="flex items-center gap-2.5 shrink-0 text-[10px]">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span>{nodeCount} NODES</span>
          {visitorCount > 0 && (
            <span className="text-rose-400 font-semibold">+{visitorCount} NOTES</span>
          )}
          <span className="text-zinc-600">/</span>
          <span>{splineCount} SPLINES</span>
        </div>

        <div className="h-3 w-px bg-[#2b313d]" />

        {isSimulating && (
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.2 rounded-[2px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-semibold">
            <Activity className="w-2.5 h-2.5 animate-pulse" />
            <span>FORCE_SIM</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            playSound('secondaryClick');
            onFitScreen();
          }}
          className="px-1.5 py-0.5 rounded-[2px] bg-[#1a1d26] hover:bg-[#252b38] border border-[#2e3544] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="Frame All Nodes [Home]"
        >
          <Maximize className="w-2.5 h-2.5" />
          <span className="font-bold text-rose-300">{Math.round(scale * 100)}%</span>
        </button>
      </div>
    </footer>
  );
};
