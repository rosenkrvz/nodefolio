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
import { HeroCover } from './components/HeroCover';
import { MacBookDevice } from './components/MacBookDevice';
import { ExpandedNodeModal } from './components/ExpandedNodeModal';
import { CertificateModal } from './components/modals/CertificateModal';
import { ProjectDetailModal } from './components/modals/ProjectDetailModal';
import { ContactModal } from './components/modals/ContactModal';
import { ResumeModal } from './components/modals/ResumeModal';
import { InspectorListView } from './components/InspectorListView';
import { ArrowDown, ArrowUpRight, Binary, Layers, Activity } from 'lucide-react';

interface DragWireState {
  fromPinId: string;
  fromX: number;
  fromY: number;
  currentX: number;
  currentY: number;
}

export default function App() {
  // Navigation & View Mode State
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about'>('home');
  const [isFullWorkspace, setIsFullWorkspace] = useState<boolean>(false);
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

  // Interactive Cable Dragging State
  const [dragWire, setDragWire] = useState<DragWireState | null>(null);

  // Canvas pan & zoom transform for workspace
  const [transform, setTransform] = useState<CanvasTransform>({ x: 80, y: 80, scale: 0.85 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [expandedNode, setExpandedNode] = useState<NodeData | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress along the multi-phase journey
  useEffect(() => {
    const handleScroll = () => {
      if (isFullWorkspace) return;
      const el = scrollContainerRef.current || document.documentElement;
      const scrollTop = el.scrollTop || window.scrollY || 0;
      const scrollHeight = (el.scrollHeight || document.documentElement.scrollHeight) - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
        setScrollProgress(progress);

        // If user scrolls near the end, activate full workspace automatically
        if (progress > 0.95 && !isFullWorkspace) {
          setIsFullWorkspace(true);
          setActiveNavTab('network');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFullWorkspace]);

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
          const nextX = Math.max(20, Math.min(2400, Math.round(n.x + deltaX)));
          const nextY = Math.max(20, Math.min(1600, Math.round(n.y + deltaY)));
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

  // Cable Connection Interactivity: Start Dragging from Port
  const handleStartDragWire = useCallback((pin: Pin, e: React.MouseEvent) => {
    const pos = pinPositions[pin.id];
    if (!pos) return;
    setDragWire({
      fromPinId: pin.id,
      fromX: pos.x,
      fromY: pos.y,
      currentX: pos.x,
      currentY: pos.y,
    });
  }, [pinPositions]);

  // Cable Connection Interactivity: Connect to target port
  const handleEndDragWire = useCallback((targetPin: Pin) => {
    if (!dragWire) return;
    const sourcePinId = dragWire.fromPinId;
    if (sourcePinId === targetPin.id) {
      setDragWire(null);
      return;
    }

    // Find source node and pin
    let sourceNodeId = '';
    for (const n of nodes) {
      if (n.outputs?.some((p) => p.id === sourcePinId) || n.inputs?.some((p) => p.id === sourcePinId)) {
        sourceNodeId = n.id;
        break;
      }
    }

    if (sourceNodeId && sourceNodeId !== targetPin.nodeId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromNodeId: sourceNodeId,
        fromPinId: sourcePinId,
        toNodeId: targetPin.nodeId,
        toPinId: targetPin.id,
        color: '#e11d48',
        animated: true,
      };
      setConnections((prev) => [...prev, newConnection]);
    }
    setDragWire(null);
  }, [dragWire, nodes]);

  // Cable Detach handler
  const handleDetachConnection = useCallback((connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    setActiveConnectionId(null);
  }, []);

  // Update drag wire coordinate as mouse moves
  const handleMouseMoveGlobal = useCallback((e: React.MouseEvent) => {
    if (!dragWire || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - transform.x) / transform.scale;
    const canvasY = (e.clientY - rect.top - transform.y) / transform.scale;

    setDragWire((prev) => prev ? { ...prev, currentX: canvasX, currentY: canvasY } : null);
  }, [dragWire, transform]);

  const handleMouseUpGlobal = useCallback(() => {
    if (dragWire) setDragWire(null);
  }, [dragWire]);

  // Canvas Navigation: Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
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

  // Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
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
  };

  // Focus specific node on canvas with smooth pan
  const handleFocusNode = useCallback((nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    setSelectedNodeId(nodeId);
    if (!isFullWorkspace) {
      setIsFullWorkspace(true);
      setActiveNavTab('network');
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetScale = 0.95;

    setTransform({
      x: viewportWidth / 2 - (target.x + target.width / 2) * targetScale,
      y: viewportHeight / 2 - (target.y + 160) * targetScale,
      scale: targetScale,
    });
  }, [nodes, isFullWorkspace]);

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

  // Direct Enter Network action (from Hero or Laptop buttons)
  const handleEnterNetwork = useCallback(() => {
    setIsFullWorkspace(true);
    setActiveNavTab('network');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Top Nav Tab Selection
  const handleSelectNavTab = useCallback((tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => {
    setActiveNavTab(tab);

    if (tab === 'home') {
      setIsFullWorkspace(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'network') {
      setIsFullWorkspace(true);
      setActivePreset('all');
    } else if (tab === 'projects') {
      setIsFullWorkspace(true);
      setActivePreset('project');
      handleFocusNode('node-project');
    } else if (tab === 'lab') {
      setIsFullWorkspace(true);
      handleFocusNode('node-controls');
    } else if (tab === 'notebook') {
      setIsFullWorkspace(true);
      setActiveView('timeline');
    } else if (tab === 'about') {
      setIsResumeOpen(true);
    }
  }, [handleFocusNode]);

  return (
    <div className="relative w-full min-h-screen bg-[#090b10] text-[#eaeaea] overflow-x-hidden font-body select-none">
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

      {/* VIEW MODE 1: CINEMATIC HOME COVER → SCROLL TRANSITION INTO MACBOOK */}
      {!isFullWorkspace ? (
        <div ref={scrollContainerRef} className="relative w-full">
          {/* Layer 1: Minimal Editorial Hero Cover (0 to ~30% scroll) */}
          <HeroCover
            scrollProgress={scrollProgress}
            onExplore={handleEnterNetwork}
            onViewWork={() => handleFocusNode('node-project')}
          />

          {/* Layer 2: 3D MacBook Device Transition (30% to 100% scroll) */}
          <MacBookDevice
            scrollProgress={scrollProgress}
            onEnterNetwork={handleEnterNetwork}
          >
            {/* Embedded Live Neural Network Preview inside laptop screen */}
            <div className="w-full h-full relative bg-[#14171c] overflow-hidden">
              <div
                style={{
                  transform: 'scale(0.38)',
                  transformOrigin: '0 0',
                  width: '2600px',
                  height: '1600px',
                }}
                className="relative"
              >
                {/* Spline Wires in Preview */}
                <SplineWires
                  connections={filteredConnections}
                  pinPositions={pinPositions}
                  isSimulating={true}
                  wireStyle="glow"
                  activeConnectionId={null}
                />

                {/* Nodes in Preview */}
                {filteredNodes.map((node) => (
                  <GraphNode
                    key={node.id}
                    node={node}
                    scale={0.38}
                    isSelected={node.id === 'node-project'}
                    onNodeDrag={() => {}}
                    onOpenCertificateModal={() => {}}
                    onOpenProjectModal={() => {}}
                    onOpenContactModal={() => {}}
                    onOpenResumeModal={() => {}}
                  />
                ))}
              </div>
            </div>
          </MacBookDevice>
        </div>
      ) : (
        /* VIEW MODE 2: FULL-SCREEN INTERACTIVE NEURAL WORKSPACE */
        <div className="relative w-full h-screen pt-16 overflow-hidden">
          {activeView === 'canvas' ? (
            <main
              id="graph-workspace"
              aria-label="Interactive computational graph canvas"
              ref={canvasContainerRef}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleWheel}
              onMouseMove={handleMouseMoveGlobal}
              onMouseUp={handleMouseUpGlobal}
              className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden z-10"
            >
              {/* Subtle architectural background texture */}
              {showGrid && (
                <div className="absolute inset-0 pattern-bg pointer-events-none opacity-40" />
              )}

              {/* Spatial Transformed Canvas */}
              <div
                style={{
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                  transformOrigin: '0 0',
                }}
                className="w-[2800px] h-[1800px] relative pointer-events-auto"
              >
                {/* Bezier Spline Wires Layer with interactive cable dragging */}
                <SplineWires
                  connections={filteredConnections}
                  pinPositions={pinPositions}
                  isSimulating={isSimulating}
                  wireStyle={wireStyle}
                  activeConnectionId={activeConnectionId}
                  onSelectConnection={(id) => setActiveConnectionId(id)}
                  onDetachConnection={handleDetachConnection}
                  dragWire={dragWire}
                />

                {/* Connected Graph Nodes */}
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
                    onOpenExpandedNode={(n) => setExpandedNode(n)}
                    onStartDragWire={handleStartDragWire}
                    onEndDragWire={handleEndDragWire}
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
              />

              {/* Workspace Navigation Help Banner */}
              <div className="absolute bottom-4 left-6 z-20 pointer-events-none hidden sm:flex items-center gap-3 text-xs font-body text-zinc-400">
                <span className="px-2 py-1 rounded bg-black/60 border border-white/10 font-semibold text-white">PAN &amp; ZOOM</span>
                <span>Drag background to pan • Mouse wheel to zoom • Click node to focus • Double click to expand</span>
              </div>
            </main>
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
              <div className="mb-8">
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

          {/* Footer status bar in full workspace */}
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
              <span>Controlled Spatial Network</span>
              <span>•</span>
              <span>Tactile #212121 System</span>
              <span>•</span>
              <span>Interactive Latent Space</span>
            </div>

            <div className="flex items-center gap-2 text-zinc-300 font-medium text-xs">
              <span>{filteredNodes.length} NODES</span>
              <span>/</span>
              <span>{filteredConnections.length} ACTIVE SPLINES</span>
              <span>•</span>
              <span className="text-rose-500 font-bold">LIVE</span>
            </div>
          </footer>
        </div>
      )}

      {/* Modals */}
      <ExpandedNodeModal
        node={expandedNode}
        onClose={() => setExpandedNode(null)}
        onOpenProjectDetail={(p) => {
          setExpandedNode(null);
          setSelectedProject(p);
        }}
        onOpenCertificateDetail={(c) => {
          setExpandedNode(null);
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
        email={nodes.find((n) => n.id === 'node-profile')?.profile?.email || 'marksrv047@gmail.com'}
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        nodes={nodes}
      />
    </div>
  );
}
