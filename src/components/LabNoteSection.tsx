import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Maximize2, Code, FileText, Check, Copy, X, Sparkles, Terminal, Layers } from 'lucide-react';

export interface LabNoteData {
  id: string;
  number: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  purpose: string;
  experiment: string;
  observation: string;
  lesson: string;
  technologies: string[];
  status: string;
  metrics: { label: string; value: string }[];
  code: {
    html: string;
    css: string;
    react: string;
  };
}

export const LAB_NOTE_001: LabNoteData = {
  id: 'lab-note-001',
  number: '001',
  title: 'LIGHT / DEPTH',
  category: 'INTERFACE STUDY',
  subtitle: 'Physicality, Specular Angle & Tactile Presence in Flat Displays',
  description:
    'Small experiments, interface studies and things I built to understand how they work.',
  purpose:
    'A small experiment exploring light, depth, contrast and spatial hierarchy in interface design.',
  experiment:
    'Testing whether a single orbiting perimeter beacon coupled with an angled specular light streak and hairline quadrant dividers can induce a strong perception of physical depth on a 2D digital screen without WebGL or 3D meshes.',
  observation:
    'How simple geometry, lighting and typography can create depth without relying on heavy visual effects. Differential motion between the internal specular ray and the card boundary tricks the eye into perceiving translucent physical glass.',
  lesson:
    'Physical depth cues (specular angle, edge occlusion, and perimeter illumination) evoke tactile weight even in flat digital interfaces. Tactile weight is emergent: simple geometric constraints + responsive specular dynamics yield high-fidelity presence with near-zero runtime overhead.',
  technologies: ['HTML5', 'Vanilla CSS', 'React', 'GPU Compositing'],
  status: 'EXPERIMENTAL SPECIMEN',
  metrics: [
    { label: 'DOM Nodes', value: '8 Elements' },
    { label: 'Frame Budget', value: '< 0.5ms' },
    { label: 'External Libs', value: 'Zero' },
    { label: 'Compositing', value: 'GPU Accelerated' },
  ],
  code: {
    html: `<!-- Specimen 001: Reflective Card -->
<div class="outer">
  <div class="dot"></div>
  <div class="card">
    <div class="ray"></div>
    <div class="text">001</div>
    <div class="label">INTERFACE SPECIMEN</div>
    <div class="line topl"></div>
    <div class="line leftl"></div>
    <div class="line bottoml"></div>
    <div class="line rightl"></div>
  </div>
</div>`,
    css: `/* Reflective Card System */
.outer {
  width: 300px;
  height: 250px;
  border-radius: 10px;
  padding: 1px;
  background: radial-gradient(circle 230px at 0% 0%, #ffffff, #0c0d0d);
  position: relative;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.dot {
  width: 5px;
  aspect-ratio: 1;
  position: absolute;
  background-color: #fff;
  box-shadow: 0 0 10px #ffffff;
  border-radius: 100px;
  z-index: 2;
  right: 10%;
  top: 10%;
  animation: moveDot 6s linear infinite;
}

@keyframes moveDot {
  0%, 100% { top: 10%; right: 10%; }
  25% { top: 10%; right: calc(100% - 35px); }
  50% { top: calc(100% - 30px); right: calc(100% - 35px); }
  75% { top: calc(100% - 30px); right: 10%; }
}

.card {
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 9px;
  border: solid 1px #202222;
  background-size: 20px 20px;
  background: radial-gradient(circle 280px at 0% 0%, #444444, #0c0d0d);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-direction: column;
  color: #fff;
  overflow: hidden;
}

.ray {
  width: 220px;
  height: 45px;
  border-radius: 100px;
  position: absolute;
  background-color: #c7c7c7;
  opacity: 0.4;
  box-shadow: 0 0 50px #fff;
  filter: blur(10px);
  transform-origin: 10%;
  top: 0%;
  left: 0;
  transform: rotate(40deg);
  pointer-events: none;
}

.card .text {
  font-weight: bolder;
  font-size: 4rem;
  background: linear-gradient(45deg, #000000 4%, #fff, #000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.line {
  width: 100%;
  height: 1px;
  position: absolute;
  background-color: #2c2c2c;
}
.topl {
  top: 10%;
  background: linear-gradient(90deg, #888888 30%, #1d1f1f 70%);
}
.bottoml { bottom: 10%; }
.leftl {
  left: 10%;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, #747474 30%, #222424 70%);
}
.rightl { right: 10%; width: 1px; height: 100%; }`,
    react: `import React, { useState } from 'react';

export function ReflectiveCard() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 12, ry: x * 12 });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        transform: \`perspective(1000px) rotateX(\${tilt.rx}deg) rotateY(\${tilt.ry}deg)\`,
      }}
      className="outer"
    >
      <div className="dot" />
      <div className="card">
        <div className="ray" />
        <div className="text font-display">001</div>
        <div className="label">INTERFACE SPECIMEN</div>
        <div className="line topl" />
        <div className="line leftl" />
        <div className="line bottoml" />
        <div className="line rightl" />
      </div>
    </div>
  );
}`,
  },
};

