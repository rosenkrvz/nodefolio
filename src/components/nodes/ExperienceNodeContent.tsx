import React, { useState } from 'react';
import { ExperienceItem } from '../../types';
import { Briefcase, Calendar, ChevronRight } from 'lucide-react';

interface ExperienceNodeContentProps {
  experience: ExperienceItem[];
}

export const ExperienceNodeContent: React.FC<ExperienceNodeContentProps> = ({ experience }) => {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <div className="space-y-2.5 pt-1 text-slate-200">
      <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/[0.06] text-purple-300">
        <div className="flex items-center gap-1.5 font-medium">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Timeline Architecture</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">8+ Years Seniority</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {experience.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isExpanded
                  ? 'bg-white/[0.06] border-purple-500/30 shadow-md'
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">{item.role}</h4>
                  <div className="text-[11px] font-medium text-purple-300/90">{item.company}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                  <Calendar className="w-2.5 h-2.5 text-slate-500" />
                  <span>{item.period}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-white/[0.04] space-y-1.5">
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>
                  <ul className="space-y-1">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-400">
                        <ChevronRight className="w-2.5 h-2.5 text-purple-400 shrink-0 mt-0.5" />
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
