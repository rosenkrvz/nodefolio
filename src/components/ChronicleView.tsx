import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown } from './icons';
import { playSound } from '../lib/sound';
import { BrandLogo } from './ui/BrandLogo';
import { ChronicleMilestoneArtifact } from './chronicle/ChronicleArtifacts';
import { ChronicleTimelineAxis, TimelinePhase } from './chronicle/ChronicleTimelineAxis';

export interface ChronicleMilestone {
  id: string;
  period: string;
  phase: string;
  category: string;
  title: string;
  thesis: string;
  context: string;
  experiment: string;
  observation: string;
  keyLearnings: string;
  tags: string[];
  status: 'active' | 'verified' | 'deployed' | 'foundation';
  statusLabel: string;
  linkedNodeId?: string;
  metrics?: { label: string; value: string }[];
  displayYear?: string;
  shortTopic?: string;
  subTopic?: string;
}

const MILESTONES: ChronicleMilestone[] = [
  {
    id: 'm1',
    period: '2025 — PRESENT',
    displayYear: '2025',
    shortTopic: 'Latent Manifolds',
    subTopic: 'Diffusion Geodesics',
    phase: 'PHASE 05',
    category: 'GENERATIVE ARCHITECTURES & LATENT DYNAMICS',
    title: 'High-Dimensional Latent Manifold Traversal & Geodesics',
    thesis: 'Investigating Riemannian metric geometry and geodesic trajectory interpolation across continuous diffusion latent representations.',
    context: 'High-dimensional latent spaces in generative models are often treated as flat Euclidean geometries, which ignores the distortion induced by deep non-linear decoder networks.',
    experiment: 'Built an interactive WebGL projection workspace to simulate spherical and Riemannian geodesic paths across 512-dimensional latent spaces, evaluating interpolation smoothness against linear Euclidean baselines.',
    observation: 'Linear Euclidean interpolation frequently traverses low-probability sparse regions, causing perceptual distortion. Curvature-aware spherical and geodesic interpolations maintain semantic fidelity across trajectories.',
    keyLearnings: 'Connected differential geometry and score matching vector fields to practical visualization tools for high-dimensional neural representations.',
    tags: ['PyTorch', 'Vector Fields', 'Riemannian Manifolds', 'Score Matching', 'WebGL Projection'],
    status: 'active',
    statusLabel: 'ACTIVE STUDY',
    linkedNodeId: 'node-project',
    metrics: [
      { label: 'Topology', value: 'Non-Euclidean' },
      { label: 'Compute', value: 'WebGL / Canvas' },
      { label: 'Status', value: 'Interactive' },
    ],
  },
  {
    id: 'm2',
    period: 'Q4 2024 — Q1 2025',
    displayYear: '2024–25',
    shortTopic: 'Attention Kernels',
    subTopic: 'KV-Cache Dynamics',
    phase: 'PHASE 04',
    category: 'ATTENTION MECHANISMS & COMPUTE KERNELS',
    title: 'Self-Attention Memory Hierarchy & KV-Cache Dynamics',
    thesis: 'Dissecting memory-bandwidth bottlenecks in transformer inference through tiled matrix algebra and cache management experiments.',
    context: 'Transformer sequence scaling is constrained by memory bandwidth rather than pure computational capacity due to repeated round-trips between GPU global memory (HBM) and on-chip SRAM.',
    experiment: 'Implemented tiled matrix multiplication and simplified FlashAttention-style forward passes in PyTorch and Triton to profile latency and memory traffic during long-context evaluation.',
    observation: 'Fusing online softmax computation into the outer tiled loop eliminates the need to materialize the quadratic N x N attention matrix in GPU global memory, drastically reducing memory IO overhead.',
    keyLearnings: 'Modern deep learning algorithms must be designed with explicit awareness of hardware memory hierarchies; mathematical formulation and physical execution are inseparable.',
    tags: ['PyTorch', 'Triton', 'FlashAttention', 'Memory Hierarchy', 'KV Cache', 'Tiled Matrix'],
    status: 'verified',
    statusLabel: 'VERIFIED BENCHMARK',
    linkedNodeId: 'node-models',
    metrics: [
      { label: 'Bottleneck', value: 'Memory IO' },
      { label: 'Tiling', value: 'On-Chip SRAM' },
      { label: 'Status', value: 'Benchmarked' },
    ],
  },
  {
    id: 'm3',
    period: 'MID — LATE 2024',
    displayYear: '2024',
    shortTopic: 'Metric Spaces',
    subTopic: 'Contrastive Uniformity',
    phase: 'PHASE 03',
    category: 'REPRESENTATION LEARNING & EMBEDDING GEOMETRY',
    title: 'Hyperspherical Uniformity & Contrastive Representation Spaces',
    thesis: 'Empirical study of alignment and uniformity properties in multi-modal contrastive formulations under temperature scaling.',
    context: 'Self-supervised representation models risk representation collapse and dimensional shrinkage, where embeddings collapse along low-dimensional subspaces instead of utilizing full hypersphere capacity.',
    experiment: 'Evaluated InfoNCE loss formulations across synthetic and image embedding benchmarks, monitoring hyperspherical uniformity and singular value decay under varying temperatures.',
    observation: 'Low temperature hyperparameters aggressively separate negative samples to enforce uniformity but increase gradient variance; adaptive temperature schedules yield smoother cluster separation without collapse.',
    keyLearnings: 'Balancing positive pair alignment with uniform negative distribution across the unit hypersphere is fundamental for robust embedding spaces.',
    tags: ['Metric Spaces', 'Contrastive Learning', 'Hyperspherical Uniformity', 'InfoNCE', 'Embeddings'],
    status: 'verified',
    statusLabel: 'STUDY COMPLETE',
    linkedNodeId: 'node-models',
    metrics: [
      { label: 'Loss Metric', value: 'InfoNCE' },
      { label: 'Geometry', value: 'Unit Sphere' },
      { label: 'Status', value: 'Completed' },
    ],
  },
  {
    id: 'm4',
    period: '2023 — 2024',
    displayYear: '2023–24',
    shortTopic: 'Convex Optimization',
    subTopic: 'Statistical Theory',
    phase: 'PHASE 02',
    category: 'MATHEMATICAL & PROBABILISTIC FOUNDATIONS',
    title: 'Convex Optimization, Probability & Statistical Machine Learning',
    thesis: 'Rigorous academic coursework and foundational study across linear algebra, multivariate calculus, and statistical inference.',
    context: 'Deep learning abstractions often obscure the underlying mathematical principles that govern gradient convergence, regularization, and probabilistic uncertainty.',
    experiment: 'Completed formal derivations and numerical implementations of convex optimization methods (Lagrangian duality, KKT conditions, proximal operators) and probabilistic inference (EM algorithm, Bayesian bounds).',
    observation: 'Locally quadratic approximations of loss surfaces explain why adaptive optimizers (Adam, RMSProp) stabilize training in ill-conditioned valleys where standard SGD oscillates.',
    keyLearnings: 'A thorough mathematical foundation in linear algebra and multivariable optimization provides the essential tools to evaluate and implement complex machine learning literature.',
    tags: ['Linear Algebra', 'Convex Optimization', 'Probability Theory', 'Bayesian Inference', 'Multivariate'],
    status: 'foundation',
    statusLabel: 'FORMAL RIGOR',
    linkedNodeId: 'node-credentials',
    metrics: [
      { label: 'Domain', value: 'Optimization' },
      { label: 'Method', value: 'KKT Duality' },
      { label: 'Status', value: 'Coursework' },
    ],
  },
  {
    id: 'm5',
    period: 'EARLY 2023',
    displayYear: '2023',
    shortTopic: 'Autograd Engine',
    subTopic: 'Reverse-Mode Autodiff',
    phase: 'PHASE 01',
    category: 'SYSTEMS ARCHITECTURE & AUTOGRAD ENGINE',
    title: 'First Principles: Computational Graphs & Reverse-Mode Autodiff',
    thesis: 'Building an automatic differentiation engine and backward execution tape from scratch to ground intuitive mechanics of backpropagation.',
    context: 'Relying exclusively on high-level framework abstractions creates an illusion of understanding without grasping topological graph sorting and backward tape accumulation.',
    experiment: 'Constructed a lightweight scalar and tensor autograd engine from scratch in Python with a C++ extension. Implemented DAG topological sorting, dynamic tape recording, and reverse-mode derivative propagation.',
    observation: 'Backpropagation is mathematically straightforward—an ordered chain-rule traversal along a directed acyclic graph—while the engineering challenge lies in memory management and broadcast bookkeeping.',
    keyLearnings: 'Demystified how modern tensor frameworks allocate activation memory during the forward pass and reclaim intermediate tensors during backward passes.',
    tags: ['Computational Graphs', 'Reverse-Mode Autodiff', 'DAG Topological Sort', 'Autograd Tape', 'C++ / Python'],
    status: 'deployed',
    statusLabel: 'SYSTEM BUILT',
    linkedNodeId: 'node-systems',
    metrics: [
      { label: 'Engine', value: 'From Scratch' },
      { label: 'Architecture', value: 'DAG Tape' },
      { label: 'Status', value: 'Built & Tested' },
    ],
  },
];

