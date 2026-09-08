import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown } from './icons';
import { LabNoteSection } from './LabNoteSection';
import { playSound } from '../lib/sound';

interface ChronicleMilestone {
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
 * Fade-in on scroll observer hook
 */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/**
 * Single milestone card component with scroll-driven reveal animation
 */
const MilestoneCard: React.FC<{
  item: ChronicleMilestone;
  index: number;
  onFocusNodeOnCanvas?: (nodeId: string) => void;
}> = ({ item, index, onFocusNodeOnCanvas }) => {
  const { ref, isVisible } = useScrollReveal();
  const isActive = item.status === 'active';

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.06}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.06}s`,
      }}
    >
      {/* Phase card: glass-morphism dark card with crimson accent seam */}
      <article
        onMouseEnter={() => playSound('hover')}
        className={`relative group rounded-2xl overflow-hidden transition-all duration-300 ${
          isActive
            ? 'bg-[#12141a]/90 border border-rose-500/30 shadow-[0_0_40px_rgba(225,29,72,0.08),0_20px_50px_rgba(0,0,0,0.6)]'
            : 'bg-[#12141a]/70 border border-white/[0.06] hover:border-white/[0.14] shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Active investigation crimson top seam */}
        {isActive && (
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e]" />
        )}

        <div className="p-6 sm:p-8 md:p-10">
          {/* Top row: Phase + Period + Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              {/* Phase index number */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                <span className="font-display text-sm font-bold text-zinc-300">
                  {String(5 - index).padStart(2, '0')}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-body text-[10px] font-semibold tracking-[0.25em] uppercase text-zinc-500">
                  {item.phase}
                </span>
                <span className={`font-body text-xs font-bold tracking-wider uppercase ${isActive ? 'text-rose-400' : 'text-zinc-300'}`}>
                  {item.period}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start sm:self-auto ${
              isActive
                ? 'bg-rose-500/10 border border-rose-500/25'
                : 'bg-white/[0.03] border border-white/[0.08]'
            }`}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]' : 'bg-zinc-500'
                }`}
              />
              <span className={`font-body text-[10px] font-bold tracking-[0.2em] uppercase ${isActive ? 'text-rose-300' : 'text-zinc-400'}`}>
                {item.statusLabel}
              </span>
            </div>
          </div>

          {/* Category eyebrow */}
          <div className="font-body text-[10px] font-semibold tracking-[0.3em] uppercase text-zinc-500 mb-3">
            {item.category}
          </div>

          {/* Title */}
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight uppercase leading-tight mb-4">
            {item.title}
          </h2>

          {/* Thesis quote */}
          <div className="relative pl-4 border-l-2 border-rose-500/40 mb-5">
            <p className="font-body text-sm sm:text-[15px] text-zinc-200 font-medium leading-relaxed italic">
              "{item.thesis}"
            </p>
          </div>

          {/* Description */}
          <p className="font-body text-sm text-zinc-400 leading-relaxed mb-6 max-w-3xl">
            {item.description}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] font-body text-[11px] tracking-wider text-zinc-300 transition-colors uppercase font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Bottom: Metrics + Canvas link */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-5 border-t border-white/[0.06]">
            {/* Metrics grid */}
            {item.metrics && item.metrics.length > 0 && (
              <div className="flex items-center gap-6">
                {item.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="space-y-0.5">
                    <span className="block font-body text-[9px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">{m.label}</span>
                    <span className="block font-body text-xs font-bold text-zinc-200">{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Canvas link */}
            {item.linkedNodeId && onFocusNodeOnCanvas && (
              <button
                type="button"
                onClick={() => {
                  playSound('select');
                  onFocusNodeOnCanvas(item.linkedNodeId!);
                }}
                className="inline-flex items-center gap-1.5 font-body text-xs tracking-wider uppercase text-rose-400 hover:text-rose-300 font-semibold group/link cursor-pointer focus:outline-none transition-colors"
              >
                <span>Inspect Node</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};


export const ChronicleView: React.FC<ChronicleViewProps> = ({
  onBackToCanvas,
  onFocusNodeOnCanvas,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // Trigger hero entrance after mount
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#0c0e12] text-[#ededed] font-body select-text overflow-hidden">
      {/* ═══════════ ATMOSPHERIC LAYERS ═══════════ */}

      {/* Background diagonal stripe grid (same as Cover page) */}
      <div className="fixed inset-0 pointer-events-none z-0 pattern-bg opacity-40" aria-hidden="true">
        <div className="cube-svg" />
      </div>

      {/* Coordinate dot overlay */}
      <div className="fixed inset-0 pointer-events-none bg-canvas-dots-overlay opacity-25 z-0" aria-hidden="true" />

      {/* Rose ambient glow — upper right (mirrors Cover) */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_75%_15%,rgba(225,29,72,0.12),transparent_55%)] z-0" aria-hidden="true" />

      {/* Secondary deep ambient — lower left */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_15%_85%,rgba(225,29,72,0.06),transparent_50%)] z-0" aria-hidden="true" />


      {/* ═══════════ HERO SECTION ═══════════ */}
      <div className="relative z-10 w-full pt-24 pb-0 px-6 sm:px-12 md:px-16">
        <div
          ref={heroRef}
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="max-w-7xl mx-auto"
        >
          {/* Top editorial eyebrow (matches Cover layout) */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2.5 font-body text-xs tracking-[0.25em] text-zinc-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span className="font-semibold text-zinc-300">CHRONICLE / 03</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-zinc-400 hidden sm:inline">RESEARCH & BUILD LOG</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-accent text-3xl leading-none text-rose-400/90 font-bold -mb-1 hidden sm:inline">
                2023 — 2026
              </span>
            </div>
          </div>

          {/* Grid: Hero title left + specs right (mirrors Cover asymmetric layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end pb-16 border-b border-white/[0.06]">
            {/* Left: Big editorial title */}
            <div className="lg:col-span-8 flex flex-col items-start">
              {/* Category pillar */}
              <div className="font-body text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-rose-400 mb-4 flex items-center gap-2">
                <span>MILESTONES</span>
                <span className="text-zinc-600">/</span>
                <span>EXPERIMENTS</span>
                <span className="text-zinc-600">/</span>
                <span>FOUNDATIONS</span>
              </div>

              {/* Monumental display title — Josefin Sans */}
              <h1 className="leading-[0.92] mb-6 select-none tracking-tight">
                <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-[-0.03em] uppercase">
                  COMPUTATIONAL
                </span>
                <span className="block font-display text-5xl sm:text-7xl md:text-8xl font-light text-zinc-400/90 tracking-[-0.02em] uppercase mt-1">
                  CHRONICLE
                </span>
              </h1>

              {/* Supporting copy */}
              <p className="font-body text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8 max-w-xl">
                A chronological record of what I am investigating, testing, and building across statistical learning, generative representations, and computational systems.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4 font-body">
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
                  href="#chronicle-entries"
                  onClick={() => playSound('secondaryClick')}
                  className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_24px_rgba(225,29,72,0.4)] hover:shadow-[0_0_32px_rgba(225,29,72,0.6)] flex items-center gap-2 group active:scale-95 cursor-pointer"
                >
                  <span>VIEW ENTRIES</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* Right column: Research stats (mirrors Cover's spec column) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col items-end text-right space-y-8 pl-8">
              <div className="space-y-2.5">
                <span className="font-accent text-3xl leading-none text-rose-400/80 block">
                  RESEARCH PHASES
                </span>
                {[
                  { label: 'ACTIVE INVESTIGATIONS', value: '01' },
                  { label: 'VERIFIED EXPERIMENTS', value: '02' },
                  { label: 'SYSTEMS DEPLOYED', value: '01' },
                  { label: 'FORMAL FOUNDATIONS', value: '01' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-end gap-3"
                  >
                    <span className="font-body text-xs text-zinc-400 font-medium tracking-[0.2em] uppercase">
                      {stat.label}
                    </span>
                    <span className="font-display text-lg font-bold text-white w-8 text-right">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/[0.08] max-w-[220px]">
                <p className="font-body text-xs text-zinc-400 leading-relaxed uppercase tracking-wider">
                  5 phases of research spanning systems architecture to generative models.
                </p>
                <div className="w-8 h-0.5 bg-rose-500 mt-3 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ═══════════ MILESTONE ENTRIES ═══════════ */}
      <div id="chronicle-entries" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 md:px-12 pt-12 pb-8">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-6 h-[1px] bg-rose-500" />
          <span className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">
            PHASE LEDGER • {MILESTONES.length} ENTRIES
          </span>
          <div className="flex-1 h-[1px] bg-white/[0.06]" />
        </div>

        {/* Milestone cards */}
        <div className="space-y-6">
          {MILESTONES.map((item, idx) => (
            <MilestoneCard
              key={item.id}
              item={item}
              index={idx}
              onFocusNodeOnCanvas={onFocusNodeOnCanvas}
            />
          ))}
        </div>
      </div>

      {/* ═══════════ LAB NOTE SECTION ═══════════ */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 md:px-12">
        <LabNoteSection />
      </div>

      {/* ═══════════ CLOSING COLOPHON ═══════════ */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 md:px-12 mt-16 pb-20">
        <div className="pt-10 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span className="font-semibold text-zinc-300">CHRONICLE ARCHIVE</span>
            <span className="text-zinc-600">&bull;</span>
            <span>VOL. 2026</span>
          </div>

          <div className="font-body text-xs text-zinc-400 font-medium tracking-[0.15em] uppercase">
            Open for Select Research &amp; Engineering Collaborations
          </div>
        </div>
      </div>
    </div>
  );
};
