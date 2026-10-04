import React, { useState, useRef, useEffect } from 'react';
import {
  Grid,
  Sliders,
  Activity,
  Maximize,
  Plus,
  ChevronDown,
  Layers,
  Check,
} from '../icons';
import { playSound } from '../../lib/sound';

export interface WorkspaceCADStatusBarProps {
  activePreset: 'network' | 'project' | 'all';
  onSelectPreset: (preset: 'network' | 'project') => void;
  wireStyle: 'glow' | 'minimal' | 'cyber';
  onChangeWireStyle: (style: 'glow' | 'minimal' | 'cyber') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onFitScreen: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenAddNode?: () => void;
  nodeCount: number;
  visitorCount?: number;
  splineCount: number;
  scale: number;
}

export const WorkspaceCADStatusBar: React.FC<WorkspaceCADStatusBarProps> = ({
  activePreset,
  onSelectPreset,
  wireStyle,
  onChangeWireStyle,
  showGrid,
  onToggleGrid,
  isSimulating,
  onToggleSimulate,
  onFitScreen,
  sidebarOpen,
  onToggleSidebar,
  onOpenAddNode,
  nodeCount,
  visitorCount = 0,
  splineCount,
  scale,
}) => {
  const [openMenu, setOpenMenu] = useState<'view' | 'layout' | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openMenu]);

  return (
    <footer
      ref={menuContainerRef}
      role="toolbar"
      aria-label="Spatial Workspace CAD Unified Control & Status Bar"
      className="w-full h-8 sm:h-8.5 px-2 sm:px-3 bg-[#111319]/95 backdrop-blur-md border-t border-[#242934] z-20 flex items-center justify-between text-xs font-mono select-none relative shadow-lg shrink-0"
    >
      {/* Left Cluster: Viewport Mode, Menus & Presets */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {/* Workspace Identifier Tag */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-[#1a1e27] border border-[#2e3542] text-zinc-200 text-[10px] sm:text-[10.5px] font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
          <span className="tracking-wider uppercase">SPATIAL WORKSPACE</span>
        </div>

        {/* Object Mode Pill */}
        <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-rose-500/10 border border-rose-500/30 text-[9px] font-semibold text-rose-300 uppercase tracking-wider shrink-0">
          <span>OBJECT MODE</span>
        </div>

        {/* Viewport Menus (Open upwards) */}
        <div className="hidden md:flex items-center gap-0.5 text-zinc-300 text-[11px]">
          {/* View Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playSound('nav');
                setOpenMenu(openMenu === 'view' ? null : 'view');
              }}
              className={`px-1.5 sm:px-2 py-0.5 rounded-[2px] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer flex items-center gap-1 ${
                openMenu === 'view' ? 'bg-white/[0.1] text-white' : ''
              }`}
            >
              <span>View</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${openMenu === 'view' ? 'rotate-180' : ''}`} />
            </button>
            {openMenu === 'view' && (
              <div className="absolute left-0 bottom-full mb-1.5 w-48 py-1 bg-[#1a1d24] border border-[#323846] rounded-[4px] shadow-2xl z-50 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => {
                    playSound('select');
                    onFitScreen();
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-left text-zinc-200 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <span>Frame All Nodes</span>
                  <span className="text-[9px] text-zinc-400">Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('select');
                    onToggleGrid();
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-left text-zinc-200 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <span>Toggle Dotted Grid</span>
                  <span className="text-[9px] text-zinc-400">G</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('select');
                    onToggleSidebar();
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-left text-zinc-200 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <span>Toggle Inspector Sidebar</span>
                  <span className="text-[9px] text-zinc-400">N</span>
                </button>
              </div>
            )}
          </div>

          {/* Wire Layout Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playSound('nav');
                setOpenMenu(openMenu === 'layout' ? null : 'layout');
              }}
              className={`px-1.5 sm:px-2 py-0.5 rounded-[2px] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer flex items-center gap-1 ${
                openMenu === 'layout' ? 'bg-white/[0.1] text-white' : ''
              }`}
            >
              <span>Cables</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${openMenu === 'layout' ? 'rotate-180' : ''}`} />
            </button>
            {openMenu === 'layout' && (
              <div className="absolute left-0 bottom-full mb-1.5 w-48 py-1 bg-[#1a1d24] border border-[#323846] rounded-[4px] shadow-2xl z-50 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => {
                    playSound('select');
                    onChangeWireStyle('glow');
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-left text-zinc-200 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <span>Crimson Glow Wires</span>
                  {wireStyle === 'glow' && <Check className="w-3 h-3 text-rose-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('select');
                    onChangeWireStyle('cyber');
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-left text-zinc-200 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <span>Cyber Segmented Splines</span>
                  {wireStyle === 'cyber' && <Check className="w-3 h-3 text-rose-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('select');
                    onChangeWireStyle('minimal');
                    setOpenMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-left text-zinc-200 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <span>Minimal Solid Cables</span>
                  {wireStyle === 'minimal' && <Check className="w-3 h-3 text-rose-400" />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-[#2b313d] mx-0.5" />

        {/* Preset Indicator: Network workspace */}
        <div className="flex items-center gap-1 bg-[#191c24] p-0.5 rounded-[3px] border border-[#2b313d]">
          <button
            type="button"
            onClick={() => {
              playSound('nav');
              onSelectPreset('network');
            }}
            className="px-2 py-0.5 rounded-[2px] text-[10px] font-semibold uppercase tracking-wider bg-rose-600/30 text-white border border-rose-500/50 shadow-sm cursor-pointer"
            title="Official core network graph"
          >
            NETWORK
          </button>
        </div>
      </div>

      {/* Center Cluster: Telemetry & Shortcuts */}
      <div className="hidden md:flex items-center gap-2.5 text-[9.5px] text-zinc-400">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#1a1d26] border border-[#2b313d] text-zinc-300">
          <span className="font-semibold text-zinc-200">{nodeCount} NODES</span>
          {visitorCount > 0 && (
            <span className="text-rose-400 font-semibold">+{visitorCount} NOTES</span>
          )}
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">{splineCount} SPLINES</span>
        </div>

        {/* Keybinding Reference Hints for Wide Viewports */}
        <div className="hidden 2xl:flex items-center gap-2 text-zinc-500 text-[9px]">
          <span><strong className="text-zinc-400">LMB:</strong> Drag</span>
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
      </div>

      {/* Right Cluster: Quick CAD Actions, Simulation, Sidebar & Zoom */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Add Note Button */}
        {onOpenAddNode && (
          <button
            type="button"
            onClick={() => {
              playSound('open');
              onOpenAddNode();
            }}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-300 hover:text-white text-[10px] font-semibold transition-all cursor-pointer shadow-[0_0_8px_rgba(244,63,94,0.15)]"
            title="Create Custom Research Node"
          >
            <Plus className="w-3 h-3 text-rose-400" />
            <span>ADD NOTE</span>
          </button>
        )}

        {/* Cable Style Quick Cycle Button */}
        <button
          type="button"
          onClick={() => {
            playSound('select');
            const styles: ('glow' | 'minimal' | 'cyber')[] = ['glow', 'minimal', 'cyber'];
            const next = styles[(styles.indexOf(wireStyle) + 1) % styles.length];
            onChangeWireStyle(next);
          }}
          className="hidden sm:flex px-2 py-0.5 rounded-[3px] bg-[#1c202a] hover:bg-[#252b38] border border-[#2e3544] text-[10px] text-zinc-300 hover:text-white transition-all cursor-pointer items-center gap-1"
          title={`Cable Style: ${wireStyle}`}
        >
          <Sliders className="w-3 h-3 text-rose-400" />
          <span className="hidden lg:inline uppercase text-[9px]">{wireStyle}</span>
        </button>

        {/* Grid Toggle */}
        <button
          type="button"
          onClick={() => {
            playSound('toggle');
            onToggleGrid();
          }}
          className={`px-2 py-0.5 rounded-[3px] transition-all cursor-pointer flex items-center gap-1 text-[10px] ${
            showGrid
              ? 'bg-[#222735] text-white border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
              : 'bg-[#1c202a] text-zinc-400 hover:text-white border border-[#2e3544]'
          }`}
          title="Toggle Grid Canvas [G]"
        >
          <Grid className="w-3 h-3" />
          <span className="hidden sm:inline font-semibold">Grid</span>
          <span className="text-[9px] text-zinc-500 hidden lg:inline">[G]</span>
        </button>

        {/* Simulate / Physics Toggle */}
        <button
          type="button"
          onClick={() => {
            playSound('connect');
            onToggleSimulate();
          }}
          className={`px-2 py-0.5 rounded-[3px] transition-all cursor-pointer flex items-center gap-1 text-[10px] ${
            isSimulating
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
              : 'bg-[#1c202a] text-zinc-400 hover:text-white border border-[#2e3544]'
          }`}
          title="Force-Directed Physics Simulation [S]"
        >
          <Activity className={`w-3 h-3 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline font-semibold">Physics</span>
          <span className="text-[9px] text-zinc-500 hidden lg:inline">[S]</span>
        </button>

        {/* Sidebar Toggle (N-Panel) */}
        <button
          type="button"
          onClick={() => {
            playSound('toggle');
            onToggleSidebar();
          }}
          className={`px-2 py-0.5 rounded-[3px] transition-all cursor-pointer flex items-center gap-1 text-[10px] font-semibold ${
            sidebarOpen
              ? 'bg-rose-600/30 text-white border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
              : 'bg-[#1c202a] text-zinc-400 hover:text-white border border-[#2e3544]'
          }`}
          title="Toggle CAD Inspector Sidebar [N]"
        >
          <Layers className="w-3 h-3 text-rose-400" />
          <span className="hidden sm:inline">Sidebar</span>
          <span className="text-[9px] text-zinc-500 hidden md:inline">[N]</span>
        </button>

        {/* Fit / Zoom Pill */}
        <button
          type="button"
          onClick={() => {
            playSound('secondaryClick');
            onFitScreen();
          }}
          className="px-1.5 py-0.5 rounded-[3px] bg-[#1a1d26] hover:bg-[#252b38] border border-[#2e3544] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="Frame All Nodes [Home]"
        >
          <Maximize className="w-2.5 h-2.5" />
          <span className="font-bold text-rose-300 text-[10px]">{Math.round(scale * 100)}%</span>
        </button>
      </div>
    </footer>
  );
};
