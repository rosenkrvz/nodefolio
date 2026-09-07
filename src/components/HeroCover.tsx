import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface HeroCoverProps {
  onExplore: () => void;
  onViewWork: () => void;
  scrollProgress: number; // 0 to 1
}

export const HeroCover: React.FC<HeroCoverProps> = ({
  onExplore,
  onViewWork,
  scrollProgress,
}) => {
  // Progressive defocus and fade as user scrolls according to timeline:
  // 0% - 35%: sharp, in focus
  // 35% - 75%: gradual defocus and slow fade
  // > 75%: hidden to save render cost
  let blur = 0;
  let opacity = 1;
  let scale = 1;
  let translateY = 0;

  if (scrollProgress <= 0.32) {
    blur = 0;
    opacity = 1;
    scale = 1;
    translateY = 0;
  } else if (scrollProgress <= 0.75) {
    const t = (scrollProgress - 0.32) / 0.43; // 0 to 1
    blur = t * 12; // 0px to 12px
    opacity = Math.max(0, 1 - t * 0.95);
    scale = 1 - t * 0.06;
    translateY = t * -40;
  } else {
    blur = 12;
    opacity = 0;
    scale = 0.94;
    translateY = -40;
  }

  return (
    <section
      aria-label="Portfolio Introduction"
      style={{
        opacity,
        filter: `blur(${blur}px)`,
        transform: `translateY(${translateY}px) scale(${scale})`,
        pointerEvents: opacity < 0.2 ? 'none' : 'auto',
      }}
      className="absolute inset-0 w-full h-screen flex flex-col justify-between px-6 sm:px-12 md:px-16 pt-24 pb-10 transition-all duration-75 ease-out select-none overflow-hidden"
    >
      {/* Background Celestial Orbital Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep space radial glow */}
        <div className="absolute top-1/4 right-[-10%] w-[850px] h-[850px] rounded-full bg-gradient-to-bl from-rose-950/20 via-zinc-900/10 to-transparent blur-3xl opacity-60" />

        {/* Realistic SVG Celestial Earth Sphere with night lights curve & red orbital trajectory */}
        <svg
          className="absolute -right-32 sm:-right-16 top-6 w-[640px] sm:w-[820px] md:w-[980px] h-[640px] sm:h-[820px] md:h-[980px] opacity-85"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1a202c" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#0d1117" stopOpacity="0.95" />
              <stop offset="85%" stopColor="#05070a" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="orbitalArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0" />
              <stop offset="40%" stopColor="#f43f5e" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#fb7185" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
            </linearGradient>
            <filter id="orbitalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Planet Sphere Horizon */}
          <circle cx="680" cy="420" r="440" fill="url(#sphereGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* City Night Lights clusters on dark continent edges */}
          <g opacity="0.65" fill="#fef08a">
            <circle cx="560" cy="380" r="1.5" filter="drop-shadow(0 0 3px #fde047)" />
            <circle cx="580" cy="390" r="1.2" />
            <circle cx="600" cy="375" r="1.8" filter="drop-shadow(0 0 4px #fde047)" />
            <circle cx="640" cy="360" r="1.5" />
            <circle cx="670" cy="390" r="1.2" />
            <circle cx="655" cy="420" r="1.8" />
            <circle cx="690" cy="410" r="1.5" />
            <circle cx="720" cy="395" r="2.0" filter="drop-shadow(0 0 4px #fde047)" />
            <circle cx="750" cy="430" r="1.4" />
            <circle cx="710" cy="460" r="1.6" />
            <circle cx="780" cy="420" r="1.7" />
            <circle cx="810" cy="450" r="2.2" filter="drop-shadow(0 0 5px #fde047)" />
            <circle cx="830" cy="480" r="1.5" />
            <circle cx="800" cy="510" r="1.6" />
            <circle cx="850" cy="530" r="1.4" />
            <circle cx="870" cy="560" r="1.8" />
          </g>

          {/* Thin Glowing Crimson Orbital Arc */}
          <path
            d="M 120 780 C 350 720, 620 580, 880 260"
            stroke="url(#orbitalArcGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#orbitalGlow)"
          />
          <path
            d="M 120 780 C 350 720, 620 580, 880 260"
            stroke="#ffffff"
            strokeWidth="0.7"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
        </svg>

        {/* Ambient grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* Main Hero Row: Left Column Content & Right Column Metadata */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6 sm:mt-12">
        {/* Left 8 Columns: Identity, Display Title & Description */}
        <div className="lg:col-span-8 flex flex-col items-start max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
            <span className="font-body text-xs sm:text-[13px] tracking-[0.25em] uppercase text-rose-400 font-bold">
              COMPUTATION MEETS CURIOSITY
            </span>
          </div>

          {/* Massive Designed Headline */}
          <h1 className="leading-none mb-4 select-none tracking-tight">
            <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-bold text-white tracking-[-0.03em] uppercase">
              SHUBHAM
            </span>
            <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-light text-zinc-500/80 tracking-[-0.02em] uppercase -mt-1 sm:-mt-2">
              SHARMA
            </span>
          </h1>

          {/* Professional Subhead */}
          <div className="font-body text-sm sm:text-base tracking-[0.3em] uppercase text-zinc-300 font-semibold mb-6">
            AI &amp; DATA SCIENCE
          </div>

          {/* Human-written Editorial Copy */}
          <p className="font-body text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed mb-8 max-w-xl">
            Exploring data, building models, and understanding how mathematics and computation shape real-world systems.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 font-body">
            <button
              type="button"
              onClick={onExplore}
              className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_24px_rgba(225,29,72,0.4)] hover:shadow-[0_0_32px_rgba(225,29,72,0.6)] flex items-center gap-2 group active:scale-95"
            >
              <span>EXPLORE</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onViewWork}
              className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.12] hover:border-white/[0.25] font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95"
            >
              VIEW WORK
            </button>
          </div>
        </div>

        {/* Right 4 Columns: Editorial Vertical Metadata & Italic Quote */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-end text-right space-y-10 pl-8">
          {/* Metadata Pillars */}
          <div className="space-y-3">
            {[
              'DATA',
              'MODELS',
              'MATHEMATICS',
              'EXPERIMENTATION',
              'REAL-WORLD IMPACT',
            ].map((tag) => (
              <div
                key={tag}
                className="font-body text-xs text-zinc-400 font-medium tracking-[0.25em] uppercase hover:text-rose-300 transition-colors"
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Editorial Philosophy Statement */}
          <div className="pt-8 border-t border-white/[0.08] max-w-[220px]">
            <span className="font-accent text-3xl leading-none text-rose-400/90 tracking-wide block mb-1">
              01 &mdash; PHILOSOPHY
            </span>
            <p className="font-display italic text-base sm:text-lg text-zinc-300 leading-snug">
              Better questions build better systems.
            </p>
            <div className="w-6 h-0.5 bg-rose-500 mt-3 ml-auto" />
          </div>
        </div>
      </div>

      {/* Bottom Scroll Prompt */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pt-6 border-t border-white/[0.05] text-xs font-body text-zinc-500">
        <button
          type="button"
          onClick={onExplore}
          className="flex items-center gap-2 tracking-[0.2em] uppercase font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer group focus:outline-none"
          title="Scroll to enter computational workspace"
        >
          <span className="w-2 h-2 rounded-full border border-zinc-400 group-hover:border-rose-500 group-hover:bg-rose-500 transition-colors inline-block" />
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-rose-400 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <div className="hidden sm:flex items-center gap-4 text-[11px] font-body text-zinc-500 tracking-wider uppercase">
          <span>PORTFOLIO COVER</span>
          <span>•</span>
          <span>LAYER 01 / 02</span>
        </div>
      </div>
    </section>
  );
};
