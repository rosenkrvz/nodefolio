import React from 'react';
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
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#111419] border border-white/10 p-5 sm:p-8 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Eyebrow & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-tech text-xs tracking-widest text-rose-400 uppercase">
              Research Case Study • Machine Learning &amp; Representation
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-normal tracking-tight">
            {project.title}
          </h2>
          <p className="font-body text-sm sm:text-base text-zinc-300 mt-1.5 leading-relaxed">
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
            <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[11px] font-tech text-zinc-300">
              Artifact: Latent Space Traversal Map
            </div>
            <div className="px-2.5 py-1 rounded bg-rose-950/70 backdrop-blur-sm border border-rose-500/30 text-[11px] font-tech text-rose-300">
              Interactive WebGL Accelerated
            </div>
          </div>
        </div>

        {/* Telemetry Metric Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {project.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center"
            >
              <div className="text-[10px] font-tech text-zinc-500 uppercase tracking-wider">{m.label}</div>
              <div className="text-sm font-tech font-semibold text-zinc-100 mt-1">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Structured Case Study Sections */}
        <div className="space-y-7 border-t border-white/[0.06] pt-6 text-xs sm:text-sm font-body">
          {/* 1. THE PROBLEM */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Binary className="w-4 h-4 text-rose-400" />
              <h3 className="font-tech text-xs uppercase tracking-widest text-zinc-400">
                1. The Problem
              </h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              High-dimensional neural representations (such as 512-D and 1024-D latent vectors from diffusion and transformer architectures) are fundamentally opaque. Researchers and engineers struggle to inspect topological cluster collapse, mode entanglement, or evaluate how continuous trajectory shifts alter generation semantics without brute-force inference passes.
            </p>
          </div>

          {/* 2. WHAT I BUILT */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <h3 className="font-tech text-xs uppercase tracking-widest text-zinc-400">
                2. What I Built
              </h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              An interactive computational research interface that projects continuous high-dimensional manifolds down to an interpretable 3D topological workspace in real time. It enables interactive parametric exploration, manifold curve interpolation, and semantic cluster inspection with zero latency.
            </p>
          </div>

          {/* 3. HOW IT WORKS & ARCHITECTURE */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <h3 className="font-tech text-xs uppercase tracking-widest text-zinc-400">
                3. How It Works
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3 font-tech text-xs text-zinc-300">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 text-zinc-400">
                <span>STAGE 01</span>
                <span>Extract High-D Tensor Embeddings (PyTorch)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 text-zinc-400">
                <span>STAGE 02</span>
                <span>Dimensional Reduction via UMAP / t-SNE Optimization</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 text-zinc-400">
                <span>STAGE 03</span>
                <span>Construct Neighborhood Topology &amp; Riemannian Geodesics</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>STAGE 04</span>
                <span>Interactive Shader Projection &amp; Spherical Interpolation</span>
              </div>
            </div>
          </div>

          {/* 4. DATA / MODEL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              <h3 className="font-tech text-xs uppercase tracking-widest text-zinc-400">
                4. Data &amp; Model Specifications
              </h3>
            </div>
            <ul className="space-y-2 text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span><strong>Representation Source:</strong> 512-dimensional bottleneck latent tensors derived from conditional diffusion models.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span><strong>Mathematical Objectives:</strong> Minimization of cross-entropy fuzzy simplicial set divergence (UMAP objective function) alongside Kullback-Leibler divergence calibration.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span><strong>Clustering Metric:</strong> Cosine similarity and Euclidean geodesic distance across continuous cluster centroids.</span>
              </li>
            </ul>
          </div>

          {/* 5. RESULTS & TELEMETRY */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-rose-400" />
              <h3 className="font-tech text-xs uppercase tracking-widest text-zinc-400">
                5. Results &amp; Telemetry
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="font-semibold text-white mb-1">Convergence &amp; Stability</div>
                <p className="text-zinc-400">Achieved steady gradient descent convergence with 0.0142 loss across 1,200 sample embedding checkpoints.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="font-semibold text-white mb-1">Real-Time Fluidity</div>
                <p className="text-zinc-400">Maintained locked 60 FPS viewport orbit and parametric traversal using instanced buffer geometries.</p>
              </div>
            </div>
          </div>

          {/* 6. WHAT I LEARNED */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <h3 className="font-tech text-xs uppercase tracking-widest text-zinc-400">
                6. What I Learned
              </h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Learned the critical trade-offs between local fidelity and global structure preservation in non-linear dimensionality reduction. Discovered how high-dimensional space sparsity often leads to false clustering if perplexity hyper-parameters are not regularized against geometric manifold curvature.
            </p>
          </div>

          {/* 7. TECHNOLOGIES */}
          <div>
            <h3 className="font-tech text-xs uppercase tracking-widest text-zinc-500 mb-2.5">
              Technologies &amp; Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-tech bg-white/[0.04] text-zinc-300 border border-white/[0.07]"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all text-center flex items-center justify-center gap-2"
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
              className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs transition-colors flex items-center gap-2"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
