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

  // Step 4 Reveal phase: continuous smoothstep (0.08 -> 0.88)
  const rawT = Math.max(0, Math.min(1, (scrollProgress - 0.08) / 0.80));
  const smoothReveal = rawT * rawT * (3 - 2 * rawT);
  const revealProgress = smoothReveal;

  // Workspace container scale: expands smoothly to 100% viewport
  const frameScale = prefersReducedMotion ? 1 : 0.95 + smoothReveal * 0.05;

  // Status text indicator during transition
  const isOpening = scrollProgress > 0.15 && scrollProgress < 0.82;
  const statusOpacity = isOpening ? Math.min(1, Math.sin(smoothReveal * Math.PI)) : 0;

  return (
    <div className="absolute inset-0 w-full h-screen overflow-hidden select-none z-10">
      {/* Underlying Computational System Workspace Canvas */}
      <div
        style={{
          transform: `scale(${frameScale.toFixed(4)})`,
          transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
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
          <span>{revealProgress > 0.7 ? 'WORKSPACE UNLOCKED' : 'SEPARATING SURFACE'}</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

