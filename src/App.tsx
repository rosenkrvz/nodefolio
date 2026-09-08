/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { NodeData, Connection, CertificateItem, ProjectItem, CanvasTransform, Pin } from './types';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from './data/portfolioData';
import { SplineWires } from './components/SplineWires';
import { GraphNode } from './components/GraphNode';
import { TopNavbar } from './components/TopNavbar';
import { CanvasControlsDock } from './components/CanvasControlsDock';
import { EditorialCover } from './components/EditorialCover';
import { ArchitecturalReveal } from './components/ArchitecturalReveal';
import { FocusedNodeModal } from './components/FocusedNodeModal';
import { CertificateModal } from './components/modals/CertificateModal';
import { ProjectDetailModal } from './components/modals/ProjectDetailModal';
import { ContactModal } from './components/modals/ContactModal';
import { ResumeModal } from './components/modals/ResumeModal';
import { InspectorListView } from './components/InspectorListView';

export default function App() {
  // Navigation & Scroll State
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about'>('home');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Graph Data State
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [activePreset, setActivePreset] = useState<string>('all');
  const [activeView, setActiveView] = useState<'canvas' | 'list' | 'timeline'>('canvas');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [wireStyle, setWireStyle] = useState<'glow' | 'minimal' | 'cyber'>('glow');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  // Canvas pan & zoom transform
  const [transform, setTransform] = useState<CanvasTransform>({ x: 80, y: 70, scale: 0.86 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [focusedNode, setFocusedNode] = useState<NodeData | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Throttled scroll progress tracking via requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docEl = document.documentElement;
          const totalHeight = docEl.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = Math.max(0, Math.min(1, window.scrollY / totalHeight));
            setScrollProgress(progress);
            if (progress < 0.28) {
              setActiveNavTab('home');
            } else if (progress > 0.85) {
              setActiveNavTab('network');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Node Dragging Handler
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeId) {
          const nextX = Math.max(20, Math.min(2300, Math.round(n.x + deltaX)));
          const nextY = Math.max(20, Math.min(1500, Math.round(n.y + deltaY)));
          return { ...n, x: nextX, y: nextY };
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

  // Canvas Panning Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.node-card') ||
      target.closest('button') ||
      target.closest('.port-pin') ||
      target.closest('aside')
    ) {
      return;
    }

    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };

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

  // Zoom Handler:
  // If user holds Ctrl/Meta or pinch-to-zoom, zoom canvas!
  // Otherwise, let wheel event bubble naturally to scroll the window.
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const nextScale = Math.max(0.4, Math.min(1.8, transform.scale * zoomFactor));

      if (!canvasContainerRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - transform.x) * (nextScale / transform.scale);
      const newY = mouseY - (mouseY - transform.y) * (nextScale / transform.scale);

      setTransform({
        x: newX,
        y: newY,
        scale: nextScale,
      });
    }
  };

  // Smooth scroll down to workspace
  const handleExplore = useCallback(() => {
    const docEl = document.documentElement;
    const totalHeight = docEl.scrollHeight - window.innerHeight;
    window.scrollTo({ top: totalHeight, behavior: 'smooth' });
  }, []);

  // Focus specific node on canvas with smooth pan
  const handleFocusNode = useCallback((nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    setSelectedNodeId(nodeId);
    setActiveNavTab('network');

    // Smoothly scroll down to workspace
    const docEl = document.documentElement;
    const totalHeight = docEl.scrollHeight - window.innerHeight;
    window.scrollTo({ top: totalHeight, behavior: 'smooth' });

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetScale = 0.95;

    setTransform({
      x: viewportWidth / 2 - (target.x + target.width / 2) * targetScale,
      y: viewportHeight / 2 - (target.y + 160) * targetScale,
      scale: targetScale,
    });
  }, [nodes]);

  // Fit view
  const handleFitScreen = useCallback(() => {
    setTransform({ x: 60, y: 60, scale: 0.85 });
  }, []);

  // Reset Graph
  const handleResetGraph = useCallback(() => {
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNECTIONS);
    handleFitScreen();
  }, [handleFitScreen]);

  // Top Nav Tab Selection
  const handleSelectNavTab = useCallback((tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => {
    setActiveNavTab(tab);

    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'network') {
      setActivePreset('all');
      handleExplore();
    } else if (tab === 'projects') {
      setActivePreset('project');
      handleFocusNode('node-project');
    } else if (tab === 'lab') {
      handleFocusNode('node-controls');
    } else if (tab === 'notebook') {
      setActiveView('timeline');
      handleExplore();
    } else if (tab === 'about') {
      setIsResumeOpen(true);
    }
  }, [handleExplore, handleFocusNode]);

  // Clear node selection when clicking canvas background
  const handleCanvasBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setActiveConnectionId(null);
  }, []);

  return (
    <div className="relative w-full bg-[#090b10] text-[#eaeaea] overflow-x-hidden font-body select-none">
      {/* Top Navbar */}
      <TopNavbar
        activePreset={activePreset}
        onSelectPreset={setActivePreset}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(!isSimulating)}
        onResetGraph={handleResetGraph}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenResume={() => setIsResumeOpen(true)}
        onFocusClock={() => handleFocusNode('node-clock')}
        activeView={activeView}
        onToggleView={setActiveView}
        activeNavTab={activeNavTab}
        onSelectNavTab={handleSelectNavTab}
      />

      {/* CONTINUOUS SCROLL-DRIVEN ARCHITECTURE */}
      <main className="relative w-full">
        {/* Real vertical scroll track with deliberate height (350vh) */}
        <div ref={scrollContainerRef} className="relative w-full h-[350vh]">
          {/* Sticky 100vh Viewport Stage */}
          <div className="sticky top-0 w-full h-screen overflow-hidden">
            {/* SECTION 01: Solid Editorial Portfolio Cover (0 to ~65% scroll) */}
            <EditorialCover
              scrollProgress={scrollProgress}
              onExplore={handleExplore}
              onViewWork={() => handleFocusNode('node-project')}
            />

            {/* PHYSICAL REVEAL EFFECT & SECTION 02: Computational Neural Workspace */}
            <ArchitecturalReveal scrollProgress={scrollProgress}>
              <div
                style={{
                  opacity: scrollProgress >= 0.28 ? Math.min(1, (scrollProgress - 0.28) / 0.40) : 0,
                  pointerEvents: scrollProgress >= 0.88 ? 'auto' : 'none',
                }}
                className="absolute inset-0 w-full h-screen pt-16 transition-opacity duration-75 ease-out z-10"
              >
                {activeView === 'canvas' ? (
                  <div
                    id="graph-workspace"
                    aria-label="Interactive computational graph canvas"
                    ref={canvasContainerRef}
                    onMouseDown={handleCanvasMouseDown}
                    onWheel={handleWheel}
                    onClick={handleCanvasBackgroundClick}
                    className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
                  >
                    {/* Subtle architectural background texture */}
                    {showGrid && (
                      <div className="absolute inset-0 pattern-bg pointer-events-none opacity-35" />
                    )}

                    {/* Spatial Transformed Canvas */}
                    <div
                      style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: '0 0',
                      }}
                      className="w-[2600px] h-[1700px] relative pointer-events-auto"
                    >
                      {/* Spline Connections Layer with Focus/Depth Dimming */}
                      <SplineWires
                        connections={filteredConnections}
                        pinPositions={pinPositions}
                        isSimulating={isSimulating}
                        wireStyle={wireStyle}
                        activeConnectionId={activeConnectionId}
                        selectedNodeId={selectedNodeId}
                        onSelectConnection={(id) => setActiveConnectionId(id)}
                      />

                      {/* Connected Graph Nodes (#212121) */}
                      {filteredNodes.map((node) => (
                        <GraphNode
                          key={node.id}
                          node={node}
                          scale={transform.scale}
                          isSelected={selectedNodeId === node.id}
                          isDimmed={selectedNodeId !== null && selectedNodeId !== node.id}
                          onSelectNode={(id) => setSelectedNodeId(id)}
                          onNodeDrag={handleNodeDrag}
                          onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
                          onOpenProjectModal={(proj) => setSelectedProject(proj)}
                          onOpenContactModal={() => setIsContactOpen(true)}
                          onOpenResumeModal={() => setIsResumeOpen(true)}
                          onOpenFocusedNode={(n) => setFocusedNode(n)}
                        />
                      ))}
                    </div>

                    {/* Floating Dock Controls */}
                    <CanvasControlsDock
                      scale={transform.scale}
                      onZoomIn={() => setTransform((p) => ({ ...p, scale: Math.min(1.8, p.scale * 1.15) }))}
                      onZoomOut={() => setTransform((p) => ({ ...p, scale: Math.max(0.4, p.scale * 0.85) }))}
                      onFitScreen={handleFitScreen}
                      showGrid={showGrid}
                      onToggleGrid={() => setShowGrid(!showGrid)}
                      wireStyle={wireStyle}
                      onCycleWireStyle={() => {
                        const styles: ('glow' | 'minimal' | 'cyber')[] = ['glow', 'minimal', 'cyber'];
                        const next = styles[(styles.indexOf(wireStyle) + 1) % styles.length];
                        setWireStyle(next);
                      }}
                      isSimulating={isSimulating}
                      onToggleSimulate={() => setIsSimulating(!isSimulating)}
                      onReturnToCover={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    />

                    {/* Clean Workspace Navigation Hint */}
                    <div className="absolute bottom-4 left-6 z-20 pointer-events-none hidden sm:flex items-center gap-3 text-xs font-body text-zinc-400">
                      <span className="px-2 py-1 rounded bg-black/60 border border-white/10 font-semibold text-white">
                        SPATIAL WORKSPACE
                      </span>
                      <span>Drag background to pan &bull; Ctrl+Scroll to zoom &bull; Double click node to inspect &bull; Scroll up for cover</span>
                    </div>
                  </div>
                ) : activeView === 'list' ? (
                  /* Inspector Catalog View */
                  <InspectorListView
                    nodes={nodes}
                    connections={connections}
                    onFocusNodeOnCanvas={handleFocusNode}
                    onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
                    onOpenProjectModal={(proj) => setSelectedProject(proj)}
                    onOpenContact={() => setIsContactOpen(true)}
                  />
                ) : (
                  /* Timeline Chronicle View */
                  <div className="absolute inset-0 pt-24 pb-16 px-4 sm:px-8 max-w-4xl mx-auto overflow-y-auto z-30 pointer-events-auto font-body">
                    <div className="mb-8 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="font-body text-xs tracking-widest uppercase text-rose-400 font-bold">
                            Research &amp; Exploration Chronicle
                          </span>
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl text-white font-bold uppercase tracking-tight">
                          Computational Milestones
                        </h2>
                        <p className="font-body text-zinc-300 text-sm sm:text-base mt-1.5 leading-relaxed">
                          Key trajectories in statistical learning, generative models, and mathematical research.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveView('canvas')}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                      >
                        Back to Canvas
                      </button>
                    </div>

                    <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8 font-body">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-[#14171c]" />
                        <span className="text-xs text-rose-400 uppercase tracking-wider font-semibold">Present • Active Focus</span>
                        <h3 className="font-display text-xl text-white font-semibold mt-0.5 tracking-wide">High-Dimensional Latent Manifold Traversal</h3>
                        <p className="text-sm sm:text-[15px] text-zinc-200 mt-1 leading-relaxed">
                          Investigating continuous trajectory interpolation in diffusion latent representations with WebGL manifold projection.
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-[#14171c]" />
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Research Study</span>
                        <h3 className="font-display text-xl text-white font-semibold mt-0.5 tracking-wide">Transformers &amp; Self-Attention Dynamics</h3>
                        <p className="text-sm sm:text-[15px] text-zinc-200 mt-1 leading-relaxed">
                          Implementation of FlashAttention kernels, KV cache optimization, and sequence representations for multimodal inference.
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-[#14171c]" />
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Academic Foundation</span>
                        <h3 className="font-display text-xl text-white font-semibold mt-0.5 tracking-wide">Probability, Optimization &amp; Linear Algebra</h3>
                        <p className="text-sm sm:text-[15px] text-zinc-200 mt-1 leading-relaxed">
                          Rigorous coursework and problem sets in multivariate calculus, convex optimization, and statistical inference.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quiet Status Bar */}
                <footer
                  aria-label="Portfolio coordinates and node navigation"
                  className="absolute bottom-3 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex items-center justify-between text-xs font-body text-zinc-400 select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-200 font-semibold font-display tracking-wider uppercase">Shubham Sharma</span>
                    <span>/</span>
                    <span className="text-rose-400 font-medium">AI &amp; Data Science</span>
                  </div>

                  <div className="hidden md:flex items-center gap-4 text-xs text-zinc-400">
                    <span>Spatial Network System</span>
                    <span>&bull;</span>
                    <span>Tactile #212121 Nodes</span>
                    <span>&bull;</span>
                    <span>Active Latent Topology</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-300 font-medium text-xs">
                    <span>{filteredNodes.length} NODES</span>
                    <span>/</span>
                    <span>{filteredConnections.length} ACTIVE SPLINES</span>
                    <span>&bull;</span>
                    <span className="text-rose-500 font-bold">LIVE</span>
                  </div>
                </footer>
              </div>
            </ArchitecturalReveal>
          </div>
        </div>
      </main>

      {/* Modals */}
      <FocusedNodeModal
        node={focusedNode}
        onClose={() => setFocusedNode(null)}
        onOpenProjectDetail={(p) => {
          setFocusedNode(null);
          setSelectedProject(p);
        }}
        onOpenCertificateDetail={(c) => {
          setFocusedNode(null);
          setSelectedCertificate(c);
        }}
      />

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
