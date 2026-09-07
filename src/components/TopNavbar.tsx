import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Mail,
  Share2,
  Check,
  Activity,
  SlidersHorizontal,
  Clock as ClockIcon,
  FileText,
} from 'lucide-react';

interface TopNavbarProps {
  activePreset: string;
  onSelectPreset: (preset: string) => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetGraph: () => void;
  onOpenContact: () => void;
  onOpenResume?: () => void;
  onFocusClock?: () => void;
  activeView: 'canvas' | 'list' | 'timeline';
  onToggleView: (view: 'canvas' | 'list' | 'timeline') => void;
  activeNavTab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about';
  onSelectNavTab: (tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activePreset,
  onSelectPreset,
  isSimulating,
  onToggleSimulate,
  onResetGraph,
  onOpenContact,
  onOpenResume,
  onFocusClock,
  activeView,
  onToggleView,
  activeNavTab,
  onSelectNavTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="fixed top-0 inset-x-0 h-16 z-50 flex items-center justify-between px-4 sm:px-8 md:px-10 bg-[#090b10]/90 backdrop-blur-md border-b border-white/[0.08] pointer-events-auto select-none">
      {/* Brand Identity / Geometric Designed Monogram Logo */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onSelectNavTab('home')}
          className="flex items-center gap-3 text-left group"
        >
          {/* Geometric Designed Monogram SVG (Matches reference image) */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/15 group-hover:border-rose-500/50 flex items-center justify-center shadow-lg transition-colors shrink-0">
            <svg
              className="w-4 h-4 text-white group-hover:text-rose-400 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 6h10a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h10" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-xs sm:text-sm font-bold text-white tracking-widest uppercase">
                SHUBHAM SHARMA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            </div>
            <span className="font-body text-[10px] font-semibold text-zinc-400 tracking-wider uppercase block mt-1">
              AI • DATA • SYSTEMS
            </span>
          </div>
        </button>
      </div>

      {/* Center Navigation Links (Matching reference screenshot) */}
      <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 text-xs font-body font-semibold">
        <button
          type="button"
          onClick={() => onSelectNavTab('home')}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            activeNavTab === 'home'
              ? 'text-white bg-white/[0.08] border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${activeNavTab === 'home' ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-transparent'}`} />
          <span className="tracking-wider uppercase">HOME</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectNavTab('network')}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            activeNavTab === 'network'
              ? 'text-white bg-white/[0.08] border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${activeNavTab === 'network' ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-transparent'}`} />
          <span className="tracking-wider uppercase">NETWORK</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectNavTab('projects')}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            activeNavTab === 'projects'
              ? 'text-white bg-white/[0.08] border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="tracking-wider uppercase">PROJECTS</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectNavTab('lab')}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            activeNavTab === 'lab'
              ? 'text-white bg-white/[0.08] border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="tracking-wider uppercase">LAB</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectNavTab('notebook')}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            activeNavTab === 'notebook'
              ? 'text-white bg-white/[0.08] border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="tracking-wider uppercase">NOTEBOOK</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectNavTab('about')}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            activeNavTab === 'about'
              ? 'text-white bg-white/[0.08] border border-white/10'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="tracking-wider uppercase">ABOUT</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 font-body">
        {/* View Switcher for Workspace (Canvas / Index Catalog / Timeline) */}
        {activeNavTab !== 'home' && (
          <div className="hidden xl:flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => onToggleView('canvas')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs font-medium ${
                activeView === 'canvas' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => onToggleView('list')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs font-medium ${
                activeView === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Index
            </button>
            <button
              type="button"
              onClick={() => onToggleView('timeline')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs font-medium ${
                activeView === 'timeline' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Timeline
            </button>
          </div>
        )}

        {/* Live Clock button */}
        <button
          type="button"
          onClick={onFocusClock}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] text-xs text-zinc-300 font-medium transition-colors"
          title="System Chronometer"
        >
          <ClockIcon className="w-3.5 h-3.5 text-rose-400" />
          <span>{timeStr || '12:00 PM'}</span>
        </button>

        {/* Resume CV button */}
        {onOpenResume && (
          <button
            type="button"
            onClick={onOpenResume}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>CV</span>
          </button>
        )}

        {/* Share button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs transition-all"
          title="Share URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* CONTACT Button (Matching reference: Pill with glowing red dot) */}
        <button
          type="button"
          onClick={onOpenContact}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 hover:bg-rose-950/40 text-white text-xs font-semibold tracking-wider uppercase border border-rose-500/50 hover:border-rose-400 transition-all shadow-[0_0_12px_rgba(225,29,72,0.25)] active:scale-95"
        >
          <span>CONTACT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse" />
        </button>
      </div>
    </header>
  );
};
