import React from 'react';
import { NodeData } from '../../types';
import {
  Close,
} from '../icons';

interface NodeCharacterBannerProps {
  node: NodeData;
  isContentVisible?: boolean;
  onClose?: () => void;
  status?: { label: string; state: string; pulse: boolean };
}

export const NodeCharacterBanner: React.FC<NodeCharacterBannerProps> = ({
  node,
  isContentVisible = true,
  onClose,
  status,
}) => {
  const accent = node.accentColor || '#e11d48';

  // Specific domain configuration per node ID or category
  const getBannerMeta = () => {
    switch (node.id) {
      case 'node-models':
        return {
          domainBadge: 'DEEP GENERATIVE MANIFOLD',
          specSubtitle: 'CONTINUOUS SDE // MULTI-HEAD ATTENTION MECHANICS',
          mathFormula: 'dx = -½ β(t)x dt + √β(t) dw • Softmax(QKᵀ / √d_k)V',
          symbolTitle: 'GEN-CORE 01',
          symbolGlyph: '⨂',
          symbolSub: 'SCORE SDE',
          telemetry: [
            { label: 'ARCH', value: 'DIFFUSION × ATTN' },
            { label: 'PRECISION', value: 'BF16 TENSORS' },
            { label: 'LATENT DIM', value: '512-D CONTINUOUS' },
            { label: 'SAMPLER', value: 'EDM 50-STEP' },
          ],
        };
      case 'node-systems':
        return {
          domainBadge: 'NEURAL PIPELINE & DATA INFRASTRUCTURE',
          specSubtitle: 'HNSW VECTOR RETRIEVAL // ZERO-COPY ARROW STREAMING',
          mathFormula: 'd(u,v) = 1 - (u·v)/(‖u‖‖v‖) • IPC Throughput ≥ 420 MB/s',
          symbolTitle: 'SYS-STREAM 02',
          symbolGlyph: '☵',
          symbolSub: 'HNSW CLUSTER',
          telemetry: [
            { label: 'INGESTION', value: '420 MB/S PEAK' },
            { label: 'INDEX', value: 'HNSW M=32' },
            { label: 'LATENCY', value: 'p99 12.4MS' },
            { label: 'ENGINE', value: 'TENSORRT 10' },
          ],
        };
      case 'node-credentials':
        return {
          domainBadge: 'ACADEMIC RIGOR & FORMAL FOUNDATIONS',
          specSubtitle: 'IIT JODHPUR • MATHEMATICAL & COMPUTATIONAL HONORS',
          mathFormula: '∀ ϵ > 0 ∃ δ > 0 • ∫_ℳ dω = ∫_{∂ℳ} ω • 𝒢 = (𝒱, ℰ, 𝒲)',
          symbolTitle: 'IITJ-RIGOR 03',
          symbolGlyph: '⌬',
          symbolSub: 'FORMAL LOGIC',
          telemetry: [
            { label: 'INSTITUTE', value: 'IIT JODHPUR' },
            { label: 'PROGRAM', value: 'B.S. AI & DS' },
            { label: 'HONORS', value: 'FIRST CLASS' },
            { label: 'CORE', value: 'TENSOR CALCULUS' },
          ],
        };
      case 'node-project':
        return {
          domainBadge: 'INTERACTIVE RESEARCH ARTIFACT',
          specSubtitle: '512-D MANIFOLD PROJECTION // RIEMANNIAN EMBEDDINGS',
          mathFormula: 'f: ℝ⁵¹² ↦ ℳ³ • Geodesic Distance Minimization',
          symbolTitle: 'LGV-MANIFOLD 04',
          symbolGlyph: '⬡',
          symbolSub: '3D GRAPH',
          telemetry: [
            { label: 'PROJECTION', value: '3D MANIFOLD' },
            { label: 'TOPOLOGY', value: 'RIEMANNIAN' },
            { label: 'INPUT DIM', value: '512-D VECTORS' },
            { label: 'PIPELINE', value: 'WEBGL / SHADERS' },
          ],
        };
      case 'node-profile':
        return {
          domainBadge: 'RESEARCHER IDENTITY & THESIS CORE',
          specSubtitle: 'AI & DATA SCIENCE RESEARCHER // IIT JODHPUR',
          mathFormula: 'argmax_θ 𝔼[log p_θ(x)] • Latent Representation Learning',
          symbolTitle: 'SHUBHAM-047',
          symbolGlyph: '◈',
          symbolSub: 'RESEARCH CORE',
          telemetry: [
            { label: 'AFFILIATION', value: 'IIT JODHPUR' },
            { label: 'TENURE', value: '2025 — 2029' },
            { label: 'FOCUS', value: 'GENERATIVE / AI' },
            { label: 'LOCATION', value: 'GHAZIABAD / IITJ' },
          ],
        };
      case 'node-clock':
        return {
          domainBadge: 'TEMPORAL SYNCHRONIZATION BEACON',
          specSubtitle: 'HIGH-STABILITY QUARTZ OSCILLATOR // DETERMINISTIC SYNC',
          mathFormula: 'y(t) = A sin(2π f₀ t + ϕ) • Drift: ±0.002 ms',
          symbolTitle: 'QUARTZ-REF 00',
          symbolGlyph: '◎',
          symbolSub: '60 HZ SYNC',
          telemetry: [
            { label: 'STABILITY', value: '±0.002 MS' },
            { label: 'FREQUENCY', value: '60.000 HZ' },
            { label: 'SYNC MODE', value: 'EPOCH LOCKED' },
            { label: 'BUS', value: 'TOPOLOGICAL' },
          ],
        };
      default:
        return {
          domainBadge: `${node.category.toUpperCase()} // ARTIFACT ${node.id.toUpperCase()}`,
          specSubtitle: 'COMPUTATIONAL SYSTEM COMPONENT',
          mathFormula: 'f(x) ∈ ℳ • State: Synchronized',
          symbolTitle: node.id.toUpperCase(),
          symbolGlyph: '⨂',
          symbolSub: 'ACTIVE',
          telemetry: [
            { label: 'CATEGORY', value: node.category.toUpperCase() },
            { label: 'COORDS', value: `[${Math.round(node.x)}, ${Math.round(node.y)}]` },
            { label: 'PORTS', value: `${(node.inputs?.length || 0) + (node.outputs?.length || 0)}` },
            { label: 'STATE', value: 'COMPILED' },
          ],
        };
    }
  };

  const meta = getBannerMeta();

  return (
    <div className="relative w-full overflow-hidden border-b border-white/[0.12] bg-[#07090e] select-none shrink-0">
      {/* 1. Underlying Thematic Schematic Vector Art */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Generative Architectures Vector Art */}
        {node.id === 'node-models' && (
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            preserveAspectRatio="none"
            viewBox="0 0 900 240"
          >
            <defs>
              <linearGradient id="gen-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#be123c" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#881337" stopOpacity="0.05" />
              </linearGradient>
              <pattern id="gen-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(244,63,94,0.12)" strokeWidth="0.8" />
                <circle cx="30" cy="30" r="1" fill="rgba(244,63,94,0.35)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gen-grid)" />

            {/* Stochastic diffusion trajectory curves */}
            <path
              d="M 50 180 C 180 60, 280 220, 420 110 S 620 40, 850 140"
              fill="none"
              stroke="url(#gen-grad-1)"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <path
              d="M 50 160 C 220 220, 360 40, 520 150 S 740 200, 880 70"
              fill="none"
              stroke="rgba(225,29,72,0.35)"
              strokeWidth="1.5"
            />
            {/* Attention projection rays */}
            {[180, 240, 300, 360, 420, 480, 540, 600, 660, 720].map((x, i) => (
              <line
                key={i}
                x1={x}
                y1={30}
                x2={x + (i % 2 === 0 ? 40 : -30)}
                y2={210}
                stroke="rgba(244,63,94,0.15)"
                strokeWidth="1"
              />
            ))}
            {/* Latent clusters */}
            <circle cx="420" cy="110" r="32" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="420" cy="110" r="16" fill="rgba(244,63,94,0.2)" stroke="#f43f5e" strokeWidth="1.5" />
            <circle cx="420" cy="110" r="4" fill="#ffffff" />

            <circle cx="680" cy="80" r="24" fill="none" stroke="#be123c" strokeWidth="1" opacity="0.5" />
            <circle cx="680" cy="80" r="8" fill="rgba(190,18,60,0.3)" />
            <circle cx="210" cy="140" r="20" fill="none" stroke="#fda4af" strokeWidth="1" opacity="0.4" />
          </svg>
        )}

        {/* Neural Systems & Data Infrastructure Vector Art */}
        {node.id === 'node-systems' && (
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            preserveAspectRatio="none"
            viewBox="0 0 900 240"
          >
            <defs>
              <pattern id="sys-hex" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 40 10 L 40 30 L 20 40 L 0 30 L 0 10 Z" fill="none" stroke="rgba(225,29,72,0.12)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sys-hex)" />
            {/* Stream pipes */}
            <path d="M 0 60 H 900" stroke="rgba(244,63,94,0.25)" strokeWidth="2" strokeDasharray="12 6" />
            <path d="M 0 120 H 900" stroke="rgba(244,63,94,0.45)" strokeWidth="1.5" />
            <path d="M 0 180 H 900" stroke="rgba(244,63,94,0.2)" strokeWidth="2" strokeDasharray="8 4" />
            {/* HNSW Tree nodes */}
            <circle cx="280" cy="120" r="18" fill="rgba(225,29,72,0.25)" stroke="#f43f5e" strokeWidth="1.5" />
            <circle cx="460" cy="60" r="14" fill="rgba(225,29,72,0.2)" stroke="#f43f5e" strokeWidth="1.5" />
            <circle cx="640" cy="180" r="16" fill="rgba(225,29,72,0.25)" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="280" y1="120" x2="460" y2="60" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="460" y1="60" x2="640" y2="180" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.4" />
          </svg>
        )}

        {/* Academic & Foundation Rigor Vector Art */}
        {node.id === 'node-credentials' && (
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            preserveAspectRatio="none"
            viewBox="0 0 900 240"
          >
            <defs>
              <pattern id="acad-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <rect width="24" height="24" fill="none" stroke="rgba(225,29,72,0.12)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#acad-grid)" />
            {/* Concentric coordinate rings & geometry */}
            <circle cx="720" cy="120" r="90" fill="none" stroke="rgba(225,29,72,0.25)" strokeWidth="1" strokeDasharray="6 4" />
            <circle cx="720" cy="120" r="60" fill="none" stroke="rgba(244,63,94,0.35)" strokeWidth="1.5" />
            <circle cx="720" cy="120" r="30" fill="rgba(225,29,72,0.15)" stroke="#f43f5e" strokeWidth="1" />
            {/* Coordinate axes */}
            <line x1="600" y1="120" x2="840" y2="120" stroke="rgba(244,63,94,0.4)" strokeWidth="1" />
            <line x1="720" y1="10" x2="720" y2="230" stroke="rgba(244,63,94,0.4)" strokeWidth="1" />
          </svg>
        )}

        {/* Latent Graph Visualizer Project Banner */}
        {node.id === 'node-project' && node.project?.image && (
          <div className="absolute inset-0">
            <img
              src={node.project.image}
              alt={node.project.title}
              className="w-full h-full object-cover object-center opacity-45 scale-105 filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/70 to-[#07090e]/85" />
          </div>
        )}

        {/* Profile Avatar Vignette */}
        {node.id === 'node-profile' && node.profile?.avatar && (
          <div className="absolute right-0 top-0 bottom-0 w-80 overflow-hidden pointer-events-none opacity-30">
            <img
              src={node.profile.avatar}
              alt={node.profile.name}
              className="w-full h-full object-cover object-top filter grayscale contrast-150"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#07090e]/80 to-[#07090e]" />
          </div>
        )}

        {/* System Chronometer Vector Art */}
        {node.id === 'node-clock' && (
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            preserveAspectRatio="none"
            viewBox="0 0 900 240"
          >
            {/* Harmonic sine wave */}
            <path
              d="M 0 120 Q 75 40, 150 120 T 300 120 T 450 120 T 600 120 T 750 120 T 900 120"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <path
              d="M 0 120 Q 75 190, 150 120 T 300 120 T 450 120 T 600 120 T 750 120 T 900 120"
              fill="none"
              stroke="rgba(244,63,94,0.25)"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
            {/* Quartz chronometer dial */}
            <circle cx="760" cy="120" r="70" fill="none" stroke="rgba(244,63,94,0.3)" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="760" cy="120" r="45" fill="rgba(225,29,72,0.15)" stroke="#f43f5e" strokeWidth="1.5" />
          </svg>
        )}
      </div>

      {/* 2. Radiant Gradient Accents & Scanline Atmosphere */}
      <div
        className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
      />
      <div
        className="absolute -bottom-16 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 75%)` }}
      />

      {/* Cybernetic Scanline Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]"
        aria-hidden="true"
      />

      {/* Fade overlay blending downward into chassis content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07090e]/30 to-[#0c0e14] pointer-events-none" />

      {/* 3. Foreground Content */}
      <div className="relative z-10 px-4 sm:px-8 pt-4 sm:pt-5 pb-4 sm:pb-5 flex flex-col justify-between gap-3.5">
        {/* Top Eyebrow Row: Category Specs, Status Badge & Close Action */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 240ms ease 30ms, transform 240ms cubic-bezier(0.16, 1, 0.3, 1) 30ms',
          }}
          className="flex items-center justify-between gap-3"
        >
          {/* Left Metadata Chips */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span
              className={`w-1.5 h-1.5 shrink-0 ${
                status?.pulse
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                  : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
              }`}
            />
            <span className="font-mono text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] truncate">
              {node.category.toUpperCase()} // ARTIFACT {meta.symbolTitle}
            </span>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest hidden sm:inline">
              {meta.domainBadge}
            </span>
          </div>

          {/* Right Header Status & Dismissal */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {status && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-black/60 border border-white/[0.12] text-[10px] font-mono text-zinc-300 uppercase tracking-wider backdrop-blur-xs">
                <span className="text-rose-400 font-bold">{status.label}:</span>
                <span className="text-zinc-200">{status.state}</span>
              </div>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close inspection panel"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white/[0.06] hover:bg-rose-500/20 active:bg-rose-500/30 text-zinc-300 hover:text-white border border-white/10 hover:border-rose-500/50 transition-all cursor-pointer shadow-sm"
                title="Close inspection (ESC)"
              >
                <Close className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Hero: Symbol Insignia + Headline Title + Dedicated Secondary Specs Row */}
        <div
          style={{
            opacity: isContentVisible ? 1 : 0,
            transform: isContentVisible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 280ms ease 60ms, transform 280ms cubic-bezier(0.16, 1, 0.3, 1) 60ms',
          }}
          className="flex flex-col gap-3.5"
        >
          {/* Main Title Row: 100% full horizontal width, bold typography, ZERO truncation or ellipses */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full">
            {/* Thematic Character Emblem Badge */}
            <div className="relative group shrink-0">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-black/80 border-2 border-rose-500/60 flex flex-col items-center justify-center shadow-[0_0_24px_rgba(225,29,72,0.30)] relative overflow-hidden transition-all duration-300 group-hover:border-rose-400"
              >
                {/* Rotating background reticle */}
                <div className="absolute inset-0 border border-rose-500/25 rounded-sm rotate-45 pointer-events-none" />
                <span className="font-mono text-xl sm:text-2xl font-black text-rose-400 drop-shadow-[0_0_8px_#f43f5e] relative z-10 leading-none">
                  {meta.symbolGlyph}
                </span>
                <span className="font-mono text-[7px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5 relative z-10">
                  {meta.symbolSub}
                </span>
              </div>
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-rose-400 pointer-events-none" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-rose-400 pointer-events-none" />
            </div>

            {/* Title & Subtitle Container */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 uppercase tracking-widest">
                  {meta.symbolTitle}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bold tracking-tight uppercase leading-tight whitespace-normal break-words">
                {node.title}
              </h2>
              {node.subtitle && (
                <p className="font-serif italic text-xs sm:text-sm text-zinc-300 font-normal mt-0.5 tracking-wide">
                  {node.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Secondary Specs Row: Dedicated 4-column horizontal grid below title, giving full breathing room */}
          <div className="pt-2 border-t border-white/[0.08] w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {meta.telemetry.map((t, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1.5 rounded bg-black/60 border border-white/[0.10] shadow-2xs backdrop-blur-xs flex flex-col justify-center"
                >
                  <div className="font-mono text-[8px] text-rose-400 font-bold uppercase tracking-wider">
                    {t.label}
                  </div>
                  <div className="font-mono text-[10px] sm:text-[11px] font-semibold text-zinc-200 uppercase tracking-tight mt-0.5 truncate">
                    {t.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
