import React from 'react';
import { VisitorNodeData } from '../../types';
import { Close } from '../icons';

interface VisitorNodeContentProps {
  visitorData: VisitorNodeData;
  onDelete?: (id: string) => void;
}

export const VisitorNodeContent: React.FC<VisitorNodeContentProps> = ({
  visitorData,
  onDelete,
}) => {
  const dateStr = new Date(visitorData.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const getAccentBorder = () => {
    switch (visitorData.accent) {
      case 'crimson':
        return 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
      case 'white':
        return 'border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.08)]';
      case 'zinc':
      default:
        return 'border-zinc-700/60 shadow-lg';
    }
  };

  return (
    <div
      className={`relative p-3.5 rounded-xl bg-[#0f1218]/95 backdrop-blur-md border ${getAccentBorder()} transition-all select-none group font-body`}
    >
      {/* Visual Tape / Pin Marker at top center */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-[2px] bg-white/[0.08] border border-white/20 backdrop-blur-sm pointer-events-none" />

      {/* Header Row: Category Badge & Author */}
      <div className="flex items-center justify-between gap-2 mb-2 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-rose-400 truncate">
            {visitorData.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-tech text-zinc-400 tracking-wider">
            {dateStr}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(visitorData.id);
              }}
              title="Remove this visitor note"
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <Close className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Message Body */}
      <p className="text-xs text-zinc-200 font-normal leading-relaxed mb-3 break-words">
        &ldquo;{visitorData.message}&rdquo;
      </p>

      {/* Footer: Author Attribution */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] font-tech text-zinc-400">
        <span className="text-zinc-400 uppercase tracking-wider">LEFT BY:</span>
        <span className="text-zinc-200 font-bold tracking-wide truncate max-w-[140px]">
          {visitorData.name}
        </span>
      </div>
    </div>
  );
};
