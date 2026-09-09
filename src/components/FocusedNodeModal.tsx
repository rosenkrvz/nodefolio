import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NodeData, ProjectItem, CertificateItem, Connection } from '../types';
import { AnalogClock } from './AnalogClock';
import { ResearchMiniVisualizer } from './nodes/ResearchMiniVisualizer';
import { playSound } from '../lib/sound';
import {
  Close,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Activity,
  Globe,
  Clock,
  ShieldCheck,
  Award,
  Copy,
  Check,
  Layers,
  Cpu,
  Binary,
  Database,
  Code,
  User,
  Mail,
  FileText,
  Terminal,
  Sliders,
  Compass,
  Sparkles,
  BarChart,
  Trash,
} from './icons';

interface FocusedNodeModalProps {
  node: NodeData | null;
  originRect?: { left: number; top: number; width: number; height: number } | null;
  connections?: Connection[];
  onClose: () => void;
  onOpenProjectDetail?: (project: ProjectItem) => void;
  onOpenCertificateDetail?: (cert: CertificateItem) => void;
  onOpenContact?: () => void;
  onOpenResume?: () => void;
  onFocusNode?: (nodeId: string) => void;
  onDeleteVisitorNode?: (id: string) => void;
}

export const FocusedNodeModal: React.FC<FocusedNodeModalProps> = ({
  node,
  originRect,
  connections = [],
  onClose,
  onOpenProjectDetail,
  onOpenCertificateDetail,
  onOpenContact,
  onOpenResume,
  onFocusNode,
  onDeleteVisitorNode,
}) => {
  const chassisRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState('');
  const [clockDate, setClockDate] = useState('');
  const [timeZone, setTimeZone] = useState('');

  // Animation lifecycle state: 'mounting' | 'open' | 'closing'
  const [animState, setAnimState] = useState<'mounting' | 'open' | 'closing'>('mounting');
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [transformStyle, setTransformStyle] = useState<{
    transform: string;
    opacity: number;
  }>({
    transform: 'translate3d(0, 16px, 0) scale(0.96)',
    opacity: 0,
  });

  // Calculate origin transform and trigger entry animation
  useEffect(() => {
    if (!node) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setTransformStyle({
        transform: 'none',
        opacity: 1,
      });
      setAnimState('open');
      setIsContentVisible(true);
      return;
    }

    const chassis = chassisRef.current;
    let dx = 0;
    let dy = 16;
    let sx = 0.94;
    let sy = 0.94;

    if (originRect && chassis) {
      const chassisRect = chassis.getBoundingClientRect();
      if (chassisRect.width > 0 && chassisRect.height > 0) {
        const nodeCenterX = originRect.left + originRect.width / 2;
        const nodeCenterY = originRect.top + originRect.height / 2;
        const chassisCenterX = chassisRect.left + chassisRect.width / 2;
        const chassisCenterY = chassisRect.top + chassisRect.height / 2;

        dx = Math.round(nodeCenterX - chassisCenterX);
        dy = Math.round(nodeCenterY - chassisCenterY);
        sx = Math.max(0.28, Math.min(1, originRect.width / chassisRect.width));
        sy = Math.max(0.22, Math.min(1, originRect.height / chassisRect.height));
      }
    }

    // Phase 1: Set initial transformed origin state
    setTransformStyle({
      transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
      opacity: 0.45,
    });
    setAnimState('mounting');
    setIsContentVisible(false);

    // Phase 2: Morph smoothly to full modal position
    let contentTimer: ReturnType<typeof setTimeout>;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransformStyle({
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          opacity: 1,
        });
        setAnimState('open');

        // Phase 3: Staggered internal content revelation
        contentTimer = setTimeout(() => {
          setIsContentVisible(true);
        }, 90);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (contentTimer) clearTimeout(contentTimer);
    };
  }, [node, originRect]);

  // Coordinated closing sequence back toward origin
  const handleClose = useCallback(
    (callback?: () => void) => {
      if (animState === 'closing') return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        playSound('close');
        onClose();
        callback?.();
        return;
      }

      setAnimState('closing');
      setIsContentVisible(false);
      playSound('close');

      const chassis = chassisRef.current;
      let dx = 0;
      let dy = 16;
      let sx = 0.94;
      let sy = 0.94;

      if (originRect && chassis) {
        const chassisRect = chassis.getBoundingClientRect();
        if (chassisRect.width > 0 && chassisRect.height > 0) {
          const nodeCenterX = originRect.left + originRect.width / 2;
          const nodeCenterY = originRect.top + originRect.height / 2;
          const chassisCenterX = chassisRect.left + chassisRect.width / 2;
          const chassisCenterY = chassisRect.top + chassisRect.height / 2;

          dx = Math.round(nodeCenterX - chassisCenterX);
          dy = Math.round(nodeCenterY - chassisCenterY);
          sx = Math.max(0.28, Math.min(1, originRect.width / chassisRect.width));
          sy = Math.max(0.22, Math.min(1, originRect.height / chassisRect.height));
        }
      }

      setTransformStyle({
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
        opacity: 0,
      });

      const timer = setTimeout(() => {
        onClose();
        callback?.();
      }, 260);

      return () => clearTimeout(timer);
    },
    [animState, onClose, originRect]
  );

  // Keyboard accessibility: Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Live chronometer tick for Clock Node
  useEffect(() => {
    if (!node || node.category !== 'clock') return;
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setClockDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [node]);

  if (!node) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find incoming & outgoing connection paths for topological routing ledger
  const incomingConns = connections.filter((c) => c.toNodeId === node.id);
  const outgoingConns = connections.filter((c) => c.fromNodeId === node.id);

  // Status badge label per category
  const getStatusBadge = () => {
    switch (node.category) {
      case 'profile':
        return { label: 'IDENTITY CORE', state: 'ONLINE', pulse: true };
      case 'project':
        return { label: 'LIVE ARTIFACT', state: '512-D MANIFOLD', pulse: true };
      case 'skills':
        return { label: 'COMPUTATIONAL STACK', state: 'COMPILED', pulse: false };
      case 'certificates':
        return { label: 'FORMAL RIGOR', state: 'VERIFIED', pulse: false };
      case 'clock':
        return { label: 'QUARTZ REF', state: '60 HZ SYNC', pulse: true };
      case 'statistics':
        return { label: 'PROBABILISTIC INFERENCE', state: 'CALIBRATED', pulse: true };
      case 'optimization':
        return { label: 'OBJECTIVE DYNAMICS', state: 'CONVERGING', pulse: true };
      case 'pipeline':
        return { label: 'STREAM INGESTION', state: '420 MB/S', pulse: true };
      case 'evaluation':
        return { label: 'MODEL BENCHMARKS', state: 'AUDITED', pulse: false };
      case 'vectors':
        return { label: 'HNSW MANIFOLD', state: '1536-D', pulse: true };
      case 'vision':
        return { label: 'SPATIAL EXTRACTION', state: 'ViT-B/16', pulse: false };
      case 'generative':
        return { label: 'SCORE DIFFUSION', state: 'SDE ACTIVE', pulse: true };
      case 'software':
        return { label: 'SYSTEM RUNTIME', state: 'p99 14MS', pulse: true };
      case 'experiment':
        return { label: 'STRESS LAB', state: 'CONTINUOUS', pulse: true };
      case 'computational':
        return { label: 'ROOFLINE ACCEL', state: 'BF16 TENSORS', pulse: true };
      case 'visitor':
        return { label: 'VISITOR CONTRIBUTION', state: 'SAVED', pulse: false };
      default:
        return { label: 'SYSTEM COMPONENT', state: 'ACTIVE', pulse: false };
    }
  };

  const status = getStatusBadge();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detailed technical artifact: ${node.title}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 md:p-10 select-none"
    >
      {/* Deep dark backdrop maintaining spatial awareness of the graph behind it */}
      <div
        style={{
          opacity: animState === 'open' ? 1 : 0,
          transition: 'opacity 260ms ease-out',
        }}
        className="absolute inset-0 bg-[#090b10]/85 backdrop-blur-md cursor-pointer"
        onClick={() => handleClose()}
      />
      <div
        style={{
          opacity: animState === 'open' ? 0.35 : 0,
          transition: 'opacity 260ms ease-out',
        }}
        className="absolute inset-0 bg-canvas-dots-overlay pointer-events-none"
        aria-hidden="true"
      />

      {/* Architectural Inspection Chassis */}
      <div
        ref={chassisRef}
        style={{
          transform: transformStyle.transform,
          opacity: transformStyle.opacity,
          transformOrigin: 'center center',
          transition:
            animState === 'closing'
              ? 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease-in'
              : animState === 'open'
              ? 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease-out'
              : 'none',
          willChange: 'transform, opacity',
        }}
        className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-[28px] sm:rounded-[26px] bg-[#0c0e14] border-t sm:border border-white/[0.14] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(225,29,72,0.12)] z-10 font-body overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+8px)] sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden w-12 h-1 rounded-full bg-white/20 mx-auto mt-2.5 -mb-1 shrink-0" />
        {/* Top Crimson Laser Horizon Indicator */}
        <div
          className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_14px_#f43f5e] z-30 transition-opacity duration-300 ${
            isContentVisible ? 'opacity-100' : 'opacity-60'
          }`}
        />

        {/* Technical Corner Registration Reticles */}
        <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-rose-500/40 pointer-events-none" />
        <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-rose-500/40 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-rose-500/40 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-rose-500/40 pointer-events-none" />

        {/* ═══════════ UNIFIED INSPECTION HEADER ═══════════ */}
        <header className="shrink-0 px-6 sm:px-8 pt-6 pb-5 border-b border-white/[0.08] bg-white/[0.01]">
          {/* Metadata Eyebrow Row */}
          <div
            style={{
              opacity: isContentVisible ? 1 : 0,
              transform: isContentVisible ? 'translateY(0)' : 'translateY(5px)',
              transition: 'opacity 260ms ease 40ms, transform 260ms cubic-bezier(0.16, 1, 0.3, 1) 40ms',
            }}
            className="flex items-center justify-between gap-4 mb-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-2 h-2 rounded-full ${
                  status.pulse
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                    : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                }`}
              />
              <span className="font-body text-[11px] font-semibold text-rose-400 uppercase tracking-[0.25em] truncate">
                {node.category} &bull; ARTIFACT {node.id.toUpperCase()}
              </span>
              <span className="text-zinc-600 hidden sm:inline">&bull;</span>
              <span className="text-zinc-400 text-[10px] font-tech uppercase tracking-widest hidden sm:inline">
                LAYER 01 / SPATIAL SPEC
              </span>
            </div>

            {/* Right Header Status & Dismissal */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden xs:flex sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-tech text-zinc-300 uppercase tracking-wider">
                <span className="text-rose-400 font-bold">{status.label}:</span>
                <span className="text-zinc-200">{status.state}</span>
              </div>

              <button
                type="button"
                onClick={() => handleClose()}
                aria-label="Close inspection panel"
                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl sm:rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-zinc-300 hover:text-white border border-white/12 transition-colors cursor-pointer"
                title="Close inspection (ESC)"
              >
                <Close className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Monumental Headline Title */}
          <div
            style={{
              opacity: isContentVisible ? 1 : 0,
              transform: isContentVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 280ms ease 80ms, transform 280ms cubic-bezier(0.16, 1, 0.3, 1) 80ms',
            }}
            className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
          >
            <div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight uppercase leading-none">
                {node.title}
              </h2>
              {node.subtitle && (
                <p className="font-body text-xs sm:text-sm text-zinc-400 font-medium mt-1.5 tracking-wide">
                  {node.subtitle}
                </p>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <span className="font-tech text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.2em] block">
                COORD: [{Math.round(node.x)}, {Math.round(node.y)}]
              </span>
              <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">
                WIDTH: {node.width}PX &bull; PORTS: {(node.inputs?.length || 0) + (node.outputs?.length || 0)}
              </span>
            </div>
          </div>
        </header>

        {/* ═══════════ ARTIFACT CONTENT VIEWPORT (SCROLLABLE) ═══════════ */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 300ms ease 130ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) 130ms',
          }}
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6"
        >
          {/* -------------------------------------------------------------
              1. PROFILE NODE ARTIFACT VIEW
             ------------------------------------------------------------- */}
          {node.category === 'profile' && node.profile && (
            <div className="space-y-6">
              {/* Personal Thesis Statement Quote */}
              <div className="relative pl-5 border-l-2 border-rose-500/60 bg-white/[0.015] py-3 pr-4 rounded-r-xl">
                <p className="font-body text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                  "{node.profile.bio}"
                </p>
              </div>

              {/* Research Focus Pillars (Sleek technical specification grid) */}
              <div>
                <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  <span>CORE RESEARCH PILLARS &amp; SPECIALIZATION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {node.profile.stats?.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
                    >
                      <div className="font-body text-[10px] text-rose-400 font-semibold uppercase tracking-[0.2em]">
                        {st.label}
                      </div>
                      <div className="font-display text-base sm:text-lg font-bold text-white uppercase tracking-wide mt-1.5">
                        {st.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location, Availability & Communication Ledger */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-400">
                    RESEARCH AVAILABILITY
                  </div>
                  <div className="font-body text-xs text-zinc-200 font-medium">
                    {node.profile.location}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {onOpenContact && (
                    <button
                      type="button"
                      onClick={onOpenContact}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(225,29,72,0.35)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact &amp; Inquire</span>
                    </button>
                  )}

                  {onOpenResume && (
                    <button
                      type="button"
                      onClick={onOpenResume}
                      className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.12] font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span>Full Curriculum Vitae</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              2. SKILLS / COMPUTATIONAL PIPELINE STAGES VIEW
             ------------------------------------------------------------- */}
          {node.category === 'skills' && node.skills && (
            <div className="space-y-5">
              {/* Section Header with technical index */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  <span>COMPUTATIONAL MODULES &bull; {node.skills.length} OPERATIONAL STAGES</span>
                </div>
                <div className="font-tech text-[10px] text-zinc-400 tracking-widest uppercase">
                  ARCHITECTURE VERIFIED &bull; LATENT OPS
                </div>
              </div>

              {/* Sophisticated Module Ledger (Replaces generic SaaS progress bars) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {node.skills.map((sk, idx) => (
                  <div
                    key={sk.name}
                    className="p-4 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/[0.18] transition-all relative overflow-hidden group"
                  >
                    {/* Stage Eyebrow & Category */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-tech text-[10px] font-bold text-rose-400 tracking-wider uppercase">
                          STAGE 0{idx + 1}
                        </span>
                        <span className="text-zinc-600">&bull;</span>
                        <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">
                          {sk.category}
                        </span>
                      </div>

                      {/* Discrete Benchmark Metric (Editorial/Technical rather than cartoon progress bar) */}
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-tech text-[10px] font-semibold text-zinc-300">
                        {sk.level}% BENCH
                      </span>
                    </div>

                    {/* Module Title */}
                    <h3 className="font-display text-base font-bold text-white tracking-wide uppercase mb-3 group-hover:text-rose-100 transition-colors">
                      {sk.name}
                    </h3>

                    {/* Runtime Dependencies / Capability Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sk.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] font-tech text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              3. PROJECT / RESEARCH ARTIFACT VIEW
             ------------------------------------------------------------- */}
          {node.category === 'project' && node.project && (
            <div className="space-y-6">
              {/* Embedded Computational Artifact Viewport */}
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] bg-black/60 shadow-2xl">
                {/* Viewport Header Reticle */}
                <div className="flex items-center justify-between px-4 py-2 bg-black/80 border-b border-white/[0.08] text-[10px] font-tech text-zinc-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>EMBEDDED VIEWPORT // ARTIFACT REG: LGV-2026</span>
                  </div>
                  <div>PROJECTION MODE: TOPOLOGICAL MANIFOLD</div>
                </div>

                {/* Viewport Frame with Image and Dimension Overlay */}
                <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={node.project.image}
                    alt={node.project.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                  />
                  {/* Subtle technical coordinate overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-transparent opacity-90" />
                  <div className="absolute inset-0 pointer-events-none bg-canvas-dots-overlay opacity-30" />

                  {/* Corner Target Markings */}
                  <div className="absolute top-3 left-3 font-tech text-[9px] text-white/50 tracking-widest">
                    + X:0.742 Y:0.318 Z:0.912
                  </div>
                  <div className="absolute top-3 right-3 font-tech text-[9px] text-white/50 tracking-widest">
                    RESOLUTION: 512-D
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between">
                    <div>
                      <span className="font-tech text-[10px] font-bold text-rose-400 tracking-[0.25em] uppercase block mb-0.5">
                        {node.project.tagline}
                      </span>
                      <span className="font-display text-lg font-bold text-white uppercase tracking-tight">
                        {node.project.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Abstract Description */}
              <div className="space-y-2">
                <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase">
                  RESEARCH ABSTRACT &amp; ARCHITECTURAL THESIS
                </div>
                <p className="font-body text-sm sm:text-[15px] text-zinc-300 leading-relaxed max-w-3xl">
                  {node.project.description}
                </p>
              </div>

              {/* Empirical Metrics Ledger (3 Columns) */}
              {node.project.metrics && (
                <div>
                  <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase mb-2.5">
                    EMPIRICAL MEASUREMENTS &amp; CONVERGENCE
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {node.project.metrics.map((m, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08]"
                      >
                        <div className="font-tech text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                          {m.label}
                        </div>
                        <div className="font-display text-lg font-bold text-white mt-1 uppercase">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies & Inspection Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {node.project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-tech text-zinc-300 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {onOpenProjectDetail && (
                  <button
                    type="button"
                    onClick={() => onOpenProjectDetail(node.project!)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_16px_rgba(225,29,72,0.35)] active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>Inspect Full Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              4. ACADEMIC & THEORETICAL FOUNDATION VIEW
             ------------------------------------------------------------- */}
          {node.category === 'certificates' && node.certificates && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-rose-400" />
                  <span>THEORETICAL FOUNDATION &bull; FORMAL CURRICULUM</span>
                </div>
                <div className="font-tech text-[10px] text-zinc-400 tracking-widest uppercase">
                  ACADEMIC RIGOR
                </div>
              </div>

              {/* Curriculum Cards */}
              <div className="space-y-4">
                {node.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
                      <div>
                        <span className="font-tech text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">
                          {cert.issuer}
                        </span>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
                          {cert.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-tech text-[10px] text-zinc-400 uppercase px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                          {cert.issueDate}
                        </span>
                      </div>
                    </div>

                    <p className="font-body text-sm text-zinc-300 leading-relaxed">
                      {cert.description}
                    </p>

                    {/* Competency tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-tech text-zinc-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Verification Actions */}
                    <div className="pt-2 flex items-center justify-between text-xs font-tech text-zinc-400">
                      <button
                        type="button"
                        onClick={() => handleCopy(cert.credentialId, cert.id)}
                        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === cert.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-rose-400 font-semibold">COPIED REF</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>REF: {cert.credentialId}</span>
                          </>
                        )}
                      </button>

                      {onOpenCertificateDetail && (
                        <button
                          type="button"
                          onClick={() => onOpenCertificateDetail(cert)}
                          className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold tracking-wider uppercase cursor-pointer"
                        >
                          <span>Inspect Credential</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              5. SYSTEM CHRONOMETER NODE VIEW
             ------------------------------------------------------------- */}
          {node.category === 'clock' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>TEMPORAL COORDINATES &bull; SYSTEM CHRONOMETER</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-tech uppercase tracking-widest font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>LIVE OSCILLATION</span>
                </div>
              </div>

              {/* Instrument Bezel with Analog Clock and Telemetry Display */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-black/50 border border-white/[0.10]">
                {/* Left: Mechanical Analog Clock Face */}
                <div className="md:col-span-5 flex items-center justify-center py-4">
                  <div className="p-3 rounded-full bg-white/[0.02] border border-white/[0.10] shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                    <AnalogClock scale={1.1} />
                  </div>
                </div>

                {/* Right: Digital Real-Time Telemetry Breakdown */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <div className="font-tech text-[10px] text-zinc-400 tracking-[0.2em] uppercase mb-1">
                      LOCAL SYNCHRONIZED TIME
                    </div>
                    <div className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
                      {clockTime || '12:00:00 PM'}
                    </div>
                    <div className="font-body text-sm text-zinc-400 font-medium mt-1">
                      {clockDate}
                    </div>
                  </div>

                  {/* Telemetry metrics row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">
                        TIMEZONE
                      </div>
                      <div className="font-tech text-xs text-white font-semibold mt-1 truncate">
                        {timeZone || 'UTC'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">
                        DRIFT STABILITY
                      </div>
                      <div className="font-tech text-xs text-rose-400 font-semibold mt-1 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-rose-500 animate-pulse" />
                        <span>&plusmn;0.002 ms (QUARTZ)</span>
                      </div>
                    </div>
                  </div>

                  <p className="font-body text-xs text-zinc-400 leading-relaxed">
                    Provides continuous deterministic timestamp coordination across interactive graph splines, simulated neural pulses, and temporal journal records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              6. EXPANDED FIRST-CLASS RESEARCH ARTIFACT VIEW
             ------------------------------------------------------------- */}
          {node.researchData && (
            <div className="space-y-6">
              {/* Abstract Thesis Statement */}
              <div className="relative pl-5 border-l-2 border-rose-500/60 bg-white/[0.015] py-3 pr-4 rounded-r-xl">
                <div className="font-tech text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">
                  ARCHITECTURAL ABSTRACT // {node.researchData.domain}
                </div>
                <p className="font-body text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                  {node.researchData.overview}
                </p>
              </div>

              {/* Technical System Specification Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tech">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">DOMAIN</div>
                  <div className="text-xs font-bold text-zinc-200 mt-1 uppercase">{node.researchData.domain}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">METHOD</div>
                  <div className="text-xs font-bold text-rose-400 mt-1 uppercase">{node.researchData.method}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">STATE</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1 uppercase">{node.researchData.state}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">COMPUTE</div>
                  <div className="text-xs font-bold text-zinc-200 mt-1 uppercase">{node.researchData.compute}</div>
                </div>
              </div>

              {/* Embedded Visualization Viewport */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.10] space-y-2.5">
                <div className="flex items-center justify-between font-tech text-[10px] text-zinc-400 uppercase tracking-widest border-b border-white/[0.06] pb-2">
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    LIVE PARAMETRIC MONITOR
                  </span>
                  <span>SIMULATION ACTIVE</span>
                </div>
                <div className="py-2">
                  <ResearchMiniVisualizer
                    type={node.researchData.visualizationType || 'distribution'}
                    accentColor={node.accentColor}
                  />
                </div>
              </div>

              {/* Empirical Metrics Ledger (if defined) */}
              {node.researchData.metrics && node.researchData.metrics.length > 0 && (
                <div>
                  <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase mb-2.5 flex items-center gap-2">
                    <BarChart className="w-3.5 h-3.5 text-rose-400" />
                    <span>EMPIRICAL BENCHMARKS &amp; TELEMETRY</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {node.researchData.metrics.map((m, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08]">
                        <div className="font-tech text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                          {m.label}
                        </div>
                        <div className="font-display text-base sm:text-lg font-bold text-white mt-1 uppercase">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Computational Details Stages */}
              <div>
                <div className="font-body text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  <span>COMPUTATIONAL MECHANISMS &amp; ALGORITHMIC STAGES</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body">
                  {node.researchData.computationalDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-black/35 border border-white/[0.08] hover:border-white/[0.16] transition-colors flex gap-3"
                    >
                      <span className="font-tech text-xs font-bold text-rose-400 shrink-0 mt-0.5">
                        0{idx + 1}
                      </span>
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-normal">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Connected Nodes */}
              {node.researchData.relatedNodeIds && node.researchData.relatedNodeIds.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest mb-2.5">
                    TOPOLOGICAL CONNECTIONS // RELATED RESEARCH NODES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {node.researchData.relatedNodeIds.map((relId) => (
                      <button
                        key={relId}
                        type="button"
                        onClick={() => {
                          handleClose(() => onFocusNode?.(relId));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 hover:border-rose-500/40 border border-white/[0.08] text-xs font-tech text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span className="uppercase">{relId.replace('node-', '').replace('-', ' ')}</span>
                        <ArrowUpRight className="w-3 h-3 text-rose-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------
              7. VISITOR CONTRIBUTED NODE ARTIFACT VIEW
             ------------------------------------------------------------- */}
          {node.category === 'visitor' && node.visitorData && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-black/50 border border-white/[0.12] space-y-4 font-body">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-tech text-xs font-bold text-rose-400 uppercase tracking-widest">
                      COMMUNITY OBSERVATION &bull; {node.visitorData.category.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-tech text-xs text-zinc-400">
                    {new Date(node.visitorData.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <blockquote className="text-base sm:text-lg text-white font-normal leading-relaxed italic pl-3 border-l-2 border-rose-500">
                  &ldquo;{node.visitorData.message}&rdquo;
                </blockquote>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs font-tech text-zinc-400">
                  <span>CONTRIBUTED BY</span>
                  <span className="text-white font-bold text-sm tracking-wide">
                    {node.visitorData.name}
                  </span>
                </div>

                {onDeleteVisitorNode && (
                  <div className="flex justify-end pt-3 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => {
                        handleClose(() => onDeleteVisitorNode(node.id));
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/60 text-xs font-tech text-rose-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Trash className="w-3.5 h-3.5 text-rose-400" />
                      <span>REMOVE THIS NOTE</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ FOOTER HARDWARE ROUTING LEDGER ═══════════ */}
        <footer
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(5px)',
            transition: 'opacity 260ms ease 170ms, transform 260ms cubic-bezier(0.16, 1, 0.3, 1) 170ms',
          }}
          className="shrink-0 px-6 sm:px-8 py-4 border-t border-white/[0.08] bg-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          {/* Pins & Topological Connectivity Map */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-tech text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 uppercase tracking-wider">INPUT PINS:</span>
              <span className="font-bold text-white">{node.inputs?.length || 0}</span>
              {node.inputs && node.inputs.length > 0 && (
                <span className="text-zinc-500">
                  ({node.inputs.map((p) => p.label).join(', ')})
                </span>
              )}
            </div>

            <span className="text-zinc-700 hidden sm:inline">&bull;</span>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 uppercase tracking-wider">OUTPUT PINS:</span>
              <span className="font-bold text-rose-400">{node.outputs?.length || 0}</span>
              {node.outputs && node.outputs.length > 0 && (
                <span className="text-zinc-500">
                  ({node.outputs.map((p) => p.label).join(', ')})
                </span>
              )}
            </div>
          </div>

          {/* Dismiss Back to Graph Action */}
          <button
            type="button"
            onClick={() => handleClose()}
            className="self-end sm:self-auto px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-rose-600 text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <span>Back to Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </footer>
      </div>
    </div>
  );
};
