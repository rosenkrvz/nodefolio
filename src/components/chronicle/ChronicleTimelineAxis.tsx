import React from 'react';
import { playSound } from '../../lib/sound';

export interface TimelinePhase {
  id: string;
  phase: string;
  year: string;
  shortTitle: string;
  subTopic?: string;
  status: 'active' | 'verified' | 'deployed' | 'foundation';
}

interface ChronicleTimelineAxisProps {
  phases: TimelinePhase[];
  activePhaseId: string;
  onSelectPhase: (phaseId: string) => void;
  className?: string;
}

export const ChronicleTimelineAxis: React.FC<ChronicleTimelineAxisProps> = ({
  phases,
  activePhaseId,
  onSelectPhase,
  className = '',
}) => {
  const activePhase = phases.find((p) => p.id === activePhaseId) || phases[0];

  return (
    <div
      className={`relative w-full border-y border-white/[0.08] bg-[#090b10]/95 backdrop-blur-md select-none transition-all ${className}`}
      aria-label="Chronological Research Axis"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        {/* Top Header Row: System Beacon & Navigation Metadata */}
        <div className="flex items-center justify-between gap-4 pb-2.5 mb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
              <span className="text-zinc-100 font-bold">TEMPORAL AXIS</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-zinc-400 font-mono">2023 — 2026 ROADMAP</span>
            </div>

            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.07]">
              {phases.length} PHASES
            </span>
          </div>

          <div className="flex items-center gap-2 font-tech text-[10px] tracking-wider uppercase text-zinc-400">
            <span className="hidden md:inline text-zinc-500">SELECTED:</span>
            <span className="font-semibold text-rose-400">
              {activePhase ? `${activePhase.phase} • ${activePhase.shortTitle}` : 'RESEARCH LOG'}
            </span>
          </div>
        </div>

        {/* Responsive 5-Card Stepper Deck */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 w-full">
          {phases.map((p) => {
            const isSelected = p.id === activePhaseId;
            const isCurrent = p.status === 'active';

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  playSound('select');
                  onSelectPhase(p.id);
                }}
                className={`relative group flex flex-col justify-between p-2.5 sm:p-3 rounded-xl text-left transition-all duration-200 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 ${
                  isSelected
                    ? 'bg-[#151922] border border-rose-500/60 shadow-[0_4px_20px_rgba(244,63,94,0.18)] -translate-y-0.5'
                    : 'bg-[#0c0e15]/90 border border-white/[0.07] hover:border-white/[0.22] hover:bg-[#121620] hover:-translate-y-0.5'
                }`}
              >
                {/* Active Glowing Top Seam */}
                {isSelected && (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 shadow-[0_0_10px_#f43f5e]" />
                )}

                {/* Subtle Ambient Radial Glow on Active */}
                {isSelected && (
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-rose-500/10 blur-xl pointer-events-none" />
                )}

                {/* Card Top Row: Phase + Status Dot + Year Badge */}
                <div className="flex items-center justify-between w-full gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : isSelected
                          ? 'bg-white shadow-[0_0_6px_#ffffff]'
                          : 'bg-zinc-600 group-hover:bg-zinc-400'
                      }`}
                    />
                    <span
                      className={`font-tech text-[10px] tracking-wider uppercase font-bold truncate ${
                        isSelected ? 'text-rose-400' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      {p.phase}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-zinc-400 font-semibold px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] shrink-0">
                    {p.year}
                  </span>
                </div>

                {/* Card Body: Primary Topic */}
                <div className="mt-2 w-full">
                  <h4
                    className={`font-display text-[12px] sm:text-[13px] font-bold tracking-tight leading-snug truncate transition-colors ${
                      isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                    }`}
                  >
                    {p.shortTitle}
                  </h4>

                  {p.subTopic && (
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-500 group-hover:text-zinc-400 truncate">
                      {p.subTopic}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
