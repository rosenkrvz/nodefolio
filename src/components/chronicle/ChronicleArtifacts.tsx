import React from 'react';

interface ArtifactProps {
  active?: boolean;
  className?: string;
}

/**
 * PHASE 05: Latent Manifold Traversal & Geodesics
 * Visualizes a Riemannian metric manifold with geodesic paths, vector field tangents,
 * and a surgical crimson routing point.
 */
export const LatentManifoldArtifact: React.FC<ArtifactProps> = ({ active = true, className = '' }) => {
  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#090b10] border border-white/[0.08] group/artifact transition-all duration-300 ${
        active ? 'border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.12)]' : 'hover:border-white/[0.16]'
      } ${className}`}
    >
      {/* Blueprint Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="manifold-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-500" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#manifold-grid)" />
      </svg>

      {/* Riemannian Curvature Vector Field & Geodesic Curve */}
      <svg
        viewBox="0 0 400 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full p-2"
      >
        {/* Iso-potential curvature contours */}
        <path
          d="M30 180 C 100 230, 260 210, 370 160"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d="M30 140 C 120 190, 270 170, 370 110"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <path
          d="M40 90 C 130 140, 270 120, 360 60"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
        />
        <path
          d="M50 40 C 140 80, 280 60, 350 20"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Transverse Latent Mesh Geodesics */}
        <path
          d="M90 30 C 110 100, 100 170, 70 210"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <path
          d="M170 35 C 190 105, 180 165, 150 215"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <path
          d="M250 30 C 270 95, 260 160, 240 205"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <path
          d="M320 25 C 335 80, 325 140, 310 185"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* Primary Geodesic Trajectory (Optimal Score-Matching Transport Path) */}
        <path
          d="M 50 160 C 120 200, 180 60, 350 90"
          stroke="#f43f5e"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-500 group-hover/artifact:stroke-rose-400"
        />

        {/* Vector Tangents along the Geodesic */}
        <line x1="120" y1="170" x2="150" y2="150" stroke="#f43f5e" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="195" y1="88" x2="225" y2="78" stroke="#f43f5e" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="280" y1="78" x2="310" y2="82" stroke="#f43f5e" strokeWidth="1.2" strokeOpacity="0.7" />

        {/* Source point */}
        <circle cx="50" cy="160" r="3.5" fill="#a1a1aa" />
        <text x="42" y="180" fill="#71717a" fontSize="8" fontFamily="monospace">z₀</text>

        {/* Target point */}
        <circle cx="350" cy="90" r="3.5" fill="#a1a1aa" />
        <text x="355" y="94" fill="#71717a" fontSize="8" fontFamily="monospace">z₁</text>

        {/* Dynamic Critical Nexus / Saddle Point */}
        <g className="transition-transform duration-300 group-hover/artifact:scale-110" style={{ transformOrigin: '195px 88px' }}>
          <circle cx="195" cy="88" r="8" fill="#f43f5e" fillOpacity="0.2" className="animate-ping" />
          <circle cx="195" cy="88" r="4.5" fill="#f43f5e" />
          <circle cx="195" cy="88" r="1.5" fill="#ffffff" />
        </g>
        <text x="180" y="70" fill="#f43f5e" fontSize="9" fontWeight="600" fontFamily="monospace">
          γ(t*) ∈ M
        </text>
      </svg>

      {/* Telemetry Status Bar */}
      <div className="absolute bottom-2 inset-x-3 flex items-center justify-between font-tech text-[9px] uppercase tracking-widest text-zinc-500 bg-[#090b10]/80 backdrop-blur-sm px-2 py-1 rounded border border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-zinc-300">RIEMANNIAN GEODESIC</span>
        </div>
        <span className="text-zinc-400">g_ij(z) ∇ ṫ = 0</span>
      </div>
    </div>
  );
};

/**
 * PHASE 04: Self-Attention Kernel Optimization & KV-Cache Dynamics
 * Visualizes tiled matrix SRAM memory partitioning (FlashAttention logic) and IO-aware throughput.
 */
export const AttentionKernelArtifact: React.FC<ArtifactProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#090b10] border border-white/[0.08] hover:border-white/[0.18] group/artifact transition-all duration-300 ${className}`}
    >
      <div className="absolute inset-0 p-3.5 flex flex-col justify-between">
        {/* Header telemetry */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 font-tech text-[9px] tracking-widest text-zinc-400 uppercase">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-xs bg-cyan-400" />
            SRAM TILING KERNEL
          </span>
          <span className="text-zinc-400">B_r × B_c = 64×64</span>
        </div>

        {/* Matrix Tiles Graphic */}
        <div className="grid grid-cols-12 gap-2 my-auto items-center">
          {/* Query Block */}
          <div className="col-span-3 space-y-1">
            <div className="font-tech text-[8px] text-zinc-400 uppercase tracking-wider text-center">Q BLOCK</div>
            <div className="grid grid-cols-3 gap-1 p-1 rounded bg-white/[0.02] border border-white/[0.08]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 rounded-xs transition-colors duration-200 ${
                    i === 3 ? 'bg-cyan-500/50 border border-cyan-400' : 'bg-white/[0.04]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="col-span-1 text-center font-tech text-zinc-500 text-xs">⊗</div>

          {/* Key Block Transposed */}
          <div className="col-span-4 space-y-1">
            <div className="font-tech text-[8px] text-zinc-400 uppercase tracking-wider text-center">K^T SLICE</div>
            <div className="grid grid-cols-4 gap-1 p-1 rounded bg-white/[0.02] border border-white/[0.08]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 rounded-xs transition-colors duration-200 ${
                    i === 2 || i === 6 ? 'bg-rose-500/50 border border-rose-400' : 'bg-white/[0.04]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="col-span-1 text-center font-tech text-zinc-500 text-xs">➔</div>

          {/* Online Softmax Accumulator */}
          <div className="col-span-3 space-y-1">
            <div className="font-tech text-[8px] text-zinc-400 uppercase tracking-wider text-center">O_TILE</div>
            <div className="h-[42px] rounded p-1.5 bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-rose-400 h-full w-[82%]" />
              </div>
              <div className="flex justify-between font-tech text-[7px] text-zinc-400">
                <span>MEM IO</span>
                <span className="text-zinc-200 font-bold">1.84 TB/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footnote */}
        <div className="flex items-center justify-between font-tech text-[8px] text-zinc-400 border-t border-white/[0.06] pt-1.5">
          <span>HBM ⇄ ON-CHIP SRAM PASS</span>
          <span className="text-rose-400">ZERO VRAM SPILL</span>
        </div>
      </div>
    </div>
  );
};

