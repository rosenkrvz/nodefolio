import React from 'react';
import {
  RotateCcw,
  Mail,
  Share2,
  Check,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';

interface TopNavbarProps {
  activePreset: string;
  onSelectPreset: (preset: string) => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetGraph: () => void;
  onOpenContact: () => void;
  activeView: 'canvas' | 'list' | 'timeline';
  onToggleView: (view: 'canvas' | 'list' | 'timeline') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activePreset,
  onSelectPreset,
  isSimulating,
  onToggleSimulate,
  onResetGraph,
  onOpenContact,
  activeView,
  onToggleView,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="absolute top-0 inset-x-0 h-14 z-40 flex items-center justify-between px-3 sm:px-6 md:px-8 bg-[#14171c]/85 backdrop-blur-md border-b border-white/[0.08] pointer-events-auto select-none">
      {/* Brand Identity / Monogram */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.1] flex items-center justify-center font-tech text-xs text-zinc-200 font-semibold shadow-inner">
            SS
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-body text-xs sm:text-[13px] font-bold text-white tracking-wide uppercase">
                SHUBHAM SHARMA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <span className="font-tech text-[9px] text-zinc-400 tracking-wider uppercase block mt-0.5">
              AI • DATA • SYSTEMS
            </span>
          </div>
        </div>

        {/* View Switcher: Graph Canvas / Index Catalog / Timeline */}
        <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs font-body ml-2">
          <button
            type="button"
            onClick={() => onToggleView('canvas')}
            className={`px-3 py-1 rounded-md transition-all text-xs ${
              activeView === 'canvas'
                ? 'bg-white/10 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Graph Canvas
          </button>
          <button
            type="button"
            onClick={() => onToggleView('list')}
            className={`px-3 py-1 rounded-md transition-all text-xs ${
              activeView === 'list'
                ? 'bg-white/10 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Index Catalog
          </button>
          <button
            type="button"
            onClick={() => onToggleView('timeline')}
            className={`px-3 py-1 rounded-md transition-all text-xs ${
              activeView === 'timeline'
                ? 'bg-white/10 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Center / Filter: Preset View */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] text-xs">
          <SlidersHorizontal className="w-3 h-3 text-rose-400" />
          <span className="font-tech text-[10px] text-zinc-500 uppercase tracking-wider">View:</span>
          <select
            value={activePreset}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="bg-transparent text-zinc-200 font-body text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" className="bg-[#181c21]">Complete Network</option>
            <option value="skills" className="bg-[#181c21]">Architecture & Models</option>
            <option value="certificates" className="bg-[#181c21]">Academic Foundation</option>
            <option value="project" className="bg-[#181c21]">Latent Graph Artifact</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onResetGraph}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Reset Graph Layout & Perspective"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 font-body">
        {/* Live status telemetry dot */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-tech text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-zinc-300">Live</span>
        </div>

        {/* Pulse Toggle */}
        <button
          type="button"
          onClick={onToggleSimulate}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
            isSimulating
              ? 'bg-rose-950/50 text-rose-300 border-rose-500/40'
              : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
          }`}
          title={isSimulating ? 'Signal Pulse Active' : 'Enable Signal Flow'}
        >
          <Activity className={`w-3 h-3 ${isSimulating ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span className="font-tech text-[10px] hidden sm:inline">
            Pulse
          </span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] text-xs transition-all"
          title="Share URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Contact Button */}
        <button
          type="button"
          onClick={onOpenContact}
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <Mail className="w-3 h-3" />
          <span>Contact</span>
        </button>
      </div>
    </header>
  );
};
