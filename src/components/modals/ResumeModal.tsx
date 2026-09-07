import React from 'react';
import { X, Printer, Award, BookOpen, Layers } from 'lucide-react';
import { NodeData } from '../../types';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: NodeData[];
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, nodes }) => {
  if (!isOpen) return null;

  const profileNode = nodes.find((n) => n.id === 'node-profile')?.profile;
  const credNode = nodes.find((n) => n.id === 'node-credentials')?.certificates || [];
  const modelsSkills = nodes.find((n) => n.id === 'node-models')?.skills || [];
  const systemsSkills = nodes.find((n) => n.id === 'node-systems')?.skills || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#09090b] border border-white/10 p-8 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar actions */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06]">
          <div className="text-[10px] font-tech text-rose-500/90 tracking-widest uppercase">
            Curriculum Vitae / Specification
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-body transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="mb-6 pb-6 border-b border-white/[0.06]">
          <h2 className="font-display text-3xl text-white tracking-wide">{profileNode?.name}</h2>
          <p className="font-body text-sm text-rose-400 font-medium mt-1">{profileNode?.role}</p>
          <p className="font-tech text-xs text-zinc-500 mt-1">
            {profileNode?.location} • {profileNode?.email}
          </p>
          <p className="font-body text-xs text-zinc-300 mt-3 max-w-2xl leading-relaxed">
            {profileNode?.bio}
          </p>
        </div>

        {/* Academic & Theoretical Foundation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-tech text-rose-400 uppercase tracking-widest mb-3">
            <BookOpen className="w-4 h-4" />
            <span>Academic & Theoretical Foundation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {credNode.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="font-body text-xs font-semibold text-zinc-100">{c.title}</div>
                <div className="font-body text-[11px] text-zinc-400 mt-0.5">
                  {c.issuer} • {c.issueDate}
                </div>
                <p className="font-body text-xs text-zinc-400 mt-2 leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-tech text-zinc-400 uppercase tracking-widest mb-3">
            <Layers className="w-4 h-4" />
            <span>Technical Capabilities</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[...modelsSkills, ...systemsSkills].map((s) => (
              <span
                key={s.name}
                className="px-2.5 py-1 rounded text-xs font-tech bg-white/[0.03] text-zinc-300 border border-white/[0.06]"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
