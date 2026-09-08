import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ArchitecturalRevealProps {
  scrollProgress: number; // 0 to 1
  children: React.ReactNode;
}

export const ArchitecturalReveal: React.FC<ArchitecturalRevealProps> = ({
  scrollProgress,
  children,
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Defocus and aperture phase (0.30 -> 0.85)
  // Cover blurs and physical structural panels separate, revealing the system underneath
  const revealProgress = Math.max(0, Math.min(1, (scrollProgress - 0.30) / 0.55));

  // Top and Bottom shutter panel translation: 0% closed -> 102% cleared outside viewport
  const panelShift = prefersReducedMotion ? 0 : revealProgress * 102; // in percent
  const panelOpacity = Math.max(0, 1 - revealProgress * 1.5);

  // Aperture frame scale: expands smoothly to 100% viewport
  const frameScale = prefersReducedMotion ? 1 : 0.88 + revealProgress * 0.12;
  const frameBorderOpacity = Math.max(0, (1 - revealProgress * 1.2) * 0.8);

  // Status text indicator during separation
  const isOpening = scrollProgress > 0.25 && scrollProgress < 0.90;
  const statusOpacity = isOpening ? Math.min(1, Math.sin(revealProgress * Math.PI)) : 0;

  return (
    <div className="absolute inset-0 w-full h-screen overflow-hidden pointer-events-none select-none">
      {/* Underlying Computational System Workspace Canvas */}
      <div
        style={{
          transform: `scale(${frameScale})`,
          transition: 'transform 0.05s ease-out',
        }}
        className="w-full h-full relative"
      >
        {children}
      </div>

      {/* Floating Transition Telemetry Eyebrow (appears during physical opening) */}
      <div
        style={{
          opacity: statusOpacity,
          transform: `translateY(${(1 - revealProgress) * 15}px)`,
        }}
        className="absolute top-20 inset-x-0 w-full max-w-5xl mx-auto flex items-center justify-between px-6 text-[11px] font-body text-zinc-400 uppercase tracking-[0.25em] z-30 pointer-events-none transition-opacity duration-150"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-zinc-300 font-semibold">ACCESSING UNDERLYING SYSTEM</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
          <span>{revealProgress > 0.7 ? 'NETWORK UNLOCKED' : 'SEPARATING SURFACE'}</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>

      {/* PHYSICAL APERTURE PANELS: Split monolithic dark architectural surfaces */}
      {!prefersReducedMotion && revealProgress < 0.98 && (
        <>
          {/* Top Panel: Monolithic obsidian slate lifting upward */}
          <div
            style={{
              transform: `translateY(-${panelShift}%)`,
              opacity: panelOpacity,
            }}
            className="absolute top-0 inset-x-0 h-1/2 bg-[#090b10] border-b border-rose-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-20 transition-transform duration-75 ease-out overflow-hidden"
          >
            {/* Subtle architectural seam detail */}
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
            <div className="absolute inset-0 bg-radial-vignette opacity-60" />
          </div>

          {/* Bottom Panel: Monolithic obsidian slate lowering downward */}
          <div
            style={{
              transform: `translateY(${panelShift}%)`,
              opacity: panelOpacity,
            }}
            className="absolute bottom-0 inset-x-0 h-1/2 bg-[#090b10] border-t border-rose-500/30 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] z-20 transition-transform duration-75 ease-out overflow-hidden"
          >
            {/* Subtle architectural seam detail */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
            <div className="absolute inset-0 bg-radial-vignette opacity-60" />
          </div>

          {/* Architectural Framing Border that contracts and fades as the viewport expands */}
          <div
            style={{
              opacity: frameBorderOpacity,
            }}
            className="absolute inset-8 sm:inset-12 md:inset-16 border border-white/10 rounded-2xl pointer-events-none z-20 transition-opacity duration-100"
          >
            {/* Precision corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-rose-500/70" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-rose-500/70" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-rose-500/70" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-rose-500/70" />
          </div>
        </>
      )}
    </div>
  );
};