interface ChronicleViewProps {
  onBackToCanvas: () => void;
  onFocusNodeOnCanvas?: (nodeId: string) => void;
  activePhaseId?: string;
  onActivePhaseChange?: (phaseId: string) => void;
  onOpenResearchCanvas3D?: (phaseId: string) => void;
}

interface EditorialResearchEntryProps {
  item: ChronicleMilestone;
  numeral: string;
  reducedMotion: boolean;
  onFocusNodeOnCanvas?: (nodeId: string) => void;
  onOpenResearchCanvas3D?: (phaseId: string) => void;
  prevPhase?: { id: string; phase: string } | null;
  nextPhase?: { id: string; phase: string } | null;
  onSelectPhase?: (phaseId: string) => void;
}

/**
 * Editorial Research Entry Component
 * Technical Field Notebook & Build Log layout with structured problem context,
 * implementation artifact, concrete observations, and direct canvas node jump.
 */
const EditorialResearchEntry: React.FC<EditorialResearchEntryProps> = ({
  item,
  numeral,
  onFocusNodeOnCanvas,
  onOpenResearchCanvas3D,
  prevPhase,
  nextPhase,
  onSelectPhase,
}) => {
  return (
    <article
      id={`milestone-${item.id}`}
      onMouseEnter={() => playSound('hover')}
      className="relative group scroll-mt-28 pb-10 pt-7 border-b border-white/[0.08] transition-colors duration-300 bg-gradient-to-b from-rose-500/[0.02] to-transparent rounded-2xl p-5 sm:p-8"
    >
      {/* Active Phase Crimson Laser Accent Top Rule */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_14px_#f43f5e]" />

      {/* Grid: 3-column asymmetric editorial layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Temporal Spine & Status (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col items-start space-y-4">
          {/* Phase Numeral & Classification */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-none text-white transition-colors">
              {numeral}
            </span>
            <div className="flex flex-col">
              <span className="font-tech text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-semibold">
                {item.phase}
              </span>
              <span className="font-body text-xs font-bold tracking-wider uppercase text-rose-400">
                {item.period}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-tech tracking-[0.2em] uppercase font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
            <span>{item.statusLabel}</span>
          </div>

          {/* Category Pillar */}
          <div className="pt-1 font-tech text-[9.5px] uppercase tracking-[0.25em] text-zinc-400 max-w-[220px] leading-relaxed">
            {item.category}
          </div>
        </div>

        {/* Center Column: Field Notebook Log & Findings (col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Title */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight uppercase leading-[1.12] text-white">
            {item.title}
          </h2>

          {/* Core Thesis / Question */}
          <div className="relative pl-4 border-l-2 border-rose-500/60 bg-white/[0.015] py-2.5 pr-3 rounded-r-lg">
            <p className="font-body text-sm sm:text-[14.5px] text-zinc-200 font-medium leading-relaxed italic">
              "{item.thesis}"
            </p>
          </div>

          {/* Structured Field Notebook Sections */}
          <div className="space-y-4 pt-1">
            {/* 01: Context & Problem */}
            <div className="space-y-1">
              <div className="font-tech text-[10px] tracking-[0.22em] text-rose-400 uppercase font-bold">
                01 // CONTEXT &amp; PROBLEM
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {item.context}
              </p>
            </div>

            {/* 02: Experiment & Implementation */}
            <div className="space-y-1">
              <div className="font-tech text-[10px] tracking-[0.22em] text-rose-400 uppercase font-bold">
                02 // EXPERIMENT &amp; IMPLEMENTATION
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {item.experiment}
              </p>
            </div>

            {/* 03: Concrete Observation */}
            <div className="space-y-1 bg-white/[0.02] p-3 rounded-lg border border-white/[0.06]">
              <div className="font-tech text-[10px] tracking-[0.22em] text-zinc-300 uppercase font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>03 // COMPUTATIONAL OBSERVATION</span>
              </div>
              <p className="font-body text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-normal">
                {item.observation}
              </p>
            </div>

            {/* 04: Key Takeaway */}
            <div className="space-y-1">
              <div className="font-tech text-[10px] tracking-[0.22em] text-rose-400 uppercase font-bold">
                04 // CORE TAKEAWAYS
              </div>
              <p className="font-body text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {item.keyLearnings}
              </p>
            </div>
          </div>

          {/* Tech stack pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] font-tech text-[10px] tracking-wider text-zinc-300 transition-colors uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Artifact & Telemetry Specs (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Custom Computational Visual Artifact with Active Rose Glow */}
          <ChronicleMilestoneArtifact
            milestoneId={item.id}
            active={true}
            className="w-full shadow-lg"
          />

          {/* Telemetry Metrics & Canvas Link */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            {item.metrics && item.metrics.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-white/[0.06]">
                {item.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="space-y-0.5">
                    <span className="block font-tech text-[8.5px] uppercase tracking-wider text-zinc-400">
                      {m.label}
                    </span>
                    <span className="block font-tech text-xs font-semibold text-zinc-200 truncate">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Inspect Node Interaction -> 3D Research Canvas */}
            <button
              type="button"
              onClick={() => {
                playSound('select');
                if (onOpenResearchCanvas3D) {
                  onOpenResearchCanvas3D(item.id);
                } else if (item.linkedNodeId && onFocusNodeOnCanvas) {
                  onFocusNodeOnCanvas(item.linkedNodeId);
                }
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-rose-950/40 hover:bg-rose-600/20 border border-rose-500/40 hover:border-rose-500/70 font-body text-xs tracking-wider uppercase text-rose-300 hover:text-white font-semibold group/link cursor-pointer focus:outline-none transition-all flex items-center justify-between shadow-[0_0_14px_rgba(225,29,72,0.15)] active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>INSPECT NODE ON CANVAS</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-rose-400 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Phase Navigation Footer */}
      <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        {prevPhase ? (
          <button
            type="button"
            onClick={() => {
              playSound('select');
              onSelectPhase?.(prevPhase.id);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:border-rose-500/40 border border-white/[0.08] font-tech text-[10px] tracking-wider text-zinc-300 hover:text-white uppercase transition-all cursor-pointer group/btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400 transition-transform group-hover/btn:-translate-x-0.5" />
            <span>PREV: {prevPhase.phase}</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 font-tech text-[10px] tracking-widest text-zinc-500 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500/70" />
          <span>PHASE {numeral} OF 05</span>
        </div>

        {nextPhase ? (
          <button
            type="button"
            onClick={() => {
              playSound('select');
              onSelectPhase?.(nextPhase.id);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:border-rose-500/40 border border-white/[0.08] font-tech text-[10px] tracking-wider text-zinc-300 hover:text-white uppercase transition-all cursor-pointer group/btn"
          >
            <span>NEXT: {nextPhase.phase}</span>
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400 rotate-180 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
};

export const ChronicleView: React.FC<ChronicleViewProps> = ({
  onBackToCanvas,
  onFocusNodeOnCanvas,
  activePhaseId: controlledPhaseId,
  onActivePhaseChange,
  onOpenResearchCanvas3D,
}) => {
  const [entryStage, setEntryStage] = useState(0);
  const [internalPhaseId, setInternalPhaseId] = useState<string>(controlledPhaseId || 'm1');
  const activePhaseId = controlledPhaseId || internalPhaseId;
  const [displayedPhaseId, setDisplayedPhaseId] = useState<string>(controlledPhaseId || 'm1');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Synchronize when controlled phase changes
  useEffect(() => {
    if (controlledPhaseId && controlledPhaseId !== internalPhaseId) {
      setInternalPhaseId(controlledPhaseId);
    }
  }, [controlledPhaseId]);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Coordinated Page Entry Reveal Sequence (~800ms total)
  useEffect(() => {
    if (reducedMotion) {
      setEntryStage(4);
      return;
    }

    const t1 = setTimeout(() => setEntryStage(1), 50);   // Background + Eyebrow
    const t2 = setTimeout(() => setEntryStage(2), 200);  // Title Mask Reveal
    const t3 = setTimeout(() => setEntryStage(3), 450);  // Subtitle + Buttons
    const t4 = setTimeout(() => setEntryStage(4), 750);  // Axis & Entries settle

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reducedMotion]);

  // Smooth cross-fade transition when active phase changes
  useEffect(() => {
    if (activePhaseId === displayedPhaseId) return;

    if (reducedMotion) {
      setDisplayedPhaseId(activePhaseId);
      return;
    }

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayedPhaseId(activePhaseId);
      setIsTransitioning(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [activePhaseId, displayedPhaseId, reducedMotion]);

  // Build timeline phases for the interactive axis
  const timelinePhases: TimelinePhase[] = useMemo(() => {
    return MILESTONES.map((m) => ({
      id: m.id,
      phase: m.phase,
      year: m.displayYear || m.period.split('—')[0].trim(),
      shortTitle: m.shortTopic || m.title.split(' ')[0] + ' ' + (m.title.split(' ')[1] || ''),
      subTopic: m.subTopic,
      status: m.status,
    }));
  }, []);

  const activeMilestone = useMemo(() => {
    return MILESTONES.find((m) => m.id === activePhaseId) || MILESTONES[0];
  }, [activePhaseId]);

  const displayedMilestone = useMemo(() => {
    return MILESTONES.find((m) => m.id === displayedPhaseId) || MILESTONES[0];
  }, [displayedPhaseId]);

  const currentIdx = useMemo(() => {
    return MILESTONES.findIndex((m) => m.id === displayedMilestone.id);
  }, [displayedMilestone]);

  const prevMilestone = currentIdx > 0 ? MILESTONES[currentIdx - 1] : null;
  const nextMilestone = currentIdx < MILESTONES.length - 1 ? MILESTONES[currentIdx + 1] : null;
  const displayedNumeral = displayedMilestone.phase.split(' ')[1] || '05';

  // Select milestone from axis or stepper
  const handleSelectPhase = (phaseId: string) => {
    setInternalPhaseId(phaseId);
    onActivePhaseChange?.(phaseId);
    const targetEl = document.getElementById('chronicle-ledger');
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      if (rect.top < 60 || rect.top > window.innerHeight * 0.75) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#14171c] text-[#ededed] font-body select-text overflow-x-hidden">
      {/* ═══════════ EDITORIAL COVER MATCHING ARCHITECTURAL BACKDROP ═══════════ */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <div className="pattern-bg">
          <div className="cube-svg" />
        </div>
      </div>

      {/* Subtle Coordinate Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-canvas-dots-overlay opacity-60 z-0" aria-hidden="true" />

      {/* Subtle Crimson Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_25%,rgba(225,29,72,0.14),transparent_55%)] z-0" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_10%_80%,rgba(225,29,72,0.06),transparent_50%)] z-0" aria-hidden="true" />

      {/* ═══════════ CINEMATIC EDITORIAL HERO SECTION ═══════════ */}
      <header className="relative z-10 w-full pt-28 pb-12 px-6 sm:px-12 md:px-16 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          {/* Top Eyebrow & Brand Anchor */}
          <div
            style={{
              opacity: entryStage >= 1 ? 1 : 0,
              transform: reducedMotion || entryStage >= 1 ? 'none' : 'translateY(-12px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
            className="flex items-center justify-between mb-10 pb-4 border-b border-white/[0.06]"
          >
            <div className="flex items-center gap-3 font-tech text-xs tracking-[0.25em] text-zinc-400 uppercase">
              <BrandLogo variant="icon" size={15} className="text-rose-400 shrink-0" />
              <span className="font-semibold text-zinc-200">CHRONICLE / 03</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="hidden sm:inline text-zinc-400 font-mono">COMPUTATIONAL RESEARCH JOURNAL</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-accent text-3xl leading-none text-rose-400/90 font-bold -mb-1">
                2023 — 2026
              </span>
              <span className="text-zinc-600 hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline font-tech text-[10px] tracking-widest text-zinc-400 uppercase">
                VOL. IV
              </span>
            </div>
          </div>

          {/* Main Asymmetric Title Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            {/* Left: Directionally Masked Title & Pitch (col-span-8) */}
            <div className="lg:col-span-8 flex flex-col items-start">
              {/* Category Breadcrumb */}
              <div
                style={{
                  opacity: entryStage >= 2 ? 1 : 0,
                  transition: 'opacity 0.5s ease-out',
                }}
                className="font-tech text-xs font-semibold tracking-[0.35em] uppercase text-rose-400 mb-3 flex items-center gap-2"
              >
                <span>RESEARCH MILESTONES</span>
                <span className="text-zinc-600">/</span>
                <span>SYSTEMS KERNELS</span>
                <span className="text-zinc-600">/</span>
                <span>LATENT GEODESICS</span>
              </div>

              {/* Directionally Masked Monumental Display Title */}
              <div className="overflow-hidden mb-5">
                <h1
                  style={{
                  transform:
                      reducedMotion || entryStage >= 2 ? 'translateY(0)' : 'translateY(100%)',
                    opacity: reducedMotion || entryStage >= 2 ? 1 : 0,
                    transition:
                      'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out',
                  }}
                  className="leading-[0.9] select-none tracking-tight"
                >
                  <span className="block font-display text-4xl min-[360px]:text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-[-0.03em] uppercase break-words">
                    COMPUTATIONAL
                  </span>
                  <span className="block font-display text-4xl min-[360px]:text-5xl sm:text-7xl md:text-8xl font-light text-zinc-400/90 tracking-[-0.02em] uppercase mt-1 break-words">
                    CHRONICLE
                  </span>
                </h1>
              </div>

              {/* Supporting Editorial Statement */}
              <p
                style={{
                  opacity: entryStage >= 3 ? 1 : 0,
                  transform: reducedMotion || entryStage >= 3 ? 'none' : 'translateY(16px)',
                  transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                }}
                className="font-body text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8 max-w-2xl"
              >
                An art-directed experimental journal logging investigations in Riemannian latent representations, hardware-aware attention kernels, contrastive metric geometry, and first-principles autodiff engines.
              </p>

              {/* Tactile Navigation Buttons */}
              <div
                style={{
                  opacity: entryStage >= 3 ? 1 : 0,
                  transform: reducedMotion || entryStage >= 3 ? 'none' : 'translateY(12px)',
                  transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
                }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 font-body w-full sm:w-auto"
              >
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onBackToCanvas();
                  }}
                  className="w-full min-[400px]:w-auto justify-center px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.12] hover:border-white/[0.25] font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400 transition-transform group-hover:-translate-x-1" />
                  <span>BACK TO CANVAS</span>
                </button>

                <a
                  href="#chronicle-ledger"
                  onClick={() => playSound('secondaryClick')}
                  className="w-full min-[400px]:w-auto justify-center px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_24px_rgba(244,63,94,0.35)] hover:shadow-[0_0_32px_rgba(244,63,94,0.55)] flex items-center gap-2 group active:scale-95 cursor-pointer"
                >
                  <span>EXPLORE CHRONICLE</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* Right: Technical Index Specs (col-span-4) */}
            <div
              style={{
                opacity: entryStage >= 3 ? 1 : 0,
                transition: 'opacity 0.7s ease-out',
              }}
              className="hidden lg:flex lg:col-span-4 flex-col items-end text-right space-y-6 pl-8"
            >
              <div className="space-y-3 w-full max-w-[280px]">
                <div className="font-tech text-xs tracking-[0.25em] text-rose-400 uppercase font-semibold pb-2 border-b border-white/[0.08]">
                  JOURNAL SPECIFICATION
                </div>
                {[
                  { label: 'ACTIVE INVESTIGATION', value: activeMilestone.phase },
                  { label: 'VERIFIED BENCHMARKS', value: '02 MODULES' },
                  { label: 'SYSTEMS COMPLETED', value: '02 ENGINES' },
                  { label: 'FORMAL RIGOR', value: 'KKT DUALITY' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-xs">
                    <span className="font-tech text-zinc-400 uppercase tracking-wider text-[10px]">
                      {stat.label}
                    </span>
                    <span className="font-tech font-bold text-zinc-200">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/[0.06] max-w-[240px]">
                <p className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest leading-normal">
                  All mathematical diagrams and kernel schematics are verified against working computational codebases.
                </p>
                <div className="w-6 h-0.5 bg-rose-500 mt-2 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ INTERACTIVE CHRONOLOGICAL AXIS ═══════════ */}
      <nav
        style={{
          opacity: entryStage >= 4 ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
        }}
        className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:top-16 z-30 shadow-2xl"
      >
        <ChronicleTimelineAxis
          phases={timelinePhases}
          activePhaseId={activePhaseId}
          onSelectPhase={handleSelectPhase}
        />
      </nav>

      {/* ═══════════ EDITORIAL RESEARCH LEDGER ═══════════ */}
      <main id="chronicle-ledger" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 pt-10 pb-16">
        {/* Section Title Header */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span className="font-tech text-xs font-bold tracking-[0.25em] uppercase text-zinc-300">
              DISCOVERY &amp; IMPLEMENTATION CHRONICLE ({MILESTONES.length} PHASES)
            </span>
          </div>

          <span className="font-tech text-[10px] tracking-widest text-zinc-400 uppercase hidden sm:inline">
            ASYMMETRIC RESEARCH ARTIFACTS
          </span>
        </div>

        {/* Milestone Entry with smooth transition */}
        <div
          id="chronicle-main-entry"
          tabIndex={-1}
          className="transition-all duration-300 ease-out focus:outline-none"
          style={{
            opacity: isTransitioning ? 0.35 : 1,
            transform: isTransitioning ? 'translateY(6px)' : 'translateY(0)',
          }}
        >
          <EditorialResearchEntry
            item={displayedMilestone}
            numeral={displayedNumeral}
            reducedMotion={reducedMotion}
            onFocusNodeOnCanvas={onFocusNodeOnCanvas}
            onOpenResearchCanvas3D={onOpenResearchCanvas3D}
            prevPhase={prevMilestone ? { id: prevMilestone.id, phase: prevMilestone.phase } : null}
            nextPhase={nextMilestone ? { id: nextMilestone.id, phase: nextMilestone.phase } : null}
            onSelectPhase={handleSelectPhase}
          />
        </div>
      </main>


      {/* ═══════════ CLOSING COLOPHON & ARCHIVE STAMP ═══════════ */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 mt-8 pb-[calc(env(safe-area-inset-bottom,0px)+32px)] sm:pb-24">
        <div className="pt-10 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase text-zinc-400">
            <BrandLogo variant="icon" size={14} className="text-rose-400 shrink-0" />
            <span className="font-semibold text-zinc-200">CHRONICLE ARCHIVE</span>
            <span className="text-zinc-600">&bull;</span>
            <span>VOL. 2026</span>
          </div>

          <div className="font-body text-xs text-zinc-400 font-medium tracking-[0.15em] uppercase">
            Open for Select Research &amp; Engineering Collaborations
          </div>
        </div>
      </footer>
    </div>
  );
};
