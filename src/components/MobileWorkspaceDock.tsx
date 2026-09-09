import React from 'react';
import { Plus, Layers, Grid, ChevronLeft, ChevronRight } from './icons';
import { playSound } from '../lib/sound';

interface MobileWorkspaceDockProps {
  onPrevNode: () => void;
  onNextNode: () => void;
  hasPrevNode?: boolean;
  hasNextNode?: boolean;
  currentNodeIndex: number;
  totalNodes: number;
  onOpenIndex: () => void;
  onOpenAddNode?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
}

export const MobileWorkspaceDock: React.FC<MobileWorkspaceDockProps> = ({
  onPrevNode,
  onNextNode,
  hasPrevNode = true,
  hasNextNode = true,
  currentNodeIndex,
  totalNodes,
  onOpenIndex,
  onOpenAddNode,
  showGrid = true,
  onToggleGrid,
}) => {
  const indexStr = `${String(currentNodeIndex).padStart(2, '0')}/${String(totalNodes).padStart(2, '0')}`;

  return (
    <nav
      aria-label="Mobile node navigation and workspace controls"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+38px)] inset-x-0 z-30 pointer-events-auto flex justify-center px-3"
    >
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0c0e14]/94 border border-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.85)] max-w-sm w-full justify-between select-none">
        {/* Previous Node Button: 44px min touch target */}
        <button
          type="button"
          onClick={() => {
            playSound('secondaryClick');
            onPrevNode();
          }}
          disabled={!hasPrevNode}
          title="Previous node in graph"
          aria-label="Navigate to previous node"
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Node Index Trigger & Counter: 44px min touch target */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onOpenIndex();
          }}
          title="Open research network node index"
          aria-label={`Open research node index. Currently at node ${indexStr}.`}
          className="flex-1 h-11 min-h-[44px] px-2 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] border border-white/10 text-white transition-all cursor-pointer font-tech font-bold uppercase tracking-wider text-xs"
        >
          <Layers className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="text-zinc-300 text-[11px]">NODE</span>
          <span className="text-rose-400 font-mono text-xs">{indexStr}</span>
        </button>

        {/* Next Node Button: 44px min touch target */}
        <button
          type="button"
          onClick={() => {
            playSound('secondaryClick');
            onNextNode();
          }}
          disabled={!hasNextNode}
          title="Next node in graph"
          aria-label="Navigate to next node"
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Grid Toggle Button: 44px min touch target */}
        {onToggleGrid && (
          <button
            type="button"
            onClick={() => {
              playSound('secondaryClick');
              onToggleGrid();
            }}
            title={showGrid ? 'Hide background grid' : 'Show background grid'}
            aria-label={showGrid ? 'Hide background grid' : 'Show background grid'}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
              showGrid
                ? 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/10 active:bg-white/20'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        )}

        {/* Add Visitor Field Note: 44px min touch target */}
        {onOpenAddNode && (
          <button
            type="button"
            onClick={() => {
              playSound('open');
              onOpenAddNode();
            }}
            title="Add field note"
            aria-label="Add visitor field note"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500/30 active:bg-rose-500/40 border border-rose-500/40 text-rose-300 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </nav>
  );
};