/**
 * PHASE 03: Hyperspherical Uniformity & Contrastive Representation Spaces
 * Visualizes a projection unit sphere S^{d-1}, alignment forces, and uniform repulsive distribution.
 */
export const HypersphereContrastiveArtifact: React.FC<ArtifactProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#090b10] border border-white/[0.08] hover:border-white/[0.18] group/artifact transition-all duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-2"
      >
        {/* Hypersphere Perimeter */}
        <ellipse cx="160" cy="100" rx="80" ry="75" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
        <ellipse cx="160" cy="100" rx="80" ry="24" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <ellipse cx="160" cy="100" rx="26" ry="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

        {/* Polar Axis */}
        <line x1="160" y1="15" x2="160" y2="185" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />

        {/* Repulsive Force Field Arcs */}
        <path d="M 120 70 Q 140 100 120 130" stroke="rgba(244,63,94,0.35)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 200 70 Q 180 100 200 130" stroke="rgba(244,63,94,0.35)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Anchor Node (z_i) */}
        <circle cx="140" cy="85" r="4" fill="#f43f5e" />
        <text x="126" y="80" fill="#f43f5e" fontSize="8" fontFamily="monospace">z_i (anchor)</text>

        {/* Positive Pair (z_i^+) with attractive alignment vector */}
        <circle cx="152" cy="74" r="3.5" fill="#38bdf8" />
        <line x1="140" y1="85" x2="152" y2="74" stroke="#38bdf8" strokeWidth="1.4" />

        {/* Hard Negatives with repulsion arrows */}
        <circle cx="210" cy="115" r="3" fill="#71717a" />
        <circle cx="185" cy="140" r="3" fill="#71717a" />
        <circle cx="105" cy="115" r="3" fill="#71717a" />

        {/* Repulsion vectors from anchor to negatives */}
        <line x1="140" y1="85" x2="185" y2="140" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="140" y1="85" x2="210" y2="115" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 2" />

        {/* Mathematical formulation banner */}
        <rect x="18" y="166" width="130" height="20" rx="3" fill="rgba(12,14,20,0.85)" stroke="rgba(255,255,255,0.08)" />
        <text x="24" y="179" fill="#a1a1aa" fontSize="7.5" fontFamily="monospace">
          ℒ_align + λℒ_uniform (τ=0.07)
        </text>
      </svg>

      <div className="absolute top-2.5 right-3 font-tech text-[8px] text-zinc-400 tracking-wider">
        {"S^{d-1} EMBEDDING MANIFOLD"}
      </div>
    </div>
  );
};

/**
 * PHASE 02: Convex Optimization, Probability & Statistical Machine Learning
 * Visualizes loss contour ellipses, gradient descent trajectory, and Lagrangian dual hyperplane.
 */
