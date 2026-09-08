import React, { useEffect } from 'react';
import { NodeData, ProjectItem, CertificateItem } from '../types';
import { X, ExternalLink, Activity, Layers, Award, Sliders, Eye, User, Clock, ArrowRight } from 'lucide-react';

interface FocusedNodeModalProps {
  node: NodeData | null;
  onClose: () => void;
  onOpenProjectDetail?: (project: ProjectItem) => void;
  onOpenCertificateDetail?: (cert: CertificateItem) => void;
}

export const FocusedNodeModal: React.FC<FocusedNodeModalProps> = ({
  node,
  onClose,
  onOpenProjectDetail,
  onOpenCertificateDetail,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detailed technical artifact: ${node.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none animate-in fade-in duration-200"
    >
      {/* Deep dark backdrop blur preserving spatial context */}
      <div
        className="absolute inset-0 bg-[#090b10]/80 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Enlarged Focused Technical Artifact Card (#212121) */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[30px] bg-[#212121] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(225,29,72,0.18)] p-6 sm:p-8 z-10 font-body">
        {/* Top Artifact Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-[0.25em]">
                {node.category} &bull; ARTIFACT {node.id}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-white font-bold tracking-tight uppercase">
              {node.title}
            </h2>
            {node.subtitle && (
              <p className="text-sm text-zinc-300 font-medium mt-1">
                {node.subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Close inspection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section based on Node Category */}
        <div className="space-y-6">
          {/* Profile Overview */}
          {node.category === 'profile' && node.profile && (
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                {node.profile.bio}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {node.profile.stats?.map((st, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{st.label}</div>
                    <div className="text-sm font-semibold text-white mt-1">{st.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Details */}
          {node.category === 'project' && node.project && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative">
                <img
                  src={node.project.image}
                  alt={node.project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="text-xs text-rose-400 font-semibold tracking-wider uppercase">
                    {node.project.tagline}
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {node.project.description}
              </p>

              {/* Empirical Metrics */}
              {node.project.metrics && (
                <div className="grid grid-cols-3 gap-3">
                  {node.project.metrics.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{m.label}</div>
                      <div className="text-sm font-semibold text-white mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {node.project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills / Modules Details */}
          {node.category === 'skills' && node.skills && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
                Technical Modules &amp; Pipeline Stages
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {node.skills.map((sk) => (
                  <div key={sk.name} className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                      <span>{sk.name}</span>
                      <span className="text-rose-400 font-tech text-[11px]">{sk.level}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${sk.level}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sk.tags.map((t) => (
                        <span key={t} className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connections Metadata */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
            <div>
              <span>INPUT PORTS: </span>
              <span className="text-white font-semibold">{node.inputs?.length || 0}</span>
              <span className="mx-2">&bull;</span>
              <span>OUTPUT PORTS: </span>
              <span className="text-white font-semibold">{node.outputs?.length || 0}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