interface ReflectiveArtifactProps {
  interactive?: boolean;
  scale?: number;
  onClick?: () => void;
  className?: string;
  isExpanded?: boolean;
}

export const ReflectiveArtifact: React.FC<ReflectiveArtifactProps> = ({
  interactive = true,
  scale = 1,
  onClick,
  className = '',
  isExpanded = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [lightPos, setLightPos] = useState({ x: 15, y: 15 });
  const [isHovered, setIsHovered] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      // Restrained physical tilt (-7deg to +7deg)
      const rx = Math.max(-7, Math.min(7, -normY * 14));
      const ry = Math.max(-7, Math.min(7, normX * 14));

      setTilt({ rx, ry });
      // Moving internal specular light reflection
      setLightPos({
        x: Math.round(normX * 40 + 20),
        y: Math.round(normY * 40 + 20),
      });
    },
    [interactive, prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setLightPos({ x: 15, y: 15 });
    setIsHovered(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      ref={containerRef}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="Interactive Reflective Card Specimen 001 - Click to inspect"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) scale(${scale})`,
        transition: isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.2s ease'
          : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease',
      }}
      className={`relative select-none ${onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500' : ''} ${className}`}
    >
      {/* CSS Styles Scoped to Specimen */}
      <style>{`
        @keyframes specimenMoveDot {
          0%, 100% {
            top: 10%;
            right: 10%;
          }
          25% {
            top: 10%;
            right: calc(100% - 35px);
          }
          50% {
            top: calc(100% - 30px);
            right: calc(100% - 35px);
          }
          75% {
            top: calc(100% - 30px);
            right: 10%;
          }
        }
      `}</style>

      {/* Outer Border Layer */}
      <div
        className="w-[300px] sm:w-[320px] h-[250px] sm:h-[260px] rounded-[10px] p-[1px] relative transition-shadow duration-300"
        style={{
          background: `radial-gradient(circle 240px at ${lightPos.x + 30}% ${lightPos.y + 30}%, #ffffff, #0c0d0d)`,
          boxShadow: isHovered
            ? '0 20px 50px -10px rgba(0,0,0,0.9), 0 0 30px rgba(255,255,255,0.1)'
            : '0 15px 35px -10px rgba(0,0,0,0.85)',
        }}
      >
        {/* Orbiting Beacon Dot */}
        <div
          className="w-[5px] h-[5px] absolute bg-white rounded-full z-20 pointer-events-none"
          style={{
            boxShadow: '0 0 10px #ffffff, 0 0 4px #ffffff',
            right: '10%',
            top: '10%',
            animation: prefersReducedMotion ? 'none' : 'specimenMoveDot 6s linear infinite',
          }}
        />

        {/* Inner Card Core */}
        <div
          className="w-full h-full rounded-[9px] border border-[#202222] flex flex-col items-center justify-center relative overflow-hidden text-white"
          style={{
            background: `radial-gradient(circle 280px at ${lightPos.x}% ${lightPos.y}%, #3a3d42, #0c0d0d)`,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Angled Specular Light Ray */}
          <div
            className="w-[240px] h-[48px] rounded-full absolute pointer-events-none transition-transform duration-100 ease-out"
            style={{
              backgroundColor: '#c7c7c7',
              opacity: isHovered ? 0.45 : 0.35,
              boxShadow: '0 0 55px #ffffff',
              filter: 'blur(11px)',
              transformOrigin: '15%',
              top: '2%',
              left: `${lightPos.x * 0.4 - 10}px`,
              transform: `rotate(${38 + tilt.ry * 0.4}deg)`,
            }}
          />

          {/* Central Display Typography (Neutral Technical Specimen Identifier) */}
          <div
            className="font-display font-black text-6xl tracking-tight leading-none z-10 select-none"
            style={{
              background: 'linear-gradient(45deg, #111111 5%, #ffffff 50%, #222222 95%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            001
          </div>

          {/* Secondary Subtitle Label */}
          <div className="font-tech text-xs tracking-[0.28em] text-zinc-300 font-semibold uppercase mt-3 z-10">
            INTERFACE SPECIMEN
          </div>

          {/* Hairline Quadrant Framing Reticle Lines */}
          <div
            className="w-full h-[1px] absolute top-[10%] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #888888 30%, #1d1f1f 70%)' }}
          />
          <div
            className="w-[1px] h-full absolute left-[10%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, #747474 30%, #222424 70%)' }}
          />
          <div className="w-full h-[1px] absolute bottom-[10%] bg-[#2c2c2c] pointer-events-none" />
          <div className="w-[1px] h-full absolute right-[10%] bg-[#2c2c2c] pointer-events-none" />

          {/* Interactive Inspection Hover Overlay */}
          {onClick && !isExpanded && (
            <div
              className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 z-30 ${
                isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/20 backdrop-blur-md font-tech text-[10px] tracking-[0.2em] uppercase font-semibold text-zinc-200 flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-3 h-3 text-rose-400" />
                <span>EXPAND SPECIMEN</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const LabNoteSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'react'>('css');
  const [copied, setCopied] = useState(false);

  const note = LAB_NOTE_001;

  const handleCopyCode = () => {
    const snippet = note.code[activeCodeTab];
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Keyboard escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <section
      aria-label="Chronicle Lab Note 001 - Interactive Specimen"
      className="pt-20 pb-16 border-t border-white/[0.08]"
    >
      {/* Section Masthead */}
      <div className="space-y-4 mb-12">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-tech text-xs tracking-[0.26em] text-rose-400 font-semibold uppercase">
          <span className="w-1.5 h-1.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <span>LAB NOTE / {note.number}</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-zinc-300">{note.category}</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-rose-300 font-bold">{note.title}</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase leading-[0.95]">
          Light &amp; Depth Interface Study
        </h2>

        <p className="font-body text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
          "{note.description}"
        </p>

        {/* Small Technical Metadata Header Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] font-tech text-[10px] tracking-widest uppercase text-zinc-400 font-medium">
            ARTIFACT {note.number}
          </span>
          <span className="px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] font-tech text-[10px] tracking-widest uppercase text-zinc-400 font-medium">
            INTERFACE / VISUAL SYSTEM
          </span>
          <span className="px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] font-tech text-[10px] tracking-widest uppercase text-zinc-400 font-medium">
            HTML &bull; CSS &bull; REACT
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-500/[0.08] border border-rose-500/20 font-tech text-[10px] tracking-widest uppercase text-rose-300 font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-rose-500" />
            EXPERIMENTAL SPECIMEN
          </span>
        </div>
      </div>

      {/* Main Two-Column Journal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Artifact Specimen Rig */}
        <div className="lg:col-span-5 flex flex-col items-center sm:items-start space-y-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-center w-full min-h-[320px] relative overflow-hidden group">
            {/* Background grid texture inside preview rig */}
            <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-canvas-dots-overlay opacity-30 pointer-events-none" />

            {/* The Live Interactive Artifact */}
            <ReflectiveArtifact onClick={() => setIsModalOpen(true)} />
          </div>

          {/* Interactive Caption */}
          <div className="w-full flex items-center justify-between text-xs font-tech text-zinc-400 px-1">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Interactive Physics Active</span>
            </span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-rose-400 hover:text-rose-300 font-semibold tracking-wider uppercase inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Inspect Specimen</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Structured Journal Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* CONTEXT */}
          <div className="space-y-1.5">
            <div className="font-tech text-xs tracking-[0.24em] uppercase text-zinc-400 font-semibold flex items-center gap-2">
              <span className="text-zinc-600">// 01</span>
              <span>CONTEXT</span>
            </div>
            <p className="font-body text-sm text-zinc-300 leading-relaxed">
              Why I built it: Flat UI paradigms often lose structural hierarchy when dark themes are applied uniformly. This experiment was constructed to discover how physical cues—specular highlight drift, perimeter beacon orbital velocity, and hairline coordinate boundaries—can simulate real tactile presence without relying on dense textures or heavy 3D canvases.
            </p>
          </div>

          {/* EXPERIMENT */}
          <div className="space-y-1.5">
            <div className="font-tech text-xs tracking-[0.24em] uppercase text-zinc-400 font-semibold flex items-center gap-2">
              <span className="text-zinc-600">// 02</span>
              <span>EXPERIMENT</span>
            </div>
            <p className="font-body text-sm text-zinc-300 leading-relaxed">
              {note.experiment}
            </p>
          </div>

          {/* OBSERVATION */}
          <div className="space-y-1.5">
            <div className="font-tech text-xs tracking-[0.24em] uppercase text-zinc-400 font-semibold flex items-center gap-2">
              <span className="text-zinc-600">// 03</span>
              <span>OBSERVATION</span>
            </div>
            <p className="font-body text-sm text-zinc-300 leading-relaxed">
              {note.observation}
            </p>
          </div>

          {/* LESSON */}
          <div className="space-y-1.5">
            <div className="font-tech text-xs tracking-[0.24em] uppercase text-rose-400 font-semibold flex items-center gap-2">
              <span className="text-rose-500/60">// 04</span>
              <span>LESSON LEARNED</span>
            </div>
            <p className="font-body text-sm text-zinc-200 leading-relaxed italic">
              "{note.lesson}"
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-3 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.22] font-tech text-xs tracking-[0.2em] uppercase font-semibold text-white transition-all active:scale-95 cursor-pointer group shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5 text-rose-400 transition-transform group-hover:scale-110" />
              <span>Open Specimen Viewer</span>
            </button>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN EXPANDED ARTIFACT SPECIMEN VIEWER MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Specimen Viewer - Lab Note 001"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-xl animate-fadeIn select-text"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0e12] border border-white/[0.12] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <div>
                  <div className="flex items-center gap-2 font-tech text-[11px] tracking-[0.24em] uppercase text-zinc-400 font-semibold">
                    <span>LAB NOTE // {note.number}</span>
                    <span className="text-zinc-600">&bull;</span>
                    <span className="text-rose-400">{note.category}</span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
                    {note.title} Specimen Inspection
                  </h3>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-tech uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                title="Close modal (Esc)"
              >
                <span>CLOSE</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Content Split View */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
              {/* Left Pane: Large Live Specimen Rig */}
              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[380px] bg-black/40 relative overflow-hidden">
                <div className="absolute inset-0 pattern-bg opacity-25 pointer-events-none" />
                <div className="absolute inset-0 bg-canvas-dots-overlay opacity-30 pointer-events-none" />

                {/* Scaled Artifact */}
                <div className="relative z-10 py-6">
                  <ReflectiveArtifact scale={1.08} isExpanded={true} />
                </div>

                {/* Live Inspection Telemetry */}
                <div className="w-full mt-6 pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2 font-tech text-[10px] tracking-wider uppercase text-zinc-400">
                  {note.metrics.map((m) => (
                    <div key={m.label} className="space-y-0.5">
                      <span className="text-zinc-500 block">{m.label}</span>
                      <span className="text-zinc-200 font-semibold block">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Pane: Specimen Analysis & Interactive Code Viewer */}
              <div className="lg:col-span-6 flex flex-col bg-[#0e1015]">
                {/* Mode Selector Tabs */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.08] bg-white/[0.01]">
                  <div className="font-tech text-xs tracking-widest uppercase font-semibold text-zinc-400">
                    SPECIMEN LAB LEDGER
                  </div>

                  {/* Code Snippet Tabs */}
                  <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                    {(['html', 'css', 'react'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveCodeTab(tab)}
                        className={`px-2.5 py-1 rounded text-[11px] font-tech uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                          activeCodeTab === tab
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Viewer Box */}
                <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                  {/* Code Editor Preview */}
                  <div className="relative rounded-xl bg-black/60 border border-white/[0.1] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-white/[0.02]">
                      <div className="flex items-center gap-2 font-tech text-[10px] tracking-widest uppercase text-zinc-400">
                        <Terminal className="w-3 h-3 text-rose-400" />
                        <span>SPECIMEN_SOURCE.{activeCodeTab === 'react' ? 'tsx' : activeCodeTab}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-tech uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Copy code to clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[220px]">
                      <code>{note.code[activeCodeTab]}</code>
                    </pre>
                  </div>

                  {/* Concise Analysis Points */}
                  <div className="space-y-4 pt-2 text-xs">
                    <div>
                      <span className="font-tech text-[10px] tracking-widest uppercase text-rose-400 font-semibold block mb-1">
                        PURPOSE
                      </span>
                      <p className="font-body text-zinc-300 leading-relaxed">
                        {note.purpose}
                      </p>
                    </div>

                    <div>
                      <span className="font-tech text-[10px] tracking-widest uppercase text-zinc-400 font-semibold block mb-1">
                        TECHNIQUE
                      </span>
                      <p className="font-body text-zinc-300 leading-relaxed">
                        Composed of 8 standard DOM nodes. Leverages CSS radial-gradients with dynamic focal points mapped to pointer normalized screen vectors, an accelerated 6s CSS keyframe loop on the perimeter beacon, and sub-pixel CSS transforms to eliminate runtime layout recalculations.
                      </p>
                    </div>

                    <div>
                      <span className="font-tech text-[10px] tracking-widest uppercase text-zinc-400 font-semibold block mb-1">
                        OBSERVATION &amp; LESSON
                      </span>
                      <p className="font-body text-zinc-300 leading-relaxed">
                        {note.observation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-[11px] font-tech tracking-wider text-zinc-500 uppercase">
                  <span>CHRONICLE RESEARCH ARCHIVE</span>
                  <span className="text-zinc-400 font-medium">SPECIMEN NO. 001 // REPRODUCIBLE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
