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
  isResumeOpen?: boolean;
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
  isResumeOpen = false,
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
    playSound('toggle');
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMobileSelect = (tab: 'home' | 'network' | 'projects' | 'notebook') => {
    playSound('nav');
    setIsMobileMenuOpen(false);
    onSelectNavTab?.(tab);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:h-16 z-50 flex items-center justify-between px-3 sm:px-8 md:px-12 bg-[#090b10]/95 backdrop-blur-md border-b border-white/[0.08] pointer-events-auto select-none font-body pt-[env(safe-area-inset-top,0px)]">
        {/* Brand Identity / Geometric SS Monogram */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <button
            type="button"
            onClick={() => {
              playSound('nav');
              setIsMobileMenuOpen(false);
              onSelectNavTab?.('home');
            }}
            className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer focus:outline-none min-w-0"
          >
            {/* Distinctive Geometric Monogram Badge */}
            <BrandLogo variant="navbar" active={activeNavTab === 'home'} />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display text-xs sm:text-sm font-bold text-white tracking-wider uppercase truncate">
                  SHUBHAM SHARMA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              </div>
              <span className="font-body text-[9px] sm:text-[10px] font-semibold text-zinc-400 tracking-[0.16em] sm:tracking-[0.2em] uppercase hidden min-[360px]:block mt-0.5 truncate">
                COMPUTATION &bull; RESEARCH
              </span>
            </div>
          </button>

          {/* Desktop Quiet Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-xs text-zinc-400 uppercase tracking-widest font-semibold ml-4">
            <button
              type="button"
              onClick={() => {
                playSound('nav');
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
                playSound('nav');
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
                playSound('nav');
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
                playSound('nav');
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
            {onOpenResume && (
              <button
                type="button"
                id="nav-cv-btn"
                onClick={() => {
                  playSound('nav');
                  onOpenResume();
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isResumeOpen
                    ? 'text-white bg-white/[0.08]'
                    : 'hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                CV
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Minimal Section Pill */}
        <div className="hidden min-[400px]:flex md:hidden items-center px-1">
          <span className="text-[10px] font-tech font-bold text-zinc-300 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {activeNavTab === 'projects' ? 'RESEARCH' : activeNavTab === 'network' ? 'NETWORK' : activeNavTab === 'notebook' ? 'CHRONICLE' : 'COVER'}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs shrink-0">
          {/* Clock Button (Desktop / Tablet) */}
          {onFocusClock && (
            <button
              type="button"
              onClick={() => {
                playSound('toggle');
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
            className={`w-10 h-10 sm:w-auto sm:h-auto sm:p-2 flex items-center justify-center rounded-xl sm:rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-white/[0.02] text-zinc-500 border-white/[0.06] hover:text-zinc-300'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 hover:text-white border-white/[0.08]'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-zinc-500" />
            ) : (
              <VolumeMax className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-rose-400" />
            )}
          </button>

          {/* Share Button (Desktop only) */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share URL"
            className="hidden md:flex p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
            title="Share URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Share className="w-3.5 h-3.5" />}
          </button>

          {/* Contact Action (Desktop only - mobile opens via menu drawer) */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onOpenContact();
            }}
            className="hidden md:flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(225,29,72,0.35)] active:scale-95 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => {
              playSound('toggle');
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <Close className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:top-16 z-40 bg-[#090b10]/98 backdrop-blur-2xl border-b border-white/10 p-4 md:hidden animate-in slide-in-from-top-2 duration-150 font-body shadow-2xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <nav className="flex flex-col gap-1 text-sm uppercase tracking-widest font-semibold text-zinc-300">
            <button
              type="button"
              onClick={() => handleMobileSelect('home')}
              className={`px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeNavTab === 'home' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/[0.06]'
              }`}
            >
              Cover
            </button>
            <button
              type="button"
              onClick={() => handleMobileSelect('network')}
              className={`px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeNavTab === 'network' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/[0.06]'
              }`}
            >
              Network
            </button>
            <button
              type="button"
              onClick={() => handleMobileSelect('projects')}
              className={`px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeNavTab === 'projects' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/[0.06]'
              }`}
            >
              Research
            </button>
            <button
              type="button"
              onClick={() => handleMobileSelect('notebook')}
              className={`px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeNavTab === 'notebook' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/[0.06]'
              }`}
            >
              Chronicle
            </button>
            {onOpenResume && (
              <button
                type="button"
                onClick={() => {
                  playSound('nav');
                  setIsMobileMenuOpen(false);
                  onOpenResume();
                }}
                className={`px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                  isResumeOpen ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                CV / Resume
              </button>
            )}

            {/* Mobile Contact Action */}
            <div className="pt-3 mt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setIsMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Shubham Sharma</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export const TopNavbar = React.memo(TopNavbarComponent);
