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
  activeNavTab?: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about';
  onSelectNavTab?: (tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => void;
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
  activeNavTab = 'home',
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
    <header className="fixed top-0 inset-x-0 h-16 z-50 flex items-center justify-between px-4 sm:px-8 md:px-12 bg-[#090b10]/90 backdrop-blur-md border-b border-white/[0.08] pointer-events-auto select-none font-body">
      {/* Brand Identity / Geometric SS Monogram */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => onSelectNavTab?.('home')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          {/* Geometric Monogram Mark */}
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-rose-500/50 flex items-center justify-center shadow-inner transition-colors shrink-0">
            <svg
              className="w-4 h-4 text-zinc-200 group-hover:text-rose-400 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Double-S geometric architectural mark */}
              <path d="M7 6h3a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H8a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h3" />
              <path d="M14 10h3a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h3" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-sm font-bold text-white tracking-wider uppercase">
                SHUBHAM SHARMA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <span className="font-body text-[10px] font-semibold text-zinc-400 tracking-[0.2em] uppercase block mt-0.5">
              COMPUTATION &bull; RESEARCH
            </span>
          </div>
        </button>

        {/* Quiet Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-xs text-zinc-400 uppercase tracking-widest font-semibold ml-4">
          <button
            type="button"
            onClick={() => onSelectNavTab?.('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'home'
                ? 'text-white bg-white/[0.08]'
                : 'hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            COVER
          </button>
          <button
            type="button"
            onClick={() => onSelectNavTab?.('network')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'network'
                ? 'text-white bg-white/[0.08]'
                : 'hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            NETWORK
          </button>
          <button
            type="button"
            onClick={() => onSelectNavTab?.('projects')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'projects'
                ? 'text-white bg-white/[0.08]'
                : 'hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            RESEARCH
          </button>
          <button
            type="button"
            onClick={() => onSelectNavTab?.('notebook')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'notebook'
                ? 'text-white bg-white/[0.08]'
                : 'hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            CHRONICLE
          </button>
          <button
            type="button"
            onClick={onOpenResume}
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            CV
          </button>
        </nav>
      </div>

      {/* Right Controls: Quiet Telemetry & Primary Contact Action */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Clock Button */}
        {onFocusClock && (
          <button
            type="button"
            onClick={onFocusClock}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-zinc-300 transition-colors cursor-pointer"
            title="Focus Chronometer"
          >
            <ClockIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>{timeStr || '12:00 PM'}</span>
          </button>
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
          title="Share URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Contact Action */}
        <button
          type="button"
          onClick={onOpenContact}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(225,29,72,0.35)] active:scale-95 cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact</span>
        </button>
      </div>
    </header>
  );
};
