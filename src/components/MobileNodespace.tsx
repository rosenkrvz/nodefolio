import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { NodeData, Connection, CertificateItem, ProjectItem } from '../types';
import { MobileWorkspaceDock } from './MobileWorkspaceDock';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileNodeIndexSheet } from './MobileNodeIndexSheet';
import { ProfileNodeContent } from './nodes/ProfileNodeContent';
import { SkillsNodeContent } from './nodes/SkillsNodeContent';
import { CertificatesNodeContent } from './nodes/CertificatesNodeContent';
import { ControlsNodeContent } from './nodes/ControlsNodeContent';
import { ProjectNodeContent } from './nodes/ProjectNodeContent';
import { ExperienceNodeContent } from './nodes/ExperienceNodeContent';
import { ClockNodeContent } from './nodes/ClockNodeContent';
import { ResearchMiniVisualizer } from './nodes/ResearchMiniVisualizer';
import { VisitorNodeContent } from './nodes/VisitorNodeContent';
import { PinPort } from './PinPort';
import { playSound } from '../lib/sound';
import {
  Maximize,
  Layers,
  Award,
  Sliders,
  Eye,
  User,
  Clock,
  BarChart,
  Binary,
  Database,
  Terminal,
  Compass,
  Cpu,
  FileText,
  ChevronLeft,
  ChevronRight,
} from './icons';

interface MobileNodespaceProps {
  nodes: NodeData[];
  connections: Connection[];
  activePreset: 'project' | 'network' | 'all';
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onOpenCertificateModal: (cert: CertificateItem) => void;
  onOpenProjectModal: (
    proj: ProjectItem,
    originRect?: { left: number; top: number; width: number; height: number } | null
  ) => void;
  onOpenContactModal: () => void;
  onOpenResumeModal: () => void;
  onOpenFocusedNode: (node: NodeData) => void;
  onDeleteVisitorNode: (id: string) => void;
  isSimulating: boolean;
  wireStyle: 'glow' | 'minimal' | 'cyber';
  showGrid?: boolean;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  profile: <User className="w-3.5 h-3.5 text-rose-400" />,
  skills: <Layers className="w-3.5 h-3.5 text-rose-400" />,
  certificates: <Award className="w-3.5 h-3.5 text-rose-400" />,
  controls: <Sliders className="w-3.5 h-3.5 text-rose-400" />,
  project: <Eye className="w-3.5 h-3.5 text-rose-400" />,
  clock: <Clock className="w-3.5 h-3.5 text-rose-400" />,
  statistics: <BarChart className="w-3.5 h-3.5 text-rose-400" />,
  optimization: <Sliders className="w-3.5 h-3.5 text-rose-400" />,
  pipeline: <Binary className="w-3.5 h-3.5 text-rose-400" />,
  evaluation: <Binary className="w-3.5 h-3.5 text-rose-400" />,
  vectors: <Database className="w-3.5 h-3.5 text-rose-400" />,
  vision: <Eye className="w-3.5 h-3.5 text-rose-400" />,
  generative: <Binary className="w-3.5 h-3.5 text-rose-400" />,
  software: <Terminal className="w-3.5 h-3.5 text-rose-400" />,
  experiment: <Compass className="w-3.5 h-3.5 text-rose-400" />,
  computational: <Cpu className="w-3.5 h-3.5 text-rose-400" />,
  visitor: <FileText className="w-3.5 h-3.5 text-rose-400" />,
};

type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'direct';

