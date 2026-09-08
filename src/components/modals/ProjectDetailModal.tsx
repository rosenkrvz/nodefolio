import React, { useEffect } from 'react';
import { ProjectItem } from '../../types';
import {
  X,
  ExternalLink,
  Github,
  Layers,
  Activity,
  Binary,
  Cpu,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Project Case Study: ${project.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-body"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#111419] border border-white/10 p-5 sm:p-8 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Eyebrow & Title */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-body text-xs font-bold tracking-wider text-rose-400 uppercase">
                Research Case Study • Machine Learning &amp; Representation
              </span>
            </div>
            <span className="font-accent text-3xl text-rose-300/80 leading-none hidden sm:inline">
              topology • manifold
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-wide uppercase">
            {project.title}
          </h2>
          <p className="font-body text-base sm:text-lg text-zinc-300 mt-2 leading-relaxed max-w-2xl">
            {project.tagline}
          </p>
        </div>

        {/* Visual Artifact Banner */}
        <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden border border-white/10 mb-8 bg-[#090b0e]">
          <img
            src={project.image}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111419] via-black/20 to-transparent" />
          
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-xs font-body font-medium text-zinc-300">
              Artifact: Latent Space Traversal Map
            </div>
            <div className="px-2.5 py-1 rounded bg-rose-950/80 backdrop-blur-sm border border-rose-500/40 text-xs font-body font-semibold text-rose-300">
              Interactive WebGL Accelerated
            </div>
          </div>
        </div>

        {/* Telemetry Metric Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {project.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
            >
              <div className="text-xs font-body font-semibold text-zinc-400 uppercase tracking-wider">{m.label}</div>
              <div className="text-base sm:text-lg font-display font-bold text-white mt-1">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Structured Case Study Sections */}
        <div className="space-y-8 border-t border-white/[0.08] pt-6 text-sm sm:text-base font-body">
          {/* 1. THE PROBLEM */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Binary className="w-4 h-4 text-rose-400" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                1. The Problem
              </h3>
            </div>
            <p className="text-zinc-200 leading-relaxed font-normal">
              High-dimensional neural representations (such as 512-D and 1024-D latent vectors from diffusion and transformer architectures) are fundamentally opaque. Researchers and engineers struggle to inspect topological cluster collapse, mode entanglement, or evaluate how continuous trajectory shifts alter generation semantics without brute-force inference passes.
            </p>
          </div>

          {/* 2. WHAT I BUILT */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-4 h-4 text-rose-400" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                2. What I Built
              </h3>
            </div>
            <p className="text-zinc-200 leading-relaxed font-normal">
              An interactive computational research interface that projects continuous high-dimensional manifolds down to an interpretable 3D topological workspace in real time. It enables interactive parametric exploration, manifold curve interpolation, and semantic cluster inspection with zero latency.
            </p>
          </div>

          {/* 3. HOW IT WORKS & ARCHITECTURE */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Activity className="w-4 h-4 text-rose-400" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                3. How It Works
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3 font-body text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-zinc-300 font-medium">
                <span className="font-bold text-rose-400">STAGE 01</span>
                <span>Extract High-D Tensor Embeddings (PyTorch)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-zinc-300 font-medium">
                <span className="font-bold text-rose-400">STAGE 02</span>
                <span>Dimensional Reduction via UMAP / t-SNE Optimization</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-zinc-300 font-medium">
                <span className="font-bold text-rose-400">STAGE 03</span>
                <span>Construct Neighborhood Topology &amp; Riemannian Geodesics</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span className="font-bold text-rose-400">STAGE 04</span>
                <span>Interactive Shader Projection &amp; Spherical Interpolation</span>
              </div>
            </div>
          </div>

          {/* 4. DATA / MODEL */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Cpu className="w-4 h-4 text-rose-400" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                4. Data &amp; Model Specifications
              </h3>
            </div>
            <ul className="space-y-2.5 text-zinc-200">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span><strong className="text-white">Representation Source:</strong> 512-dimensional bottleneck latent tensors derived from conditional diffusion models.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span><strong className="text-white">Mathematical Objectives:</strong> Minimization of cross-entropy fuzzy simplicial set divergence (UMAP objective function) alongside Kullback-Leibler divergence calibration.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span><strong className="text-white">Clustering Metric:</strong> Cosine similarity and Euclidean geodesic distance across continuous cluster centroids.</span>
              </li>
            </ul>
          </div>

          {/* 5. RESULTS & TELEMETRY */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <BarChart2 className="w-4 h-4 text-rose-400" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                5. Results &amp; Telemetry
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="font-bold text-white mb-1 font-body">Convergence &amp; Stability</div>
                <p className="text-zinc-300 leading-relaxed">Achieved steady gradient descent convergence with 0.0142 loss across 1,200 sample embedding checkpoints.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="font-bold text-white mb-1 font-body">Real-Time Fluidity</div>
                <p className="text-zinc-300 leading-relaxed">Maintained locked 60 FPS viewport orbit and parametric traversal using instanced buffer geometries.</p>
              </div>
            </div>
          </div>

          {/* 6. WHAT I LEARNED */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold">
                6. What I Learned
              </h3>
            </div>
            <p className="text-zinc-200 leading-relaxed font-normal">
              Learned the critical trade-offs between local fidelity and global structure preservation in non-linear dimensionality reduction. Discovered how high-dimensional space sparsity often leads to false clustering if perplexity hyper-parameters are not regularized against geometric manifold curvature.
            </p>
          </div>

          {/* 7. TECHNOLOGIES */}
          <div>
            <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-white font-bold mb-3">
              Technologies &amp; Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-body font-semibold bg-white/[0.04] text-zinc-200 border border-white/[0.08]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-3 pt-6 mt-8 border-t border-white/[0.08]">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body font-semibold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Explore Code Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs sm:text-sm font-body font-semibold transition-colors flex items-center gap-2 border border-white/[0.08]"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs sm:text-sm font-body font-semibold transition-colors border border-white/[0.06]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
