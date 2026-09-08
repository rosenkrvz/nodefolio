import React from 'react';
import { playSound } from '../../lib/sound';

export interface TimelinePhase {
  id: string;
  phase: string;
  year: string;
  shortTitle: string;
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
  return (
    <div
      className={`relative w-full border-y border-white/[0.08] bg-[#090b10]/95 backdrop-blur-md select-none ${className}`}
      aria-label="Chronological Research Axis"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Axis Label & Metadata */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.25em] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-zinc-200 font-semibold">TEMPORAL AXIS</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-400 font-mono">2023 — 2026</span>
          </div>
        </div>

        {/* Chronological Track & Nodes */}
        <div className="relative flex-1 max-w-3xl flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Continuous architectural baseline wire */}
          <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/[0.12] -translate-y-1/2 pointer-events-none hidden sm:block" />

          {phases.map((p, idx) => {
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
                className={`relative z-10 group flex items-center gap-2 sm:flex-col sm:items-center px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-white/[0.08] border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : 'bg-[#090b10] border border-white/[0.06] hover:border-white/[0.20] hover:bg-white/[0.04]'
                }`}
              >
                {/* Year Tick & Phase Pill */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      isCurrent
                        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                        : isSelected
                        ? 'bg-white shadow-[0_0_6px_#ffffff]'
                        : 'bg-zinc-600 group-hover:bg-zinc-400'
                    }`}
                  />
                  <span
                    className={`font-tech text-[10px] tracking-wider uppercase font-semibold ${
                      isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {p.phase}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:text-center">
                  <span
                    className={`font-body text-[11px] font-bold ${
                      isCurrent ? 'text-rose-400' : isSelected ? 'text-zinc-200' : 'text-zinc-400'
                    }`}
                  >
                    {p.year}
                  </span>
                  <span className="hidden lg:inline text-zinc-600 text-[9px]">&bull;</span>
                  <span className="hidden lg:inline font-body text-[10px] text-zinc-400 tracking-wider uppercase truncate max-w-[120px]">
                    {p.shortTitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend / Status Flag */}
        <div className="hidden xl:flex items-center gap-2 font-tech text-[10px] tracking-widest text-zinc-400 uppercase shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-zinc-300 font-semibold">TENSOR PROGRESSION</span>
        </div>
      </div>
    </div>
  );
};
