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
  activeView: 'canvas' | 'list';
  onToggleView: (view: 'canvas' | 'list') => void;
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
    <header className="absolute top-0 inset-x-0 h-14 z-40 flex items-center justify-between px-4 sm:px-8 bg-[#181c21]/80 backdrop-blur-md border-b border-white/[0.06] pointer-events-auto">
      {/* Brand Identity / Title */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-lg text-white font-normal tracking-wide">
            Shubham Sharma
          </span>
          <span className="font-tech text-[10px] text-rose-500/90 tracking-widest uppercase hidden sm:inline">
            Nodefolio v0.4.2
          </span>
        </div>

        {/* View Switcher: Graph vs Index */}
        <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-body">
          <button
            type="button"
            onClick={() => onToggleView('canvas')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeView === 'canvas'
                ? 'bg-white/10 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Graph Canvas
          </button>
          <button
            type="button"
            onClick={() => onToggleView('list')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeView === 'list'
                ? 'bg-white/10 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Index Catalog
          </button>
        </div>
      </div>

      {/* Preset Filter */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
          <SlidersHorizontal className="w-3 h-3 text-rose-400" />
          <span className="font-tech text-[10px] text-zinc-500 uppercase">View:</span>
          <select
            value={activePreset}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="bg-transparent text-zinc-200 font-body text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" className="bg-[#181c21]">Complete Network</option>
            <option value="skills" className="bg-[#181c21]">Architecture & Stack</option>
            <option value="certificates" className="bg-[#181c21]">Academic Foundation</option>
            <option value="project" className="bg-[#181c21]">Latent Graph Artifact</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onResetGraph}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Reset Graph Layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 font-body">
        {/* Signal Flow Toggle */}
        <button
          type="button"
          onClick={onToggleSimulate}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
            isSimulating
              ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
              : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
          }`}
          title={isSimulating ? 'Signal Pulse Active' : 'Enable Signal Flow'}
        >
          <Activity className={`w-3 h-3 ${isSimulating ? 'animate-pulse text-rose-400' : ''}`} />
          <span className="hidden sm:inline font-tech text-[10px]">
            {isSimulating ? 'Pulse Active' : 'Pulse Paused'}
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
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all shadow-sm active:scale-95"
        >
          <Mail className="w-3 h-3" />
          <span>Inquire</span>
        </button>
      </div>
    </header>
  );
};
