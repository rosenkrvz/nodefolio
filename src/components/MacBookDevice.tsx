import React from 'react';
import { ArrowRight, ChevronDown, Maximize2 } from 'lucide-react';

interface MacBookDeviceProps {
  scrollProgress: number; // 0 to 1
  onEnterNetwork: () => void;
  children?: React.ReactNode;
}

export const MacBookDevice: React.FC<MacBookDeviceProps> = ({
  scrollProgress,
  onEnterNetwork,
  children,
}) => {
  // Check prefers-reduced-motion for accessibility
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. ENTRY PHASE (0.32 -> 0.65)
  // Laptop starts off-screen at bottom-right (35vw, 35vh, scale 0.75, rotateY -15deg) and moves to center
  const entryT = Math.max(0, Math.min(1, (scrollProgress - 0.32) / 0.30));
  const translateX = prefersReducedMotion ? 0 : (1 - entryT) * 35; // in vw
  const translateY = prefersReducedMotion ? 0 : (1 - entryT) * 35; // in vh
  const entryScale = prefersReducedMotion ? 1 : 0.75 + entryT * 0.25;
  const rotateY = prefersReducedMotion ? 0 : -15 * (1 - entryT);
  const containerOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.30) / 0.12));

  // Left Callout text (appears once laptop is centered, fades out during full viewport expansion)
  const calloutIn = Math.max(0, Math.min(1, (scrollProgress - 0.48) / 0.16));
  const calloutOut = Math.max(0, Math.min(1, (scrollProgress - 0.85) / 0.10));
  const calloutOpacity = calloutIn * (1 - calloutOut);
  const calloutTranslateY = (1 - calloutIn) * 24;

  // 2. LID OPENING PHASE (0.65 -> 0.85)
  // Lid starts flat closed (0deg) and opens smoothly to -105deg
  const lidT = Math.max(0, Math.min(1, (scrollProgress - 0.65) / 0.20));
  const lidAngle = prefersReducedMotion ? -105 : -lidT * 105; // 0deg -> -105deg
  const screenBrightness = prefersReducedMotion ? 1 : Math.max(0.05, lidT * 1.0);

  // 3. EXPANSION TO FULL VIEWPORT PHASE (0.85 -> 1.00)
  // Screen expands outward to fill viewport, laptop chassis fades away smoothly
  const expandT = Math.max(0, Math.min(1, (scrollProgress - 0.85) / 0.15));
  const chassisOpacity = Math.max(0, 1 - expandT * 2.2);
  const isFullyExpanded = expandT >= 0.96;

  // Flatten angles as screen expands to full viewport
  const currentRotateY = rotateY * (1 - expandT);
  const currentRotateX = (prefersReducedMotion ? 0 : 12) * (1 - expandT);
  const deviceScale = prefersReducedMotion ? 1 : entryScale * (1 + expandT * 1.8);

  return (
    <div
      style={{
        opacity: containerOpacity,
        pointerEvents: containerOpacity < 0.1 ? 'none' : isFullyExpanded ? 'none' : 'auto',
      }}
      className="absolute inset-0 w-full h-screen flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-75"
    >
      {/* Top subtle phase eyebrow (visible during transition) */}
      <div
        style={{
          opacity: Math.max(0, (calloutOpacity - 0.2) * 1.2),
          transform: `translateY(${-calloutTranslateY}px)`,
        }}
        className="absolute top-20 inset-x-0 w-full max-w-6xl mx-auto flex items-center justify-between px-6 sm:px-12 text-[11px] font-body text-zinc-500 uppercase tracking-widest pointer-events-none z-20"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-zinc-400">
            LAYER 02 <strong className="text-white font-medium">&mdash; COMPUTATIONAL WORKSPACE</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400 font-medium">
          <span>{lidT >= 0.9 ? 'SCROLL TO EXPAND' : 'SCROLL TO OPEN'}</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>

      {/* Main Container: Left Callout + Center 3D MacBook */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center px-4 sm:px-8 relative z-10">
        {/* Left Side Callout Text (matches reference aesthetic) */}
        <div
          style={{
            opacity: calloutOpacity,
            transform: `translateY(${calloutTranslateY}px)`,
            pointerEvents: calloutOpacity < 0.3 ? 'none' : 'auto',
          }}
          className="lg:col-span-4 flex flex-col items-start z-20 pl-2 sm:pl-4 transition-all duration-75"
        >
          <div className="flex flex-col gap-1 text-xs font-body text-rose-400 uppercase tracking-widest font-semibold mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>WELCOME TO MY</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <span>COMPUTATIONAL SPACE</span>
            </div>
          </div>

          <h2 className="leading-none mb-4 tracking-tight">
            <span className="block font-display text-4xl sm:text-5xl font-bold text-white uppercase">
              IDEAS
            </span>
            <span className="block font-display text-4xl sm:text-5xl font-bold text-rose-500 uppercase">
              CONNECTED.
            </span>
          </h2>

          <p className="font-body text-sm sm:text-base text-zinc-300 leading-relaxed max-w-sm mb-6">
            A living network of my work, research, experiments and interests. Explore, zoom in, and follow the connections.
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onEnterNetwork}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_28px_rgba(225,29,72,0.6)] flex items-center gap-2 group active:scale-95 cursor-pointer"
            >
              <span>ENTER NETWORK</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="text-[11px] font-body text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>{lidT > 0.85 ? 'READY TO ENTER' : 'SCROLL TO OPEN'}</span>
              <ChevronDown className="w-3 h-3 text-rose-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Right Side: 3D MacBook Pro Unit */}
        <div
          style={{
            transform: `translate(${translateX}vw, ${translateY}vh) scale(${deviceScale})`,
          }}
          className="lg:col-span-8 relative flex items-center justify-center transition-transform duration-75 ease-out perspective-[2200px]"
        >
          {/* Ambient red floor glow beneath laptop */}
          <div
            style={{ opacity: (1 - expandT) * 0.7 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[85%] h-24 bg-rose-600/25 blur-3xl rounded-full pointer-events-none transition-opacity"
          />

          {/* Complete Laptop Unit */}
          <div
            className="relative w-[340px] sm:w-[540px] md:w-[660px] lg:w-[720px] flex flex-col items-center select-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${currentRotateY}deg) rotateX(${currentRotateX}deg)`,
              transition: 'transform 0.08s ease-out',
            }}
          >
            {/* 1. TOP DISPLAY / SCREEN LID (Rotates on hinge) */}
            <div
              className="relative w-full aspect-[16/10] rounded-t-2xl bg-[#0d0f14] border-[6px] sm:border-[8px] border-[#1c1f26] shadow-2xl overflow-hidden origin-bottom transition-all duration-75"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${lidAngle}deg)`,
                boxShadow:
                  '0 -10px 40px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              {/* Top Bezel Webcam Notch */}
              <div
                style={{ opacity: chassisOpacity }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-2.5 sm:h-3 bg-[#14171e] rounded-b-md z-30 flex items-center justify-center transition-opacity"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-black border border-white/20" />
              </div>

              {/* Inside Screen Workspace Surface */}
              <div
                className="w-full h-full relative overflow-hidden bg-[#0e1015]"
                style={{
                  filter: `brightness(${screenBrightness})`,
                  transition: 'filter 0.1s ease-out',
                }}
              >
                {/* Mini Top Status Bar inside screen */}
                <div
                  style={{ opacity: Math.min(screenBrightness, chassisOpacity) }}
                  className="absolute top-0 inset-x-0 h-6 sm:h-7 bg-black/70 backdrop-blur-md border-b border-white/[0.08] z-20 flex items-center justify-between px-3 text-[9px] font-body text-zinc-400 pointer-events-none transition-opacity"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-white/10 text-white font-bold flex items-center justify-center text-[7px]">
                      SS
                    </span>
                    <span className="font-semibold text-white uppercase tracking-wider">
                      SHUBHAM SHARMA
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-rose-400 font-medium">NETWORK</span>
                    <span>PROJECTS</span>
                    <span>LAB</span>
                  </div>

                  <div className="flex items-center gap-1 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>LIVE WORKSPACE</span>
                  </div>
                </div>

                {/* Embedded Neural Workspace Content */}
                <div className="w-full h-full pt-6 relative overflow-hidden">
                  {children}
                </div>

                {/* Glass screen reflection overlay */}
                <div
                  style={{ opacity: chassisOpacity }}
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none transition-opacity"
                />

                {/* Direct Enter Network Button on screen */}
                {lidT > 0.7 && !isFullyExpanded && (
                  <button
                    type="button"
                    onClick={onEnterNetwork}
                    style={{ opacity: chassisOpacity }}
                    className="absolute bottom-2.5 right-2.5 z-30 px-2.5 py-1 rounded-md bg-black/85 hover:bg-rose-600 text-white text-[10px] font-body font-semibold border border-white/15 transition-all flex items-center gap-1 shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Expand Workspace</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. LAPTOP HINGE CYLINDER */}
            <div
              style={{ opacity: chassisOpacity }}
              className="w-[96%] h-2.5 sm:h-3.5 bg-gradient-to-r from-[#111317] via-[#2a2e38] to-[#111317] rounded-sm shadow-inner z-10 transition-opacity duration-75"
            />

            {/* 3. LAPTOP BOTTOM BASE / KEYBOARD CHASSIS */}
            <div
              style={{
                opacity: chassisOpacity,
                transform: 'rotateX(25deg)',
                transformOrigin: 'top center',
              }}
              className="relative w-full h-24 sm:h-36 md:h-42 rounded-b-2xl bg-gradient-to-b from-[#181a20] to-[#121418] border-x border-b border-[#282c35] shadow-[0_30px_60px_rgba(0,0,0,0.9)] p-2 sm:p-3 overflow-hidden transition-opacity duration-75"
            >
              {/* Keyboard Well Outline */}
              <div className="w-[90%] mx-auto h-[60%] rounded-lg bg-[#0e1014] border border-white/[0.06] p-1 grid grid-cols-12 gap-0.5 opacity-85 shadow-inner">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full rounded-[2px] bg-[#16181f] border border-black/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  />
                ))}
              </div>

              {/* Centered Trackpad with subtle border */}
              <div className="w-24 sm:w-36 md:w-44 h-8 sm:h-12 md:h-14 mx-auto mt-1.5 sm:mt-2.5 rounded-md border border-white/[0.08] bg-[#14161c] shadow-inner" />

              {/* Front Center Opening Thumb Indentation */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-1 sm:h-1.5 bg-[#2a2e38] rounded-t-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
