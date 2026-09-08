import React from 'react';
import { ArrowRight, ChevronDown, Compass } from 'lucide-react';

interface EditorialCoverProps {
  scrollProgress: number; // 0 to 1
  onExplore: () => void;
  onViewWork: () => void;
}

const EditorialCoverComponent: React.FC<EditorialCoverProps> = ({
  scrollProgress,
  onExplore,
  onViewWork,
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Step 4 Transition Curve:
  // Continuous smooth Hermite easing curve for liquid cinematic fluidity
  let blur = 0;
  let opacity = 1;
  let scale = 1;
  let translateYPercent = 0;
  const isLifting = scrollProgress > 0.08;

  if (prefersReducedMotion) {
    opacity = scrollProgress < 0.5 ? 1 : Math.max(0, 1 - (scrollProgress - 0.5) / 0.3);
    blur = 0;
    scale = 1;
    translateYPercent = scrollProgress >= 0.75 ? -105 : 0;
  } else {
    // Continuous smooth progression over scroll [0.12, 0.88]
    // Typography stays readable through the first 50% of the transition
    const rawT = Math.max(0, Math.min(1, (scrollProgress - 0.12) / 0.76));
    // Smooth cubic Hermite S-curve
    const smoothT = rawT * rawT * (3 - 2 * rawT);

    // Gradual, GPU-friendly blur progression:
    // 0% -> 0px, 25% -> 2px, 50% -> 5px, 75% -> 9px, 100% -> 12px
    blur = smoothT * 12;
    scale = 1 - smoothT * 0.05; // 1.0 to 0.95
    translateYPercent = -(smoothT * 105); // 0% to -105%
    // Maintain strong readability through first half of lift
    opacity = scrollProgress < 0.35 ? 1 : Math.max(0, 1 - Math.pow(smoothT, 1.8));
  }

  const isFullyOffscreen = scrollProgress >= 0.98;

  return (
    <section
      aria-label="Editorial Portfolio Cover"
      style={{
        opacity,
        filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none',
        transform: `translate3d(0, ${translateYPercent.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`,
        pointerEvents: scrollProgress >= 0.82 ? 'none' : 'auto',
        visibility: isFullyOffscreen ? 'hidden' : 'visible',
      }}
      className={`absolute inset-0 w-full h-screen flex flex-col justify-between px-6 sm:px-12 md:px-16 pt-24 pb-10 select-none overflow-hidden z-20 bg-[#14171c] ${
        isLifting ? 'border-b border-rose-500/50 shadow-[0_30px_70px_rgba(0,0,0,0.95)]' : ''
      }`}
    >
      {/* Restored Authentic Technical Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="pattern-bg">
          <div className="cube-svg" />
        </div>
      </div>

      {/* Subtle Coordinate Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-canvas-dots-overlay opacity-60 z-0" aria-hidden="true" />

      {/* Subtle Crimson Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_25%,rgba(225,29,72,0.14),transparent_55%)] z-0" aria-hidden="true" />

      {/* Crimson Seam Glow Indicator when lifting */}
      {isLifting && (
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_16px_#f43f5e] z-30 pointer-events-none" />
      )}

      {/* Top Editorial Eyebrow & Issue Stamp */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-body text-zinc-400 uppercase tracking-[0.25em]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <span className="font-semibold text-zinc-300">PORTFOLIO / 01</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-zinc-400 hidden sm:inline">COMPUTATION &amp; RESEARCH</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-accent text-3xl leading-none text-rose-400/90 font-bold -mb-1">
            VOL. 2026
          </span>
          <span className="text-zinc-600 hidden sm:inline">&bull;</span>
          <span className="text-zinc-400 hidden sm:inline text-[11px] tracking-widest">
            LATENT ARCHITECTURE
          </span>
        </div>
      </div>

      {/* Main Asymmetric Hero Row */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto py-6">
        {/* Left Column: Bold Architectural Name & Personal Editorial Statement */}
        <div className="lg:col-span-8 flex flex-col items-start max-w-2xl">
          {/* Professional Category Pillar */}
          <div className="font-body text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-rose-400 mb-4 flex items-center gap-2">
            <span>AI</span>
            <span className="text-zinc-600">/</span>
            <span>DATA</span>
            <span className="text-zinc-600">/</span>
            <span>SYSTEMS</span>
          </div>

          {/* Primary Satoshi Display Title */}
          <h1 className="leading-[0.92] mb-6 select-none tracking-tight">
            <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-[-0.03em] uppercase">
              SHUBHAM
            </span>
            <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-light text-zinc-400/90 tracking-[-0.02em] uppercase mt-1">
              SHARMA
            </span>
          </h1>

          {/* Core Personal Statement */}
          <div className="font-display text-xl sm:text-2xl md:text-3xl text-zinc-100 font-semibold tracking-tight leading-snug mb-4">
            I build things to understand how they work.
          </div>

          {/* Human-written Supporting Copy */}
          <p className="font-body text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8 max-w-xl">
            Exploring mathematics, data, machine learning and software through experiments, systems and things I can actually build.
          </p>

          {/* Editorial Actions */}
          <div className="flex flex-wrap items-center gap-4 font-body">
            <button
              type="button"
              onClick={onExplore}
              className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_24px_rgba(225,29,72,0.4)] hover:shadow-[0_0_32px_rgba(225,29,72,0.6)] flex items-center gap-2 group active:scale-95 cursor-pointer"
            >
              <span>ENTER SYSTEM</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onViewWork}
              className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.12] hover:border-white/[0.25] font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-rose-400" />
              <span>VIEW RESEARCH</span>
            </button>
          </div>
        </div>

        {/* Right Column: Negative Space & Editorial Spec Column */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-end text-right space-y-8 pl-8">
          <div className="space-y-2.5">
            <span className="font-accent text-3xl leading-none text-rose-400/80 block">
              RESEARCH DOMAINS
            </span>
            {[
              'STATISTICAL LEARNING',
              'GENERATIVE MODELS',
              'LATENT TOPOLOGY',
              'DISTRIBUTED PIPELINES',
              'HIGH-DIMENSIONAL TENSORS',
            ].map((tag) => (
              <div
                key={tag}
                className="font-body text-xs text-zinc-400 font-medium tracking-[0.2em] uppercase hover:text-rose-300 transition-colors"
              >
                {tag}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/[0.08] max-w-[220px]">
            <p className="font-body text-xs text-zinc-400 leading-relaxed uppercase tracking-wider">
              Available for select research and machine learning engineering collaborations.
            </p>
            <div className="w-8 h-0.5 bg-rose-500 mt-3 ml-auto" />
          </div>
        </div>
      </div>

      {/* Bottom Editorial Footer & Scroll Instruction */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pt-6 border-t border-white/[0.08] text-xs font-body text-zinc-500">
        <button
          type="button"
          onClick={onExplore}
          className="flex items-center gap-2 tracking-[0.2em] uppercase font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group focus:outline-none"
          title="Scroll down to open the computational network"
        >
          <span className="w-2 h-2 rounded-full border border-zinc-400 group-hover:border-rose-500 group-hover:bg-rose-500 transition-colors inline-block" />
          <span>SCROLL TO ENTER SYSTEM</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-rose-400 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <div className="hidden sm:flex items-center gap-4 text-[11px] font-body text-zinc-400 tracking-widest uppercase">
          <span>SECTION 01: COVER</span>
          <span className="text-zinc-700">&bull;</span>
          <span>SECTION 02: NEURAL WORKSPACE</span>
        </div>
      </div>
    </section>
  );
};

export const EditorialCover = React.memo(EditorialCoverComponent);
