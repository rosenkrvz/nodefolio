import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, Compass, Layers, Binary, Filter } from './icons';
import { playSound } from '../lib/sound';
import { BrandLogo } from './ui/BrandLogo';
import { ChronicleMilestoneArtifact } from './chronicle/ChronicleArtifacts';
import { ChronicleTimelineAxis, TimelinePhase } from './chronicle/ChronicleTimelineAxis';
import { LAB_ENTRIES, PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { LabEntry, LabEntryType } from '../types';

interface LabViewProps {
  onBackToWork: () => void;
  onOpenProjectDetail?: (projectId: string) => void;
  onOpenResearchCanvas3D?: (phaseId: string) => void;
  activeEntryId?: string;
  onActiveEntryChange?: (entryId: string) => void;
}

interface LabEntryCardProps {
  entry: LabEntry;
  onOpenProjectDetail?: (projectId: string) => void;
  onOpenResearchCanvas3D?: (phaseId: string) => void;
  prevEntry?: { id: string; title: string } | null;
  nextEntry?: { id: string; title: string } | null;
  onSelectEntry?: (entryId: string) => void;
}

const LabEntryCard: React.FC<LabEntryCardProps> = ({
  entry,
  onOpenProjectDetail,
  onOpenResearchCanvas3D,
  prevEntry,
  nextEntry,
  onSelectEntry,
}) => {
  const typeBadgeColors: Record<LabEntryType, { bg: string; text: string; border: string }> = {
    BUILD: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30' },
    EXPERIMENT: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/30' },
    DEBUG: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
    OPTIMIZATION: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    RESEARCH: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
  };

  const badge = typeBadgeColors[entry.type] || typeBadgeColors.BUILD;

  return (
    <article
      id={`lab-entry-${entry.id}`}
      className="relative scroll-mt-28 pb-10 pt-7 border-b border-white/[0.08] transition-colors duration-300 bg-gradient-to-b from-rose-500/[0.02] to-transparent rounded-2xl p-5 sm:p-8"
    >
      {/* Laser Top Rule */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_14px_#f43f5e]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Temporal Spine & Type (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col items-start space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-none text-white">
              {entry.numeral}
            </span>
            <div className="flex flex-col">
              <span className="font-tech text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-semibold">
                LOG ENTRY
              </span>
              <span className="font-body text-xs font-bold tracking-wider uppercase text-rose-400">
                {entry.period}
              </span>
            </div>
          </div>

          {/* Type Badge */}
          <div
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-tech tracking-[0.2em] uppercase font-bold ${badge.bg} ${badge.text} border ${badge.border} shadow-sm`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{entry.type} // {entry.statusLabel}</span>
          </div>

          <p className="font-tech text-[10px] text-zinc-400 uppercase tracking-wider leading-relaxed pt-1">
            {entry.context}
          </p>
        </div>

        {/* Center Column: Problem, Approach & Concrete Results (col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight uppercase leading-[1.12] text-white">
            {entry.title}
          </h2>

          <div className="space-y-4 pt-1">
            {/* 01: Obstacle / Problem */}
            <div className="space-y-1">
              <div className="font-tech text-[10px] tracking-[0.22em] text-rose-400 uppercase font-bold">
                01 // THE PROBLEM &amp; INVESTIGATION
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {entry.problem} {entry.investigation}
              </p>
            </div>

            {/* 02: Approach & Implementation */}
            <div className="space-y-1">
              <div className="font-tech text-[10px] tracking-[0.22em] text-rose-400 uppercase font-bold">
                02 // APPROACH &amp; IMPLEMENTATION
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {entry.approach} {entry.implementation}
              </p>
            </div>

            {/* 03: Concrete Result */}
            <div className="space-y-1">
              <div className="font-tech text-[10px] tracking-[0.22em] text-emerald-400 uppercase font-bold">
                03 // CONCRETE RESULT &amp; MEASUREMENT
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal bg-emerald-500/[0.04] p-3 rounded-lg border border-emerald-500/20">
                {entry.result}
              </p>
            </div>

            {/* 04: Lessons Learned */}
            <div className="space-y-1">
              <div className="font-tech text-[10px] tracking-[0.22em] text-zinc-400 uppercase font-bold">
                04 // KEY TAKEAWAY &amp; ARCHITECTURAL LESSON
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed italic border-l-2 border-rose-500/50 pl-3">
                "{entry.lesson}"
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.08] font-tech text-[9.5px] tracking-wider text-zinc-400 uppercase"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Artifact & Cross-Link Actions (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <ChronicleMilestoneArtifact
            milestoneId={entry.relatedResearchPhaseId === 'phase-01' ? 'm5' : entry.relatedResearchPhaseId === 'phase-02' ? 'm4' : entry.relatedResearchPhaseId === 'phase-03' ? 'm3' : entry.relatedResearchPhaseId === 'phase-04' ? 'm2' : 'm1'}
            active={true}
            className="w-full shadow-lg"
          />

          {/* Metrics */}
          {entry.metrics && entry.metrics.length > 0 && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {entry.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="space-y-0.5">
                    <span className="block font-tech text-[8.5px] uppercase tracking-wider text-zinc-400">
                      {m.label}
                    </span>
                    <span className="block font-tech text-xs font-semibold text-zinc-200 truncate">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Bidirectional Cross-Link CTAs ─────────────────────────────── */}
          <div className="space-y-2 pt-1">
            {entry.relatedProjectId && onOpenProjectDetail && (
              <button
                type="button"
                onClick={() => {
                  playSound('select');
                  onOpenProjectDetail(entry.relatedProjectId!);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 font-body text-xs tracking-wider uppercase text-zinc-200 hover:text-white font-semibold flex items-center justify-between transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  <span>INSPECT IN WORK</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </button>
            )}

            {entry.relatedResearchPhaseId && onOpenResearchCanvas3D && (
              <button
                type="button"
                onClick={() => {
                  playSound('open');
                  onOpenResearchCanvas3D(entry.relatedResearchPhaseId!);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-rose-950/40 hover:bg-rose-600/20 border border-rose-500/40 hover:border-rose-500/70 font-body text-xs tracking-wider uppercase text-rose-300 hover:text-white font-semibold flex items-center justify-between transition-all cursor-pointer shadow-[0_0_14px_rgba(225,29,72,0.15)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-rose-400" />
                  <span>EXPLORE IN 3D RESEARCH</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Step Navigation Footer */}
      <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        {prevEntry ? (
          <button
            type="button"
            onClick={() => {
              playSound('select');
              onSelectEntry?.(prevEntry.id);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:border-rose-500/40 border border-white/[0.08] font-tech text-[10px] tracking-wider text-zinc-300 hover:text-white uppercase transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
            <span className="truncate max-w-[200px]">PREV: {prevEntry.title}</span>
          </button>
        ) : <div />}

        {nextEntry ? (
          <button
            type="button"
            onClick={() => {
              playSound('select');
              onSelectEntry?.(nextEntry.id);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:border-rose-500/40 border border-white/[0.08] font-tech text-[10px] tracking-wider text-zinc-300 hover:text-white uppercase transition-all cursor-pointer ml-auto"
          >
            <span className="truncate max-w-[200px]">NEXT: {nextEntry.title}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
          </button>
        ) : <div />}
      </div>
    </article>
  );
};

export const LabView: React.FC<LabViewProps> = ({
  onBackToWork,
  onOpenProjectDetail,
  onOpenResearchCanvas3D,
  activeEntryId: controlledEntryId,
  onActiveEntryChange,
}) => {
  const [internalEntryId, setInternalEntryId] = useState<string>(controlledEntryId || LAB_ENTRIES[0].id);
  const activeEntryId = controlledEntryId || internalEntryId;
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | LabEntryType>('ALL');

  useEffect(() => {
    if (controlledEntryId && controlledEntryId !== internalEntryId) {
      setInternalEntryId(controlledEntryId);
    }
  }, [controlledEntryId]);

  const filteredEntries = useMemo(() => {
    if (selectedFilter === 'ALL') return LAB_ENTRIES;
    return LAB_ENTRIES.filter((e) => e.type === selectedFilter);
  }, [selectedFilter]);

  const displayedEntry = useMemo(() => {
    return filteredEntries.find((e) => e.id === activeEntryId) || filteredEntries[0] || LAB_ENTRIES[0];
  }, [activeEntryId, filteredEntries]);

  const currentIndex = filteredEntries.findIndex((e) => e.id === displayedEntry.id);
  const prevEntry = currentIndex > 0 ? filteredEntries[currentIndex - 1] : null;
  const nextEntry = currentIndex < filteredEntries.length - 1 ? filteredEntries[currentIndex + 1] : null;

  const handleSelectEntry = (id: string) => {
    setInternalEntryId(id);
    onActiveEntryChange?.(id);
    const target = document.getElementById(`lab-entry-${id}`) || document.getElementById('lab-ledger');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const timelinePhases: TimelinePhase[] = useMemo(() => {
    return LAB_ENTRIES.map((entry) => ({
      id: entry.id,
      phase: entry.date,
      year: entry.displayYear,
      shortTitle: entry.title.split(' ')[0] + ' ' + (entry.title.split(' ')[1] || ''),
      subTopic: entry.type,
      status: entry.status as any,
    }));
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#07090e] text-[#eaeaea] font-body selection:bg-rose-500/30 selection:text-white pb-24">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 bg-canvas-dots-overlay opacity-25 pointer-events-none" />

      {/* ═══════════ HEADER ═══════════ */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 pt-20 sm:pt-24 pb-8 sm:pb-12 border-b border-white/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-tech text-xs tracking-[0.25em] uppercase font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>COMPUTATIONAL LAB // EXPERIMENTS &amp; BUILD LOG</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              DEVELOPMENT &amp; EXPERIMENT DISPATCHES
            </h1>

            <p className="text-zinc-400 font-body text-sm sm:text-base max-w-2xl leading-relaxed">
              Documenting first-principles implementations, kernel experiments, optimizations, debugging sessions, and architectural lessons learned across machine learning and spatial systems.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-3 text-right">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-tech text-zinc-400">
              <span className="text-rose-400 font-bold">{LAB_ENTRIES.length}</span> DOCUMENTED DISPATCHES
            </div>
            <button
              type="button"
              onClick={onBackToWork}
              className="text-xs font-tech text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
              <span>RETURN TO WORK INDEX</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar">
          <span className="font-tech text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-rose-400" />
            FILTER:
          </span>
          {(['ALL', 'BUILD', 'EXPERIMENT', 'DEBUG', 'OPTIMIZATION', 'RESEARCH'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                playSound('click');
                setSelectedFilter(filter);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-tech uppercase tracking-wider transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* ═══════════ TIMELINE AXIS ═══════════ */}
      <nav className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:top-16 z-30 shadow-2xl">
        <ChronicleTimelineAxis
          phases={timelinePhases}
          activePhaseId={displayedEntry.id}
          onSelectPhase={handleSelectEntry}
        />
      </nav>

      {/* ═══════════ MAIN LEDGER ═══════════ */}
      <main id="lab-ledger" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 pt-10 pb-16">
        <div className="space-y-12">
          {filteredEntries.map((entry) => (
            <LabEntryCard
              key={entry.id}
              entry={entry}
              onOpenProjectDetail={onOpenProjectDetail}
              onOpenResearchCanvas3D={onOpenResearchCanvas3D}
              prevEntry={prevEntry}
              nextEntry={nextEntry}
              onSelectEntry={handleSelectEntry}
            />
          ))}
        </div>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 mt-8 pt-8 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-tech text-zinc-400">
          <div className="flex items-center gap-2">
            <BrandLogo variant="icon" size={14} className="text-rose-400" />
            <span className="text-zinc-200 font-bold">COMPUTATIONAL LAB // SHUBHAM SHARMA</span>
            <span>&bull;</span>
            <span>OPEN RESEARCH DISPATCHES</span>
          </div>
          <div>All code, experiments &amp; benchmarks documented from working repositories.</div>
        </div>
      </footer>
    </div>
  );
};
