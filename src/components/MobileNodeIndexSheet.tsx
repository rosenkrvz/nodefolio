import React, { useEffect } from 'react';
import { NodeData } from '../types';
import { Close, ChevronRight, Plus, Layers } from './icons';
import { playSound } from '../lib/sound';

interface MobileNodeIndexSheetProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: NodeData[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onOpenAddNode?: () => void;
}

function getNodeDescription(node: NodeData): string {
  if (node.project?.tagline) return node.project.tagline;
  if (node.project?.description) return node.project.description.slice(0, 85) + '...';
  if (node.profile?.bio) return node.profile.bio.slice(0, 85) + '...';
  if (node.certificates?.[0]?.description) return node.certificates[0].description.slice(0, 85) + '...';
  if (node.visitorData?.message) return `"${node.visitorData.message.slice(0, 60)}" — ${node.visitorData.name || 'Visitor'}`;
  if (node.subtitle) return node.subtitle;
  return 'Computational research artifact and network node';
}

function getNodeCategoryLabel(node: NodeData): string {
  switch (node.category) {
    case 'profile':
      return 'IDENTITY CORE';
    case 'project':
      return 'RESEARCH ARTIFACT';
    case 'skills':
      return 'NEURAL ARCHITECTURE';
    case 'certificates':
      return 'FOUNDATIONS';
    case 'clock':
      return 'CHRONOMETER';
    case 'visitor':
      return 'VISITOR NOTE';
    default:
      return node.category.toUpperCase();
  }
}

export const MobileNodeIndexSheet: React.FC<MobileNodeIndexSheetProps> = ({
  isOpen,
  onClose,
  nodes,
  selectedNodeId,
  onSelectNode,
  onOpenAddNode,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Research node navigation index"
      className="fixed inset-0 z-50 flex items-end select-none animate-in fade-in duration-200"
    >
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-[#090b10]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-up Bottom Sheet */}
      <div
        className="relative w-full rounded-t-3xl bg-[#0c0e14] border-t border-white/15 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] p-5 z-10 font-body text-zinc-200 max-h-[84vh] flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+16px)] animate-in slide-in-from-bottom duration-250 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Pull Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <span className="font-tech text-xs font-bold text-white uppercase tracking-widest">
              RESEARCH MAP // INDEX
            </span>
            <span className="text-[10px] font-tech text-zinc-500 font-medium">
              ({nodes.length} NODES)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close research index"
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <Close className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 mb-3 px-0.5 shrink-0">
          Select any node to center the camera directly on its coordinates:
        </p>

        {/* Scrollable Node Index List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 -mr-1 flex-1">
          {nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const indexNumber = String(index + 1).padStart(2, '0');
            const categoryLabel = getNodeCategoryLabel(node);
            const description = getNodeDescription(node);

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  playSound('click');
                  onSelectNode(node.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] active:bg-white/[0.1]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Numerical index badge */}
                  <span
                    className={`text-[10px] font-tech font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
                    }`}
                  >
                    {indexNumber}
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Title & Category Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[13px] font-semibold text-white truncate">
                        {node.title}
                      </span>
                      <span
                        className={`text-[9px] font-tech font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          node.category === 'visitor'
                            ? 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                            : 'text-zinc-400 bg-white/[0.06] border border-white/10'
                        }`}
                      >
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Short Description */}
                    <p className="text-[11px] font-body text-zinc-400 leading-snug line-clamp-2">
                      {description}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 mt-1 transition-transform ${
                    isSelected ? 'text-rose-400 translate-x-0.5' : 'text-zinc-500'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer Action: Add Visitor Note */}
        {onOpenAddNode && (
          <div className="pt-3 mt-2 border-t border-white/[0.08] shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddNode();
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Leave a Visitor Field Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
