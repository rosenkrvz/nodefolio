import React, { useState, useEffect } from 'react';
import { Clock, Share, Check, Mail, Close, Menu, VolumeMax, VolumeX } from './icons';
import { useSound } from '../lib/sound';
import { BrandLogo } from './ui/BrandLogo';

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

const TopNavbarComponent: React.FC<TopNavbarProps> = ({
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
  const { isMuted, toggleMute, playSound } = useSound();

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleShare = () => {
    playSound('secondaryClick');
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMobileSelect = (tab: 'home' | 'network' | 'projects' | 'notebook') => {
    playSound('click');
    setIsMobileMenuOpen(false);
    onSelectNavTab?.(tab);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-16 z-50 flex items-center justify-between px-4 sm:px-8 md:px-12 bg-[#090b10]/90 backdrop-blur-md border-b border-white/[0.08] pointer-events-auto select-none font-body">
        {/* Brand Identity / Geometric SS Monogram */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              playSound('secondaryClick');
              setIsMobileMenuOpen(false);
              onSelectNavTab?.('home');
            }}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            {/* Distinctive Geometric Monogram Badge */}
            <BrandLogo variant="navbar" active={activeNavTab === 'home'} />

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

          {/* Desktop Quiet Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-xs text-zinc-400 uppercase tracking-widest font-semibold ml-4">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onSelectNavTab?.('home');
              }}
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
              onClick={() => {
                playSound('click');
                onSelectNavTab?.('network');
              }}
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
              onClick={() => {
                playSound('click');
                onSelectNavTab?.('projects');
              }}
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
              onClick={() => {
                playSound('click');
                onSelectNavTab?.('notebook');
              }}
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
              onClick={() => {
                playSound('secondaryClick');
                onOpenResume?.();
              }}
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
              onClick={() => {
                playSound('secondaryClick');
                onFocusClock();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-zinc-300 transition-colors cursor-pointer"
              title="Focus Chronometer"
            >
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{timeStr || '12:00 PM'}</span>
            </button>
          )}

          {/* Global Audio Mute Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute interface sound' : 'Mute interface sound'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-white/[0.02] text-zinc-500 border-white/[0.06] hover:text-zinc-300'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 hover:text-white border-white/[0.08]'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <VolumeMax className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share URL"
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
            title="Share URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Share className="w-3.5 h-3.5" />}
          </button>

          {/* Contact Action */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onOpenContact();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(225,29,72,0.35)] active:scale-95 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Contact</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2 rounded-lg bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <Close className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 bg-[#090b10]/95 backdrop-blur-xl border-b border-white/10 p-4 md:hidden animate-in slide-in-from-top-2 duration-150 font-body">
          <nav className="flex flex-col gap-1 text-sm uppercase tracking-widest font-semibold text-zinc-300">
            <button
              type="button"
              onClick={() => handleMobileSelect('home')}
              className="px-4 py-2.5 rounded-xl text-left hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              Cover
            </button>
            <button
              type="button"
              onClick={() => handleMobileSelect('network')}
              className="px-4 py-2.5 rounded-xl text-left hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              Network
            </button>
            <button
              type="button"
              onClick={() => handleMobileSelect('projects')}
              className="px-4 py-2.5 rounded-xl text-left hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              Research
            </button>
            <button
              type="button"
              onClick={() => handleMobileSelect('notebook')}
              className="px-4 py-2.5 rounded-xl text-left hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              Chronicle
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenResume?.();
              }}
              className="px-4 py-2.5 rounded-xl text-left hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              CV / Resume
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export const TopNavbar = React.memo(TopNavbarComponent);
