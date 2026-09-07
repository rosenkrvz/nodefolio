import React from 'react';
import { NodeData } from '../../types';
import { ArrowUpRight, Mail } from 'lucide-react';

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
      <div>
        <div className="text-[11px] font-body font-bold text-rose-400 tracking-wider uppercase mb-1">
          Identity Anchor
        </div>
        <h4 className="font-display text-xl text-white font-bold tracking-wide uppercase">
          {data.name}
        </h4>
        <p className="text-xs sm:text-sm font-body text-zinc-300 font-medium mt-0.5">
          {data.role}
        </p>
      </div>

      <p className="text-sm font-body text-zinc-200 leading-relaxed">
        {data.bio}
      </p>

      {/* Clean, quiet action row */}
      <div className="pt-2.5 flex items-center justify-between border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onOpenContact}
          className="group inline-flex items-center gap-1.5 text-xs font-body font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>Connect & Inquire</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          type="button"
          onClick={onOpenResume}
          className="text-xs font-body font-semibold text-zinc-300 hover:text-white transition-colors"
        >
          View CV
        </button>
      </div>
    </div>
  );
};
