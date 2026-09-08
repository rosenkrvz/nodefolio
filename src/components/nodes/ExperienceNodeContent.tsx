import React, { useState } from 'react';
import { ExperienceItem } from '../../types';
import { Briefcase, Calendar, ChevronRight } from '../icons';

interface ExperienceNodeContentProps {
  experience: ExperienceItem[];
}

export const ExperienceNodeContent: React.FC<ExperienceNodeContentProps> = ({ experience }) => {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <div className="space-y-2.5 pt-1 text-slate-200">
      <div className="flex items-center justify-between text-xs pb-1 border-b border-white/[0.08] text-rose-400">
        <div className="flex items-center gap-1.5 font-semibold">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Timeline Architecture</span>
        </div>
        <span className="text-xs font-body text-zinc-400 font-medium">Trajectory & Focus</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {experience.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                isExpanded
                  ? 'bg-white/[0.06] border-rose-500/40 shadow-md'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h4 className="text-sm font-semibold font-display text-white tracking-wide">{item.role}</h4>
                  <div className="text-xs font-medium font-body text-rose-300 mt-0.5">{item.company}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-body text-zinc-400 shrink-0 mt-0.5 font-medium">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>{item.period}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] space-y-2">
                  <p className="text-xs sm:text-[13px] font-body text-zinc-200 leading-relaxed font-normal">
                    {item.description}
                  </p>
                  <ul className="space-y-1.5">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs font-body text-zinc-300">
                        <ChevronRight className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
