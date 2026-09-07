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
  // Phase mapping for scroll progress:
  // 0.0 - 0.2: Hidden / off-screen bottom right
  // 0.2 - 0.5: Enters diagonally towards center
  // 0.5 - 0.8: Centered, lid opens from 0deg (closed) to 105deg (open)
  // 0.8 - 1.0: Scales up / transitions into full viewport

  // Entry transform
  const entryProgress = Math.max(0, Math.min(1, (scrollProgress - 0.15) / 0.35));
  const translateX = (1 - entryProgress) * 180; // slides from right
  const translateY = (1 - entryProgress) * 260; // slides from bottom
  const containerOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.1) / 0.25));

  // Lid rotation progress (starts around scroll 0.45 and reaches full open by 0.78)
  const lidProgress = Math.max(0, Math.min(1, (scrollProgress - 0.45) / 0.33));
  // rotateX: 0deg is flat closed, -100deg is open tilted back naturally
  const lidAngle = -10 - lidProgress * 95; // from -10deg to -105deg

  // Screen brightness & glow turns on as lid opens
  const screenBrightness = 0.2 + lidProgress * 0.8;

  // Zoom progress for final transition to full screen
  const zoomProgress = Math.max(0, Math.min(1, (scrollProgress - 0.78) / 0.22));
  const deviceScale = 1 + zoomProgress * 0.45;
  const deviceOpacity = 1 - zoomProgress * 0.85;

  return (
    <div
      style={{
        opacity: containerOpacity,
        pointerEvents: containerOpacity < 0.2 ? 'none' : 'auto',
      }}
      className="relative w-full min-h-[140vh] flex flex-col items-center justify-start py-12 select-none overflow-visible"
    >
      {/* Section Transition Eyebrow */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-6 sm:px-12 text-xs font-body text-zinc-500 uppercase tracking-widest mb-12">
        <span className="text-zinc-400">SOMETHING <strong className="text-white">BIGGER</strong> LIES AHEAD</span>
        <span className="text-rose-400 animate-pulse">SCROLLING...</span>
      </div>

      {/* Main Container: Left Callout + Center 3D MacBook */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center px-4 sm:px-8">
        {/* Left Side Callout Text (matches reference image) */}
        <div
          style={{
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.25)),
            transform: `translateY(${(1 - Math.min(1, (scrollProgress - 0.3) / 0.25)) * 40}px)`,
          }}
          className="lg:col-span-4 flex flex-col items-start z-20 pl-2 sm:pl-4"
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
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_28px_rgba(225,29,72,0.6)] flex items-center gap-2 group active:scale-95"
            >
              <span>ENTER NETWORK</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="text-[11px] font-body text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span>{lidProgress > 0.8 ? 'READY TO ENTER' : 'SCROLL TO OPEN'}</span>
              <ChevronDown className="w-3 h-3 text-rose-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Right Side: 3D MacBook Pro Assembly (matches reference image) */}
        <div
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${deviceScale})`,
            opacity: deviceOpacity,
          }}
          className="lg:col-span-8 relative flex items-center justify-center transition-transform duration-100 ease-out perspective-[1800px]"
        >
          {/* Ambient red floor glow beneath laptop */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-24 bg-rose-600/20 blur-3xl rounded-full pointer-events-none" />

          {/* Complete Laptop Unit */}
          <div
            className="relative w-[340px] sm:w-[560px] md:w-[680px] lg:w-[740px] flex flex-col items-center select-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateY(-8deg) rotateX(12deg)',
            }}
          >
            {/* 1. TOP DISPLAY / SCREEN LID (Rotates on hinge) */}
            <div
              className="relative w-full aspect-[16/10] rounded-t-2xl bg-[#0d0f14] border-[6px] sm:border-[9px] border-[#1c1f26] shadow-2xl overflow-hidden origin-bottom transition-all duration-75"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${lidAngle}deg)`,
                boxShadow: '0 -10px 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              {/* Top Bezel Webcam Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-2.5 sm:h-3.5 bg-[#14171e] rounded-b-md z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black border border-white/20" />
              </div>

              {/* Inside Screen Workspace Surface */}
              <div
                className="w-full h-full relative overflow-hidden bg-[#14171c]"
                style={{
                  filter: `brightness(${screenBrightness})`,
                  transition: 'filter 0.15s ease-out',
                }}
              >
                {/* Mini Top Status Bar inside screen */}
                <div className="absolute top-0 inset-x-0 h-7 bg-black/60 backdrop-blur-md border-b border-white/[0.08] z-20 flex items-center justify-between px-3 text-[9px] font-body text-zinc-400 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-white/10 text-white font-bold flex items-center justify-center text-[7px]">SS</span>
                    <span className="font-semibold text-white uppercase tracking-wider">SHUBHAM SHARMA</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-rose-400 font-medium">NETWORK</span>
                    <span>PROJECTS</span>
                    <span>LAB</span>
                  </div>

                  <div className="flex items-center gap-1 text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>LIVE WORKSPACE</span>
                  </div>
                </div>

                {/* Live Neural Network Preview Canvas */}
                <div className="w-full h-full pt-6 relative pointer-events-auto overflow-hidden">
                  {children}
                </div>

                {/* Glass screen reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />

                {/* Quick Expand Button on top-right of screen */}
                <button
                  type="button"
                  onClick={onEnterNetwork}
                  className="absolute bottom-2.5 right-2.5 z-30 px-2.5 py-1 rounded-md bg-black/80 hover:bg-rose-600 text-white text-[10px] font-body font-semibold border border-white/15 transition-all flex items-center gap-1 shadow-lg active:scale-95"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Enter Full Workspace</span>
                </button>
              </div>
            </div>

            {/* 2. LAPTOP HINGE CYLINDER */}
            <div className="w-[96%] h-2.5 sm:h-3.5 bg-gradient-to-r from-[#111317] via-[#2a2e38] to-[#111317] rounded-sm shadow-inner z-10" />

            {/* 3. LAPTOP BOTTOM BASE / KEYBOARD CHASSIS */}
            <div
              className="relative w-full h-24 sm:h-36 md:h-44 rounded-b-2xl bg-gradient-to-b from-[#181a20] to-[#121418] border-x border-b border-[#282c35] shadow-[0_30px_60px_rgba(0,0,0,0.9)] p-2 sm:p-3 overflow-hidden"
              style={{
                transform: 'rotateX(25deg)',
                transformOrigin: 'top center',
              }}
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
