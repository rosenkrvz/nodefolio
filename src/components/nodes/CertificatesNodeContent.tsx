import React from 'react';
import { CertificateItem } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface CertificatesNodeContentProps {
  certificates: CertificateItem[];
  onSelectCertificate: (cert: CertificateItem) => void;
}

export const CertificatesNodeContent: React.FC<CertificatesNodeContentProps> = ({
  certificates,
  onSelectCertificate,
}) => {
  return (
    <div className="space-y-3 pt-0.5 text-zinc-300">
      <div className="text-[10px] font-tech text-rose-500/90 tracking-widest uppercase">
        Academic & Theoretical Foundation
      </div>

      <div className="space-y-2">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            onClick={() => onSelectCertificate(cert)}
            className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-rose-500/30 transition-all cursor-pointer group"
          >
            <div className="font-body text-xs font-semibold text-zinc-100 group-hover:text-rose-200 transition-colors">
              {cert.title}
            </div>
            <div className="flex items-center justify-between text-[11px] font-body text-zinc-400 mt-1">
              <span>{cert.issuer}</span>
              <span className="font-tech text-[10px] text-zinc-500">{cert.issueDate}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-1.5 flex items-center justify-between border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => certificates[0] && onSelectCertificate(certificates[0])}
          className="group inline-flex items-center gap-1.5 text-xs font-body text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>Inspect Academic Background</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
