import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Close, Printer, BookOpen, Layers, Briefcase, Award } from '../icons';
import { NodeData } from '../../types';
import { playSound } from '../../lib/sound';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: NodeData[];
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, nodes }) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [animState, setAnimState] = useState<'closed' | 'entering' | 'open' | 'closing'>(
    isOpen ? 'open' : 'closed'
  );
  const [isContentVisible, setIsContentVisible] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize opening and closing states with smooth transitions
  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsMounted(true);
      setAnimState('entering');
      setIsContentVisible(false);

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        setAnimState('open');
        setIsContentVisible(true);
        return;
      }

      // RAF queue to trigger browser reflow and smooth CSS transition
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setAnimState('open');
        });
        return () => cancelAnimationFrame(raf2);
      });

      const contentTimer = setTimeout(() => {
        setIsContentVisible(true);
      }, 70);

      return () => {
        cancelAnimationFrame(raf1);
        clearTimeout(contentTimer);
      };
    } else {
      // If isOpen was toggled to false from outside
      if (animState !== 'closed') {
        setIsMounted(false);
        setAnimState('closed');
        setIsContentVisible(false);
      }
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (animState === 'closing' || animState === 'closed') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      playSound('close');
      onClose();
      return;
    }

    setAnimState('closing');
    setIsContentVisible(false);
    playSound('close');

    closeTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      setAnimState('closed');
      onClose();
    }, 240);
  }, [animState, onClose]);

  // Clean up any dangling timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Keyboard shortcut (Escape) listener
  useEffect(() => {
    if (!isMounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, handleClose]);

  if (!isMounted) return null;

  const profileNode = nodes.find((n) => n.id === 'node-profile')?.profile;
  const credNode = nodes.find((n) => n.id === 'node-credentials')?.certificates || [];
  const modelsSkills = nodes.find((n) => n.id === 'node-models')?.skills || [];
  const systemsSkills = nodes.find((n) => n.id === 'node-systems')?.skills || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Curriculum Vitae / Specification"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none font-body"
    >
      {/* Deep dark backdrop with subtle dots overlay */}
      <div
        style={{
          opacity: animState === 'open' ? 1 : 0,
          transition:
            animState === 'closing'
              ? 'opacity 200ms ease-in'
              : 'opacity 280ms ease-out',
        }}
        className="absolute inset-0 bg-[#090b10]/85 backdrop-blur-md cursor-pointer"
        onClick={handleClose}
      />
      <div
        style={{
          opacity: animState === 'open' ? 0.35 : 0,
          transition:
            animState === 'closing'
              ? 'opacity 180ms ease-in'
              : 'opacity 280ms ease-out',
        }}
        className="absolute inset-0 bg-canvas-dots-overlay pointer-events-none"
        aria-hidden="true"
      />

      {/* Architectural CV Chassis Card */}
      <div
        style={{
          transform:
            animState === 'open'
              ? 'translateY(0) scale(1)'
              : animState === 'closing'
              ? 'translateY(-14px) scale(0.97)'
              : 'translateY(-22px) scale(0.95)',
          opacity: animState === 'open' ? 1 : 0,
          transition:
            animState === 'closing'
              ? 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-in'
              : animState === 'open'
              ? 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease-out'
              : 'none',
          willChange: 'transform, opacity',
        }}
        className="relative w-full max-w-3xl max-h-[88dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl bg-[#0c0e14] border border-white/[0.14] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(225,29,72,0.12)] p-4 sm:p-8 text-zinc-200 z-10 resume-paper pb-[calc(env(safe-area-inset-bottom,0px)+24px)] sm:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Crimson Laser Horizon Indicator */}
        <div
          className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_14px_#f43f5e] z-30 transition-opacity duration-300 ${
            isContentVisible ? 'opacity-100' : 'opacity-40'
          }`}
        />

        {/* Technical Corner Registration Reticles */}
        <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-rose-500/40 pointer-events-none" />
        <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-rose-500/40 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-rose-500/40 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-rose-500/40 pointer-events-none" />

        {/* Top bar actions */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(6px)',
            transition:
              'opacity 260ms ease 40ms, transform 260ms cubic-bezier(0.16, 1, 0.3, 1) 40ms',
          }}
          className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-white/[0.08] gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-body font-bold text-rose-400 tracking-[0.16em] sm:tracking-[0.22em] uppercase truncate">
              Curriculum Vitae / Specification
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print or export CV to PDF"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-zinc-200 text-[11px] sm:text-xs font-body font-semibold transition-all border border-white/[0.08] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden min-[360px]:inline">Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close CV modal"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Close className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Header with Avatar & Details */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(8px)',
            transition:
              'opacity 280ms ease 80ms, transform 280ms cubic-bezier(0.16, 1, 0.3, 1) 80ms',
          }}
          className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-white/[0.08]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-white/20 bg-white/[0.04] shadow-lg shrink-0">
              <img
                src={profileNode?.avatar || '/assets/shubham_photo.jpg'}
                alt={profileNode?.name || 'Shubham Sharma'}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl sm:text-3xl text-white font-bold tracking-tight uppercase leading-tight">
                {profileNode?.name}
              </h2>
              <p className="font-body text-xs sm:text-sm text-rose-400 font-semibold mt-0.5">
                AI &amp; Data Science Scholar • IIT Jodhpur
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[11px] sm:text-xs text-zinc-400 font-medium mt-1.5">
                <span>{profileNode?.email}</span>
                <span>•</span>
                <span>{profileNode?.phone || '+91 8882082760'}</span>
                <span>•</span>
                <span>{profileNode?.location}</span>
              </div>
            </div>
          </div>

          {/* Career Objective Banner */}
          <div className="mt-3.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] font-display font-bold uppercase tracking-wider text-rose-400 mb-0.5">
              Career Objective
            </div>
            <p className="font-body text-xs text-zinc-300 italic leading-relaxed m-0">
              &ldquo;I work for a research-oriented approach towards a descriptive data-driven environment that focuses on purpose rather than just plain definition.&rdquo;
            </p>
          </div>
        </div>

        {/* Academic Foundation */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(10px)',
            transition:
              'opacity 300ms ease 120ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) 120ms',
          }}
          className="mb-5 sm:mb-6"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-display text-white font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span>Academic Foundation &amp; Credentials</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {credNode.map((c) => (
              <div
                key={c.id}
                className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex justify-between items-baseline">
                  <div className="font-body text-xs sm:text-sm font-semibold text-zinc-100">{c.title}</div>
                </div>
                <div className="font-body text-[11px] sm:text-xs text-rose-400 mt-0.5 font-medium">
                  {c.issuer}
                </div>
                <div className="font-body text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 font-medium">
                  {c.issueDate} &bull; <span className="text-zinc-300 font-semibold">{c.credentialId}</span>
                </div>
                <p className="font-body text-xs text-zinc-300 mt-1.5 leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Work & Research Experience */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(11px)',
            transition:
              'opacity 310ms ease 140ms, transform 310ms cubic-bezier(0.16, 1, 0.3, 1) 140ms',
          }}
          className="mb-5 sm:mb-6"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-display text-white font-bold uppercase tracking-wider mb-3">
            <Briefcase className="w-4 h-4 text-rose-400" />
            <span>Work &amp; Research Experience</span>
          </div>
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Research &amp; Data Science &bull; Internship
                </span>
                <span className="font-body text-[10px] sm:text-xs text-rose-400 font-semibold">
                  Jun 2026 — Present
                </span>
              </div>
              <div className="font-body text-xs text-zinc-400 font-medium mt-0.5">
                Doingly Analysis &amp; Consultancy &bull; Delhi, India
              </div>
              <ul className="list-disc list-inside text-xs text-zinc-300 mt-2 space-y-1 pl-0.5 leading-relaxed">
                <li>Conduct research, quantitative exploratory analysis, and data modeling for active client consulting projects.</li>
                <li>Analyze enterprise data to uncover patterns, anomalies, and actionable practical recommendations.</li>
                <li>Utilize Python and data science paradigms for statistical inference, validation, and rapid experimentation.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Core Team Member
                </span>
                <span className="font-body text-[10px] sm:text-xs text-rose-400 font-semibold">
                  Feb 2026 — Present
                </span>
              </div>
              <div className="font-body text-xs text-zinc-400 font-medium mt-0.5">
                Visible Logic Labs &bull; Virtual / Remote
              </div>
              <ul className="list-disc list-inside text-xs text-zinc-300 mt-2 space-y-1 pl-0.5 leading-relaxed">
                <li>Support marketing, growth, and user outreach initiatives to scale technical product adoption and community reach.</li>
                <li>Author and maintain high-standard technical documentation, API specifications, and architecture briefs.</li>
                <li>Collaborate cross-functionally on product feature ideation, UX flows, and robust user-centric solutions.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Capabilities */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(12px)',
            transition:
              'opacity 320ms ease 160ms, transform 320ms cubic-bezier(0.16, 1, 0.3, 1) 160ms',
          }}
          className="mb-5 sm:mb-6"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-display text-white font-bold uppercase tracking-wider mb-3">
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Technical Capabilities</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Python',
              'SQL',
              'C++',
              'TypeScript',
              'PyTorch',
              'NumPy / SciPy',
              'Data Analytics',
              'Data Engineering',
              'Data Cleaning',
              'Data Manipulation',
              'Web Development',
              'UI & UX Design',
              'RESTful APIs',
              'Problem Solving',
              'Technical Writing',
            ].map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-body font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(14px)',
            transition:
              'opacity 340ms ease 200ms, transform 340ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
          }}
          className="mb-5 sm:mb-6"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-display text-white font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span>Featured Engineering &amp; Research Projects</span>
          </div>
          <div className="space-y-3">
            {/* Nirogshaala */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Full-stack Consultation Website (Nirogshaala)
                </span>
                <span className="font-body text-[10px] sm:text-xs text-rose-400 font-semibold uppercase">
                  Apr 2026 — Sep 2026
                </span>
              </div>
              <p className="font-body text-xs sm:text-[13px] text-zinc-300 mt-1.5 leading-relaxed">
                Designed and developed the Nirogshaala healthcare platform with a clean, responsive interface and intuitive UX. Engineered responsive layouts for mobile, tablet, and desktop viewports, with focus on performance and usability.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'UI/UX Design', 'REST API'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-400 font-tech">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Latent Graph Visualizer */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Latent Graph Visualizer
                </span>
                <span className="font-body text-[10px] sm:text-xs text-rose-400 font-semibold uppercase">
                  Interactive Manifold Explorer
                </span>
              </div>
              <p className="font-body text-xs sm:text-[13px] text-zinc-300 mt-1.5 leading-relaxed">
                Interactive computational workspace mapping continuous latent spaces to discrete topological clusters. Parametric traversal, dimensionality reduction (UMAP/t-SNE), and WebGL manifold projection.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {['PyTorch', 'WebGL', 'UMAP', 't-SNE', 'Embedding Topology'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-400 font-tech">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* First-Principles Autograd */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  First-Principles Autograd Engine
                </span>
                <span className="font-body text-[10px] sm:text-xs text-rose-400 font-semibold uppercase">
                  Reverse-Mode Tape
                </span>
              </div>
              <p className="font-body text-xs sm:text-[13px] text-zinc-300 mt-1.5 leading-relaxed">
                Constructed scalar and tensor autograd engine from scratch in Python with C++ extension. Built dynamic DAG topological sort and reverse-mode derivative accumulation.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {['Python', 'C++', 'DAG Topological Sort', 'Autograd Tape', 'Memory Management'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-400 font-tech">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Extracurricular & Achievements */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(16px)',
            transition:
              'opacity 360ms ease 220ms, transform 360ms cubic-bezier(0.16, 1, 0.3, 1) 220ms',
          }}
          className="mb-2"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-display text-white font-bold uppercase tracking-wider mb-3">
            <Award className="w-4 h-4 text-rose-400" />
            <span>Extracurricular Initiatives &amp; Honors</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="font-body text-xs font-bold text-zinc-200">
                EV Braking Efficiency Startup &bull; IIT Jodhpur
              </div>
              <p className="font-body text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                Core Team Member investigating regenerative thermodynamics to convert braking friction into electrical energy for extending EV range.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="font-body text-xs font-bold text-zinc-200">
                10+ Hackathons &bull; Academic Student of the Year
              </div>
              <p className="font-body text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                Competed in 10+ hackathons across AI &amp; Web; Awarded Academic Student of the Year in high school for exceptional performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
