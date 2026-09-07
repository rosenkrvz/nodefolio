import React from 'react';
import { ProjectItem } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface ProjectNodeContentProps {
  project: ProjectItem;
  onOpenModal: (project: ProjectItem) => void;
}

export const ProjectNodeContent: React.FC<ProjectNodeContentProps> = ({
  project,
  onOpenModal,
}) => {
  return (
    <div className="space-y-3 pt-0.5 text-zinc-300">
      <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/9] bg-black/60 group cursor-pointer" onClick={() => onOpenModal(project)}>
        <img
          src={project.image}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-102 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3">
          <div className="text-[9px] font-tech text-rose-400 tracking-wider uppercase mb-0.5">
            Artifact Preview
          </div>
          <div className="font-display text-sm text-white font-normal truncate">
            {project.title}
          </div>
        </div>
      </div>

      <p className="font-body text-xs text-zinc-300 leading-relaxed line-clamp-2">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1">
        {project.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-[10px] font-tech bg-white/[0.03] text-zinc-400 border border-white/[0.05]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => onOpenModal(project)}
          className="group inline-flex items-center gap-1.5 text-xs font-body text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>Open Case Study & Artifact</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