export const ConvexOptimizationArtifact: React.FC<ArtifactProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#090b10] border border-white/[0.08] hover:border-white/[0.18] group/artifact transition-all duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-2"
      >
        {/* Elliptical Loss Contours */}
        <ellipse cx="170" cy="100" rx="110" ry="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <ellipse cx="170" cy="100" rx="80" ry="42" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        <ellipse cx="170" cy="100" rx="50" ry="25" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <ellipse cx="170" cy="100" rx="20" ry="10" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

        {/* Global Optima x* */}
        <circle cx="170" cy="100" r="2.5" fill="#f43f5e" />
        <text x="175" y="103" fill="#f43f5e" fontSize="8" fontFamily="monospace">θ* (min)</text>

        {/* Gradient Descent Optimization Steps */}
        <polyline
          points="70,50 110,85 135,78 150,110 162,96 170,100"
          stroke="#f43f5e"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Step Nodes */}
        <circle cx="70" cy="50" r="2.5" fill="#a1a1aa" />
        <circle cx="110" cy="85" r="2" fill="#a1a1aa" />
        <circle cx="135" cy="78" r="2" fill="#a1a1aa" />
        <circle cx="150" cy="110" r="2" fill="#a1a1aa" />

        {/* Hyperplane constraint: g(x) <= 0 */}
        <line x1="60" y1="180" x2="280" y2="40" stroke="rgba(56,189,248,0.4)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="210" y="55" fill="#38bdf8" fontSize="8" fontFamily="monospace">∇f(θ*) + λ∇g(θ*) = 0</text>
      </svg>

      <div className="absolute bottom-2.5 left-3 font-tech text-[8px] text-zinc-400 tracking-wider">
        LAGRANGIAN DUALITY & KKT CONVERGENCE
      </div>
    </div>
  );
};

/**
 * PHASE 01: Systems Architecture & Reverse-Mode Autodiff Engine
 * Visualizes a DAG computational graph tape with forward evaluation and reverse-mode adjoint accumulation.
 */
export const AutogradDAGArtifact: React.FC<ArtifactProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#090b10] border border-white/[0.08] hover:border-white/[0.18] group/artifact transition-all duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-2"
      >
        {/* Forward Directed Edges */}
        <line x1="50" y1="60" x2="120" y2="85" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
        <line x1="50" y1="140" x2="120" y2="115" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
        <line x1="150" y1="100" x2="210" y2="100" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
        <line x1="240" y1="100" x2="280" y2="100" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />

        {/* Backward Adjoint Gradient Propagation Curves */}
        <path d="M 280 110 C 255 125, 235 125, 210 115" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3 3" />
        <path d="M 120 125 C 90 155, 75 155, 50 150" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* Input Leaf Node x_1 */}
        <circle cx="50" cy="60" r="12" fill="#12141a" stroke="rgba(255,255,255,0.25)" />
        <text x="46" y="64" fill="#e4e4e7" fontSize="9" fontFamily="monospace">x₁</text>

        {/* Input Leaf Node x_2 */}
        <circle cx="50" cy="140" r="12" fill="#12141a" stroke="rgba(255,255,255,0.25)" />
        <text x="46" y="144" fill="#e4e4e7" fontSize="9" fontFamily="monospace">x₂</text>

        {/* Intermediate Operator Node: Mul (*) */}
        <circle cx="135" cy="100" r="14" fill="#18181b" stroke="#38bdf8" strokeWidth="1.2" />
        <text x="131" y="104" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">*</text>

        {/* Non-linear Activation Node: ReLU */}
        <rect x="210" y="86" width="30" height="28" rx="6" fill="#18181b" stroke="rgba(255,255,255,0.3)" />
        <text x="216" y="103" fill="#e4e4e7" fontSize="8" fontFamily="monospace">ReLU</text>

        {/* Loss Node L */}
        <circle cx="290" cy="100" r="14" fill="#12141a" stroke="#f43f5e" strokeWidth="1.5" />
        <text x="286" y="104" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">ℒ</text>

        {/* Reverse Gradient Label */}
        <text x="120" y="152" fill="#f43f5e" fontSize="8" fontFamily="monospace">∂ℒ/∂x = (∂ℒ/∂y)·(∂y/∂x)</text>
      </svg>

      <div className="absolute top-2.5 right-3 font-tech text-[8px] text-zinc-400 tracking-wider">
        TOPOLOGICAL DAG REVERSE TAPE
      </div>
    </div>
  );
};

/**
 * Dispatcher helper to render the appropriate artifact for each milestone
 */
export const ChronicleMilestoneArtifact: React.FC<{
  milestoneId: string;
  active?: boolean;
  className?: string;
}> = ({ milestoneId, active = false, className = '' }) => {
  switch (milestoneId) {
    case 'm1':
      return <LatentManifoldArtifact active={active} className={className} />;
    case 'm2':
      return <AttentionKernelArtifact className={className} />;
    case 'm3':
      return <HypersphereContrastiveArtifact className={className} />;
    case 'm4':
      return <ConvexOptimizationArtifact className={className} />;
    case 'm5':
      return <AutogradDAGArtifact className={className} />;
    default:
      return <LatentManifoldArtifact active={active} className={className} />;
  }
};
