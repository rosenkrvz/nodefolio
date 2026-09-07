import React from 'react';
import { ProjectItem } from '../../types';
import {
  X,
  ExternalLink,
  Github,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#09090b] border border-white/10 p-6 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 mb-5 bg-black">
          <img
            src={project.image}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/30" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-tech text-rose-300 bg-rose-950/60 border border-rose-500/30 uppercase tracking-widest mb-1.5 inline-block">
              Research Artifact
            </span>
            <h3 className="font-display text-2xl text-white font-normal tracking-wide">{project.title}</h3>
            <p className="font-body text-xs text-zinc-300 mt-0.5">{project.tagline}</p>
          </div>
        </div>

        {/* Focus Dimensions Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {project.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-center"
            >
              <div className="text-[10px] font-tech text-zinc-500 uppercase tracking-wider">{m.label}</div>
              <div className="text-xs font-body font-medium text-zinc-200 mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Description & Problem Statement */}
        <div className="space-y-2 mb-5">
          <h4 className="text-[10px] font-tech text-rose-500/90 uppercase tracking-widest">
            Computational Design & Objective
          </h4>
          <p className="text-xs font-body text-zinc-300 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tech Stack Chips */}
        <div className="space-y-2 mb-5">
          <h4 className="text-[10px] font-tech text-zinc-500 uppercase tracking-widest">
            Architecture Stack
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded text-xs font-tech bg-white/[0.03] text-zinc-300 border border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body font-medium text-xs transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Explore Research Code</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 font-body text-xs transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 text-xs transition-colors font-body"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
