import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize,
  ChevronDown,
  Layers,
} from '../icons';
import { playSound } from '../../lib/sound';

export interface WorkspaceCADStatusBarProps {
  activePreset: 'network' | 'project' | 'all';
  onSelectPreset: (preset: 'network' | 'project') => void;
  onFitScreen: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  scale: number;
}

export const WorkspaceCADStatusBar: React.FC<WorkspaceCADStatusBarProps> = ({
  activePreset,
  onSelectPreset,
  onFitScreen,
  sidebarOpen,
  onToggleSidebar,
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

      {/* Center Cluster: Active Hotkeys Reference */}
      <div className="hidden sm:flex items-center gap-2 text-zinc-500 text-[9.5px]">
        <span><strong className="text-zinc-400">LMB:</strong> Drag</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">Wheel:</strong> Zoom</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">N:</strong> Sidebar</span>
        <span>&bull;</span>
        <span><strong className="text-zinc-400">Home:</strong> Recenter</span>
      </div>

      {/* Right Cluster: Sidebar & Zoom */}
      <div className="flex items-center gap-1.5 shrink-0">
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
