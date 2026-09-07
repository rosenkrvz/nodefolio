import React from 'react';
import { SkillItem } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface SkillsNodeContentProps {
  skills: SkillItem[];
  accentColor?: string;
  categoryLabel?: string;
  onExplore?: () => void;
}

export const SkillsNodeContent: React.FC<SkillsNodeContentProps> = ({
  skills,
  onExplore,
}) => {
  return (
    <div className="space-y-3 pt-0.5 text-zinc-300">
      <div className="text-[10px] font-tech text-rose-500/90 tracking-widest uppercase">
        Computational Stack
      </div>

      <div className="space-y-2">
        {skills.slice(0, 4).map((skill) => (
          <div
            key={skill.name}
            className="flex items-baseline justify-between border-b border-white/[0.04] pb-1.5"
          >
            <span className="font-body text-xs text-zinc-200 font-medium">
              {skill.name}
            </span>
            <span className="font-tech text-[10px] text-zinc-500">
              {skill.category}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-1.5 flex items-center justify-between border-t border-white/[0.06]">
        <button
          type="button"
          onClick={onExplore}
          className="group inline-flex items-center gap-1.5 text-xs font-body text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>View Technical Specification</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
