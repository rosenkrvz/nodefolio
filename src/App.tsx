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
  const activeNavTabRef = useRef(activeNavTab);
  activeNavTabRef.current = activeNavTab;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setTransform({ x: 20, y: 40, scale: 0.65 });
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (activeNavTabRef.current === 'home') {
            const docEl = document.documentElement;
            const totalHeight = docEl.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
              const progress = Math.max(0, Math.min(1, window.scrollY / totalHeight));
              setScrollProgress(progress);
              if (progress > 0.85) {
                setActiveNavTab('network');
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
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

  // Fit view (responsive to mobile, tablet & desktop)
  const handleFitScreen = useCallback(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Graph bounding box: x: 60 to 2100 (w: 2040), y: 80 to 930 (h: 850)
    const graphWidth = 2100;
    const graphHeight = 880;

    // Available viewport margins: top navbar 68px, bottom status 75px, right dock 85px
    const availW = Math.max(320, vw - (vw < 640 ? 30 : 135));
    const availH = Math.max(320, vh - (vw < 640 ? 110 : 155));

    const fitScale = Math.min(availW / graphWidth, availH / graphHeight);
    const targetScale = Math.max(0.38, Math.min(0.85, Number(fitScale.toFixed(2))));

    // Precision centering
    const x = Math.round((vw - graphWidth * targetScale) / 2) + 15;
    const y = Math.round((vh - graphHeight * targetScale) / 2) + 25;

    setTransform({ x, y, scale: targetScale });
  }, []);

  // Initial auto-fit on load and resize
  useEffect(() => {
    handleFitScreen();
  }, [handleFitScreen]);

  // Direct scroll wheel zoom on workspace (eliminates seizure of zoom control)
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      // If user is on cover and scrolling down, allow window to scroll naturally
      if (activeNavTabRef.current === 'home') {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const zoomDelta = -e.deltaY * 0.0015;
      const zoomFactor = Math.exp(zoomDelta);

      setTransform((prev) => {
        const nextScale = Math.max(0.35, Math.min(2.0, prev.scale * zoomFactor));
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - prev.x) * (nextScale / prev.scale);
        const newY = mouseY - (mouseY - prev.y) * (nextScale / prev.scale);

        return { x: newX, y: newY, scale: nextScale };
      });
    };

    container.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onNativeWheel);
    };
  }, []);

  // Reset Graph
  const handleResetGraph = useCallback(() => {
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNECTIONS);
    handleFitScreen();
  }, [handleFitScreen]);

  // Return to cover
  const handleReturnToCover = useCallback(() => {
    setActiveNavTab('home');
    setScrollProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Smooth transition down to workspace
  const handleExplore = useCallback(() => {
    setActiveNavTab('network');
    setActiveView('canvas');
    setActivePreset('all');
    setSelectedNodeId(null);
    setScrollProgress(1);
    handleFitScreen();
  }, [handleFitScreen]);

  // Focus specific node on canvas with smooth pan
  const handleFocusNode = useCallback((nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    setSelectedNodeId(nodeId);
    setScrollProgress(1);

    if (nodeId === 'node-project') {
      setActiveNavTab('projects');
      if (target.project) {
        setSelectedProject(target.project);
      }
    } else {
      setActiveNavTab('network');
    }

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const targetScale = viewportWidth < 640 ? 0.75 : 0.95;

    setTransform({
      x: viewportWidth / 2 - (target.x + target.width / 2) * targetScale,
      y: viewportHeight / 2 - (target.y + 160) * targetScale,
      scale: targetScale,
    });
  }, [nodes]);

  // Top Nav Tab Selection - Instant, reliable loading for all tabs
  const handleSelectNavTab = useCallback((tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => {
    setActiveNavTab(tab);

    if (tab === 'home') {
      handleReturnToCover();
    } else if (tab === 'network') {
      setActiveView('canvas');
      setActivePreset('all');
      setSelectedNodeId(null);
      setScrollProgress(1);
      handleFitScreen();
    } else if (tab === 'projects') {
      setActiveView('canvas');
      setActivePreset('project');
      setSelectedNodeId('node-project');
      setScrollProgress(1);
      const target = nodes.find((n) => n.id === 'node-project');
      if (target) {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        const targetScale = viewportWidth < 640 ? 0.75 : 0.95;
        setTransform({
          x: viewportWidth / 2 - (target.x + target.width / 2) * targetScale,
          y: viewportHeight / 2 - (target.y + 160) * targetScale,
          scale: targetScale,
        });
      }
    } else if (tab === 'lab') {
      setActiveView('canvas');
      setScrollProgress(1);
      handleFocusNode('node-controls');
    } else if (tab === 'notebook') {
      setActiveView('timeline');
      setScrollProgress(1);
    } else if (tab === 'about') {
      setIsResumeOpen(true);
    }
  }, [handleFitScreen, handleFocusNode, handleReturnToCover, nodes]);

  // Clear node selection when clicking canvas background
  const handleCanvasBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setActiveConnectionId(null);
  }, []);

  const isCoverActive = activeNavTab === 'home';
  const effectiveProgress = isCoverActive ? scrollProgress : 1.0;

  return (
    <div className="relative w-full bg-[#14171c] text-[#eaeaea] font-body select-none">
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
      <main className="relative w-full max-w-full overflow-x-clip">
        {/* Real vertical scroll track when on cover, clean 100vh when in workspace */}
        <div ref={scrollContainerRef} className={`relative w-full ${isCoverActive ? 'h-[250vh]' : 'h-screen overflow-hidden'}`}>
          {/* Sticky 100vh Viewport Stage */}
          <div className="sticky top-0 w-full h-screen overflow-hidden">
            {/* SECTION 02: Computational Neural Workspace (Base Layer) */}
            <ArchitecturalReveal scrollProgress={effectiveProgress}>
              <div
                style={{
                  opacity: !isCoverActive ? 1 : (effectiveProgress >= 0.25 ? Math.min(1, (effectiveProgress - 0.25) / 0.50) : 0),
                  pointerEvents: !isCoverActive || effectiveProgress >= 0.80 ? 'auto' : 'none',
                }}
                className="absolute inset-0 w-full h-screen pt-16 transition-opacity duration-150 ease-out z-10"
              >
                {activeView === 'canvas' ? (
                  <div
                    id="graph-workspace"
                    aria-label="Interactive computational graph canvas"
                    ref={canvasContainerRef}
                    onMouseDown={handleCanvasMouseDown}
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

                      {/* Connected Graph Nodes (#0b0d12 carbon fiber) */}
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
                      onReturnToCover={handleReturnToCover}
                    />
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

                {/* Unified Precision Workspace Footer Bar */}
                <footer
                  aria-label="Portfolio coordinates and workspace navigation"
                  className="absolute bottom-3 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex items-center justify-between text-[11px] sm:text-xs font-body text-zinc-400 select-none px-4 py-2 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/10 font-semibold text-white uppercase text-[10px] tracking-wider shrink-0">
                      SPATIAL WORKSPACE
                    </span>
                    <span className="text-zinc-200 font-semibold font-display tracking-wider uppercase truncate hidden sm:inline">
                      Shubham Sharma
                    </span>
                    <span className="text-zinc-600 hidden sm:inline">&bull;</span>
                    <span className="text-rose-400 font-medium truncate">AI &amp; Data Science</span>
                  </div>

                  <div className="hidden lg:flex items-center gap-3 text-zinc-400 text-[11px]">
                    <span>Drag background to pan</span>
                    <span>&bull;</span>
                    <span>Scroll wheel to zoom</span>
                    <span>&bull;</span>
                    <span>Drag nodes to arrange</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-300 font-medium text-[11px] shrink-0">
                    <span>{filteredNodes.length} NODES</span>
                    <span>/</span>
                    <span>{filteredConnections.length} ACTIVE SPLINES</span>
                    <span>&bull;</span>
                    <span className="text-rose-500 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                </footer>
              </div>
            </ArchitecturalReveal>

            {/* SECTION 01: Solid Editorial Portfolio Cover (Surface Layer, sits on top and physically lifts on scroll) */}
            {isCoverActive && (
              <EditorialCover
                scrollProgress={scrollProgress}
                onExplore={handleExplore}
                onViewWork={() => handleSelectNavTab('projects')}
              />
            )}
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
