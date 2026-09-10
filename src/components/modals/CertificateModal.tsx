import React, { useState, useEffect } from 'react';
import { CertificateItem } from '../../types';
import {
  Close,
  ShieldCheck,
  Award,
  ExternalLink,
  Calendar,
  Building,
} from '../icons';

interface CertificateModalProps {
  certificate: CertificateItem | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!certificate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [certificate, onClose]);

  if (!certificate) return null;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(certificate.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate Details: ${certificate.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none font-body"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl bg-[#09090b] border border-white/10 p-4 sm:p-6 shadow-2xl text-zinc-200 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Close className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="flex items-center gap-3 sm:gap-3.5 mb-4 sm:mb-5 pb-4 border-b border-white/[0.08] pr-8 sm:pr-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-body font-bold text-rose-400 uppercase tracking-wider">
              Academic & Specialized Track
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-white font-bold tracking-wide uppercase mt-0.5 sm:mt-1 leading-tight">
              {certificate.title}
            </h3>
          </div>
        </div>

        {/* Institution & Term */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
          <div className="p-2.5 sm:p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-body font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>Program / Institution</span>
            </div>
            <div className="text-xs sm:text-sm font-body font-semibold text-zinc-100">{certificate.issuer}</div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-body font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Scope & Term</span>
            </div>
            <div className="text-xs sm:text-sm font-body font-semibold text-zinc-100">
              {certificate.issueDate}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 mb-4 sm:mb-5">
          <h4 className="text-[11px] sm:text-xs font-body font-bold text-rose-400 uppercase tracking-wider">
            Curriculum & Research Focus
          </h4>
          <p className="text-xs sm:text-sm font-body text-zinc-200 leading-relaxed font-normal">
            {certificate.description}
          </p>
        </div>

        {/* Core Competencies */}
        <div className="space-y-2 mb-4 sm:mb-5">
          <h4 className="text-[11px] sm:text-xs font-body font-bold text-zinc-400 uppercase tracking-wider">
            Key Theoretical Competencies
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {certificate.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-body font-semibold bg-rose-950/50 text-rose-200 border border-rose-500/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-4 border-t border-white/[0.08]">
          <a
            href={certificate.verificationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[170px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body font-semibold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View Academic Profile</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-body font-semibold text-xs sm:text-sm transition-colors border border-white/[0.06] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
