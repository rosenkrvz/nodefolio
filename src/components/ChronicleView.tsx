import React from 'react';
import { ArrowLeft, ArrowUpRight } from './icons';
import { LabNoteSection } from './LabNoteSection';

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

export const ChronicleView: React.FC<ChronicleViewProps> = ({
  onBackToCanvas,
  onFocusNodeOnCanvas,
}) => {
  return (
    <div className="relative w-full min-h-screen bg-[#0c0e12] text-[#ededed] font-body select-text pt-24 pb-32 px-4 sm:px-8 md:px-12">
      {/* Subtle Coordinate dots texture */}
      <div className="fixed inset-0 pointer-events-none bg-canvas-dots-overlay opacity-30 z-0" aria-hidden="true" />

      {/* Atmospheric diagonal grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0 pattern-bg" aria-hidden="true" />

      {/* Subtle ambient illumination */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[500px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.06),transparent_65%)] z-0" aria-hidden="true" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 border-b border-white/[0.08]">
          <div className="space-y-3">
            {/* Editorial Eyebrow */}
            <div className="flex items-center gap-2.5 font-tech text-xs tracking-[0.28em] text-rose-400 font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-none bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span>RESEARCH &amp; BUILD JOURNAL</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-zinc-400">2023 — 2026</span>
            </div>

            {/* Monumental Headline in Satoshi */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-[-0.035em] uppercase leading-[0.92]">
              Computational Milestones
            </h1>

            {/* Concise Human Intro in Satoshi */}
            <p className="font-body text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-2xl pt-1">
              A chronological record of what I am investigating, testing, and building across statistical learning, generative representations, and computational systems.
            </p>
          </div>

          {/* Action: Return to Canvas */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={onBackToCanvas}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 font-tech text-xs tracking-[0.2em] uppercase font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer group shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-rose-400 transition-transform group-hover:-translate-x-1" />
              <span>Back to Canvas</span>
            </button>
          </div>
        </div>

        {/* Timeline Journal Ledger */}
        <div className="divide-y divide-white/[0.08]">
          {MILESTONES.map((item, idx) => {
            const isActive = item.status === 'active';

            return (
              <article
                key={item.id}
                className={`py-12 sm:py-16 transition-colors group ${
                  isActive ? 'bg-gradient-to-r from-rose-500/[0.02] via-transparent to-transparent -mx-4 sm:-mx-8 px-4 sm:px-8 rounded-2xl' : ''
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                  {/* Left Column: Period, Index & Status Badge */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Period Badge */}
                      <div className="flex items-center gap-2 font-tech text-xs tracking-[0.22em] text-zinc-400 uppercase font-semibold">
                        <span className="text-zinc-600">{item.phase}</span>
                        <span className="text-zinc-700">&bull;</span>
                        <span className={isActive ? 'text-rose-400 font-bold' : 'text-zinc-300'}>{item.period}</span>
                      </div>

                      {/* Status Stamp */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] font-tech text-[10px] tracking-[0.2em] uppercase font-semibold">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]' : 'bg-zinc-500'
                          }`}
                        />
                        <span className={isActive ? 'text-rose-300' : 'text-zinc-400'}>{item.statusLabel}</span>
                      </div>
                    </div>

                    {/* Metadata Telemetry Pill */}
                    {item.metrics && item.metrics.length > 0 && (
                      <div className="hidden sm:grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.05]">
                        {item.metrics.map((m, mIdx) => (
                          <div key={mIdx} className="space-y-0.5">
                            <span className="block font-tech text-[9px] tracking-wider text-zinc-500 uppercase">{m.label}</span>
                            <span className="block font-tech text-xs font-semibold text-zinc-300 truncate">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Content, Title, Thesis & Tags */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Category */}
                    <div className="font-tech text-[11px] font-semibold tracking-[0.25em] uppercase text-zinc-400 flex items-center gap-2">
                      <span>{item.category}</span>
                    </div>

                    {/* Title in Satoshi Bold Display */}
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase leading-snug group-hover:text-zinc-100 transition-colors">
                      {item.title}
                    </h2>

                    {/* Thesis In Italics / Satoshi Medium */}
                    <p className="font-body text-base text-zinc-200 font-medium leading-relaxed italic">
                      "{item.thesis}"
                    </p>

                    {/* Detailed Narrative in Satoshi Regular */}
                    <p className="font-body text-sm sm:text-[15px] text-zinc-400 font-normal leading-relaxed">
                      {item.description}
                    </p>

                    {/* Technical Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] font-tech text-[11px] tracking-wider text-zinc-300 transition-colors uppercase font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Canvas Link if node exists */}
                    {item.linkedNodeId && onFocusNodeOnCanvas && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => onFocusNodeOnCanvas(item.linkedNodeId!)}
                          className="inline-flex items-center gap-1.5 font-tech text-xs tracking-wider uppercase text-rose-400 hover:text-rose-300 font-semibold group/link cursor-pointer focus:outline-none transition-colors"
                        >
                          <span>Inspect Node on Spatial Canvas</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* LAB NOTE / INTERACTIVE EXPERIMENTAL ARTIFACT SECTION */}
        <LabNoteSection />

        {/* Closing Editorial Colophon */}
        <div className="mt-16 pt-10 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-tech text-xs tracking-widest uppercase text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-none bg-rose-500" />
            <span>CHRONICLE ARCHIVE // VOL. 2026</span>
          </div>

          <div className="text-zinc-400 font-medium">
            Open for Select Research &amp; Engineering Collaborations
          </div>
        </div>
      </div>
    </div>
  );
};
