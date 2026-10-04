import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NodeData, ProjectItem, CertificateItem, Connection } from '../types';
import { AnalogClock } from './AnalogClock';
import { ResearchMiniVisualizer } from './nodes/ResearchMiniVisualizer';
import { NodeCharacterBanner } from './modals/NodeCharacterBanner';
import { SKILL_CHARACTER_MAP } from '../data/skillsCharacterData';
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
  onOpenResearchCanvas3D?: (phaseId?: string) => void;
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
  onOpenResearchCanvas3D,
}) => {
  const chassisRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState('');
  const [clockDate, setClockDate] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [skillsViewMode, setSkillsViewMode] = useState<'specs' | 'deep' | 'architecture'>('deep');

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
    if (!node || node.id !== 'node-clock') return;
    updateTime();
    const handleVisibility = () => {
      if (!document.hidden) updateTime();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    const timer = setInterval(() => {
      if (!document.hidden) updateTime();
    }, 1000);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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
        className="relative w-full max-w-4xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col rounded-t-xl sm:rounded-lg bg-[#0c0e14] border-t sm:border border-white/[0.14] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(225,29,72,0.10)] z-10 font-body overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden w-10 h-0.5 bg-white/25 mx-auto mt-2.5 -mb-1 shrink-0" />
        {/* Top Crimson Laser Horizon Indicator */}
        <div
          className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] z-30 transition-opacity duration-300 ${
            isContentVisible ? 'opacity-100' : 'opacity-60'
          }`}
        />

        {/* Technical Corner Registration Reticles (Crisp, sharp brackets) */}
        <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-rose-500/60 pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-rose-500/60 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-rose-500/60 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-rose-500/60 pointer-events-none" />

        {/* ═══════════ UNIFIED THEMATIC HERO BANNER & HEADER ═══════════ */}
        <NodeCharacterBanner
          node={node}
          isContentVisible={isContentVisible}
          onClose={() => handleClose()}
          status={status}
        />

        {/* ═══════════ ARTIFACT CONTENT VIEWPORT (SCROLLABLE) ═══════════ */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 300ms ease 130ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) 130ms',
          }}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6"
        >
          {/* -------------------------------------------------------------
              1. PROFILE NODE ARTIFACT VIEW
             ------------------------------------------------------------- */}
          {node.category === 'profile' && node.profile && (
            <div className="space-y-6">
              {/* Personal Thesis Statement Quote (Editorial Lora Serif) */}
              <div className="relative pl-5 border-l-2 border-rose-500 bg-white/[0.015] py-3 pr-4 rounded-r-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                    RESEARCHER STATEMENT // IDENTITY THESIS
                  </div>
                  <div className="font-mono text-[9px] text-zinc-300 tracking-wider uppercase bg-black/60 px-2.5 py-0.5 rounded border border-white/[0.08]">
                    argmax_θ 𝔼[log p_θ(x)] &bull; LATENT REPRESENTATION LEARNING
                  </div>
                </div>
                <p className="font-serif italic text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                  &ldquo;{node.profile.bio}&rdquo;
                </p>
              </div>

              {/* Research Focus Pillars (Sharp technical specification grid) */}
              <div>
                <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  <span>CORE RESEARCH PILLARS &amp; SPECIALIZATION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {node.profile.stats?.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-md bg-black/50 border border-white/[0.10] hover:border-white/[0.20] transition-colors"
                    >
                      <div className="font-mono text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em]">
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
              <div className="p-4 rounded-md bg-black/40 border border-white/[0.10] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">
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
                      className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(225,29,72,0.30)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact &amp; Inquire</span>
                    </button>
                  )}

                  {onOpenResume && (
                    <button
                      type="button"
                      onClick={onOpenResume}
                      className="px-4 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.12] font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
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
              {/* Section Header with technical index & view mode selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-300 uppercase flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  <span>COMPUTATIONAL MODULES &bull; {node.skills.length} OPERATIONAL STAGES</span>
                </div>

                {/* View Mode Switcher: Specs, Deep Telemetry, Architecture */}
                <div className="flex items-center gap-1 p-0.5 rounded bg-black/60 border border-white/[0.10] self-start sm:self-auto font-mono text-[9px]">
                  <button
                    type="button"
                    onClick={() => setSkillsViewMode('deep')}
                    className={`px-2 py-1 rounded transition-colors uppercase font-bold tracking-wider ${
                      skillsViewMode === 'deep'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-2xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Deep Telemetry &amp; Math
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkillsViewMode('specs')}
                    className={`px-2 py-1 rounded transition-colors uppercase font-bold tracking-wider ${
                      skillsViewMode === 'specs'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-2xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Compact Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkillsViewMode('architecture')}
                    className={`px-2 py-1 rounded transition-colors uppercase font-bold tracking-wider ${
                      skillsViewMode === 'architecture'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-2xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Architectural Notes
                  </button>
                </div>
              </div>

              {/* Character-Rich Computational Modules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {node.skills.map((sk, idx) => {
                  const charSpec = SKILL_CHARACTER_MAP[sk.name];
                  const symbol = charSpec?.symbol || '⨂';
                  const badge = charSpec?.badge || `${sk.category.toUpperCase()} PIPELINE`;
                  const formula = charSpec?.formula;
                  const specs = charSpec?.specs || [];
                  const notes = charSpec?.architecturalNotes;

                  return (
                    <div
                      key={sk.name}
                      className="p-4 sm:p-4.5 rounded-lg bg-black/60 border border-white/[0.12] hover:border-rose-500/50 transition-all relative overflow-hidden group shadow-md flex flex-col justify-between gap-3"
                    >
                      {/* Subtle accent corner glow */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />

                      {/* Stage Eyebrow Row: Symbol Chip, Stage Title & Benchmark Meter */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Thematic Character Symbol Badge */}
                            <div className="w-8 h-8 rounded-md bg-rose-500/15 border border-rose-500/35 flex items-center justify-center font-mono text-sm font-bold text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.25)] shrink-0">
                              {symbol}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-bold text-rose-400 tracking-wider uppercase">
                                  STAGE 0{idx + 1}
                                </span>
                                <span className="text-zinc-600">&bull;</span>
                                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest truncate">
                                  {sk.category}
                                </span>
                              </div>
                              <div className="font-mono text-[8px] text-rose-300/80 tracking-wider uppercase truncate">
                                {badge}
                              </div>
                            </div>
                          </div>

                          {/* Benchmark Score Badge */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="px-2 py-0.5 rounded-xs bg-white/[0.05] border border-white/[0.12] font-mono text-[10px] font-bold text-zinc-100 flex items-center gap-1.5 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              {sk.level}% BENCH
                            </span>
                          </div>
                        </div>

                        {/* Benchmark Progress Bar */}
                        <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_8px_#f43f5e] transition-all duration-700 ease-out"
                            style={{ width: `${sk.level}%` }}
                          />
                        </div>

                        {/* Module Title */}
                        <h3 className="font-display text-base font-bold text-white tracking-wide uppercase group-hover:text-rose-100 transition-colors pt-0.5">
                          {sk.name}
                        </h3>
                      </div>

                      {/* Mathematical Formulation (in Deep mode or Specs mode) */}
                      {formula && skillsViewMode !== 'architecture' && (
                        <div className="px-2.5 py-1.5 rounded bg-black/70 border border-white/[0.08] font-mono text-[9.5px] text-rose-300 tracking-wide flex items-center justify-between gap-2 overflow-x-auto">
                          <span className="text-zinc-500 font-bold shrink-0">FORMULA:</span>
                          <span className="truncate text-zinc-200">{formula}</span>
                        </div>
                      )}

                      {/* Deep Technical Specs Grid */}
                      {specs.length > 0 && skillsViewMode !== 'architecture' && (
                        <div className="grid grid-cols-2 gap-1.5 font-mono">
                          {specs.map((sp, sIdx) => (
                            <div
                              key={sIdx}
                              className="px-2 py-1 rounded bg-white/[0.025] border border-white/[0.06] flex flex-col justify-center"
                            >
                              <span className="text-[7.5px] text-rose-400/90 font-bold uppercase tracking-wider">
                                {sp.label}
                              </span>
                              <span className="text-[9.5px] text-zinc-200 font-medium truncate mt-0.5">
                                {sp.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Architectural Insight Note */}
                      {notes && (skillsViewMode === 'deep' || skillsViewMode === 'architecture') && (
                        <p className="font-serif italic text-xs text-zinc-300 leading-relaxed font-normal border-l-2 border-rose-500/40 pl-2.5 py-0.5">
                          {notes}
                        </p>
                      )}

                      {/* Capability / Dependency Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
                        {sk.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-xs bg-white/[0.03] border border-white/[0.08] text-[9.5px] font-mono text-zinc-300 flex items-center gap-1 group-hover:border-white/[0.14] transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-rose-400/60" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              3. PROJECT / RESEARCH ARTIFACT VIEW
             ------------------------------------------------------------- */}
          {node.category === 'project' && node.project && (
            <div className="space-y-6">
              {/* Embedded Computational Artifact Viewport */}
              <div className="relative rounded-lg overflow-hidden border border-white/[0.14] bg-black/80 shadow-2xl">
                {/* Viewport Header Reticle */}
                <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-black/90 border-b border-white/[0.08] text-[9px] font-mono text-zinc-400 uppercase tracking-widest gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 animate-pulse" />
                    <span>EMBEDDED VIEWPORT // ARTIFACT REG: LGV-2026</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-zinc-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08] hidden sm:inline">
                      f: ℝ⁵¹² ↦ ℳ³ &bull; GEODESIC DISTANCE MINIMIZATION
                    </span>
                    <span>PROJECTION MODE: TOPOLOGICAL MANIFOLD</span>
                  </div>
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
                  <div className="absolute top-3 left-3 font-mono text-[9px] text-white/60 tracking-widest">
                    + X:0.742 Y:0.318 Z:0.912
                  </div>
                  <div className="absolute top-3 right-3 font-mono text-[9px] text-white/60 tracking-widest">
                    RESOLUTION: 512-D
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-rose-400 tracking-[0.25em] uppercase block mb-0.5">
                        {node.project.tagline}
                      </span>
                      <span className="font-display text-lg font-bold text-white uppercase tracking-tight">
                        {node.project.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Abstract Description (Editorial Lora Serif) */}
              <div className="space-y-2">
                <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                  RESEARCH ABSTRACT &amp; ARCHITECTURAL THESIS
                </div>
                <p className="font-serif text-sm sm:text-[15px] text-zinc-200 leading-relaxed max-w-3xl font-normal">
                  {node.project.description}
                </p>
              </div>

              {/* Empirical Metrics Ledger (3 Columns with Space Mono) */}
              {node.project.metrics && (
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-2.5">
                    EMPIRICAL MEASUREMENTS &amp; CONVERGENCE
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {node.project.metrics.map((m, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-md bg-black/50 border border-white/[0.10]"
                      >
                        <div className="font-mono text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                          {m.label}
                        </div>
                        <div className="font-mono text-lg font-bold text-white mt-1 uppercase">
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
                      className="px-2.5 py-1 rounded-sm bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-300 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onOpenResearchCanvas3D && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound('select');
                        onClose();
                        onOpenResearchCanvas3D('phase-05');
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-black/80 hover:bg-rose-950/60 border border-rose-500/50 hover:border-rose-500 text-rose-300 hover:text-white font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_14px_rgba(225,29,72,0.25)] active:scale-95 cursor-pointer shrink-0"
                    >
                      <span className="w-1.5 h-1.5 bg-rose-500 animate-pulse" />
                      <span>INSPECT 3D ARTIFACT</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  )}

                  {onOpenProjectDetail && (
                    <button
                      type="button"
                      onClick={() => onOpenProjectDetail(node.project!)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_16px_rgba(225,29,72,0.30)] active:scale-95 cursor-pointer shrink-0"
                    >
                      <span>Inspect Full Case Study</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              4. ACADEMIC & THEORETICAL FOUNDATION VIEW
             ------------------------------------------------------------- */}
          {node.category === 'certificates' && node.certificates && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-2.5 gap-2">
                <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-rose-400" />
                  <span>THEORETICAL FOUNDATION &bull; FORMAL CURRICULUM</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-[9px] text-zinc-300 tracking-wider uppercase bg-black/60 px-2.5 py-0.5 rounded border border-white/[0.08] hidden sm:block">
                    ∀ ϵ &gt; 0 ∃ δ &gt; 0 • ∫_ℳ dω = ∫_{'{'}∂ℳ{'}'} ω • 𝒢 = (𝒱, ℰ, 𝒲)
                  </div>
                  <div className="font-mono text-[10px] text-zinc-400 tracking-widest uppercase">
                    ACADEMIC RIGOR
                  </div>
                </div>
              </div>

              {/* Curriculum Cards (Crisp architectural boxes with academic symbols) */}
              <div className="space-y-4">
                {node.certificates.map((cert) => {
                  const getCertSymbol = () => {
                    if (cert.id === 'acad-iitj') return { symbol: '⌬', badge: 'INSTITUTE OF NATIONAL IMPORTANCE // IIT JODHPUR' };
                    if (cert.id === 'acad-senior-school') return { symbol: '⚜', badge: 'CBSE ALL INDIA SENIOR SCHOOL EXAMINATION' };
                    return { symbol: '★', badge: 'CBSE ALL INDIA SECONDARY EXAMINATION' };
                  };
                  const certMeta = getCertSymbol();

                  return (
                    <div
                      key={cert.id}
                      className="p-5 rounded-lg bg-black/60 border border-white/[0.12] hover:border-rose-500/40 transition-all space-y-4 relative overflow-hidden group shadow-md"
                    >
                      {/* Accent corner glow */}
                      <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Academic Symbol Insignia */}
                          <div className="w-9 h-9 rounded-md bg-rose-500/15 border border-rose-500/35 flex items-center justify-center font-mono text-base font-bold text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)] shrink-0 mt-0.5">
                            {certMeta.symbol}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                                {cert.issuer}
                              </span>
                              <span className="text-zinc-600">&bull;</span>
                              <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-wider">
                                {certMeta.badge}
                              </span>
                            </div>
                            <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-tight leading-snug">
                              {cert.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          <span className="font-mono text-[10px] text-zinc-300 uppercase px-2.5 py-1 rounded bg-white/[0.05] border border-white/[0.10] font-semibold">
                            {cert.issueDate}
                          </span>
                        </div>
                      </div>

                      <p className="font-serif text-sm text-zinc-200 leading-relaxed font-normal">
                        {cert.description}
                      </p>

                      {/* Coursework & Competency Tags */}
                      <div className="space-y-1.5 pt-1">
                        <div className="font-mono text-[8.5px] text-zinc-400 uppercase tracking-widest">
                          CURRICULAR MODULES &amp; FOUNDATIONS:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cert.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-xs bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-300 flex items-center gap-1.5"
                            >
                              <span className="w-1 h-1 rounded-full bg-rose-400" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Verification Actions & Hash Status */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 border-t border-white/[0.06]">
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

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-emerald-400/90 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>VERIFIED RECORD</span>
                          </div>

                          {onOpenCertificateDetail && (
                            <button
                              type="button"
                              onClick={() => onOpenCertificateDetail(cert)}
                              className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-bold tracking-wider uppercase cursor-pointer"
                            >
                              <span>Inspect Credential</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              5. SYSTEM CHRONOMETER NODE VIEW
             ------------------------------------------------------------- */}
          {node.category === 'clock' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-2.5 gap-2">
                <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>TEMPORAL COORDINATES &bull; SYSTEM CHRONOMETER</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-[9px] text-zinc-300 tracking-wider uppercase bg-black/60 px-2.5 py-0.5 rounded border border-white/[0.08] hidden sm:block">
                    y(t) = A sin(2π f₀ t + ϕ) &bull; DRIFT: ±0.002 MS
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                    <span className="w-1.5 h-1.5 bg-rose-500 animate-pulse" />
                    <span>LIVE OSCILLATION</span>
                  </div>
                </div>
              </div>

              {/* Instrument Bezel with Analog Clock and Telemetry Display */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-md bg-black/60 border border-white/[0.10]">
                {/* Left: Mechanical Analog Clock Face */}
                <div className="md:col-span-5 flex items-center justify-center py-4">
                  <div className="p-3 rounded-full bg-white/[0.02] border border-white/[0.10] shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                    <AnalogClock scale={1.1} />
                  </div>
                </div>

                {/* Right: Digital Real-Time Telemetry Breakdown */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <div className="font-mono text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mb-1">
                      LOCAL SYNCHRONIZED TIME
                    </div>
                    <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
                      {clockTime || '12:00:00 PM'}
                    </div>
                    <div className="font-serif italic text-sm text-zinc-300 font-medium mt-1">
                      {clockDate}
                    </div>
                  </div>

                  {/* Telemetry metrics row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.08]">
                      <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                        TIMEZONE
                      </div>
                      <div className="font-mono text-xs text-white font-bold mt-1 truncate">
                        {timeZone || 'UTC'}
                      </div>
                    </div>

                    <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.08]">
                      <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                        DRIFT STABILITY
                      </div>
                      <div className="font-mono text-xs text-rose-400 font-bold mt-1 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-rose-500 animate-pulse" />
                        <span>&plusmn;0.002 ms (QUARTZ)</span>
                      </div>
                    </div>
                  </div>

                  <p className="font-serif text-xs text-zinc-300 leading-relaxed font-normal">
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
              {/* Abstract Thesis Statement (Lora Serif) */}
              <div className="relative pl-5 border-l-2 border-rose-500 bg-white/[0.015] py-3 pr-4 rounded-r-sm">
                <div className="font-mono text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">
                  ARCHITECTURAL ABSTRACT // {node.researchData.domain}
                </div>
                <p className="font-serif italic text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                  {node.researchData.overview}
                </p>
              </div>

              {/* Technical System Specification Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="p-3 rounded-md bg-black/50 border border-white/[0.10]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">DOMAIN</div>
                  <div className="text-xs font-bold text-zinc-200 mt-1 uppercase">{node.researchData.domain}</div>
                </div>
                <div className="p-3 rounded-md bg-black/50 border border-white/[0.10]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">METHOD</div>
                  <div className="text-xs font-bold text-rose-400 mt-1 uppercase">{node.researchData.method}</div>
                </div>
                <div className="p-3 rounded-md bg-black/50 border border-white/[0.10]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">STATE</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1 uppercase">{node.researchData.state}</div>
                </div>
                <div className="p-3 rounded-md bg-black/50 border border-white/[0.10]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">COMPUTE</div>
                  <div className="text-xs font-bold text-zinc-200 mt-1 uppercase">{node.researchData.compute}</div>
                </div>
              </div>

              {/* Embedded Visualization Viewport */}
              <div className="p-4 rounded-md bg-black/60 border border-white/[0.10] space-y-2.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase tracking-widest border-b border-white/[0.06] pb-2">
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

              {/* Empirical Metrics Ledger (Space Mono) */}
              {node.researchData.metrics && node.researchData.metrics.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-2.5 flex items-center gap-2">
                    <BarChart className="w-3.5 h-3.5 text-rose-400" />
                    <span>EMPIRICAL BENCHMARKS &amp; TELEMETRY</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {node.researchData.metrics.map((m, i) => (
                      <div key={i} className="p-3.5 rounded-md bg-black/50 border border-white/[0.10]">
                        <div className="font-mono text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                          {m.label}
                        </div>
                        <div className="font-mono text-base sm:text-lg font-bold text-white mt-1 uppercase">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Computational Details Stages */}
              <div>
                <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  <span>COMPUTATIONAL MECHANISMS &amp; ALGORITHMIC STAGES</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {node.researchData.computationalDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-md bg-black/40 border border-white/[0.08] hover:border-white/[0.18] transition-colors flex gap-3"
                    >
                      <span className="font-mono text-xs font-bold text-rose-400 shrink-0 mt-0.5">
                        0{idx + 1}
                      </span>
                      <p className="font-body text-xs sm:text-[13px] text-zinc-200 leading-relaxed font-normal">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Connected Nodes */}
              {node.researchData.relatedNodeIds && node.researchData.relatedNodeIds.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
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
                        className="px-3 py-1.5 rounded-md bg-white/[0.03] hover:bg-rose-500/20 hover:border-rose-500/40 border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 bg-rose-500" />
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
              <div className="p-6 rounded-md bg-black/60 border border-white/[0.12] space-y-4 font-body">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500" />
                    <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
                      COMMUNITY OBSERVATION &bull; {node.visitorData.category.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-zinc-400">
                    {new Date(node.visitorData.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <blockquote className="font-serif italic text-base sm:text-lg text-white font-normal leading-relaxed pl-3 border-l-2 border-rose-500">
                  &ldquo;{node.visitorData.message}&rdquo;
                </blockquote>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                  <span className="uppercase tracking-wider">CONTRIBUTED BY</span>
                  <span className="text-white font-bold text-sm tracking-wider uppercase">
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
                      className="px-3.5 py-2 rounded-md bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/60 text-xs font-mono font-bold text-rose-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider"
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
          className="shrink-0 px-6 sm:px-8 py-3.5 border-t border-white/[0.10] bg-black/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          {/* Pins & Topological Connectivity Map */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 uppercase tracking-wider">INPUT PINS:</span>
              <span className="font-bold text-white">{node.inputs?.length || 0}</span>
              {node.inputs && node.inputs.length > 0 && (
                <span className="text-zinc-400">
                  ({node.inputs.map((p) => p.label).join(', ')})
                </span>
              )}
            </div>

            <span className="text-zinc-700 hidden sm:inline">&bull;</span>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 uppercase tracking-wider">OUTPUT PINS:</span>
              <span className="font-bold text-rose-400">{node.outputs?.length || 0}</span>
              {node.outputs && node.outputs.length > 0 && (
                <span className="text-zinc-400">
                  ({node.outputs.map((p) => p.label).join(', ')})
                </span>
              )}
            </div>
          </div>

          {/* Dismiss Back to Graph Action */}
          <button
            type="button"
            onClick={() => handleClose()}
            className="self-end sm:self-auto px-4 py-2 rounded-md bg-white/[0.08] hover:bg-rose-600 text-white font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <span>Back to Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </footer>
      </div>
    </div>
  );
};
