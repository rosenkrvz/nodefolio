import React from 'react';

export interface BrandLogoProps {
  variant?: 'navbar' | 'icon' | 'badge' | 'editorial';
  size?: number;
  className?: string;
  active?: boolean;
}

/**
 * Geometric Computational SS Monogram
 * Precision vector icon featuring dual interlocking tensor tracks ("SS"),
 * 45-degree architectural chamfers, terminal connection pins,
 * and a surgical crimson routing vertex.
 */
export const BrandMarkSVG: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Outer Computational S-Rail: (24,6.5) -> (9,6.5) -> (6.5,9) -> (6.5,13) -> (8.5,15) -> (23.5,15) -> (25.5,17) -> (25.5,23) -> (23,25.5) -> (8,25.5) */}
      <path
        d="M24 6.5H9.5L6.5 9.5V13L8.5 15H23.5L25.5 17V22.5L22.5 25.5H8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-200"
      />

      {/* Inner Intertwined Parallel S-Rail: (21,10.5) -> (13,10.5) -> (11,12.5) -> (11,13.5) / (21,18.5) -> (21,19.5) -> (19,21.5) -> (11,21.5) */}
      <path
        d="M20.5 10.5H13.5L11.5 12.5V13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.75"
        className="transition-opacity duration-200"
      />
      <path
        d="M20.5 18.5V19.5L18.5 21.5H11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.75"
        className="transition-opacity duration-200"
      />

      {/* Terminal Node Pins */}
      <circle cx="24" cy="6.5" r="1.5" fill="currentColor" />
      <circle cx="8" cy="25.5" r="1.5" fill="currentColor" />

      {/* Surgical Crimson Routing Nexus Vertex */}
      <circle
        cx="16"
        cy="15"
        r="2"
        fill="#f43f5e"
        className="transition-transform duration-200 group-hover:scale-125"
      />
      <circle
        cx="16"
        cy="15"
        r="4.5"
        stroke="#f43f5e"
        strokeWidth="0.8"
        strokeOpacity="0.35"
        className="animate-pulse"
      />
    </svg>
  );
};

/**
 * Global Brand Identity Component
 * Centralized identity mark supporting navbar, badge, and editorial variants.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  size,
  className = '',
  active = false,
}) => {
  if (variant === 'icon') {
    return <BrandMarkSVG size={size || 24} className={className} />;
  }

  if (variant === 'navbar') {
    return (
      <div
        className={`w-8 h-8 rounded-lg bg-[#0c0e14] border flex items-center justify-center transition-all duration-200 shrink-0 shadow-inner group-hover:scale-105 ${
          active
            ? 'border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
            : 'border-white/[0.12] group-hover:border-rose-500/40 group-hover:shadow-[0_0_10px_rgba(244,63,94,0.18)]'
        } ${className}`}
      >
        <BrandMarkSVG
          size={18}
          className="text-zinc-200 group-hover:text-white transition-colors"
        />
      </div>
    );
  }

  if (variant === 'editorial') {
    return (
      <div
        className={`w-10 h-10 rounded-xl bg-[#0c0e14] border border-white/[0.14] hover:border-rose-500/50 flex items-center justify-center shadow-lg transition-all duration-200 shrink-0 ${className}`}
      >
        <BrandMarkSVG
          size={22}
          className="text-zinc-100 hover:text-white transition-colors"
        />
      </div>
    );
  }

  // 'badge' variant: Pill badge with mark + editorial typography
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0c0e14] border border-white/[0.10] text-xs font-body font-semibold text-zinc-300 ${className}`}
    >
      <BrandMarkSVG size={15} className="text-rose-400" />
      <span className="font-display uppercase tracking-wider text-[11px] text-white">
        SHUBHAM SHARMA
      </span>
      <span className="text-zinc-600">&bull;</span>
      <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">
        SYS // 01
      </span>
    </div>
  );
};
