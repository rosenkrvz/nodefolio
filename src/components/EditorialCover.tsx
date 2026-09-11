import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Compass } from './icons';
import { playSound } from '../lib/sound';
import { BrandLogo } from './ui/BrandLogo';

interface EditorialCoverProps {
  scrollProgress: number; // 0 to 1
  activeNavTab?: string;
  onExplore: () => void;
  onViewWork: () => void;
  onViewCV?: () => void;
}

const EditorialCoverComponent: React.FC<EditorialCoverProps> = ({
  scrollProgress,
  activeNavTab = 'home',
  onExplore,
  onViewWork,
  onViewCV,
}) => {
  const [entryStage, setEntryStage] = useState(0);
  const [isEntered, setIsEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isCoverTab = activeNavTab === 'home' || activeNavTab === 'cover';

  // Coordinated Page Entry Reveal Sequence matching the Chronicle page (~800ms total)
  useEffect(() => {
    // If reduced motion is requested or user is already scrolled / on another tab, settle immediately
    if (reducedMotion || scrollProgress > 0.02 || !isCoverTab) {
      setEntryStage(4);
      setIsEntered(true);
      return;
    }

    const t1 = setTimeout(() => setEntryStage(1), 50);   // Top Eyebrow & Brand Anchor
    const t2 = setTimeout(() => setEntryStage(2), 200);  // Title Mask Reveal + Category Pillar
    const t3 = setTimeout(() => setEntryStage(3), 450);  // Statement, Description, Buttons, Specs
    const t4 = setTimeout(() => setEntryStage(4), 750);  // Bottom Scroll Cue
    const t5 = setTimeout(() => setIsEntered(true), 900); // Fully settled, clear transitions for scroll

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [reducedMotion, isCoverTab]);

  // Immediately settle entry animation if user initiates scroll or tab change before timers complete
  useEffect(() => {
    if ((scrollProgress > 0.02 || !isCoverTab) && !isEntered) {
      setEntryStage(4);
      setIsEntered(true);
    }
  }, [scrollProgress, isCoverTab, isEntered]);

  // Multi-Phase Continuous Hermite Transition Choreography:
  // Step 1 [0.00 - 0.12]: Grounded Stability & Bottom Cue Retraction
  // Step 2 [0.12 - 0.35]: Physical Edge Ignition, Horizon Glow & Depth Separation
  // Step 3 [0.35 - 0.65]: Stratified Layer Parallax, Sub-element Fading & Focal Softening
  // Step 4 [0.65 - 0.88]: Cinematic Atmosphere Ascent, Bokeh Deepening & Spatial Aperture
  // Step 5 [0.88 - 1.00]: Terminal Handshake & Clean Clearance

  // 1. Bottom Hint & Instruction Bar (Fades out first so it doesn't clutter during lift)
  const bottomHintOpacity = Math.max(0, 1 - Math.min(1, scrollProgress / 0.14));
  const bottomHintTranslateY = Math.min(15, (scrollProgress / 0.14) * 15);

  // 2. Horizon Edge Crimson Seam Glow (Ramps from 0 at 0.06 to full intensity by 0.25)
  const seamIntensity = scrollProgress < 0.06 ? 0 : Math.min(1, (scrollProgress - 0.06) / 0.18);
  const isLifting = seamIntensity > 0.01;

  // 3. Sub-layer Parallax (Eyebrow & Research Spec Column)
  const subLayerT = Math.max(0, Math.min(1, (scrollProgress - 0.10) / 0.65));
  const subLayerSmooth = subLayerT * subLayerT * (3 - 2 * subLayerT);
  const eyebrowTranslateY = -(subLayerSmooth * 24);
  const eyebrowOpacity = Math.max(0, 1 - Math.pow(subLayerSmooth, 1.4));
  const specsTranslateY = -(subLayerSmooth * 18);
  const specsOpacity = Math.max(0, 1 - Math.pow(subLayerSmooth, 1.6));

  // 4. Background Pattern Counter-Parallax Drift
  const bgDriftPercent = -(Math.min(1, scrollProgress / 0.90) * 8);

  // 5. Main Hero Core Lift & Multi-Stage Blur
  let blur = 0;
  let opacity = 1;
  let scale = 1;
  let translateYPercent = 0;

  if (reducedMotion) {
    opacity = scrollProgress < 0.5 ? 1 : Math.max(0, 1 - (scrollProgress - 0.5) / 0.3);
    blur = 0;
    scale = 1;
    translateYPercent = scrollProgress >= 0.75 ? -105 : 0;
  } else {
    // Quintic smootherstep: 6t^5 - 15t^4 + 10t^3 (zero jerk, continuous 1st and 2nd derivatives)
    const rawT = Math.max(0, Math.min(1, (scrollProgress - 0.10) / 0.82));
    const smoothT = rawT * rawT * rawT * (rawT * (rawT * 6 - 15) + 10);

    // Multi-stage continuous blur progression (discretized to 0.5px steps to prevent GPU re-rasterization spikes):
    let rawBlur = 0;
    if (scrollProgress < 0.12) {
      rawBlur = 0;
    } else if (scrollProgress < 0.35) {
      const t = (scrollProgress - 0.12) / 0.23;
      rawBlur = t * 2.8; // 0px -> 2.8px
    } else if (scrollProgress < 0.65) {
      const t = (scrollProgress - 0.35) / 0.30;
      rawBlur = 2.8 + t * 4.7; // 2.8px -> 7.5px
    } else {
      const t = Math.min(1, (scrollProgress - 0.65) / 0.25);
      rawBlur = 7.5 + t * 6.5; // 7.5px -> 14.0px
    }
    blur = Math.round(rawBlur * 2) / 2;

    scale = 1 - smoothT * 0.055; // 1.00 to 0.945
    translateYPercent = -(smoothT * 105); // 0% to -105%

    // Opacity: Stays solid through first 38% of scroll travel, then dissolves smoothly
    if (scrollProgress < 0.38) {
      opacity = 1;
    } else {
      const tFade = Math.min(1, (scrollProgress - 0.38) / 0.52);
      opacity = Math.max(0, 1 - Math.pow(tFade, 1.6));
    }
  }

  const isFullyOffscreen = scrollProgress >= 0.96;

  return (
    <section
      aria-label="Editorial Portfolio Cover"
      style={{
        opacity,
        filter: blur >= 0.5 ? `blur(${blur.toFixed(1)}px)` : 'none',
        transform: `translate3d(0, ${translateYPercent.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`,
        pointerEvents: (!isCoverTab || scrollProgress >= 0.82) ? 'none' : 'auto',
        visibility: (!isCoverTab || isFullyOffscreen) ? 'hidden' : 'visible',
        willChange: isFullyOffscreen ? 'auto' : 'transform, opacity',
      }}
      className={`absolute inset-0 w-full max-w-full h-full min-h-full min-h-[100dvh] flex flex-col justify-between px-4 sm:px-12 md:px-16 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pt-[calc(4.5rem+env(safe-area-inset-top,0px))] sm:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] select-none overflow-hidden z-20 bg-[#14171c] ${
        isLifting ? 'border-b border-rose-500/50 shadow-[0_30px_70px_rgba(0,0,0,0.95)]' : ''
      }`}
    >
      {/* Restored Authentic Technical Background Atmosphere with subtle parallax */}
      <div
        style={{
          transform: `translate3d(0, ${bgDriftPercent.toFixed(2)}%, 0)`,
        }}
        className="absolute inset-0 w-full max-w-full h-full pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <div className="pattern-bg w-full max-w-full h-full">
          <div className="cube-svg" />
        </div>
      </div>

      {/* Crimson Ambient Aura Glow behind the cover */}
      <div
        style={{
          opacity: isEntered || entryStage >= 1 ? 0.38 : 0,
          transition: isEntered ? 'none' : 'opacity 0.8s ease-out',
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[260px] sm:h-[350px] max-w-full bg-rose-900/25 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Mobile-specific Text Contrast Vignette: softens diagonal background behind typography while letting perimeter geometry breathe */}
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_45%,rgba(20,23,28,0.85)_0%,rgba(20,23,28,0.4)_65%,transparent_100%)] sm:hidden z-0"
        aria-hidden="true"
      />

      {/* Subtle Coordinate Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-canvas-dots-overlay opacity-60 z-0" aria-hidden="true" />

      {/* Subtle Crimson Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_25%,rgba(225,29,72,0.14),transparent_55%)] z-0" aria-hidden="true" />

      {/* Crimson Seam Glow Indicator when lifting */}
      {isLifting && (
        <div
          style={{ opacity: seamIntensity }}
          className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_18px_#f43f5e] z-30 pointer-events-none"
        />
      )}

      {/* Top Editorial Eyebrow & Brand Anchor (Parallax Sub-layer) */}
      <div
        style={{
          transform: `translate3d(0, ${(eyebrowTranslateY + (isEntered || entryStage >= 1 ? 0 : -12)).toFixed(1)}px, 0)`,
          opacity: isEntered ? eyebrowOpacity : (entryStage >= 1 ? eyebrowOpacity : 0),
          transition: isEntered ? 'none' : 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
        className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.08] text-xs font-body text-zinc-400 shrink-0"
      >
        {/* Desktop Eyebrow Left */}
        <div className="hidden sm:flex items-center gap-3 tracking-[0.25em] uppercase font-medium">
          <BrandLogo variant="icon" size={16} className="text-rose-400 shrink-0" />
          <span className="font-semibold text-zinc-200">PORTFOLIO / 01</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-zinc-400">RESEARCH &bull; SYSTEMS</span>
        </div>

        {/* Mobile Eyebrow Left: Editorial Publication Metadata */}
        <div className="sm:hidden flex flex-col gap-0.5">
          <div className="flex items-center gap-2 tracking-[0.22em] uppercase font-semibold text-zinc-200 text-[11px]">
            <BrandLogo variant="icon" size={13} className="text-rose-400 shrink-0" />
            <span>PORTFOLIO / 01</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] font-medium uppercase text-rose-400/85">
            <span>RESEARCH NOTEBOOK</span>
            <span className="text-zinc-600">&bull;</span>
            <span>SYSTEMS</span>
          </div>
        </div>

        {/* Desktop Eyebrow Right */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="font-accent text-3xl leading-none text-rose-400/90 font-bold -mb-1">
            2026
          </span>
          <span className="text-zinc-600">&bull;</span>
          <span className="tracking-widest text-zinc-400 font-medium">
            AI &bull; DATA SCIENCE
          </span>
        </div>

        {/* Mobile Eyebrow Right: Year 2026 + Publication Tag */}
        <div className="sm:hidden flex flex-col items-end">
          <span className="font-accent text-3xl leading-none text-rose-400/90 font-bold">
            2026
          </span>
          <span className="text-[8.5px] tracking-[0.16em] uppercase text-zinc-500 font-medium -mt-1">
            COMPUTATION
          </span>
        </div>
      </div>

      {/* Hero Core Content: Monumental Asymmetric Editorial Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mt-4 min-[360px]:mt-6 min-[390px]:mt-8 mb-auto sm:my-auto py-1 sm:py-2">
        {/* Left / Main Column: Huge Display Title & Statement (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col items-start">
          {/* Subtle Category Pillar (Desktop Only - on mobile, publication metadata is in the top layer) */}
          <div
            style={{
              opacity: isEntered || entryStage >= 2 ? 1 : 0,
              transition: isEntered ? 'none' : 'opacity 0.5s ease-out',
            }}
            className="hidden sm:flex font-body text-xs font-semibold tracking-[0.3em] uppercase text-rose-400 mb-3 items-center gap-2"
          >
            <span>RESEARCH NOTEBOOK</span>
            <span className="text-zinc-600">/</span>
            <span>COMPUTATIONAL GRAPHS</span>
            <span className="text-zinc-600">/</span>
            <span>STATISTICAL LEARNING</span>
          </div>

          {/* Directionally Masked Monumental Display Name */}
          <div className="overflow-hidden mb-3 min-[360px]:mb-3.5 sm:mb-5">
            <h1
              style={{
                transform:
                  reducedMotion || isEntered || entryStage >= 2 ? 'translateY(0)' : 'translateY(100%)',
                opacity: isEntered || entryStage >= 2 ? 1 : 0,
                transition: isEntered
                  ? 'none'
                  : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out',
              }}
              className="leading-[0.92] select-none tracking-tight"
            >
              <span className="block font-display text-[38px] min-[360px]:text-[44px] min-[390px]:text-[48px] min-[412px]:text-[52px] sm:text-7xl md:text-8xl font-black text-white tracking-[-0.03em] uppercase break-words">
                SHUBHAM
              </span>
              <span className="block font-display text-[28px] min-[360px]:text-[32px] min-[390px]:text-[35px] min-[412px]:text-[38px] sm:text-7xl md:text-8xl font-light text-zinc-400/80 sm:text-zinc-400/90 tracking-[0.16em] min-[360px]:tracking-[0.18em] sm:tracking-[-0.02em] uppercase mt-0.5 sm:mt-1 pl-0.5 sm:pl-0 break-words">
                SHARMA
              </span>
            </h1>
          </div>

          {/* Core Personal Statement */}
          <div
            style={{
              opacity: isEntered || entryStage >= 3 ? 1 : 0,
              transform: isEntered || entryStage >= 3 ? 'none' : 'translateY(16px)',
              transition: isEntered ? 'none' : 'opacity 0.7s ease-out, transform 0.7s ease-out',
            }}
            className="font-display text-[17px] min-[360px]:text-[19px] min-[390px]:text-[21px] sm:text-2xl md:text-3xl text-zinc-100 font-semibold tracking-tight leading-snug mb-2.5 min-[360px]:mb-3 sm:mb-4 max-w-[340px] sm:max-w-none"
          >
            I build computational systems to understand how they work.
          </div>

          {/* Human-written Supporting Copy */}
          <p
            style={{
              opacity: isEntered || entryStage >= 3 ? 1 : 0,
              transform: isEntered || entryStage >= 3 ? 'none' : 'translateY(16px)',
              transition: isEntered ? 'none' : 'opacity 0.7s ease-out 0.05s, transform 0.7s ease-out 0.05s',
            }}
            className="font-body text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-lg text-zinc-300 font-normal leading-relaxed mb-4 min-[360px]:mb-5 sm:mb-8 max-w-[310px] min-[360px]:max-w-[340px] min-[390px]:max-w-[360px] sm:max-w-xl"
          >
            Data science and AI researcher exploring statistical learning, high-dimensional manifolds, autograd engines, and interactive visual computing.
          </p>

          {/* Editorial Actions: EXPLORE WORK, EXPLORE RESEARCH, VIEW CV */}
          <div
            style={{
              opacity: isEntered || entryStage >= 3 ? 1 : 0,
              transform: isEntered || entryStage >= 3 ? 'none' : 'translateY(12px)',
              transition: isEntered ? 'none' : 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
            }}
            className="flex flex-wrap items-center gap-2.5 min-[360px]:gap-3 sm:gap-4 font-body w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={() => {
                playSound('open');
                onExplore();
              }}
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 min-[360px]:px-5 min-[360px]:py-3 sm:px-6 sm:py-3.5 rounded-lg min-[360px]:rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11.5px] min-[360px]:text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_32px_rgba(225,29,72,0.6)] flex items-center gap-2 group active:scale-95 cursor-pointer"
            >
              <span>EXPLORE WORK</span>
              <ArrowRight className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('secondaryClick');
                onViewWork();
              }}
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 min-[360px]:px-5 min-[360px]:py-3 sm:px-6 sm:py-3.5 rounded-lg min-[360px]:rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.12] hover:border-white/[0.25] font-semibold text-[11.5px] min-[360px]:text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-rose-400 shrink-0" />
              <span className="whitespace-nowrap">EXPLORE RESEARCH</span>
            </button>

            {onViewCV && (
              <button
                type="button"
                onClick={() => {
                  playSound('nav');
                  onViewCV();
                }}
                className="hidden sm:inline-flex items-center px-4 py-3 sm:px-5 sm:py-3.5 rounded-lg sm:rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] text-[11.5px] sm:text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
              >
                VIEW CV
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Negative Space & Capabilities Pillar */}
        <div
          style={{
            transform: `translate3d(0, ${(specsTranslateY + (isEntered || entryStage >= 3 ? 0 : 16)).toFixed(1)}px, 0)`,
            opacity: isEntered ? specsOpacity : (entryStage >= 3 ? specsOpacity : 0),
            transition: isEntered ? 'none' : 'opacity 0.7s ease-out 0.08s, transform 0.7s ease-out 0.08s',
          }}
          className="hidden lg:flex lg:col-span-4 flex-col items-end text-right space-y-8 pl-8"
        >
          <div className="space-y-2.5">
            <span className="font-accent text-3xl leading-none text-rose-400/80 block">
              AREAS OF CAPABILITY
            </span>
            {[
              'DATA & COMPUTATIONAL SYSTEMS',
              'AI & STATISTICAL LEARNING',
              'HIGH-DIMENSIONAL VISUALIZATION',
              'WEB & INTERACTIVE ENGINES',
              'RESEARCH EXPERIMENTATION',
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
              Open for software engineering roles, machine learning systems, and research collaborations.
            </p>
            <div className="w-8 h-0.5 bg-rose-500 mt-3 ml-auto" />
          </div>
        </div>
      </div>

      {/* Bottom Editorial Footer & Scroll Instruction (Step 1 Micro-Hint Fade) */}
      <div
        style={{
          opacity: isEntered ? bottomHintOpacity : (entryStage >= 4 ? bottomHintOpacity : 0),
          transform: `translate3d(0, ${(bottomHintTranslateY + (isEntered || entryStage >= 4 ? 0 : 10)).toFixed(1)}px, 0)`,
          pointerEvents: bottomHintOpacity < 0.1 ? 'none' : 'auto',
          transition: isEntered ? 'none' : 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
        className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pt-3.5 sm:pt-6 border-t border-white/[0.06] sm:border-white/[0.08] text-xs font-body text-zinc-500 mt-auto sm:mt-0 shrink-0"
      >
        <button
          type="button"
          onClick={onExplore}
          className="flex items-center gap-2 tracking-[0.18em] sm:tracking-[0.2em] uppercase text-[10.5px] min-[360px]:text-[11px] sm:text-xs font-medium sm:font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group focus:outline-none"
          title="Scroll down to explore project index"
        >
          <span className="w-2 h-2 rounded-full border border-zinc-400 group-hover:border-rose-500 group-hover:bg-rose-500 transition-colors inline-block" />
          <span>SCROLL TO EXPLORE WORK</span>
          <ChevronDown className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 animate-bounce text-rose-400 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <div className="hidden sm:flex items-center gap-4 text-[11px] font-body text-zinc-400 tracking-widest uppercase">
          <span>SECTION 01: COVER</span>
          <span className="text-zinc-700">&bull;</span>
          <span>SECTION 02: WORK (PROJECT INDEX)</span>
        </div>
      </div>
    </section>
  );
};

export const EditorialCover = React.memo(EditorialCoverComponent);
