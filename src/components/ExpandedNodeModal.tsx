import React from 'react';
import { NodeData } from '../types';
import { X, ExternalLink, Github, ArrowUpRight, Activity, Layers, Cpu, CheckCircle } from 'lucide-react';

interface ExpandedNodeModalProps {
  node: NodeData | null;
  onClose: () => void;
  onOpenProjectDetail?: (project: any) => void;
  onOpenCertificateDetail?: (cert: any) => void;
}

export const ExpandedNodeModal: React.FC<ExpandedNodeModalProps> = ({
  node,
  onClose,
  onOpenProjectDetail,
  onOpenCertificateDetail,
}) => {
  if (!node) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#14171c] border border-white/10 p-6 sm:p-8 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Eyebrow & Title */}
        <div className="mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: node.accentColor || '#e11d48' }}
            />
            <span className="font-body text-xs uppercase tracking-widest text-rose-400 font-bold">
              {node.category} • Computational Node
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-white font-bold tracking-wide uppercase">
            {node.title}
          </h2>

          {node.subtitle && (
            <p className="font-body text-sm text-zinc-400 mt-1 font-medium">
              {node.subtitle}
            </p>
          )}
        </div>

        {/* Node Profile Specifics */}
        {node.profile && (
          <div className="space-y-4 mb-6">
            <p className="font-body text-sm sm:text-base text-zinc-200 leading-relaxed">
              {node.profile.bio}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-xs font-body font-semibold text-zinc-400 uppercase tracking-wider">Coordinates</div>
                <div className="text-sm font-body text-white font-semibold mt-1">{node.profile.location}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-xs font-body font-semibold text-zinc-400 uppercase tracking-wider">Direct Channel</div>
                <div className="text-sm font-body text-rose-300 font-semibold mt-1 truncate">{node.profile.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Node Skills List */}
        {node.skills && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-display text-white font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>Technology Stack &amp; Implementation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {node.skills.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="font-body text-sm font-semibold text-zinc-100">{s.name}</span>
                  <span className="font-body text-xs text-zinc-400 font-medium">{s.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node Project Details */}
        {node.project && (
          <div className="space-y-4 mb-6">
            <p className="font-body text-sm sm:text-base text-zinc-200 leading-relaxed">
              {node.project.description}
            </p>

            {/* Empirical Metrics */}
            <div className="space-y-2">
              <div className="text-xs font-display text-white font-bold uppercase tracking-wider">
                Empirical Telemetry &amp; Metrics
              </div>
              <div className="grid grid-cols-3 gap-2">
                {node.project.metrics.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <div className="text-xs font-body text-zinc-400 font-semibold uppercase">{m.label}</div>
                    <div className="text-base font-display font-bold text-white mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deep case study link */}
            <button
              type="button"
              onClick={() => onOpenProjectDetail?.(node.project)}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Inspect Full Case Study &amp; Architecture</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Node Certificates */}
        {node.certificates && (
          <div className="space-y-3 mb-6">
            <div className="text-xs font-display text-white font-bold uppercase tracking-wider">
              Theoretical Foundation &amp; Credentials
            </div>
            {node.certificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => onOpenCertificateDetail?.(cert)}
                className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-body text-sm font-semibold text-zinc-100">{cert.title}</div>
                  <div className="font-body text-xs text-zinc-400 mt-0.5">{cert.issuer} • {cert.issueDate}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              </div>
            ))}
          </div>
        )}

        {/* Connected Ports Info */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-body text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{node.inputs.length} Inputs • {node.outputs.length} Outputs</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-semibold transition-colors"
          >
            Close Focus
          </button>
        </div>
      </div>
    </div>
  );
};
