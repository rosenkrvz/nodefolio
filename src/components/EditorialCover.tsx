import React from 'react';
import { ArrowRight, ChevronDown, Compass, BookOpen, Terminal } from 'lucide-react';

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
      className={`absolute inset-0 w-full h-screen flex flex-col justify-between px-6 sm:px-12 md:px-16 pt-24 pb-10 select-none overflow-hidden z-20 bg-[#0c0e12] ${
        isLifting ? 'border-b border-rose-500/40 shadow-[0_30px_70px_rgba(0,0,0,0.95)]' : ''
      }`}
    >
      {/* Editorial Atmospheric Hairline Texture Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="pattern-bg">
          <div className="cube-svg" />
        </div>
      </div>

      {/* Subtle Coordinate Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-canvas-dots-overlay opacity-40 z-0" aria-hidden="true" />

      {/* Restrained Crimson Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_85%_20%,rgba(225,29,72,0.11),transparent_55%)] z-0" aria-hidden="true" />

      {/* Crimson Seam Glow Indicator when lifting */}
      {isLifting && (
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_16px_#f43f5e] z-30 pointer-events-none" />
      )}

      {/* Top Editorial Masthead & Issue Stamp */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between font-tech text-xs text-zinc-400 uppercase tracking-[0.28em] border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-none bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <span className="font-semibold text-zinc-200">INDEX // 01</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-zinc-400 hidden sm:inline">COMPUTATIONAL RESEARCH &amp; SYSTEMS</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-tech text-xs text-zinc-500 tracking-[0.25em]">VOL.</span>
          <span className="font-accent text-3xl text-white font-bold leading-none -mb-1 -ml-1">
            2026
          </span>
          <span className="text-zinc-600 hidden sm:inline">&bull;</span>
          <span className="font-tech text-[10px] text-zinc-400 tracking-[0.25em] hidden sm:inline">
            LATENT ARCHITECTURES
          </span>
        </div>
      </div>

      {/* Main Asymmetric Hero Row */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto py-4 sm:py-6">
        {/* Left Column: Bold Architectural Name & Personal Editorial Statement */}
        <div className="lg:col-span-8 flex flex-col items-start max-w-2xl">
          {/* Professional Category Pillar */}
          <div className="font-tech text-[11px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-rose-400 mb-3 flex items-center gap-2">
            <span>AI &amp; DATA SCIENCE</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">COMPUTATIONAL RESEARCH</span>
          </div>

          {/* Monumental Satoshi Display Title */}
          <h1 className="leading-[0.88] mb-6 select-none tracking-tight">
            <span className="block font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-black text-white tracking-[-0.04em] uppercase">
              SHUBHAM
            </span>
            <span className="block font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-light text-zinc-400 tracking-[-0.03em] uppercase mt-1">
              SHARMA
            </span>
          </h1>

          {/* Core Personal Statement */}
          <div className="font-display text-xl sm:text-2xl md:text-[1.65rem] text-zinc-100 font-semibold tracking-tight leading-snug mb-3">
            I build computational systems to understand how models learn.
          </div>

          {/* Human-written Thoughtful Supporting Copy */}
          <p className="font-body text-[15px] sm:text-base text-zinc-300 font-normal leading-relaxed mb-8 max-w-xl">
            Exploring mathematics, statistical learning, and neural representations through empirical systems, generative experiments, and software I can build from scratch.
          </p>

          {/* Editorial Actions in Josefin Sans */}
          <div className="flex flex-wrap items-center gap-4 font-tech">
            <button
              type="button"
              onClick={onExplore}
              className="px-6 py-3.5 rounded-lg bg-[#11141b] hover:bg-[#161a23] text-white font-semibold text-xs sm:text-[13px] tracking-[0.2em] uppercase border border-white/20 hover:border-white/40 transition-all shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_28px_rgba(225,29,72,0.45)] flex items-center gap-2.5 group active:scale-95 cursor-pointer relative overflow-hidden"
            >
              <span className="w-1.5 h-1.5 rounded-none bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              <span>ENTER SPATIAL WORKSPACE</span>
              <ArrowRight className="w-4 h-4 text-rose-400 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onViewWork}
              className="px-6 py-3.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white border border-white/[0.10] hover:border-white/[0.22] font-semibold text-xs sm:text-[13px] tracking-[0.2em] uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-zinc-400 group-hover:text-rose-400 transition-colors" />
              <span>VIEW RESEARCH</span>
            </button>
          </div>
        </div>

        {/* Right Column: Negative Space & Technical Specimen Ledger */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-end text-right space-y-6 pl-6">
          {/* Research Focus Ledger */}
          <div className="space-y-3 w-full max-w-[280px] bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-left">
              <span className="font-tech text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-semibold">
                SYSTEM INDEX // 01.0
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <div className="space-y-2 text-left pt-1">
              {[
                { idx: '01', title: 'Generative Architectures & Latent Flow' },
                { idx: '02', title: 'Transformers & KV-Cache Dynamics' },
                { idx: '03', title: 'High-Dimensional Representation Spaces' },
                { idx: '04', title: 'Distributed Tensor Graph Workflows' },
                { idx: '05', title: 'Autodiff Engines & Compute Kernels' },
              ].map((item) => (
                <div
                  key={item.idx}
                  className="flex items-start gap-2.5 font-body text-xs text-zinc-300 group/item cursor-default"
                >
                  <span className="font-tech text-[10px] text-zinc-500 tracking-wider shrink-0 mt-0.5">
                    {item.idx}.
                  </span>
                  <span className="font-medium group-hover/item:text-white transition-colors leading-tight">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grounded Colophon Footnote */}
          <div className="pt-2 max-w-[280px] text-left border-t border-white/[0.06] space-y-2">
            <p className="font-body text-xs text-zinc-400 leading-relaxed">
              Undergraduate researcher &amp; engineer. Dedicated to principled machine learning, mathematical foundations, and empirical systems implementations.
            </p>
            <div className="flex items-center gap-2 font-tech text-[10px] tracking-[0.2em] uppercase text-rose-400 font-semibold pt-1">
              <span className="w-1 h-1 rounded-full bg-rose-500" />
              <span>STATUS: ACTIVE RESEARCH &amp; LAB FOCUS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Footer & Scroll Instruction */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pt-4 sm:pt-6 border-t border-white/[0.06] text-xs font-tech text-zinc-500">
        <button
          type="button"
          onClick={onExplore}
          className="flex items-center gap-2 tracking-[0.22em] uppercase font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group focus:outline-none"
          title="Scroll down to open the computational network"
        >
          <span className="w-1.5 h-1.5 rounded-none border border-zinc-500 group-hover:border-rose-500 group-hover:bg-rose-500 transition-colors inline-block" />
          <span>SCROLL TO ENTER NETWORK</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-rose-400 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <div className="hidden sm:flex items-center gap-4 text-[10px] font-tech text-zinc-400 tracking-[0.25em] uppercase">
          <span>SURFACE 01 // EDITORIAL FOLIO</span>
          <span className="text-zinc-600">&bull;</span>
          <span>LAYER 02 // NEURAL WORKSPACE</span>
        </div>
      </div>
    </section>
  );
};

export const EditorialCover = React.memo(EditorialCoverComponent);
