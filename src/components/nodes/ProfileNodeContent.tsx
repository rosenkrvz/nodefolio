import React from 'react';
import { NodeData } from '../../types';
import { ArrowUpRight } from '../icons';

interface ProfileNodeContentProps {
  data: NonNullable<NodeData['profile']>;
  onOpenContact: () => void;
  onOpenResume: () => void;
}

export const ProfileNodeContent: React.FC<ProfileNodeContentProps> = ({
  data,
  onOpenContact,
  onOpenResume,
}) => {
  return (
    <div className="space-y-3 pt-0.5 text-zinc-200">
      {/* Header section with technical identity tag */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono font-bold text-rose-400 tracking-wider uppercase">
            [IDENTITY CORE // 01]
          </span>
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
            NODE SPEC
          </span>
        </div>
        <h4 className="font-display text-xl text-white font-bold tracking-wide uppercase">
          {data.name}
        </h4>
        <p className="text-xs font-mono text-zinc-400 font-medium mt-0.5 tracking-wider uppercase">
          {data.role}
        </p>
      </div>

      {/* Divided Specification Ledger (matching the clean rhythm of other nodes) */}
      <div className="space-y-1.5 py-0.5">
        {data.stats && data.stats.length > 0 ? (
          data.stats.slice(0, 3).map((st) => (
            <div
              key={st.label}
              className="flex items-baseline justify-between border-b border-white/[0.06] pb-1.5"
            >
              <span className="font-mono text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
                {st.label}
              </span>
              <span className="font-body text-xs text-zinc-100 font-semibold">
                {st.value}
              </span>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-1.5">
              <span className="font-mono text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
                INSTITUTE
              </span>
              <span className="font-body text-xs text-zinc-100 font-semibold">
                IIT Jodhpur
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-1.5">
              <span className="font-mono text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
                DISCIPLINE
              </span>
              <span className="font-body text-xs text-zinc-100 font-semibold">
                AI &amp; Data Science
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-1.5">
              <span className="font-mono text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
                STATUS
              </span>
              <span className="font-body text-xs text-zinc-100 font-semibold">
                {data.status || 'Active Research'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Concise Editorial Thesis (Sharp, restrained, nirogshaala-inspired serif quote) */}
      <div className="pl-2.5 border-l-2 border-rose-500/70 py-1 bg-white/[0.02] rounded-r-sm">
        <p className="font-serif italic text-xs text-zinc-300 leading-relaxed">
          &ldquo;Researching descriptive data environments &amp; generative neural modeling.&rdquo;
        </p>
      </div>

      {/* Clean, quiet action row */}
      <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onOpenContact}
          className="group inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider"
        >
          <span>Connect</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          type="button"
          onClick={onOpenResume}
          className="text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-colors uppercase tracking-wider"
        >
          View CV
        </button>
      </div>
    </div>
  );
};
