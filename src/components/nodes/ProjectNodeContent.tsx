import React from 'react';
import { ProjectItem } from '../../types';
import { ArrowUpRight, Maximize } from '../icons';
import { playSound } from '../../lib/sound';

interface ProjectNodeContentProps {
  project: ProjectItem;
  onOpenModal: (
    project: ProjectItem,
    originRect?: { left: number; top: number; width: number; height: number } | null
  ) => void;
}

export const ProjectNodeContent: React.FC<ProjectNodeContentProps> = ({
  project,
  onOpenModal,
}) => {
  const imageUrl = project.image || '/assets/latent_manifold_artifact.jpg';

  const handleOpen = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    playSound('open');
    const el = e.currentTarget as HTMLElement;
    const rect = el ? el.getBoundingClientRect() : null;
    const originRect = rect
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : null;
    onOpenModal(project, originRect);
  };

  return (
    <div className="space-y-3.5 pt-1 text-zinc-300">
      {/* Relatable Manifold Image Artifact Container - Semantic Tappable/Clickable Button */}
      <button 
        type="button"
        data-no-node-drag="true"
        onClick={handleOpen}
        aria-label={`Inspect case study and high-dimensional manifold for ${project.title}`}
        className="w-full text-left p-0 border-0 bg-transparent block relative rounded-xl overflow-hidden border border-white/[0.09] bg-[#0c0e12] aspect-[16/10] group cursor-pointer select-none transition-all duration-300 hover:border-rose-500/40 hover:shadow-[0_0_24px_rgba(225,29,72,0.22)] active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-rose-500/40"
      >
        {/* Crisp Manifold Visualization Graphic */}
        <img
          src={imageUrl}
          alt={project.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out block"
        />

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-black/40 pointer-events-none" />

        {/* Real Computational Telemetry Badges (Top) */}
        <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none text-xs font-body text-zinc-300">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/[0.08] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-zinc-200 uppercase tracking-wider font-semibold text-[11px]">UMAP PROJ</span>
          </div>

          <div className="px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/[0.08] text-zinc-300 text-[11px] font-medium shadow-sm">
            512-D → Topological Manifold
          </div>
        </div>

        {/* Bottom Telemetry & Expand Prompt */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/[0.08] text-[10.5px] font-body text-zinc-300 shadow-sm">
            <span className="text-rose-400 font-semibold uppercase">Topology</span>
            <span className="text-zinc-600">•</span>
            <span>Riemannian Grid</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/85 group-hover:bg-rose-900/95 text-rose-300 border border-rose-500/40 text-[11px] font-body font-semibold transition-all shadow-[0_0_12px_rgba(225,29,72,0.35)] group-hover:shadow-[0_0_16px_rgba(225,29,72,0.5)]">
            <span>Inspect</span>
            <Maximize className="w-3 h-3 transition-transform group-hover:scale-110" />
          </div>
        </div>
      </button>

      {/* Editorial description with Dongle accent */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-body text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              Computational Artifact
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="font-body text-xs text-zinc-400 font-medium">
              Latent Manifold Representation
            </span>
          </div>
          <span className="font-accent text-2xl text-rose-300/80 leading-none lowercase tracking-wide hidden sm:inline">
            manifold
          </span>
        </div>
        <p className="font-body text-sm text-zinc-200 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Metric chips */}
      {Array.isArray(project?.metrics) && project.metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {project.metrics.map((m, idx) => (
            <div
              key={idx}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center"
            >
              <div className="text-[10px] font-body font-semibold text-zinc-400 uppercase tracking-wider">{m.label}</div>
              <div className="text-xs sm:text-[13px] font-display text-white font-semibold truncate mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-xs font-body font-medium text-zinc-300">Latent Traversal Active</span>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          className="group inline-flex items-center gap-1 text-xs font-body font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer active:scale-95"
        >
          <span>Open Case Study</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
