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
    <div className="space-y-3 pt-0.5 text-zinc-200">
      <div className="text-[11px] font-body font-bold text-rose-400 tracking-wider uppercase">
        Computational Stack
      </div>

      <div className="space-y-2">
        {skills.slice(0, 4).map((skill) => (
          <div
            key={skill.name}
            className="flex items-baseline justify-between border-b border-white/[0.06] pb-1.5"
          >
            <span className="font-body text-xs sm:text-[13px] text-zinc-100 font-semibold">
              {skill.name}
            </span>
            <span className="font-body text-xs text-zinc-400 font-medium">
              {skill.category}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onExplore}
          className="group inline-flex items-center gap-1.5 text-xs font-body font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>View Technical Specification</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
