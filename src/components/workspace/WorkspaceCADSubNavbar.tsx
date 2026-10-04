import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize,
  ChevronDown,
  Layers,
} from '../icons';
import { playSound } from '../../lib/sound';

interface WorkspaceCADSubNavbarProps {
  activePreset: 'network' | 'project' | 'all';
  onSelectPreset: (preset: 'network' | 'project') => void;
  onFitScreen: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  nodeCount: number;
  splineCount: number;
  scale: number;
}

export const WorkspaceCADSubNavbar: React.FC<WorkspaceCADSubNavbarProps> = ({
  activePreset,
  onSelectPreset,
  onFitScreen,
  sidebarOpen,
  onToggleSidebar,
  nodeCount,
  splineCount,
}) => {
  const [openMenu, setOpenMenu] = useState<'view' | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
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
    <div
      ref={menuContainerRef}
      role="toolbar"
      aria-label="Workspace CAD Viewport Controls"
      className="w-full h-9 px-2 sm:px-3 bg-[#13151b]/95 backdrop-blur-md border-b border-[#282d38] flex items-center justify-between text-xs font-mono select-none z-30 relative shadow-sm"
    >
      {/* Left Cluster: Viewport Mode, Menus, Breadcrumbs */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {/* Viewport Identifier Tag */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-[#1a1e27] border border-[#2e3542] text-zinc-200 text-[10.5px] font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
          <span className="hidden sm:inline">2D GRAPH VIEWPORT</span>
          <span className="sm:hidden">GRAPH</span>
        </div>

        {/* Object Mode Pill */}
        <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-rose-500/10 border border-rose-500/40 text-[9.5px] font-semibold text-rose-300 uppercase tracking-wider shrink-0">
          <span>OBJECT MODE</span>
        </div>

        {/* Viewport Menus */}
        <div className="hidden lg:flex items-center gap-0.5 text-zinc-300 text-[11px]">
          {/* View Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playSound('nav');
                setOpenMenu(openMenu === 'view' ? null : 'view');
              }}
              className={`px-2 py-1 rounded-[2px] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer flex items-center gap-1 ${
                openMenu === 'view' ? 'bg-white/[0.1] text-white' : ''
              }`}
            >
              <span>View</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            {openMenu === 'view' && (
              <div className="absolute left-0 top-full mt-1 w-44 py-1 bg-[#1a1d24] border border-[#323846] rounded-[3px] shadow-2xl z-50 text-[10.5px]">
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

        {/* Telemetry pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#1a1d26] border border-[#2b313d] text-[9.5px] text-zinc-400">
          <span>{nodeCount} NODES</span>
          <span className="text-zinc-600">/</span>
          <span>{splineCount} SPLINES</span>
        </div>
      </div>

      {/* Right Cluster: Quick CAD Actions & Sidebar Toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Frame / Recenter View */}
        <button
          type="button"
          onClick={() => {
            playSound('secondaryClick');
            onFitScreen();
          }}
          className="p-1 rounded-[3px] bg-[#1c202a] hover:bg-[#252b38] border border-[#2e3544] text-zinc-400 hover:text-white transition-all cursor-pointer"
          title="Recenter and Fit Graph to View [Home]"
        >
          <Maximize className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
};
