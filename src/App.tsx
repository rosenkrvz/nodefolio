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

  // Canvas pan & zoom transform (centered at 70% scale by default)
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 0.70 });
  const transformRef = useRef(transform);
  transformRef.current = transform;
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

  // Deterministic harmonic drift personality configs for organic, controlled workspace life
  const NODE_DRIFT_PROFILES: Record<
    string,
    { ampX: number; ampY: number; periodX: number; periodY: number; phaseX: number; phaseY: number }
  > = useMemo(() => ({
    'node-profile': { ampX: 4, ampY: 7, periodX: 13.2, periodY: 10.4, phaseX: 0.3, phaseY: 1.1 },
    'node-models': { ampX: 6, ampY: 5, periodX: 15.6, periodY: 12.8, phaseX: 1.8, phaseY: 2.4 },
    'node-credentials': { ampX: 5, ampY: 6, periodX: 13.8, periodY: 14.5, phaseX: 3.1, phaseY: 0.7 },
    'node-systems': { ampX: 6, ampY: 6, periodX: 16.4, periodY: 11.8, phaseX: 4.2, phaseY: 2.9 },
    'node-project': { ampX: 3.5, ampY: 4, periodX: 18.0, periodY: 15.2, phaseX: 5.0, phaseY: 3.8 },
    'node-clock': { ampX: 5, ampY: 3, periodX: 11.4, periodY: 9.6, phaseX: 0.9, phaseY: 4.5 },
  }), []);

  // Subtle harmonic drift state
  const [driftOffsets, setDriftOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const isDraggingAnyNodeRef = useRef(false);
  const driftStartTimeRef = useRef(Date.now());
  const lastDriftFrameTimeRef = useRef(0);

  // Active nav tab ref for event listeners
  const activeNavTabRef = useRef(activeNavTab);
  activeNavTabRef.current = activeNavTab;

  // Damped, interruptible scroll progress tracking (0.0 to 1.0)
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  scrollProgressRef.current = scrollProgress;

  // Track dragging state from child nodes
  const handleDragStateChange = useCallback((nodeId: string, isDragging: boolean) => {
    isDraggingAnyNodeRef.current = isDragging;
    if (isDragging) {
      setDriftOffsets((prev) => ({
        ...prev,
        [nodeId]: { x: 0, y: 0 },
      }));
    }
  }, []);

  // Autonomous controlled spatial drift loop (throttled to ~30 FPS for optimal battery and zero lag)
  useEffect(() => {
    let animId: number;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = (timestamp: number) => {
      if (timestamp - lastDriftFrameTimeRef.current >= 33) {
        lastDriftFrameTimeRef.current = timestamp;

        const isVisible = scrollProgress >= 0.20 || activeNavTab !== 'home';
        const canSimulate =
          isSimulating &&
          !prefersReducedMotion &&
          isVisible &&
          !document.hidden &&
          !isDraggingAnyNodeRef.current;

        if (canSimulate) {
          const t = (Date.now() - driftStartTimeRef.current) / 1000;
          const nextOffsets: Record<string, { x: number; y: number }> = {};

          for (const [nodeId, cfg] of Object.entries(NODE_DRIFT_PROFILES)) {
            // Compound smooth sinusoidal harmonics - continuous derivative ensures zero jerk/jitter
            const dx =
              cfg.ampX * Math.sin((2 * Math.PI * t) / cfg.periodX + cfg.phaseX) +
              cfg.ampX * 0.25 * Math.cos((Math.PI * t) / cfg.periodX);
            const dy =
              cfg.ampY * Math.cos((2 * Math.PI * t) / cfg.periodY + cfg.phaseY) +
              cfg.ampY * 0.25 * Math.sin((1.4 * Math.PI * t) / cfg.periodY);

            nextOffsets[nodeId] = {
              x: Math.round(dx * 10) / 10,
              y: Math.round(dy * 10) / 10,
            };
          }

          setDriftOffsets(nextOffsets);
        }
      }

      animId = window.requestAnimationFrame(loop);
    };

    animId = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(animId);
    };
  }, [isSimulating, scrollProgress, activeNavTab, NODE_DRIFT_PROFILES]);

  // Smooth interruptible scroll progress tracking via weighted damping
  useEffect(() => {
    const updateTargetProgress = () => {
      const docEl = document.documentElement;
      const totalHeight = docEl.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        targetProgressRef.current = Math.max(0, Math.min(1, window.scrollY / totalHeight));
      } else {
        targetProgressRef.current = 0;
      }
    };

    let animId: number;
    const tick = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.001) {
        // Weighted damping factor (0.16) for smooth momentum without overshooting
        const next = current + diff * 0.16;
        currentProgressRef.current = next;
        setScrollProgress(Math.round(next * 1000) / 1000);
      } else if (current !== target) {
        currentProgressRef.current = target;
        setScrollProgress(target);
      }

      // Automatically sync active tab indicator to scroll position
      if (currentProgressRef.current >= 0.50 && activeNavTabRef.current === 'home') {
        setActiveNavTab('network');
      } else if (currentProgressRef.current < 0.40 && activeNavTabRef.current === 'network') {
        setActiveNavTab('home');
      }

      animId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', updateTargetProgress, { passive: true });
    window.addEventListener('resize', updateTargetProgress, { passive: true });
    updateTargetProgress();
    currentProgressRef.current = targetProgressRef.current;
    setScrollProgress(targetProgressRef.current);
    animId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateTargetProgress);
      window.removeEventListener('resize', updateTargetProgress);
      window.cancelAnimationFrame(animId);
    };
  }, []);

  // Pure deterministic pin coordinate calculation directly from nodes and drift offsets
  const pinPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const node of nodes) {
      const drift = driftOffsets[node.id] || { x: 0, y: 0 };
      const currentX = node.x + drift.x;
      const currentY = node.y + drift.y;

      if (node.inputs) {
        node.inputs.forEach((pin, i) => {
          map[pin.id] = {
            x: currentX + 18,
            y: currentY + 54 + i * 24,
          };
        });
      }
      if (node.outputs) {
        node.outputs.forEach((pin, j) => {
          map[pin.id] = {
            x: currentX + node.width - 18,
            y: currentY + 54 + j * 24,
          };
        });
      }
    }
    return map;
  }, [nodes, driftOffsets]);

  // Node Dragging Handler - Free movement across full screen resolution space, bounded by UI bars
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes((prevNodes) => {
      const targetNode = prevNodes.find((n) => n.id === nodeId);
      if (!targetNode) return prevNodes;

      const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;

      // Measure node height if DOM element is available
      const nodeEl = typeof document !== 'undefined' ? document.getElementById(`graph-node-${nodeId}`) : null;
      const nodeW = targetNode.width;
      const nodeH = nodeEl ? nodeEl.offsetHeight : (nodeId === 'node-project' ? 680 : (nodeId === 'node-clock' ? 520 : 420));

      const { scale, x: tx, y: ty } = transformRef.current;

      // Screen boundaries guarding functional bars:
      // Left: 16px from screen edge
      const minScreenX = 16;
      // Right: 80px before screen edge (safeguarding right controls dock)
      const maxScreenX = vw - 80;
      // Top: 72px from top (safeguarding 64px header navbar)
      const minScreenY = 72;
      // Bottom: 56px from bottom (safeguarding 36px bottom status bar at bottom-3)
      const maxScreenY = vh - 56;

      const cardScreenW = nodeW * scale;
      const availScreenW = maxScreenX - minScreenX;

      let minGraphX: number;
      let maxGraphX: number;
      if (cardScreenW <= availScreenW) {
        minGraphX = (minScreenX - tx) / scale;
        maxGraphX = (maxScreenX - tx) / scale - nodeW;
      } else {
        minGraphX = (maxScreenX - cardScreenW - tx) / scale;
        maxGraphX = (minScreenX - tx) / scale;
      }

      const cardScreenH = nodeH * scale;
      const availScreenH = maxScreenY - minScreenY;

      let minGraphY: number;
      let maxGraphY: number;
      if (cardScreenH <= availScreenH) {
        minGraphY = (minScreenY - ty) / scale;
        maxGraphY = (maxScreenY - ty) / scale - nodeH;
      } else {
        minGraphY = (maxScreenY - cardScreenH - ty) / scale;
        maxGraphY = (minScreenY + 20 - ty) / scale;
      }

      const proposedX = targetNode.x + deltaX;
      const proposedY = targetNode.y + deltaY;

      const effectiveMinX = Math.min(minGraphX, maxGraphX);
      const effectiveMaxX = Math.max(minGraphX, maxGraphX);
      const effectiveMinY = Math.min(minGraphY, maxGraphY);
      const effectiveMaxY = Math.max(minGraphY, maxGraphY);

      const nextX = Math.round(Math.max(effectiveMinX, Math.min(effectiveMaxX, proposedX)));
      const nextY = Math.round(Math.max(effectiveMinY, Math.min(effectiveMaxY, proposedY)));

      return prevNodes.map((n) => (n.id === nodeId ? { ...n, x: nextX, y: nextY } : n));
    });
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

  // Mobile touch canvas panning
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
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
    const touch = e.touches[0];
    panStartRef.current = { x: touch.clientX - transform.x, y: touch.clientY - transform.y };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isPanningRef.current || moveEvent.touches.length !== 1) return;
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const t = moveEvent.touches[0];
      setTransform((prev) => ({
        ...prev,
        x: Math.round(t.clientX - panStartRef.current.x),
        y: Math.round(t.clientY - panStartRef.current.y),
      }));
    };

    const handleTouchEnd = () => {
      isPanningRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Unified, mathematical centering calculation for presets & screen sizes
  const centerViewForPreset = useCallback((preset: string = 'all', desiredScale: number = 0.70) => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Accurate node bounding boxes per preset:
    // 'all': node-profile [60..400, 260..680] to node-clock [1840..2100, 120..640] & node-credentials [480..820, 550..930]
    // 'project' (Research Tab): node-models [480..820, 100..500], node-systems [900..1240, 100..500], node-project [1320..1760, 80..760]
    // 'skills': node-profile [60..400], node-models [480..820], node-systems [900..1240]
    // 'certificates': node-profile [60..400], node-credentials [480..820]

    let minX = 60;
    let maxX = 2100;
    let minY = 80;
    let maxY = 930;

    if (preset === 'project') {
      minX = 480;
      maxX = 1760; // 1320 + 440
      minY = 80;
      maxY = 760;  // 80 + 680
    } else if (preset === 'skills') {
      minX = 60;
      maxX = 1240;
      minY = 100;
      maxY = 680;
    } else if (preset === 'certificates') {
      minX = 60;
      maxX = 820;
      minY = 260;
      maxY = 930;
    }

    const groupCenterX = (minX + maxX) / 2;
    const groupCenterY = (minY + maxY) / 2;

    const groupW = maxX - minX;
    const groupH = maxY - minY;

    // Viewport usable area accounting for top navbar (64px), bottom telemetry bar (36px), and dock (60px)
    const availW = Math.max(300, vw - (vw < 640 ? 30 : 100));
    const availH = Math.max(300, vh - (vw < 640 ? 100 : 130));
    const maxFitScale = Math.min(availW / groupW, availH / groupH);

    // Keep requested 0.70 default scale, scaling down gracefully on small mobile screens
    const minScaleFloor = vw < 640 ? 0.25 : 0.38;
    const targetScale = Math.min(desiredScale, Math.max(minScaleFloor, Number(maxFitScale.toFixed(2))));

    // Precision viewport center (offsetting 64px top nav and 36px bottom status: (64-36)/2 = +14px)
    const viewCenterX = vw / 2;
    const viewCenterY = (vh + 28) / 2;

    const x = Math.round(viewCenterX - groupCenterX * targetScale);
    const y = Math.round(viewCenterY - groupCenterY * targetScale);

    setTransform({ x, y, scale: targetScale });
  }, []);

  // Fit screen handler
  const handleFitScreen = useCallback(() => {
    centerViewForPreset(activePreset, 0.70);
  }, [centerViewForPreset, activePreset]);

  // Initial auto-centering on load and resize
  useEffect(() => {
    centerViewForPreset(activePreset, 0.70);
  }, [centerViewForPreset, activePreset]);

  // Direct scroll wheel zoom on workspace with tuned sensitivity (counts every percentage smoothly)
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      // If user is on cover or in transition phase (< 0.82), allow window to scroll naturally
      if (scrollProgressRef.current < 0.82) {
        return;
      }

      // If user is scrolled into the network, but zooming out at minimum scale (scale <= 0.36) and scrolls up:
      // Allow window to scroll naturally back up to the Cover!
      if (e.deltaY < 0 && transformRef.current.scale <= 0.36) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Normalize wheel delta across mice and trackpads:
      // Standard wheel notch is ~100 delta. We clamp to [-50, 50] to eliminate wild skips.
      const clampedDelta = Math.max(-50, Math.min(50, -e.deltaY));
      
      // Fine-grained multiplier: ~1% to 1.25% change per notch
      const zoomStep = clampedDelta * 0.00025;
      const zoomFactor = 1 + zoomStep;

      setTransform((prev) => {
        // Increment smoothly in 1% increments (0.70 -> 0.71 -> 0.72)
        const rawScale = prev.scale * zoomFactor;
        const nextScale = Math.max(0.35, Math.min(1.80, Math.round(rawScale * 100) / 100));

        if (nextScale === prev.scale) return prev;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = Math.round(mouseX - (mouseX - prev.x) * (nextScale / prev.scale));
        const newY = Math.round(mouseY - (mouseY - prev.y) * (nextScale / prev.scale));

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
    setActivePreset('all');
    setSelectedNodeId(null);
    centerViewForPreset('all', 0.70);
  }, [centerViewForPreset]);

  // Return to cover
  const handleReturnToCover = useCallback(() => {
    setActiveNavTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Smooth transition down to workspace
  const handleExplore = useCallback(() => {
    setActiveNavTab('network');
    setActiveView('canvas');
    setActivePreset('all');
    setSelectedNodeId(null);
    centerViewForPreset('all', 0.70);
    const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
    window.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }, [centerViewForPreset]);

  // Focus specific node on canvas with smooth centered pan
  const handleFocusNode = useCallback((nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    setSelectedNodeId(nodeId);
    const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
    window.scrollTo({ top: maxScroll, behavior: 'smooth' });

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
    const targetScale = viewportWidth < 640 ? 0.65 : 0.75;
    const nodeHalfHeight = nodeId === 'node-project' ? 340 : (nodeId === 'node-clock' ? 260 : 200);

    const viewCenterX = viewportWidth / 2;
    const viewCenterY = (viewportHeight + 28) / 2;

    setTransform({
      x: Math.round(viewCenterX - (target.x + target.width / 2) * targetScale),
      y: Math.round(viewCenterY - (target.y + nodeHalfHeight) * targetScale),
      scale: targetScale,
    });
  }, [nodes]);

  // Top Nav Tab Selection - Centered layouts for Network and Research tabs
  const handleSelectNavTab = useCallback((tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => {
    setActiveNavTab(tab);

    if (tab === 'home') {
      handleReturnToCover();
    } else if (tab === 'network') {
      setActiveView('canvas');
      setActivePreset('all');
      setSelectedNodeId(null);
      centerViewForPreset('all', 0.70);
      const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
    } else if (tab === 'projects') {
      setActiveView('canvas');
      setActivePreset('project');
      setSelectedNodeId(null);
      centerViewForPreset('project', 0.70);
      const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
    } else if (tab === 'lab') {
      setActiveView('canvas');
      const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      handleFocusNode('node-controls');
    } else if (tab === 'notebook') {
      setActiveView('timeline');
    } else if (tab === 'about') {
      setIsResumeOpen(true);
    }
  }, [centerViewForPreset, handleFocusNode, handleReturnToCover]);

  // Preset Selection Handler
  const handleSelectPreset = useCallback((preset: string) => {
    setActivePreset(preset);
    setSelectedNodeId(null);
    centerViewForPreset(preset, 0.70);
  }, [centerViewForPreset]);

  // Clear node selection when clicking canvas background
  const handleCanvasBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setActiveConnectionId(null);
  }, []);

  const isCoverActive = activeView === 'canvas';
  const effectiveProgress = scrollProgress;

  return (
    <div className="relative w-full bg-[#14171c] text-[#eaeaea] font-body select-none">
      {/* Top Navbar */}
      <TopNavbar
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
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
        {/* Continuous vertical scroll track when on canvas view, dynamic for inspector/timeline */}
        <div
          ref={scrollContainerRef}
          className={`relative w-full ${activeView === 'canvas' ? 'h-[250vh]' : 'min-h-screen'}`}
        >
          {/* Sticky 100vh Viewport Stage */}
          <div className="sticky top-0 w-full h-screen overflow-hidden">
            {/* SECTION 02: Computational Neural Workspace (Base Layer) */}
            <ArchitecturalReveal scrollProgress={effectiveProgress}>
              <div
                style={{
                  opacity: effectiveProgress >= 0.16 ? Math.min(1, (effectiveProgress - 0.16) / 0.45) : 0,
                  pointerEvents: effectiveProgress >= 0.82 ? 'auto' : 'none',
                }}
                className="absolute inset-0 w-full h-screen pt-16 transition-opacity duration-150 ease-out z-10"
              >
                {activeView === 'canvas' ? (
                  <div
                    id="graph-workspace"
                    aria-label="Interactive computational graph canvas"
                    ref={canvasContainerRef}
                    onMouseDown={handleCanvasMouseDown}
                    onTouchStart={handleCanvasTouchStart}
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
                      className="w-full h-full min-w-[2600px] min-h-[1700px] relative pointer-events-auto overflow-visible"
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
                      {filteredNodes.map((node) => {
                        const drift = driftOffsets[node.id] || { x: 0, y: 0 };
                        const effectiveNode: NodeData = {
                          ...node,
                          x: Math.round((node.x + drift.x) * 10) / 10,
                          y: Math.round((node.y + drift.y) * 10) / 10,
                        };

                        return (
                          <GraphNode
                            key={node.id}
                            node={effectiveNode}
                            scale={transform.scale}
                            isSelected={selectedNodeId === node.id}
                            isDimmed={selectedNodeId !== null && selectedNodeId !== node.id}
                            onSelectNode={(id) => setSelectedNodeId(id)}
                            onNodeDrag={handleNodeDrag}
                            onDragStateChange={handleDragStateChange}
                            onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
                            onOpenProjectModal={(proj) => setSelectedProject(proj)}
                            onOpenContactModal={() => setIsContactOpen(true)}
                            onOpenResumeModal={() => setIsResumeOpen(true)}
                            onOpenFocusedNode={(n) => setFocusedNode(n)}
                          />
                        );
                      })}
                    </div>

                    {/* Floating Dock Controls */}
                    <CanvasControlsDock
                      scale={transform.scale}
                      onZoomIn={() => setTransform((p) => {
                        const nextScale = Math.min(1.80, Math.round((p.scale + 0.05) * 100) / 100);
                        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
                        const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                        const newX = Math.round((vw / 2) - ((vw / 2) - p.x) * (nextScale / p.scale));
                        const newY = Math.round(((vh + 28) / 2) - (((vh + 28) / 2) - p.y) * (nextScale / p.scale));
                        return { x: newX, y: newY, scale: nextScale };
                      })}
                      onZoomOut={() => setTransform((p) => {
                        const nextScale = Math.max(0.35, Math.round((p.scale - 0.05) * 100) / 100);
                        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
                        const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                        const newX = Math.round((vw / 2) - ((vw / 2) - p.x) * (nextScale / p.scale));
                        const newY = Math.round(((vh + 28) / 2) - (((vh + 28) / 2) - p.y) * (nextScale / p.scale));
                        return { x: newX, y: newY, scale: nextScale };
                      })}
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
