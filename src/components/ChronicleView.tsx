import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown } from './icons';
import { LabNoteSection } from './LabNoteSection';
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
  description: string;
  tags: string[];
  status: 'active' | 'verified' | 'deployed' | 'foundation';
  statusLabel: string;
  linkedNodeId?: string;
  metrics?: { label: string; value: string }[];
}

const MILESTONES: ChronicleMilestone[] = [
  {
    id: 'm1',
    period: '2025 — PRESENT',
    phase: 'PHASE 05',
    category: 'GENERATIVE ARCHITECTURES & LATENT DYNAMICS',
    title: 'High-Dimensional Latent Manifold Traversal & Geodesics',
    thesis: 'Investigating Riemannian metric geometry and geodesic trajectory interpolation across score-based diffusion latent representations.',
    description:
      'Exploring how diffusion latent representations can be structured as continuous Riemannian manifolds rather than flat Euclidean spaces. Developing interactive WebGL projections to visually and computationally verify interpolation smoothness, curvature consistency, and perceptual drift.',
    tags: ['PyTorch', 'Vector Field ODEs', 'Riemannian Manifolds', 'Score Matching', 'WebGL Projection'],
    status: 'active',
    statusLabel: 'ACTIVE INVESTIGATION',
    linkedNodeId: 'node-project',
    metrics: [
      { label: 'Topology', value: 'Non-Euclidean' },
      { label: 'Compute', value: 'CUDA / WebGL' },
      { label: 'State', value: 'Benchmarking' },
    ],
  },
  {
    id: 'm2',
    period: 'Q4 2024 — Q1 2025',
    phase: 'PHASE 04',
    category: 'ATTENTION MECHANISMS & COMPUTE KERNELS',
    title: 'Self-Attention Kernel Optimization & KV-Cache Dynamics',
    thesis: 'Dissecting memory-bandwidth bottlenecks in transformer inference through tiled matrix algebra and cache eviction strategies.',
    description:
      'Constructed custom FlashAttention-inspired tiled GPU kernels to analyze memory hierarchy access patterns during sequence scaling. Evaluated KV-cache compression and dynamic eviction policies to reduce peak VRAM allocation without sacrificing attention entropy.',
    tags: ['Triton', 'CUDA', 'PyTorch', 'FlashAttention', 'Memory Hierarchy', 'KV Cache'],
    status: 'verified',
    statusLabel: 'VERIFIED EXPERIMENT',
    linkedNodeId: 'node-models',
    metrics: [
      { label: 'Throughput', value: 'IO-Aware' },
      { label: 'Kernels', value: 'Tiled SRAM' },
      { label: 'Artifact', value: 'Code Published' },
    ],
  },
  {
    id: 'm3',
    period: 'MID — LATE 2024',
    phase: 'PHASE 03',
    category: 'REPRESENTATION LEARNING & EMBEDDING GEOMETRY',
    title: 'Hyperspherical Uniformity & Contrastive Representation Spaces',
    thesis: 'Empirical study of alignment and uniformity in multi-modal contrastive formulations under hard-negative mining.',
    description:
      'Investigated embedding collapse and dimensional shrinkage in self-supervised representation models. Implemented InfoNCE loss variants with adaptive temperature scaling to enforce hyperspherical uniformity across heterogeneous data distributions.',
    tags: ['Metric Spaces', 'Contrastive Learning', 'Hyperspherical Uniformity', 'InfoNCE', 'Latent Clusters'],
    status: 'verified',
    statusLabel: 'RESEARCH COMPLETE',
    linkedNodeId: 'node-models',
    metrics: [
      { label: 'Loss Metric', value: 'InfoNCE' },
      { label: 'Space', value: 'Hypersphere' },
      { label: 'Empirical', value: 'Complete' },
    ],
  },
  {
    id: 'm4',
    period: '2023 — 2024',
    phase: 'PHASE 02',
    category: 'MATHEMATICAL & PROBABILISTIC FOUNDATIONS',
    title: 'Convex Optimization, Probability & Statistical Machine Learning',
    thesis: 'Rigorous theoretical coursework and algorithmic problem-solving across linear algebra, multivariate calculus, and statistical inference.',
    description:
      'Comprehensive study of convex optimization (Lagrangian duality, KKT conditions, subgradient descent, proximal operators) and probabilistic inference (expectation-maximization, Markov random fields, variational bounds). Dedicated to understanding ML from core mathematical axioms.',
    tags: ['Linear Algebra', 'Convex Optimization', 'Probability Theory', 'Bayesian Inference', 'Measure Theory'],
    status: 'foundation',
    statusLabel: 'FORMAL RIGOR',
    linkedNodeId: 'node-credentials',
    metrics: [
      { label: 'Domain', value: 'Statistical Theory' },
      { label: 'Focus', value: 'Convex / Duality' },
      { label: 'Foundation', value: 'Academic' },
    ],
  },
  {
    id: 'm5',
    period: 'EARLY 2023',
    phase: 'PHASE 01',
    category: 'SYSTEMS ARCHITECTURE & AUTOGRAD ENGINE',
    title: 'First Principles: Computational Graphs & Reverse-Mode Autodiff',
    thesis: 'Building an automatic differentiation engine and backward tape from scratch to ground intuitive mechanics of backpropagation.',
    description:
      'Constructed a lightweight scalar and tensor autograd engine in pure Python/C++. Built topological DAG sorting, reverse-mode gradient accumulation, and operator overloads to demystify neural network optimization from foundational graph theory.',
    tags: ['Computational Graphs', 'Reverse-Mode Autodiff', 'DAG Topological Sort', 'Autograd Tape', 'C++ / Python'],
    status: 'deployed',
    statusLabel: 'SYSTEM BUILT',
    linkedNodeId: 'node-systems',
    metrics: [
      { label: 'Engine', value: 'From Scratch' },
      { label: 'Paradigms', value: 'DAG Tape' },
      { label: 'Result', value: 'Core Intuition' },
    ],
  },
];

