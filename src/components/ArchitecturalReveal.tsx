import React from 'react';
import { ChevronDown } from './icons';

interface ArchitecturalRevealProps {
  scrollProgress: number; // 0 to 1
  children: React.ReactNode;
}

const ArchitecturalRevealComponent: React.FC<ArchitecturalRevealProps> = ({
  scrollProgress,
  children,
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Multi-Phase Reveal Choreography:
  // Continuous quintic smootherstep (0.06 -> 0.88)
  const rawT = Math.max(0, Math.min(1, (scrollProgress - 0.06) / 0.82));
  const smoothReveal = rawT * rawT * rawT * (rawT * (rawT * 6 - 15) + 10);
  const revealProgress = smoothReveal;

  // Workspace container scale: expands smoothly from 0.92 to 1.00
  const frameScale = prefersReducedMotion ? 1 : 0.92 + smoothReveal * 0.08;

  // Status text indicator during transition
  const isOpening = scrollProgress > 0.12 && scrollProgress < 0.86;
  const statusOpacity = isOpening ? Math.min(1, Math.sin(smoothReveal * Math.PI)) : 0;

  // Staged Telemetry Status Messages
  let statusMessage = 'SEPARATING SURFACE';
  if (revealProgress >= 0.70) {
    statusMessage = 'WORKSPACE UNLOCKED';
  } else if (revealProgress >= 0.35) {
    statusMessage = 'CALIBRATING SPATIAL COORDINATES';
  }

  return (
    <div className="absolute inset-0 w-full h-screen overflow-hidden select-none z-10">
      {/* Underlying Computational System Workspace Canvas */}
      <div
        style={{
          transform: `scale(${frameScale.toFixed(4)})`,
          willChange: 'transform',
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
        className="absolute top-20 inset-x-0 w-full max-w-5xl mx-auto flex items-center justify-between px-6 text-[11px] font-body text-zinc-400 uppercase tracking-[0.25em] z-30 pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-zinc-300 font-semibold">ACCESSING UNDERLYING SYSTEM</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
          <span>{statusMessage}</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export const ArchitecturalReveal = React.memo(ArchitecturalRevealComponent);

