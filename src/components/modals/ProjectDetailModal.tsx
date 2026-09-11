import React, { useEffect } from 'react';
import { ProjectItem } from '../../types';
import {
  Close,
  ExternalLink,
  GitHub,
  Layers,
  Activity,
  Binary,
  Cpu,
  BarChart,
  CheckCircle,
  ArrowUpRight,
} from '../icons';

import React, { useEffect } from 'react';
import { ProjectItem } from '../../types';
import {
  Close,
  ExternalLink,
  GitHub,
  Layers,
  Activity,
  Binary,
  Cpu,
  BarChart,
  CheckCircle,
  ArrowUpRight,
  Compass,
} from '../icons';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenResearchCanvas3D?: (phaseId?: string) => void;
  onOpenLabEntry?: (labId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenResearchCanvas3D,
  onOpenLabEntry,
}) => {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Project Case Study: ${project.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-body"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90dvh] sm:max-h-[92vh] overflow-y-auto overscroll-contain rounded-2xl bg-[#111419] border border-white/10 p-4 sm:p-8 shadow-2xl text-zinc-200 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] sm:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
        >
          <Close className="w-5 h-5" />
        </button>

        {/* Header Eyebrow & Title */}
        <div className="mb-5 sm:mb-6 pr-8 sm:pr-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="font-body text-[11px] sm:text-xs font-bold tracking-wider text-rose-400 uppercase">
                {project.category || 'SOFTWARE & SYSTEMS'} &bull; {project.status || 'COMPLETED'}
              </span>
            </div>
            {project.status && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-rose-950/60 border border-rose-500/30 text-rose-300">
                {project.status}
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl sm:text-4xl text-white font-bold tracking-wide uppercase leading-tight">
            {project.title}
          </h2>
          <p className="font-body text-sm sm:text-base text-zinc-300 mt-1.5 sm:mt-2 leading-relaxed max-w-2xl">
            {project.tagline}
          </p>
        </div>

        {/* Visual Artifact Banner */}
        {project.image && (
          <div className="relative aspect-[21/9] min-h-[140px] w-full rounded-xl overflow-hidden border border-white/10 mb-6 sm:mb-8 bg-[#090b0e]">
            <img
              src={project.image}
              alt={project.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111419] via-black/20 to-transparent" />

            <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4 flex flex-wrap items-center justify-between gap-2">
              <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] sm:text-xs font-body font-medium text-zinc-300">
                Artifact &bull; Technical Architecture Evidence
              </div>
              {project.relatedResearchPhaseId && onOpenResearchCanvas3D && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResearchCanvas3D(project.relatedResearchPhaseId);
                  }}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 backdrop-blur-sm text-white text-[10px] sm:text-xs font-body font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(225,29,72,0.5)] cursor-pointer active:scale-95"
                >
                  <span>Explore in 3D Research</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Telemetry Metric Grid */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {project.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
              >
                <div className="text-[10px] sm:text-xs font-body font-semibold text-zinc-400 uppercase tracking-wider">
                  {m.label}
                </div>
                <div className="text-sm sm:text-lg font-display font-bold text-white mt-0.5 sm:mt-1">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Structured Case Study Sections */}
        <div className="space-y-6 sm:space-y-8 border-t border-white/[0.08] pt-6 text-sm sm:text-base font-body">
          {/* 1. THE PROBLEM */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Binary className="w-4 h-4 text-rose-400" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                1. The Problem
              </h3>
            </div>
            <p className="text-zinc-200 leading-relaxed font-normal">
              {project.problem || project.description}
            </p>
          </div>

          {/* 2. THE APPROACH */}
          {project.approach && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                  2. The Approach
                </h3>
              </div>
              <p className="text-zinc-200 leading-relaxed font-normal">
                {project.approach}
              </p>
            </div>
          )}

          {/* 3. IMPLEMENTATION */}
          {project.implementation && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                  3. Implementation
                </h3>
              </div>
              <p className="text-zinc-200 leading-relaxed font-normal">
                {project.implementation}
              </p>
            </div>
          )}

          {/* 4. MY CONTRIBUTION */}
          {project.myContribution && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                  4. Personal Contribution
                </h3>
              </div>
              <p className="text-zinc-200 leading-relaxed font-normal">
                {project.myContribution}
              </p>
            </div>
          )}

          {/* 5. RESULT & CURRENT STATE */}
          {project.result && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                  5. Result &amp; Current State
                </h3>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-300 leading-relaxed">
                {project.result}
              </div>
            </div>
          )}

          {/* 6. KEY LEARNINGS */}
          {project.learnings && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-rose-400" />
                <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                  6. Technical Learnings
                </h3>
              </div>
              <p className="text-zinc-200 leading-relaxed font-normal">
                {project.learnings}
              </p>
            </div>
          )}

          {/* 7. TECH STACK */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold mb-3">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-body font-semibold bg-white/[0.04] text-zinc-200 border border-white/[0.08]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 8. CONNECTED KNOWLEDGE LINKS (CROSS-LINKING) */}
          {(project.relatedResearchPhaseId || project.relatedLabId) && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-3">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Connected Knowledge Links</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {project.relatedResearchPhaseId && onOpenResearchCanvas3D && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenResearchCanvas3D(project.relatedResearchPhaseId);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>View in 3D Research Canvas</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {project.relatedLabId && onOpenLabEntry && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLabEntry(project.relatedLabId!);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer"
                  >
                    <span>Read Lab Engineering Dispatch</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-5 sm:pt-6 mt-6 sm:mt-8 border-t border-white/[0.08]">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[160px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body font-semibold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Explore Deployment / Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs sm:text-sm font-body font-semibold transition-colors flex items-center gap-2 border border-white/[0.08]"
            >
              <GitHub className="w-3.5 h-3.5" />
              <span>Source Repository</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs sm:text-sm font-body font-semibold transition-colors border border-white/[0.06] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
