/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
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

export default function App() {
  // State
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [activePreset, setActivePreset] = useState<string>('all');
  const [activeView, setActiveView] = useState<'canvas' | 'list'>('canvas');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [wireStyle, setWireStyle] = useState<'glow' | 'minimal' | 'cyber'>('glow');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  // Canvas pan & zoom transform - calculated for balanced initial viewport
  const [transform, setTransform] = useState<CanvasTransform>({ x: 30, y: 40, scale: 0.85 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Pure deterministic pin coordinate calculation directly from nodes (prevents any re-render loops)
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

  // Handle node drag
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            x: Math.round(n.x + deltaX),
            y: Math.round(n.y + deltaY),
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
    // Only pan if clicking canvas background, not on a node or control
    if ((e.target as HTMLElement).closest('.node-card') || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
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
    const zoomFactor = e.deltaY < 0 ? 1.06 : 0.94;
    setTransform((prev) => {
      const newScale = Math.min(1.4, Math.max(0.45, prev.scale * zoomFactor));
      return {
        ...prev,
        scale: newScale,
      };
    });
  };

  // Zoom controls
  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(1.4, prev.scale + 0.1) }));
  };
  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, scale: Math.max(0.45, prev.scale - 0.1) }));
  };
  const handleFitScreen = () => {
    setTransform({ x: 30, y: 40, scale: 0.85 });
  };
  const handleResetGraph = () => {
    setNodes(INITIAL_NODES);
    setTransform({ x: 30, y: 40, scale: 0.85 });
  };

  // Focus specific node on canvas
  const handleFocusNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    setActiveView('canvas');
    setSelectedNodeId(nodeId);
    setTransform({
      x: -targetNode.x * 0.9 + window.innerWidth / 2 - 180,
      y: -targetNode.y * 0.9 + window.innerHeight / 2 - 140,
      scale: 0.95,
    });
  };

  const handleCycleWireStyle = () => {
    if (wireStyle === 'glow') setWireStyle('cyber');
    else if (wireStyle === 'cyber') setWireStyle('minimal');
    else setWireStyle('glow');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#181c21] text-zinc-100 select-none">
      {/* Uiverse.io Background Pattern by chase2k25 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="pattern-bg">
          <div className="cube-svg" />
        </div>
      </div>

      {/* Subtle Coordinate Grid Overlay on top of the pattern */}
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

      {/* Main Interactive Canvas Area */}
      {activeView === 'canvas' ? (
        <main
          aria-label="Interactive graph canvas"
          ref={canvasContainerRef}
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden z-10"
        >
          {/* Editorial Hero Statement (Fixed atmospheric anchor behind nodes) */}
          <div className="absolute top-20 left-6 sm:left-12 z-0 pointer-events-none max-w-xl opacity-90 transition-opacity duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-tech text-[10px] tracking-widest uppercase text-rose-400/90">
                Computational Network • Shubham Sharma
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[1.05] mb-2.5">
              Shubham Sharma
            </h1>

            <div className="font-body text-xs sm:text-sm font-semibold text-rose-300 tracking-wider uppercase mb-3">
              AI & Data Science
            </div>

            <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              Investigating deep representations, generative architectures, and scaled inference systems.
            </p>
          </div>

          {/* Transformed Stage */}
          <div
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
            }}
            className="w-[2600px] h-[1600px] relative pointer-events-auto"
          >
            {/* Bezier Spline Wires Layer */}
            <SplineWires
              connections={filteredConnections}
              pinPositions={pinPositions}
              isSimulating={isSimulating}
              wireStyle={wireStyle}
              activeConnectionId={activeConnectionId}
              onSelectConnection={(id) => setActiveConnectionId(id)}
            />

            {/* Draggable Graph Nodes */}
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
      ) : (
        /* Inspector / List View */
        <InspectorListView
          nodes={nodes}
          connections={connections}
          onFocusNodeOnCanvas={handleFocusNode}
          onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
          onOpenProjectModal={(proj) => setSelectedProject(proj)}
          onOpenContact={() => setIsContactOpen(true)}
        />
      )}

      {/* Quiet, refined footer status bar */}
      <footer
        aria-label="Portfolio coordinates and node navigation"
        className="absolute bottom-4 inset-x-6 sm:inset-x-12 z-20 pointer-events-none flex items-center justify-between text-[11px] font-tech text-zinc-500"
      >
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Shubham Sharma</span>
          <span>/</span>
          <span className="text-rose-500/80">AI & Data Science</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[10px]">
          <span>Interactive Spline Network</span>
          <span>•</span>
          <span>Drag nodes to re-route</span>
          <span>•</span>
          <span>Scroll to scale</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 font-tech">
          <span>{filteredNodes.length} NODES</span>
          <span>/</span>
          <span>{filteredConnections.length} ACTIVE SPLINES</span>
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