export const MobileNodespace: React.FC<MobileNodespaceProps> = ({
  nodes,
  connections,
  activePreset,
  selectedNodeId,
  onSelectNode,
  onOpenCertificateModal,
  onOpenProjectModal,
  onOpenContactModal,
  onOpenResumeModal,
  onOpenFocusedNode,
  onDeleteVisitorNode,
  isSimulating: _isSimulating,
  wireStyle: _wireStyle,
  showGrid = true,
}) => {
  // Determine initial anchor node based on preset
  const defaultAnchorId = useMemo(() => {
    if (activePreset === 'project') {
      const projNode = nodes.find((n) => n.id === 'node-project');
      if (projNode) return projNode.id;
    }
    const profNode = nodes.find((n) => n.id === 'node-profile');
    if (profNode) return profNode.id;
    return nodes[0]?.id || 'node-profile';
  }, [nodes, activePreset]);

  // Current active node in the focused navigator
  const [activeNodeId, setActiveNodeId] = useState<string>(() => selectedNodeId || defaultAnchorId);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('right');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [activeTraversedConnId, setActiveTraversedConnId] = useState<string | null>(null);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [gridVisible, setGridVisible] = useState<boolean>(showGrid);

  // Sync with external selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId && selectedNodeId !== activeNodeId) {
      setActiveNodeId(selectedNodeId);
    }
  }, [selectedNodeId, activeNodeId]);

  // Keep active node in bounds when nodes list or preset changes
  useEffect(() => {
    if (!nodes.some((n) => n.id === activeNodeId)) {
      setActiveNodeId(defaultAnchorId);
    }
  }, [nodes, activeNodeId, defaultAnchorId]);

  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === activeNodeId) || nodes[0];
  }, [nodes, activeNodeId]);

  const activeIndex = useMemo(() => {
    return nodes.findIndex((n) => n.id === activeNode?.id);
  }, [nodes, activeNode]);

  // Connected nodes analysis from the graph topology
  const { incomingConnectedNodes, outgoingConnectedNodes, allConnectedNodes } = useMemo(() => {
    if (!activeNode) {
      return { incomingConnectedNodes: [], outgoingConnectedNodes: [], allConnectedNodes: [] };
    }

    // Connections where current node is target (incoming)
    const inConns = connections.filter((c) => c.toNodeId === activeNode.id);
    const inNodes = inConns
      .map((c) => {
        const fromNode = nodes.find((n) => n.id === c.fromNodeId);
        return fromNode ? { node: fromNode, connection: c, direction: 'incoming' as const } : null;
      })
      .filter(Boolean) as { node: NodeData; connection: Connection; direction: 'incoming' }[];

    // Connections where current node is source (outgoing)
    const outConns = connections.filter((c) => c.fromNodeId === activeNode.id);
    const outNodes = outConns
      .map((c) => {
        const toNode = nodes.find((n) => n.id === c.toNodeId);
        return toNode ? { node: toNode, connection: c, direction: 'outgoing' as const } : null;
      })
      .filter(Boolean) as { node: NodeData; connection: Connection; direction: 'outgoing' }[];

    const combined = [...inNodes, ...outNodes];

    return {
      incomingConnectedNodes: inNodes,
      outgoingConnectedNodes: outNodes,
      allConnectedNodes: combined,
    };
  }, [activeNode, connections, nodes]);

  // Previous and Next nodes in sequential order for linear traversal fallback
  const prevNode = useMemo(() => {
    if (nodes.length <= 1) return null;
    const prevIdx = (activeIndex - 1 + nodes.length) % nodes.length;
    return nodes[prevIdx];
  }, [nodes, activeIndex]);

  const nextNode = useMemo(() => {
    if (nodes.length <= 1) return null;
    const nextIdx = (activeIndex + 1) % nodes.length;
    return nodes[nextIdx];
  }, [nodes, activeIndex]);

  // Spatial directional candidates
  // Left: First incoming connected node or previous sequential node
  const leftTarget = useMemo(() => {
    if (incomingConnectedNodes.length > 0) return incomingConnectedNodes[0];
    if (prevNode) return { node: prevNode, connection: null, direction: 'incoming' as const };
    return null;
  }, [incomingConnectedNodes, prevNode]);

  // Right: First outgoing connected node or next sequential node
  const rightTarget = useMemo(() => {
    if (outgoingConnectedNodes.length > 0) return outgoingConnectedNodes[0];
    if (nextNode) return { node: nextNode, connection: null, direction: 'outgoing' as const };
    return null;
  }, [outgoingConnectedNodes, nextNode]);

  // Top / Bottom: Additional connected nodes if graph branches vertically
  const topTarget = useMemo(() => {
    const additional = allConnectedNodes.filter(
      (c) => c.node.id !== leftTarget?.node.id && c.node.id !== rightTarget?.node.id
    );
    return additional[0] || null;
  }, [allConnectedNodes, leftTarget, rightTarget]);

  const bottomTarget = useMemo(() => {
    const additional = allConnectedNodes.filter(
      (c) =>
        c.node.id !== leftTarget?.node.id &&
        c.node.id !== rightTarget?.node.id &&
        c.node.id !== topTarget?.node.id
    );
    return additional[0] || null;
  }, [allConnectedNodes, leftTarget, rightTarget, topTarget]);

  // Smooth node-to-node navigation with vector transitions
  const navigateToNode = useCallback(
    (targetNodeId: string, direction: TransitionDirection = 'right', connectionId?: string) => {
      if (targetNodeId === activeNodeId || isTransitioning) return;

      playSound('select');
      setTransitionDirection(direction);
      setIsTransitioning(true);

      if (connectionId) {
        setActiveTraversedConnId(connectionId);
      }

      // Smooth step
      setTimeout(() => {
        setActiveNodeId(targetNodeId);
        onSelectNode(targetNodeId);
      }, 140);

      setTimeout(() => {
        setIsTransitioning(false);
        setActiveTraversedConnId(null);
      }, 380);
    },
    [activeNodeId, isTransitioning, onSelectNode]
  );

  // Sequential controls
  const handlePrev = useCallback(() => {
    if (leftTarget) {
      navigateToNode(leftTarget.node.id, 'left', leftTarget.connection?.id);
    } else if (prevNode) {
      navigateToNode(prevNode.id, 'left');
    }
  }, [leftTarget, prevNode, navigateToNode]);

  const handleNext = useCallback(() => {
    if (rightTarget) {
      navigateToNode(rightTarget.node.id, 'right', rightTarget.connection?.id);
    } else if (nextNode) {
      navigateToNode(nextNode.id, 'right');
    }
  }, [rightTarget, nextNode, navigateToNode]);

  // ════════════════ TOUCH SWIPE GESTURE SUPPORT ════════════════
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const isSwipingRef = useRef<boolean>(false);
  const lastCardTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });

  const handleCardDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      ['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA'].includes(target.tagName) ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('.port-pin')
    ) {
      return;
    }
    playSound('open');
    onOpenFocusedNode(activeNode);
  }, [activeNode, onOpenFocusedNode]);

  const handleCardTouchEnd = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      ['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA'].includes(target.tagName) ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('.port-pin')
    ) {
      return;
    }
    if (e.changedTouches && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const now = Date.now();
      const dt = now - lastCardTapRef.current.time;
      const dist = Math.hypot(
        touch.clientX - lastCardTapRef.current.x,
        touch.clientY - lastCardTapRef.current.y
      );
      if (dt > 0 && dt < 320 && dist < 25) {
        playSound('open');
        onOpenFocusedNode(activeNode);
        lastCardTapRef.current = { time: 0, x: 0, y: 0 };
      } else {
        lastCardTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
      }
    }
  }, [activeNode, onOpenFocusedNode]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Don't intercept taps on buttons, links, inputs, or inside expanded scrollable content
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[role="dialog"]')
    ) {
      return;
    }

    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;

    if (e.changedTouches && e.changedTouches.length === 1 && touchStartRef.current) {
      const startX = typeof touchStartRef.current.x === 'number' && isFinite(touchStartRef.current.x) ? touchStartRef.current.x : 0;
      const startY = typeof touchStartRef.current.y === 'number' && isFinite(touchStartRef.current.y) ? touchStartRef.current.y : 0;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const dt = Date.now() - (touchStartRef.current.time || 0);

      // Ensure horizontal swipe is dominant and intentional
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 600) {
        if (dx < 0) {
          // Swipe left -> navigate right (next node)
          handleNext();
        } else {
          // Swipe right -> navigate left (previous node)
          handlePrev();
        }
      }
    }
  };

  if (!activeNode) return null;

  // Compute slide transform styling based on transition direction
  const getTransformClasses = () => {
    if (!isTransitioning) {
      return 'translate-x-0 translate-y-0 opacity-100 scale-100';
    }
    switch (transitionDirection) {
      case 'left':
        return '-translate-x-12 opacity-40 scale-95';
      case 'right':
        return 'translate-x-12 opacity-40 scale-95';
      case 'up':
        return '-translate-y-10 opacity-40 scale-95';
      case 'down':
        return 'translate-y-10 opacity-40 scale-95';
      default:
        return 'opacity-40 scale-95';
    }
  };

  if (!activeNode) return null;

  return (
    <div
      id="mobile-focused-node-navigator"
      aria-label="Mobile Focused Computational Node Navigator"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full relative overflow-hidden select-none touch-pan-y bg-[#090b10] flex flex-col items-center justify-center pt-2 sm:pt-4 pb-24 sm:pb-28"
    >
      {/* Subtle Spatial Canvas Background Grid */}
      {gridVisible && (
        <div className="absolute inset-0 pattern-bg pointer-events-none opacity-25" />
      )}

      {/* Atmospheric Spatial Glow behind active node */}
      <div
        style={{
          background: `radial-gradient(circle 260px at 50% 50%, ${
            activeNode.glowColor || 'rgba(225, 29, 72, 0.15)'
          }, transparent 75%)`,
        }}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
      />

      {/* ═══════════ SPATIAL CONNECTION SPLINE VECTORS ═══════════ */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
      >
        <defs>
          <linearGradient id="mobile-spline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0.25" />
          </linearGradient>
          <filter id="spline-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Vector line to Left / Previous connected node */}
        {leftTarget && (
          <g>
            <line
              x1="6%"
              y1="50%"
              x2="22%"
              y2="50%"
              stroke={activeTraversedConnId ? '#f43f5e' : '#e11d48'}
              strokeWidth={activeTraversedConnId ? '2.5' : '1.5'}
              strokeDasharray="4,4"
              strokeOpacity="0.5"
            />
            <circle cx="6%" cy="50%" r="3" fill="#e11d48" className="animate-pulse" />
          </g>
        )}

        {/* Vector line to Right / Next connected node */}
        {rightTarget && (
          <g>
            <line
              x1="78%"
              y1="50%"
              x2="94%"
              y2="50%"
              stroke={activeTraversedConnId ? '#f43f5e' : '#e11d48'}
              strokeWidth={activeTraversedConnId ? '2.5' : '1.5'}
              strokeDasharray="4,4"
              strokeOpacity="0.5"
            />
            <circle cx="94%" cy="50%" r="3" fill="#e11d48" className="animate-pulse" />
          </g>
        )}

        {/* Vector line to Top connected node */}
        {topTarget && (
          <g>
            <line
              x1="50%"
              y1="8%"
              x2="50%"
              y2="18%"
              stroke="#e11d48"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              strokeOpacity="0.45"
            />
            <circle cx="50%" cy="8%" r="3" fill="#e11d48" />
          </g>
        )}

        {/* Vector line to Bottom connected node */}
        {bottomTarget && (
          <g>
            <line
              x1="50%"
              y1="82%"
              x2="50%"
              y2="92%"
              stroke="#e11d48"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              strokeOpacity="0.45"
            />
            <circle cx="50%" cy="92%" r="3" fill="#e11d48" />
          </g>
        )}
      </svg>

      {/* Main Focus Stage Container */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center px-1 sm:px-4 max-w-lg z-10 min-h-0">
        {/* Top Directional Indicator (cleanly positioned in-flow above the card) */}
        {topTarget && (
          <div className="mb-2 shrink-0 z-20 flex justify-center pointer-events-auto">
            <button
              type="button"
              onClick={() => navigateToNode(topTarget.node.id, 'up', topTarget.connection?.id)}
              aria-label={`Navigate up to ${topTarget.node.title}`}
              className="group min-h-[38px] px-3.5 flex items-center gap-1.5 rounded-full bg-[#0c0e14]/94 border border-white/12 hover:border-rose-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all cursor-pointer"
            >
              <span className="text-rose-400 font-mono text-xs group-hover:-translate-y-0.5 transition-transform">
                &uarr;
              </span>
              <span className="text-[10px] sm:text-[11px] font-tech font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider truncate max-w-[170px] sm:max-w-[220px]">
                {topTarget.node.title}
              </span>
              {topTarget.connection?.label && (
                <span className="text-[9px] font-mono text-rose-400/80 hidden min-[360px]:inline">
                  [{topTarget.connection.label}]
                </span>
              )}
            </button>
          </div>
        )}

        {/* Left Directional Quick Anchor (44px min touch area in dedicated gutter) */}
        {leftTarget && (
          <button
            type="button"
            onClick={() => navigateToNode(leftTarget.node.id, 'left', leftTarget.connection?.id)}
            aria-label={`Navigate to previous node: ${leftTarget.node.title}`}
            className="group absolute -left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center p-1 cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#0c0e14]/94 border border-white/12 group-hover:border-rose-500/70 group-active:scale-90 shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all">
              <ChevronLeft className="w-4 h-4 text-zinc-300 group-hover:text-rose-400 group-hover:-translate-x-0.5 transition-all" />
            </div>
          </button>
        )}

        {/* Right Directional Quick Anchor (44px min touch area in dedicated gutter) */}
        {rightTarget && (
          <button
            type="button"
            onClick={() => navigateToNode(rightTarget.node.id, 'right', rightTarget.connection?.id)}
            aria-label={`Navigate to next node: ${rightTarget.node.title || 'next node'}`}
            className="group absolute -right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center p-1 cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#0c0e14]/94 border border-white/12 group-hover:border-rose-500/70 group-active:scale-90 shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all">
              <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        )}

        {/* ═══════════ THE PRIMARY FOCUSED NODE CARD ═══════════ */}
        <article
          id={`graph-node-${activeNode.id}`}
          aria-label={`Focused computational research node: ${activeNode.title}. Double-click to open.`}
          title="Double-click to open detailed artifact"
          onDoubleClick={handleCardDoubleClick}
          onTouchEnd={handleCardTouchEnd}
          style={{
            borderColor: activeNode.accentColor
              ? `${activeNode.accentColor}33`
              : 'rgba(255, 255, 255, 0.12)',
          }}
          className={`w-[calc(100%-40px)] sm:w-[calc(100%-72px)] max-w-[420px] min-w-[270px] max-h-[calc(100dvh-180px)] sm:max-h-[min(580px,calc(100dvh-180px))] flex flex-col rounded-2xl bg-[#0b0d12]/95 border backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.92)] font-body text-zinc-200 overflow-hidden transition-all duration-300 ease-out z-10 cursor-pointer ${getTransformClasses()}`}
        >
          {/* Card Top Horizon Laser Accent Line */}
          <div
            style={{
              background: `linear-gradient(90deg, transparent, ${
                activeNode.accentColor || '#e11d48'
              }, transparent)`,
            }}
            className="h-[2px] w-full"
          />

          {/* Node Header Row */}
          <header
            onDoubleClick={handleCardDoubleClick}
            className="px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between gap-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Category Icon Badge */}
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                {CATEGORY_ICON_MAP[activeNode.category] || <Cpu className="w-3.5 h-3.5 text-rose-400" />}
              </div>

              {/* Title & Subtitle */}
              <div className="min-w-0">
                <h3 className="font-display text-sm sm:text-base font-bold text-white uppercase tracking-wider truncate leading-tight">
                  {activeNode.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-tech text-zinc-400 truncate leading-none mt-0.5">
                  {activeNode.subtitle}
                </p>
              </div>
            </div>

            {/* Action Buttons Cluster */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Expand / View Technical Specification Fullscreen Button: 44px touch target */}
              <button
                type="button"
                onClick={() => {
                  playSound('open');
                  onOpenFocusedNode(activeNode);
                }}
                title="Expand detailed technical specification"
                aria-label={`Expand ${activeNode.title} technical specification`}
                className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.10] active:bg-white/[0.18] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* Topological Pin Ports Row (Inputs & Outputs) */}
          {((activeNode.inputs && activeNode.inputs.length > 0) ||
            (activeNode.outputs && activeNode.outputs.length > 0)) && (
            <div className="px-3.5 py-1.5 bg-black/40 border-b border-white/[0.06] flex items-center justify-between gap-2 text-[10px] font-tech text-zinc-400">
              {/* Inputs */}
              <div className="flex flex-col gap-1 min-w-0">
                {activeNode.inputs?.slice(0, 2).map((pin) => (
                  <PinPort key={pin.id} pin={pin} isConnected={true} />
                ))}
              </div>

              {/* Outputs */}
              <div className="flex flex-col gap-1 min-w-0 items-end">
                {activeNode.outputs?.slice(0, 2).map((pin) => (
                  <PinPort key={pin.id} pin={pin} isConnected={true} />
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ RICH NODE INTERNAL BODY CONTENT ═══════════ */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4">
            {/* 1. Profile Node Content */}
            {activeNode.category === 'profile' && activeNode.profile && (
              <ProfileNodeContent
                data={activeNode.profile}
                onOpenContact={onOpenContactModal}
                onOpenResume={onOpenResumeModal}
              />
            )}

            {/* 2. Skills / Systems Node Content */}
            {activeNode.category === 'skills' && activeNode.skills && (
              <SkillsNodeContent
                skills={activeNode.skills}
                accentColor={activeNode.accentColor}
                onExplore={() => onOpenFocusedNode(activeNode)}
              />
            )}

            {/* 3. Certificates / Academic Node Content */}
            {activeNode.category === 'certificates' && activeNode.certificates && (
              <CertificatesNodeContent
                certificates={activeNode.certificates}
                onSelectCertificate={onOpenCertificateModal}
                onExplore={() => onOpenFocusedNode(activeNode)}
              />
            )}

            {/* 4. Controls Node Content */}
            {activeNode.category === 'controls' && (
              <ControlsNodeContent initialData={activeNode.controlsData} />
            )}

            {/* 5. Project / Artifact Node Content */}
            {activeNode.category === 'project' && activeNode.project && (
              <ProjectNodeContent
                project={activeNode.project}
                onOpenModal={onOpenProjectModal}
              />
            )}

            {/* 6. Experience Node Content */}
            {activeNode.category === 'experience' && activeNode.experience && (
              <ExperienceNodeContent experience={activeNode.experience} />
            )}

            {/* 7. System Chronometer Clock Node Content */}
            {activeNode.category === 'clock' && <ClockNodeContent />}

            {/* 8. Visitor Note Node Content */}
            {activeNode.category === 'visitor' && activeNode.visitorData && (
              <VisitorNodeContent
                visitorData={activeNode.visitorData}
                onDelete={onDeleteVisitorNode}
              />
            )}

            {/* 9. Specialized Research Node Content */}
            {activeNode.researchData && (
              <div className="space-y-3 font-body">
                <div className="flex items-center justify-between text-[10px] font-tech text-zinc-400 uppercase tracking-widest border-b border-white/[0.06] pb-2">
                  <span className="text-rose-400 font-bold truncate max-w-[170px]">
                    {activeNode.researchData.domain}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300 font-medium shrink-0">
                    {activeNode.researchData.state}
                  </span>
                </div>

                <ResearchMiniVisualizer
                  type={activeNode.researchData.visualizationType || 'distribution'}
                  accentColor={activeNode.accentColor}
                />

                <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                  {activeNode.researchData.overview}
                </p>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {activeNode.researchData.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[9px] font-tech text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound('open');
                    onOpenFocusedNode(activeNode);
                  }}
                  className="w-full pt-2 text-left text-[11px] font-tech font-semibold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                >
                  <span>View Technical Specification</span>
                  <span className="group-hover:translate-x-1 transition-transform">&nearr;</span>
                </button>
              </div>
            )}
          </div>
        </article>

        {/* Bottom Directional Indicator (positioned in flow below the card) */}
        {bottomTarget && (
          <div className="mt-2 shrink-0 z-20 flex justify-center pointer-events-auto">
            <button
              type="button"
              onClick={() => navigateToNode(bottomTarget.node.id, 'down', bottomTarget.connection?.id)}
              aria-label={`Navigate down to ${bottomTarget.node.title}`}
              className="group min-h-[38px] px-3.5 flex items-center gap-1.5 rounded-full bg-[#0c0e14]/94 border border-white/12 hover:border-rose-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all cursor-pointer"
            >
              <span className="text-rose-400 font-mono text-xs group-hover:translate-y-0.5 transition-transform">
                &darr;
              </span>
              <span className="text-[10px] sm:text-[11px] font-tech font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider truncate max-w-[170px] sm:max-w-[220px]">
                {bottomTarget.node?.title || 'Node'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Control Dock */}
      <MobileWorkspaceDock
        onPrevNode={handlePrev}
        onNextNode={handleNext}
        hasPrevNode={Boolean(leftTarget || prevNode)}
        hasNextNode={Boolean(rightTarget || nextNode)}
        currentNodeIndex={activeIndex + 1}
        totalNodes={nodes.length}
        onOpenIndex={() => setIsIndexOpen(true)}
        showGrid={gridVisible}
        onToggleGrid={() => setGridVisible((v) => !v)}
      />

      {/* Floating Bottom Telemetry Status Bar */}
      <MobileStatusBar
        currentNodeIndex={activeIndex + 1}
        totalNodes={nodes.length}
        splineCount={connections.length}
        visitorCount={nodes.filter((n) => n.category === 'visitor').length}
        presetName={activePreset === 'project' ? 'RESEARCH' : 'NETWORK'}
        activeNodeTitle={activeNode?.title || 'Node'}
      />

      {/* Research Node Index Drawer Sheet */}
      <MobileNodeIndexSheet
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        nodes={nodes}
        selectedNodeId={activeNode.id}
        onSelectNode={(id) => {
          navigateToNode(id, 'direct');
        }}
      />
    </div>
  );
};
