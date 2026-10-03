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
      className="relative group scroll-mt-28 pb-10 pt-7 border border-white/[0.08] transition-colors duration-300 bg-[#0c0e15]/70 backdrop-blur-md rounded-md p-5 sm:p-8 xl:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Active Phase Crimson Laser Accent Top Rule */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_14px_#f43f5e]" />

      {/* Grid: 3-column asymmetric editorial layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 2xl:gap-16 items-start">
        {/* Left Column: Temporal Spine & Status (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col items-start space-y-4">
          {/* Phase Numeral & Classification */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-none text-white transition-colors">
              {numeral}
            </span>
            <div className="flex flex-col">
              <span className="font-tech text-[10px] xl:text-[11px] tracking-[0.25em] uppercase text-zinc-400 font-semibold">
                {item.phase}
              </span>
              <span className="font-body text-xs xl:text-sm font-bold tracking-wider uppercase text-rose-400">
                {item.period}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[10px] xl:text-[11px] font-tech tracking-[0.2em] uppercase font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
            <span>{item.statusLabel}</span>
          </div>

          {/* Category Pillar */}
          <div className="pt-1 font-tech text-[9.5px] xl:text-[10.5px] uppercase tracking-[0.25em] text-zinc-400 max-w-[220px] xl:max-w-[260px] leading-relaxed">
            {item.category}
          </div>
        </div>

        {/* Center Column: Field Notebook Log & Findings (col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Title */}
          <h2 className="font-display text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight uppercase leading-[1.12] text-white">
            {item.title}
          </h2>

          {/* Core Thesis / Question */}
          <div className="relative pl-4 border-l-2 border-rose-500/60 bg-white/[0.015] py-2.5 pr-3 rounded-r-md">
            <p className="font-body text-sm sm:text-[14.5px] xl:text-base 2xl:text-lg text-zinc-200 font-medium leading-relaxed italic">
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
          <div className="p-3.5 xl:p-5 rounded-md bg-[#090b10]/80 border border-white/[0.08] space-y-3.5">
            {item.metrics && item.metrics.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pb-3.5 border-b border-white/[0.08]">
                {item.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="space-y-0.5">
                    <span className="block font-tech text-[8.5px] xl:text-[9.5px] uppercase tracking-wider text-zinc-400">
                      {m.label}
                    </span>
                    <span className="block font-tech text-xs xl:text-sm font-semibold text-zinc-200 truncate">
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
              className="w-full py-2.5 px-3.5 rounded-md bg-rose-950/50 hover:bg-rose-600/25 border border-rose-500/50 hover:border-rose-500/80 font-body text-xs xl:text-sm tracking-wider uppercase text-rose-300 hover:text-white font-semibold group/link cursor-pointer focus:outline-none transition-all flex items-center justify-between shadow-[0_0_14px_rgba(225,29,72,0.2)] active:scale-[0.98]"
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
      {/* ═══════════ COMPUTATIONAL LAB BLUEPRINT & TELEMETRY ATMOSPHERE ═══════════ */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* Deep Slate Lab Base */}
        <div className="absolute inset-0 bg-[#0e1117]" />

        {/* Subtle Laboratory Dot Lattice Matrix */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#333a48_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Engineering CAD Blueprint Grid lines */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] [background-size:72px_72px]" />

        {/* Ambient Top Glow for Laboratory Workbench */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-rose-500/[0.04] blur-[120px] rounded-full" />
      </div>

      {/* Subtle Coordinate Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-canvas-dots-overlay opacity-40 z-0" aria-hidden="true" />

      {/* ═══════════ ARCHITECTURAL TELEMETRY MARGIN RAILS (Ultrawide / Zoom-out) ═══════════ */}
      {/* Left Margin Telemetry Rail */}
      <div className="hidden 2xl:flex fixed left-5 top-24 bottom-16 flex-col justify-between items-center pointer-events-none z-10 text-[9px] font-mono text-zinc-600 select-none tracking-widest uppercase">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/60 shadow-[0_0_6px_#f43f5e]" />
          <span className="[writing-mode:vertical-rl] rotate-180 text-zinc-400">LATENT_AXIS // 0.000</span>
        </div>
        <div className="w-px h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col items-center gap-2.5">
          <span className="[writing-mode:vertical-rl] rotate-180 text-zinc-500">SYS.CHRONICLE // v4.2</span>
          <div className="w-1.5 h-1.5 border border-white/20" />
        </div>
      </div>

      {/* Right Margin Telemetry Rail */}
      <div className="hidden 2xl:flex fixed right-5 top-24 bottom-16 flex-col justify-between items-center pointer-events-none z-10 text-[9px] font-mono text-zinc-600 select-none tracking-widest uppercase">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/60 shadow-[0_0_6px_#f43f5e]" />
          <span className="[writing-mode:vertical-rl] text-zinc-400">GEODESIC_AXIS // 1.000</span>
        </div>
        <div className="w-px h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col items-center gap-2.5">
          <span className="[writing-mode:vertical-rl] text-zinc-500">SEC.LEDGER // 0x7E3</span>
          <div className="w-1.5 h-1.5 border border-white/20" />
        </div>
      </div>

      {/* ═══════════ COMPUTATIONAL RESEARCH LABORATORY DOSSIER HEADER ═══════════ */}
      <header className="relative z-10 w-full pt-20 sm:pt-24 pb-8 px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-20 border-b border-white/[0.08]">
        <div className="w-full max-w-[1780px] 2xl:max-w-[1920px] 3xl:max-w-[2160px] mx-auto">
          {/* Top Status & Telemetry Bar */}
          <div
            style={{
              opacity: entryStage >= 1 ? 1 : 0,
              transform: reducedMotion || entryStage >= 1 ? 'none' : 'translateY(-12px)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            }}
            className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]"
          >
            <div className="flex items-center gap-3 font-tech text-xs tracking-[0.25em] text-zinc-400 uppercase">
              <BrandLogo variant="icon" size={16} className="text-rose-400 shrink-0" />
              <span className="font-semibold text-zinc-200">LABORATORY // RESEARCH &amp; THEORY</span>
              <span className="text-zinc-600 hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
                {MILESTONES.length} EMPIRICAL MODULES
              </span>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  onBackToCanvas();
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.12] hover:border-white/[0.25] font-tech font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
                <span>BACK TO CANVAS</span>
              </button>

              {onOpenResearchCanvas3D && (
                <button
                  type="button"
                  onClick={() => {
                    playSound('open');
                    onOpenResearchCanvas3D(displayedMilestone.id);
                  }}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#1a1f2c] hover:bg-[#232a3b] text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-500/80 font-mono font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(244,63,94,0.18)] flex items-center gap-2 cursor-pointer"
                  title="Launch 3D interactive viewport for this research phase"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="hidden min-[480px]:inline">3D VIEWPORT</span>
                  <span className="min-[480px]:hidden">3D</span>
                </button>
              )}

              <a
                href="#chronicle-ledger"
                onClick={() => playSound('secondaryClick')}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-tech font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_16px_rgba(244,63,94,0.3)] flex items-center gap-1.5 cursor-pointer"
              >
                <span>LEDGER</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Laboratory Overview & Mission Statement */}
          <div
            style={{
              opacity: entryStage >= 2 ? 1 : 0,
              transform: reducedMotion || entryStage >= 2 ? 'none' : 'translateY(10px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2.5 font-tech text-xs tracking-[0.3em] uppercase text-rose-400 font-semibold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                  <span>COMPUTATIONAL FIELD NOTEBOOK &amp; THEORY LOGS</span>
                </div>
                <h1 className="font-tech text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-white tracking-tight uppercase leading-tight mb-3">
                  Theoretical Formulations &amp; Systems Implementations
                </h1>
                <p className="font-body text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
                  First-principles investigations in Riemannian latent representations, hardware-aware attention kernels, contrastive metric geometry, and reverse-mode autodiff engines—verified against executable computational codebases.
                </p>
              </div>

              {/* Lab Specification Metrics */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 lg:pt-0 lg:border-l lg:border-white/[0.08] lg:pl-8 shrink-0">
                <div className="flex flex-col">
                  <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">Active Phase</span>
                  <span className="font-tech font-bold text-rose-400 text-base sm:text-lg">
                    {displayedMilestone.phase}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">Benchmarks</span>
                  <span className="font-tech font-bold text-white text-base sm:text-lg">
                    02 Modules
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">Engines</span>
                  <span className="font-tech font-bold text-white text-base sm:text-lg">
                    02 Built
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">Formal Rigor</span>
                  <span className="font-tech font-bold text-zinc-200 text-base sm:text-lg">
                    KKT Duality
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Project Discovery Cards (Direct Phase Access) */}
          <div
            style={{
              opacity: entryStage >= 3 ? 1 : 0,
              transform: reducedMotion || entryStage >= 3 ? 'none' : 'translateY(12px)',
              transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
            }}
            className="pt-2"
          >
            <div className="text-[11px] font-tech uppercase tracking-[0.25em] text-zinc-400 mb-3 flex items-center justify-between">
              <span>SELECT RESEARCH PHASE FOR THEORETICAL BREAKDOWN</span>
              <span className="hidden md:inline text-zinc-400 font-mono">CLICK TO JUMP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {MILESTONES.map((m) => {
                const isSelected = m.id === displayedMilestone.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      handleSelectPhase(m.id);
                    }}
                    className={`group relative text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1b202c] border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.18)] scale-[1.01]'
                        : 'bg-[#14171f]/80 hover:bg-[#181d26] border-white/[0.08] hover:border-white/[0.20]'
                    }`}
                  >
                    {/* Top Row: Phase + Year */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`font-tech text-xs font-bold tracking-wider ${
                          isSelected ? 'text-rose-400' : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      >
                        {m.phase}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {m.displayYear || m.period.split('—')[0].trim()}
                      </span>
                    </div>

                    {/* Topic Title */}
                    <div className="font-tech font-bold text-sm text-white group-hover:text-rose-200 transition-colors line-clamp-1 mb-1">
                      {m.shortTopic || m.title}
                    </div>

                    {/* SubTopic / Focus */}
                    <p className="font-body text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                      {m.subTopic || m.thesis}
                    </p>

                    {/* Bottom Status Chip */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <span
                        className={`text-[9px] font-tech font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/[0.04] text-zinc-400'
                        }`}
                      >
                        {m.statusLabel}
                      </span>

                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                      )}
                    </div>
                  </button>
                );
              })}
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
      <main id="chronicle-ledger" className="relative z-10 w-full max-w-[1780px] 2xl:max-w-[1920px] 3xl:max-w-[2160px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-20 pt-10 pb-16">
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
      <footer className="relative z-10 w-full max-w-[1780px] 2xl:max-w-[1920px] 3xl:max-w-[2160px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-20 mt-8 pb-[calc(env(safe-area-inset-bottom,0px)+32px)] sm:pb-24">
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