interface ChronicleViewProps {
  onBackToCanvas: () => void;
  onFocusNodeOnCanvas?: (nodeId: string) => void;
}

/**
 * Editorial Research Entry Component
 * High-end architectural layout with asymmetric columns, bespoke visual artifact,
 * and prominent typography.
 */
const EditorialResearchEntry: React.FC<{
  item: ChronicleMilestone;
  index: number;
  reducedMotion: boolean;
  onFocusNodeOnCanvas?: (nodeId: string) => void;
  onInView?: (id: string) => void;
}> = ({ item, index, reducedMotion, onFocusNodeOnCanvas, onInView }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isActive = item.status === 'active';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onInView?.(item.id);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, onInView]);

  return (
    <article
      id={`milestone-${item.id}`}
      ref={containerRef}
      onMouseEnter={() => playSound('hover')}
      style={{
        opacity: reducedMotion ? 1 : isVisible ? 1 : 0,
        transform: reducedMotion ? 'none' : isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: reducedMotion
          ? 'none'
          : `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.05}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.05}s`,
      }}
      className={`relative group scroll-mt-28 pb-16 pt-10 border-b border-white/[0.08] transition-colors duration-300 ${
        isActive ? 'bg-gradient-to-b from-rose-500/[0.03] to-transparent' : ''
      }`}
    >
      {/* Active Phase Crimson Laser Accent Top Rule */}
      {isActive && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e]" />
      )}

      {/* Grid: 3-column asymmetric editorial layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Temporal Spine & Status (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col items-start space-y-4">
          {/* Phase Numeral & Classification */}
          <div className="flex items-baseline gap-3">
            <span
              className={`font-display text-4xl sm:text-5xl font-black tracking-tight leading-none ${
                isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
              } transition-colors`}
            >
              {String(5 - index).padStart(2, '0')}
            </span>
            <div className="flex flex-col">
              <span className="font-tech text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-semibold">
                {item.phase}
              </span>
              <span
                className={`font-body text-xs font-bold tracking-wider uppercase ${
                  isActive ? 'text-rose-400' : 'text-zinc-300'
                }`}
              >
                {item.period}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-tech tracking-[0.2em] uppercase font-bold ${
              isActive
                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                : 'bg-white/[0.03] text-zinc-400 border border-white/[0.08]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]' : 'bg-zinc-600'
              }`}
            />
            <span>{item.statusLabel}</span>
          </div>

          {/* Category Pillar */}
          <div className="pt-2 font-tech text-[9px] uppercase tracking-[0.25em] text-zinc-400 max-w-[200px] leading-relaxed">
            {item.category}
          </div>
        </div>

        {/* Center Column: Monumental Headline & Narrative (col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Title */}
          <h2
            className={`font-display text-2xl sm:text-3xl font-bold tracking-tight uppercase leading-[1.12] transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white'
            }`}
          >
            {item.title}
          </h2>

          {/* Thesis quote with surgical accent rule */}
          <div className="relative pl-4 border-l-2 border-rose-500/50">
            <p className="font-body text-sm sm:text-[15px] text-zinc-200 font-medium leading-relaxed italic">
              "{item.thesis}"
            </p>
          </div>

          {/* Deep Narrative Description */}
          <p className="font-body text-sm text-zinc-400 leading-relaxed font-normal">
            {item.description}
          </p>

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
          {/* Custom Computational Visual Artifact */}
          <ChronicleMilestoneArtifact
            milestoneId={item.id}
            active={isActive}
            className="w-full shadow-lg"
          />

          {/* Telemetry Metrics & Canvas Link */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            {item.metrics && item.metrics.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-white/[0.06]">
                {item.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="space-y-0.5">
                    <span className="block font-tech text-[8px] uppercase tracking-wider text-zinc-400">
                      {m.label}
                    </span>
                    <span className="block font-tech text-xs font-semibold text-zinc-200 truncate">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Inspect Node Interaction */}
            {item.linkedNodeId && onFocusNodeOnCanvas && (
              <button
                type="button"
                onClick={() => {
                  playSound('select');
                  onFocusNodeOnCanvas(item.linkedNodeId!);
                }}
                className="w-full py-2 px-3 rounded-lg bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/40 font-body text-xs tracking-wider uppercase text-zinc-300 hover:text-rose-300 font-semibold group/link cursor-pointer focus:outline-none transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>INSPECT NODE ON CANVAS</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export const ChronicleView: React.FC<ChronicleViewProps> = ({
  onBackToCanvas,
  onFocusNodeOnCanvas,
}) => {
  const [entryStage, setEntryStage] = useState(0);
  const [activePhaseId, setActivePhaseId] = useState<string>('m1');
  const [reducedMotion, setReducedMotion] = useState(false);

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

  // Build timeline phases for the interactive axis
  const timelinePhases: TimelinePhase[] = useMemo(() => {
    return MILESTONES.map((m) => ({
      id: m.id,
      phase: m.phase,
      year: m.period.split('—')[0].trim(),
      shortTitle: m.title.split(' ')[0] + ' ' + (m.title.split(' ')[1] || ''),
      status: m.status,
    }));
  }, []);

  // Scroll to selected milestone from axis
  const handleSelectPhase = (phaseId: string) => {
    setActivePhaseId(phaseId);
    const targetEl = document.getElementById(`milestone-${phaseId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                  <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-[-0.03em] uppercase">
                    COMPUTATIONAL
                  </span>
                  <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-light text-zinc-400/90 tracking-[-0.02em] uppercase mt-1">
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
                className="flex flex-wrap items-center gap-4 font-body"
              >
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onBackToCanvas();
                  }}
                  className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.12] hover:border-white/[0.25] font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400 transition-transform group-hover:-translate-x-1" />
                  <span>BACK TO CANVAS</span>
                </button>

                <a
                  href="#chronicle-ledger"
                  onClick={() => playSound('secondaryClick')}
                  className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_24px_rgba(244,63,94,0.35)] hover:shadow-[0_0_32px_rgba(244,63,94,0.55)] flex items-center gap-2 group active:scale-95 cursor-pointer"
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
                  { label: 'ACTIVE INVESTIGATION', value: 'PHASE 05' },
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

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-right max-w-[280px]">
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
        className="sticky top-16 z-30 shadow-2xl"
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

        {/* Milestone Entries */}
        <div className="space-y-4">
          {MILESTONES.map((item, idx) => (
            <EditorialResearchEntry
              key={item.id}
              item={item}
              index={idx}
              reducedMotion={reducedMotion}
              onFocusNodeOnCanvas={onFocusNodeOnCanvas}
              onInView={(id) => setActivePhaseId(id)}
            />
          ))}
        </div>
      </main>

      {/* ═══════════ LAB NOTE SPECIMEN SECTION ═══════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-12 border-t border-white/[0.08]">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-tech text-xs tracking-[0.25em] text-zinc-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-semibold text-zinc-200">LAB NOTE SPECIMEN ARCHIVE</span>
          </div>
          <span className="font-tech text-[10px] text-zinc-400 uppercase tracking-widest">
            SPECIMEN // 001
          </span>
        </div>
        <LabNoteSection />
      </section>

      {/* ═══════════ CLOSING COLOPHON & ARCHIVE STAMP ═══════════ */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 mt-8 pb-24">
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
