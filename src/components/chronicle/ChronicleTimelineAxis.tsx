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
        <div
          role="tablist"
          aria-label="Chronicle Phases"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 w-full"
        >
          {phases.map((p) => {
            const isSelected = p.id === activePhaseId;

            return (
              <button
                key={p.id}
                role="tab"
                id={`tab-${p.id}`}
                aria-selected={isSelected}
                aria-controls="chronicle-main-entry"
                type="button"
                onClick={() => {
                  if (!isSelected) {
                    playSound('select');
                    onSelectPhase(p.id);
                  }
                }}
                className={`relative group flex flex-col justify-between p-2.5 sm:p-3 rounded-xl text-left transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b10] ${
                  isSelected
                    ? 'bg-[#151922] border border-rose-500/60 shadow-[0_4px_24px_rgba(244,63,94,0.22)] -translate-y-0.5 z-10'
                    : 'bg-[#0c0e15]/90 border border-white/[0.07] hover:border-white/[0.22] hover:bg-[#121620] hover:-translate-y-0.5 z-0'
                }`}
              >
                {/* Active Glowing Top Seam */}
                <div
                  className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 shadow-[0_0_10px_#f43f5e] transition-opacity duration-300 pointer-events-none ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Subtle Ambient Radial Glow on Active */}
                <div
                  className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-rose-500/15 blur-xl pointer-events-none transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Card Top Row: Phase + Status Dot + Year Badge */}
                <div className="flex items-center justify-between w-full gap-1.5 relative z-10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                        isSelected
                          ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse scale-110'
                          : 'bg-zinc-600 group-hover:bg-zinc-400'
                      }`}
                    />
                    <span
                      className={`font-tech text-[10px] tracking-wider uppercase font-bold truncate transition-colors duration-300 ${
                        isSelected ? 'text-rose-400' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      {p.phase}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'text-rose-300 bg-rose-500/10 border border-rose-500/30'
                        : 'text-zinc-400 bg-white/[0.04] border border-white/[0.06] group-hover:border-white/[0.12]'
                    }`}
                  >
                    {p.year}
                  </span>
                </div>

                {/* Card Body: Primary Topic */}
                <div className="mt-2 w-full relative z-10">
                  <h4
                    className={`font-display text-[12px] sm:text-[13px] font-bold tracking-tight leading-snug truncate transition-colors duration-300 ${
                      isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                    }`}
                  >
                    {p.shortTitle}
                  </h4>

                  {p.subTopic && (
                    <p
                      className={`mt-0.5 font-mono text-[10px] truncate transition-colors duration-300 ${
                        isSelected
                          ? 'text-zinc-300'
                          : 'text-zinc-500 group-hover:text-zinc-400'
                      }`}
                    >
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
