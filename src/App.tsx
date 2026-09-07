/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { NodeData, Connection, CertificateItem, ProjectItem, CanvasTransform } from './types';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from './data/portfolioData';
import { SplineWires } from './components/SplineWires';
import { GraphNode } from './components/GraphNode';
import { TopNavbar } from './components/TopNavbar';
import { CanvasControlsDock } from './components/CanvasControlsDock';
import { CertificateModal } from './components/modals/CertificateModal';
import { ProjectDetailModal } from './components/modals/ProjectDetailModal';
import { ContactModal } from './components/modals/ContactModal';
import { ResumeModal } from './components/modals/ResumeModal';
import { InspectorListView } from './components/InspectorListView';
import { ArrowDown, ArrowUpRight, Binary, Layers, Activity } from 'lucide-react';

export default function App() {
  // State
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [activePreset, setActivePreset] = useState<string>('all');
  const [activeView, setActiveView] = useState<'canvas' | 'list' | 'timeline'>('canvas');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [wireStyle, setWireStyle] = useState<'glow' | 'minimal' | 'cyber'>('glow');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  // Canvas pan & zoom transform - calculated for balanced initial viewport centering hero and visualizer
  const [transform, setTransform] = useState<CanvasTransform>({ x: 40, y: 30, scale: 0.88 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Pure deterministic pin coordinate calculation directly from nodes
  const pinPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const node of nodes) {
      if (node.inputs) {
        node.inputs.forEach((pin, i) => {
          map[pin.id] = {
            x: node.x + 18,
            y: node.y + 54 + i * 24,
          };
        });
      }
      if (node.outputs) {
        node.outputs.forEach((pin, j) => {
          map[pin.id] = {
            x: node.x + node.width - 18,
            y: node.y + 54 + j * 24,
          };
        });
      }
    }
    return map;
  }, [nodes]);

  // Spatial constraints / protected zone enforcement
  // Cards must NEVER enter or obscure the hero text rectangle: [0..660] x [0..490]
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeId) {
          let nextX = Math.round(n.x + deltaX);
          let nextY = Math.round(n.y + deltaY);

          if (nodeId === 'node-project') {
            // Latent Graph Visualizer stays anchored to the right of the hero heading
            if (nextX < 670) nextX = 670;
            if (nextY < 40) nextY = 40;
          } else {
            // Other nodes must stay below the hero zone or to the right
            if (nextY < 490 && nextX < 670) {
              if (n.y >= 490) {
                nextY = 490;
              } else if (n.x >= 670) {
                nextX = 670;
              } else {
                nextY = Math.max(490, nextY);
              }
            }
          }

          // Global canvas boundaries
          nextX = Math.max(30, Math.min(2200, nextX));
          nextY = Math.max(30, Math.min(1400, nextY));

          return {
            ...n,
            x: nextX,
            y: nextY,
          };
        }
        return n;
      })
    );
  }, []);

  // Filter nodes & connections based on active preset
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (activePreset === 'all') return true;
      if (activePreset === 'skills') {
        return ['node-profile', 'node-models', 'node-systems'].includes(n.id);
      }
      if (activePreset === 'certificates') {
        return ['node-profile', 'node-credentials'].includes(n.id);
      }
      if (activePreset === 'project') {
        return ['node-models', 'node-systems', 'node-project'].includes(n.id);
      }
      return true;
    });
  }, [nodes, activePreset]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredConnections = useMemo(() => {
    return connections.filter(
      (c) => activeNodeIds.has(c.fromNodeId) && activeNodeIds.has(c.toNodeId)
    );
  }, [connections, activeNodeIds]);

  // Canvas panning handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('.node-card') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('a')
    ) {
      return;
    }
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    setSelectedNodeId(null);
    setActiveConnectionId(null);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isPanningRef.current) return;
      setTransform((prev) => ({
        ...prev,
        x: moveEvent.clientX - panStartRef.current.x,
        y: moveEvent.clientY - panStartRef.current.y,
      }));
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    setTransform((prev) => {
      const newScale = Math.min(1.35, Math.max(0.48, prev.scale * zoomFactor));
      return {
        ...prev,
        scale: newScale,
      };
    });
  };

  // Zoom controls
  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(1.35, prev.scale + 0.1) }));
  };
  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, scale: Math.max(0.48, prev.scale - 0.1) }));
  };
  const handleFitScreen = () => {
    setTransform({ x: 40, y: 30, scale: 0.88 });
  };
  const handleResetGraph = () => {
    setNodes(INITIAL_NODES);
    setTransform({ x: 40, y: 30, scale: 0.88 });
  };

  // Focus specific node on canvas
  const handleFocusNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    setActiveView('canvas');
    setSelectedNodeId(nodeId);
    setTransform({
      x: -targetNode.x * 0.88 + window.innerWidth / 2 - 200,
      y: -targetNode.y * 0.88 + window.innerHeight / 2 - 160,
      scale: 0.92,
    });
  };

  const handleCycleWireStyle = () => {
    if (wireStyle === 'glow') setWireStyle('cyber');
    else if (wireStyle === 'cyber') setWireStyle('minimal');
    else setWireStyle('glow');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#14171c] text-zinc-100 select-none">
      {/* Technical Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="pattern-bg">
          <div className="cube-svg" />
        </div>
      </div>

      {/* Subtle Coordinate Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none bg-canvas-dots-overlay opacity-60 z-0" aria-hidden="true" />
      )}

      {/* Top Navigation Header */}
      <TopNavbar
        activePreset={activePreset}
        onSelectPreset={setActivePreset}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(!isSimulating)}
        onResetGraph={handleResetGraph}
        onOpenContact={() => setIsContactOpen(true)}
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* Floating Canvas Controls Dock (Right side) */}
      {activeView === 'canvas' && (
        <CanvasControlsDock
          scale={transform.scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitScreen={handleFitScreen}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          wireStyle={wireStyle}
          onCycleWireStyle={handleCycleWireStyle}
          isSimulating={isSimulating}
          onToggleSimulate={() => setIsSimulating(!isSimulating)}
        />
      )}

      {/* Main Content Area Based on Active View */}
      {activeView === 'canvas' ? (
        <main
          aria-label="Interactive computational graph canvas"
          ref={canvasContainerRef}
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden z-10"
        >
          {/* Transformed Stage with Controlled Two-Zone Hero Composition */}
          <div
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
            }}
            className="w-[2600px] h-[1600px] relative pointer-events-auto"
          >
            {/* HERO ZONE (LEFT / CENTER-LEFT): Protected Hero Typography & Identity */}
            <div className="absolute top-[60px] left-[60px] w-[580px] z-10 pointer-events-auto select-text">
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <span className="font-tech text-xs tracking-[0.25em] uppercase text-rose-400 font-medium">
                  COMPUTATION • DATA • INTELLIGENCE
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-heading text-white font-normal tracking-tight mb-4 select-none">
                <span className="block font-display italic text-zinc-100 font-normal leading-[0.92]">
                  BUILDING WITH
                </span>
                <span className="block font-body font-bold text-white tracking-[-0.035em] leading-[0.95] mt-1.5">
                  DATA &amp; MODELS<span className="text-rose-500">.</span>
                </span>
              </h1>

              {/* Editorial Line (18-21px) */}
              <p className="hero-subtext font-body text-zinc-300 font-normal leading-relaxed max-w-lg mb-6 select-text">
                I study how data, mathematics and machine learning become useful systems.
              </p>

              {/* Action Buttons & Quick Anchors */}
              <div className="flex items-center gap-3 font-body">
                <button
                  type="button"
                  onClick={() => handleFocusNode('node-project')}
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs font-medium text-white transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>Explore Latent Visualizer</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleFocusNode('node-models')}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5"
                >
                  <span>Model Architecture</span>
                  <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 border border-rose-500/40 text-xs font-medium text-white transition-all shadow-sm"
                >
                  Contact
                </button>
              </div>
            </div>

            {/* Bezier Spline Wires Layer */}
            <SplineWires
              connections={filteredConnections}
              pinPositions={pinPositions}
              isSimulating={isSimulating}
              wireStyle={wireStyle}
              activeConnectionId={activeConnectionId}
              onSelectConnection={(id) => setActiveConnectionId(id)}
            />

            {/* Controlled Graph Nodes */}
            {filteredNodes.map((node) => (
              <GraphNode
                key={node.id}
                node={node}
                scale={transform.scale}
                isSelected={selectedNodeId === node.id}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onNodeDrag={handleNodeDrag}
                onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
                onOpenProjectModal={(proj) => setSelectedProject(proj)}
                onOpenContactModal={() => setIsContactOpen(true)}
                onOpenResumeModal={() => setIsResumeOpen(true)}
              />
            ))}
          </div>
        </main>
      ) : activeView === 'list' ? (
        /* Inspector / Catalog View */
        <InspectorListView
          nodes={nodes}
          connections={connections}
          onFocusNodeOnCanvas={handleFocusNode}
          onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
          onOpenProjectModal={(proj) => setSelectedProject(proj)}
          onOpenContact={() => setIsContactOpen(true)}
        />
      ) : (
        /* Timeline View: Milestones & Research Checkpoints */
        <div className="absolute inset-0 pt-20 pb-12 px-4 sm:px-8 max-w-4xl mx-auto overflow-y-auto z-30 pointer-events-auto font-body">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="font-tech text-xs tracking-widest uppercase text-rose-400">
                Research &amp; Exploration Chronicle
              </span>
            </div>
            <h2 className="font-display text-4xl text-white font-normal">
              Computational Milestones
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Key trajectories in statistical learning, generative models, and mathematical research.
            </p>
          </div>

          <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-[#14171c]" />
              <span className="font-tech text-[11px] text-rose-400 uppercase tracking-wider">Present • Active Focus</span>
              <h3 className="font-display text-xl text-white font-normal mt-0.5">High-Dimensional Latent Manifold Traversal</h3>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                Investigating continuous trajectory interpolation in diffusion latent representations with WebGL manifold projection.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-[#14171c]" />
              <span className="font-tech text-[11px] text-zinc-500 uppercase tracking-wider">Research Study</span>
              <h3 className="font-display text-xl text-white font-normal mt-0.5">Transformers &amp; Self-Attention Dynamics</h3>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                Implementation of FlashAttention kernels, KV cache optimization, and sequence representations for multimodal inference.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-[#14171c]" />
              <span className="font-tech text-[11px] text-zinc-500 uppercase tracking-wider">Academic Foundation</span>
              <h3 className="font-display text-xl text-white font-normal mt-0.5">Probability, Optimization &amp; Linear Algebra</h3>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                Rigorous coursework and problem sets in multivariate calculus, convex optimization, and statistical inference.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quiet, refined footer status bar */}
      <footer
        aria-label="Portfolio coordinates and node navigation"
        className="absolute bottom-3 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex items-center justify-between text-xs font-tech text-zinc-500"
      >
        <div className="flex items-center gap-3">
          <span className="text-zinc-300 font-medium">Shubham Sharma</span>
          <span>/</span>
          <span className="text-rose-400">AI &amp; Data Science</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px]">
          <span>Controlled Network Composition</span>
          <span>•</span>
          <span>Protected Hero Typography</span>
          <span>•</span>
          <span>Interactive Latent Space</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 font-tech text-[11px]">
          <span>{filteredNodes.length} NODES</span>
          <span>/</span>
          <span>{filteredConnections.length} ACTIVE SPLINES</span>
          <span>•</span>
          <span className="text-rose-500">LIVE</span>
        </div>
      </footer>

      {/* Modals */}
      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        email="marksrv047@gmail.com"
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        nodes={nodes}
      />
    </div>
  );
}
