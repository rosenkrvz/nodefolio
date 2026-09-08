/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { NodeData, Connection, CertificateItem, ProjectItem, CanvasTransform, Pin } from './types';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from './data/portfolioData';
import { EXPANDED_RESEARCH_NODES, RESEARCH_CONNECTIONS, RESEARCH_CORE_COORDINATES } from './data/researchNodesData';
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
import { AddVisitorNodeModal } from './components/modals/AddVisitorNodeModal';
import { InspectorListView } from './components/InspectorListView';
import { ChronicleView } from './components/ChronicleView';
import { playSound } from './lib/sound';

const VISITOR_STORAGE_KEY = 'nodefolio_visitor_notes';

const loadSavedVisitorNodes = (): NodeData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error('Failed to parse saved visitor nodes', e);
  }
  return [];
};

const RESEARCH_NODE_IDS = new Set([
  'node-pipeline',
  'node-inference',
  'node-profile',
  'node-models',
  'node-systems',
  'node-project',
]);

const ALL_NETWORK_NODES: NodeData[] = [...INITIAL_NODES];
const ALL_RESEARCH_NODES: NodeData[] = [
  ...INITIAL_NODES
    .filter((n) => RESEARCH_NODE_IDS.has(n.id))
    .map((n) =>
      RESEARCH_CORE_COORDINATES[n.id] ? { ...n, ...RESEARCH_CORE_COORDINATES[n.id] } : n
    ),
  ...EXPANDED_RESEARCH_NODES.filter((n) => RESEARCH_NODE_IDS.has(n.id)),
];
const ALL_INITIAL_NODES: NodeData[] = ALL_RESEARCH_NODES;
const ALL_INITIAL_CONNECTIONS: Connection[] = [...INITIAL_CONNECTIONS, ...RESEARCH_CONNECTIONS];

// ─── URL Hash Routing ─────────────────────────────────────────────────────────
// Maps internal nav tabs to clean URL hash fragments for shareable, bookmarkable links.
const TAB_TO_HASH: Record<string, string> = {
  home: '#cover',
  network: '#network',
  projects: '#research',
  notebook: '#chronicle_entries',
  lab: '#lab',
  about: '#about',
};

const HASH_TO_TAB: Record<string, 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about'> = {
  '#cover': 'home',
  '#network': 'network',
  '#research': 'projects',
  '#chronicle_entries': 'notebook',
  '#lab': 'lab',
  '#about': 'about',
  '': 'home',
};

const getTabFromHash = (): 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about' => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.toLowerCase();
  return HASH_TO_TAB[hash] || 'home';
};

const updateHash = (tab: string) => {
  if (typeof window === 'undefined') return;
  const hash = TAB_TO_HASH[tab] || '#cover';
  if (window.location.hash !== hash) {
    window.history.replaceState(null, '', hash);
  }
};

export default function App() {
  // Navigation & Scroll State — initialize from URL hash for deep linking
  const initialTab = useMemo(() => getTabFromHash(), []);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about'>(initialTab);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string>(initialTab === 'projects' ? 'project' : 'network');
  const [connections, setConnections] = useState<Connection[]>(ALL_INITIAL_CONNECTIONS);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState<boolean>(false);

  // Graph Data State partitioned by preset so Network positions remain completely independent of Research positions
  const [nodesByPreset, setNodesByPreset] = useState<{
    network: NodeData[];
    project: NodeData[];
  }>(() => {
    const savedVisitors = loadSavedVisitorNodes();
    return {
      network: [...ALL_NETWORK_NODES, ...savedVisitors],
      project: [...ALL_RESEARCH_NODES, ...savedVisitors],
    };
  });

  const currentTabKey = activePreset === 'project' || activePreset === 'all' ? 'project' : 'network';
  const nodes = nodesByPreset[currentTabKey];
  const setNodes = useCallback(
    (updater: NodeData[] | ((prev: NodeData[]) => NodeData[])) => {
      setNodesByPreset((prev) => {
        const next = typeof updater === 'function' ? updater(prev[currentTabKey]) : updater;
        return {
          ...prev,
          [currentTabKey]: next,
        };
      });
    },
    [currentTabKey]
  );
  const [activeView, setActiveView] = useState<'canvas' | 'list' | 'timeline'>(initialTab === 'notebook' ? 'timeline' : 'canvas');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [wireStyle, setWireStyle] = useState<'glow' | 'minimal' | 'cyber'>('glow');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  // Canvas pan & zoom transform (centered at 60% scale by default)
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 0.60 });
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [focusedNode, setFocusedNode] = useState<NodeData | null>(null);
  const [nodeOriginRect, setNodeOriginRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Audio interaction refs
  const hasPlayedCoverTransitionRef = useRef<boolean>(false);
  const lastZoomBracketRef = useRef<number>(60);
  const isWheelZoomingRef = useRef<boolean>(false);
  const wheelZoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    'node-inference': { ampX: 5, ampY: 4, periodX: 14.2, periodY: 11.5, phaseX: 2.1, phaseY: 1.7 },
    'node-optimization': { ampX: 4, ampY: 6, periodX: 16.0, periodY: 13.1, phaseX: 3.8, phaseY: 0.9 },
    'node-pipeline': { ampX: 6, ampY: 4, periodX: 12.8, periodY: 15.4, phaseX: 1.2, phaseY: 3.4 },
    'node-eval': { ampX: 4.5, ampY: 5.5, periodX: 15.1, periodY: 12.2, phaseX: 4.6, phaseY: 2.1 },
    'node-vector': { ampX: 5.5, ampY: 4.5, periodX: 17.2, periodY: 14.0, phaseX: 0.8, phaseY: 4.1 },
    'node-vision': { ampX: 4, ampY: 5, periodX: 13.6, periodY: 10.8, phaseX: 2.9, phaseY: 1.5 },
    'node-generative': { ampX: 5, ampY: 6, periodX: 18.4, periodY: 13.8, phaseX: 5.2, phaseY: 3.1 },
    'node-software': { ampX: 4.5, ampY: 4, periodX: 14.8, periodY: 16.2, phaseX: 1.9, phaseY: 0.6 },
    'node-lab': { ampX: 6, ampY: 5, periodX: 15.5, periodY: 12.0, phaseX: 3.3, phaseY: 4.8 },
    'node-computational': { ampX: 4, ampY: 4.5, periodX: 13.0, periodY: 14.6, phaseX: 4.1, phaseY: 2.7 },
  }), []);

  // Subtle harmonic drift state
  const [driftOffsets, setDriftOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const isDraggingAnyNodeRef = useRef(false);
  const driftStartTimeRef = useRef(Date.now());
  const lastDriftFrameTimeRef = useRef(0);

  // Active nav tab ref for event listeners
  const activeNavTabRef = useRef(activeNavTab);
  activeNavTabRef.current = activeNavTab;
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const isProgrammaticScrollRef = useRef(false);
  const handleSelectNavTabRef = useRef<((tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => void) | null>(null);

  // ─── URL Hash Routing Effects ──────────────────────────────────────────────
  // 1. Sync URL hash bar whenever the active nav tab changes
  useEffect(() => {
    updateHash(activeNavTab);
  }, [activeNavTab]);

  // 2. Deep-link mount: if the URL hash points to a workspace tab, scroll down to it on initial load
  useEffect(() => {
    if (initialTab === 'home' || initialTab === 'notebook') return; // Cover stays at top; Chronicle already handles its own view
    // For network, projects (research), lab — scroll down to workspace after a brief layout settle
    const timer = setTimeout(() => {
      isProgrammaticScrollRef.current = true;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: maxScroll, behavior: 'instant' });
      targetProgressRef.current = 1;
      currentProgressRef.current = 1;
      setScrollProgress(1);
      setTimeout(() => { isProgrammaticScrollRef.current = false; }, 300);
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Browser back/forward navigation via hashchange
  useEffect(() => {
    const onHashChange = () => {
      const newTab = getTabFromHash();
      if (newTab === activeNavTabRef.current) return;
      // Delegate to the same handler as navbar clicks for consistent behavior
      handleSelectNavTabRef.current?.(newTab);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
  // Performance: drift offsets are stored in a ref to avoid creating new state objects every frame.
  // A lightweight render tick counter triggers re-render only when drift values actually change.
  const driftOffsetsRef = useRef<Record<string, { x: number; y: number }>>(driftOffsets);
  const [, setDriftTick] = useState(0);

  useEffect(() => {
    if (!isSimulating) {
      setDriftOffsets({});
      return;
    }

    let animId: number;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = (timestamp: number) => {
      if (timestamp - lastDriftFrameTimeRef.current >= 45) {
        lastDriftFrameTimeRef.current = timestamp;

        const isVisible = scrollProgressRef.current >= 0.20 || activeNavTabRef.current !== 'home';
        const canSimulate =
          isSimulating &&
          !prefersReducedMotion &&
          isVisible &&
          !document.hidden &&
          !isDraggingAnyNodeRef.current &&
          !isPanningRef.current &&
          !isWheelZoomingRef.current;

        if (canSimulate) {
          const t = (Date.now() - driftStartTimeRef.current) / 1000;
          const prev = driftOffsetsRef.current;
          let changed = false;

          const nextOffsets: Record<string, { x: number; y: number }> = {};

          for (const [nodeId, cfg] of Object.entries(NODE_DRIFT_PROFILES)) {
            // Compound smooth sinusoidal harmonics - continuous derivative ensures zero jerk/jitter
            const dx =
              cfg.ampX * Math.sin((2 * Math.PI * t) / cfg.periodX + cfg.phaseX) +
              cfg.ampX * 0.25 * Math.cos((Math.PI * t) / cfg.periodX);
            const dy =
              cfg.ampY * Math.cos((2 * Math.PI * t) / cfg.periodY + cfg.phaseY) +
              cfg.ampY * 0.25 * Math.sin((1.4 * Math.PI * t) / cfg.periodY);

            const rx = Math.round(dx);
            const ry = Math.round(dy);

            nextOffsets[nodeId] = { x: rx, y: ry };

            // Only flag changed if values actually differ (avoids unnecessary re-renders)
            const p = prev[nodeId];
            if (!p || p.x !== rx || p.y !== ry) {
              changed = true;
            }
          }

          if (changed) {
            driftOffsetsRef.current = nextOffsets;
            setDriftOffsets(nextOffsets);
            setDriftTick((c) => c + 1); // Lightweight re-render trigger
          }
        }
      }

      animId = window.requestAnimationFrame(loop);
    };

    animId = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(animId);
    };
  }, [isSimulating, NODE_DRIFT_PROFILES]);

  // Smooth interruptible scroll progress tracking via weighted damping with magnetic settle
  useEffect(() => {
    let settleTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const updateTargetProgress = () => {
      if (activeViewRef.current !== 'canvas') return;
      const docEl = document.documentElement;
      const totalHeight = docEl.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        targetProgressRef.current = Math.max(0, Math.min(1, window.scrollY / totalHeight));
      } else {
        targetProgressRef.current = 0;
      }
    };

    const onScroll = () => {
      updateTargetProgress();

      // Clear any pending settle timer while user is actively scrolling
      if (settleTimeoutId) {
        clearTimeout(settleTimeoutId);
        settleTimeoutId = null;
      }

      // Magnetic settle: when user stops scrolling in the transition zone between Cover and Workspace
      if (!isProgrammaticScrollRef.current && activeViewRef.current === 'canvas') {
        settleTimeoutId = setTimeout(() => {
          if (isProgrammaticScrollRef.current || activeViewRef.current !== 'canvas') return;
          const docEl = document.documentElement;
          const totalHeight = docEl.scrollHeight - window.innerHeight;
          if (totalHeight <= 0) return;

          const progress = window.scrollY / totalHeight;
          if (progress > 0.08 && progress < 0.92) {
            if (progress >= 0.35) {
              // Complete glide down to Network workspace
              isProgrammaticScrollRef.current = true;
              setActiveNavTab('network');
              setActivePreset('network');
              window.scrollTo({ top: totalHeight, behavior: 'smooth' });
            } else {
              // Return cleanly to Cover
              isProgrammaticScrollRef.current = true;
              setActiveNavTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        }, 180);
      }
    };

    let animId: number;
    const tick = () => {
      if (activeViewRef.current === 'canvas') {
        const target = targetProgressRef.current;
        const current = currentProgressRef.current;
        const diff = target - current;

        if (Math.abs(diff) > 0.001) {
          // Weighted damping factor (0.12) for smoother liquid momentum without overshooting
          const next = current + diff * 0.12;
          currentProgressRef.current = next;
          setScrollProgress(Math.round(next * 1000) / 1000);
        } else if (current !== target) {
          currentProgressRef.current = target;
          setScrollProgress(target);
        }

        // Release programmatic scroll lock when arrival is achieved
        if (isProgrammaticScrollRef.current) {
          if (activeNavTabRef.current === 'home' && currentProgressRef.current <= 0.05) {
            isProgrammaticScrollRef.current = false;
          } else if (activeNavTabRef.current !== 'home' && currentProgressRef.current >= 0.85) {
            isProgrammaticScrollRef.current = false;
          }
        }

        // Automatically sync active tab indicator to scroll position only when manually scrolling
        if (!isProgrammaticScrollRef.current) {
          if (currentProgressRef.current >= 0.70 && activeNavTabRef.current === 'home') {
            setActiveNavTab('network');
            setActivePreset('network');
          } else if (currentProgressRef.current < 0.30 && activeNavTabRef.current !== 'home') {
            setActiveNavTab('home');
          }
        }

        // Tactile transition audio: trigger ONE subtle activation sound upon crossing into the neural workspace
        if (currentProgressRef.current >= 0.70 && !hasPlayedCoverTransitionRef.current) {
          hasPlayedCoverTransitionRef.current = true;
          playSound('open');
        } else if (currentProgressRef.current < 0.30 && hasPlayedCoverTransitionRef.current) {
          hasPlayedCoverTransitionRef.current = false;
        }
      }

      animId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateTargetProgress, { passive: true });
    updateTargetProgress();
    currentProgressRef.current = targetProgressRef.current;
    setScrollProgress(targetProgressRef.current);
    animId = window.requestAnimationFrame(tick);

    return () => {
      if (settleTimeoutId) clearTimeout(settleTimeoutId);
      window.removeEventListener('scroll', onScroll);
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

  // Node Dragging Handler - Free movement across full canvas resolution space (50 to 4200)
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes((prevNodes) => {
      const targetNode = prevNodes.find((n) => n.id === nodeId);
      if (!targetNode) return prevNodes;

      const nextX = Math.round(Math.max(50, Math.min(4200, targetNode.x + deltaX)));
      const nextY = Math.round(Math.max(50, Math.min(4200, targetNode.y + deltaY)));

      return prevNodes.map((n) => (n.id === nodeId ? { ...n, x: nextX, y: nextY } : n));
    });
  }, [setNodes]);

  // Deliberate Node Square Edge Resize Handler
  const handleNodeResize = useCallback((nodeId: string, newWidth: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => (n.id === nodeId ? { ...n, width: newWidth } : n))
    );
  }, []);

  // Visitor node creation with local persistence
  const handleAddVisitorNode = useCallback((newNode: NodeData) => {
    setNodesByPreset((prev) => {
      const nextNetwork = [...prev.network, newNode];
      const nextProject = [...prev.project, newNode];
      try {
        const visitorOnly = nextProject.filter((n) => n.category === 'visitor');
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitorOnly));
      } catch (e) {
        console.error('Failed to persist visitor node', e);
      }
      return {
        network: nextNetwork,
        project: nextProject,
      };
    });
  }, []);

  // Visitor node removal with storage sync
  const handleDeleteVisitorNode = useCallback((nodeId: string) => {
    playSound('close');
    setNodesByPreset((prev) => {
      const nextNetwork = prev.network.filter((n) => n.id !== nodeId);
      const nextProject = prev.project.filter((n) => n.id !== nodeId);
      try {
        const visitorOnly = nextProject.filter((n) => n.category === 'visitor');
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitorOnly));
      } catch (e) {
        console.error('Failed to update visitor nodes in storage', e);
      }
      return {
        network: nextNetwork,
        project: nextProject,
      };
    });
  }, []);

  // Filter nodes & connections based on active preset
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (activePreset === 'all') return true;
      if (activePreset === 'network') {
        return [
          'node-profile',
          'node-models',
          'node-credentials',
          'node-systems',
          'node-project',
          'node-clock',
        ].includes(n.id);
      }
      if (activePreset === 'skills') {
        return [
          'node-profile',
          'node-models',
          'node-systems',
          'node-pipeline',
          'node-vision',
          'node-computational',
          'node-software',
        ].includes(n.id);
      }
      if (activePreset === 'certificates') {
        return ['node-profile', 'node-credentials', 'node-inference', 'node-eval'].includes(n.id);
      }
      if (activePreset === 'project') {
        // Research tab: showcases the comprehensive computational ecosystem including visitor notes
        return true;
      }
      return true;
    });
  }, [nodes, activePreset]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const currentPresetConnections = useMemo(() => {
    if (activePreset === 'project' || activePreset === 'all') {
      return RESEARCH_CONNECTIONS;
    }
    return INITIAL_CONNECTIONS;
  }, [activePreset]);

  const filteredConnections = useMemo(() => {
    return currentPresetConnections.filter(
      (c) => activeNodeIds.has(c.fromNodeId) && activeNodeIds.has(c.toNodeId)
    );
  }, [currentPresetConnections, activeNodeIds]);

  // Memoized effective nodes combining base position with drift offsets
  const effectiveNodes = useMemo(() => {
    return filteredNodes.map((node) => {
      const drift = driftOffsets[node.id];
      if (!drift || (drift.x === 0 && drift.y === 0)) return node;
      return {
        ...node,
        x: node.x + drift.x,
        y: node.y + drift.y,
      };
    });
  }, [filteredNodes, driftOffsets]);

  // Stable event callbacks to avoid breaking React.memo in GraphNode and SplineWires
  const handleSelectNode = useCallback((id: string) => {
    playSound('select');
    setSelectedNodeId(id);
  }, []);

  const handleOpenCertificateModal = useCallback((cert: CertificateItem) => {
    playSound('open');
    setSelectedCertificate(cert);
  }, []);

  const handleOpenProjectModal = useCallback((proj: ProjectItem) => {
    playSound('open');
    setSelectedProject(proj);
  }, []);

  const handleOpenContactModal = useCallback(() => {
    playSound('open');
    setIsContactOpen(true);
  }, []);

  const handleOpenResumeModal = useCallback(() => {
    playSound('open');
    setIsResumeOpen(true);
  }, []);

  const handleOpenFocusedNode = useCallback((n: NodeData) => {
    playSound('open');
    const el = typeof document !== 'undefined' ? document.getElementById(`graph-node-${n.id}`) : null;
    const rect = el ? el.getBoundingClientRect() : null;
    setNodeOriginRect(
      rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null
    );
    setFocusedNode(n);
  }, []);

  const handleSelectConnection = useCallback((id: string | null) => {
    if (id) playSound('connect');
    setActiveConnectionId(id);
  }, []);

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

  // Helper for computing estimated vertical height per node type
  const getNodeEstimatedHeight = useCallback((node: NodeData): number => {
    if (node.id === 'node-project') return 680;
    if (node.id === 'node-clock') return 520;
    if (node.id === 'node-models' || node.id === 'node-systems') return 390;
    if (node.category === 'visitor') return 280;
    if (node.researchData) return 340;
    return 340;
  }, []);

  // Precision mathematical centering calculation for presets & screen sizes
  const centerViewForPreset = useCallback((preset: string = 'network', desiredScale?: number) => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Use canonical baseline nodes for calculating structural center (prevents distortion from dragged cards)
    const baselineNodes = (preset === 'project' || preset === 'all') ? ALL_RESEARCH_NODES : ALL_NETWORK_NODES;
    const targetNodes = baselineNodes.filter((n) => {
      if (preset === 'network') {
        return ['node-profile', 'node-models', 'node-credentials', 'node-systems', 'node-project', 'node-clock'].includes(n.id);
      }
      if (preset === 'project') {
        // Research tab: Center symmetrically on the 6-node 2x3 organized layout
        return ['node-pipeline', 'node-inference', 'node-profile', 'node-models', 'node-systems', 'node-project'].includes(n.id);
      }
      if (preset === 'skills') {
        return [
          'node-profile',
          'node-models',
          'node-systems',
          'node-pipeline',
          'node-vision',
          'node-computational',
          'node-software',
        ].includes(n.id);
      }
      if (preset === 'certificates') {
        return ['node-profile', 'node-credentials', 'node-inference', 'node-eval'].includes(n.id);
      }
      // 'all': full research workspace ecosystem
      return true;
    });

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    if (targetNodes.length > 0) {
      for (const node of targetNodes) {
        const h = getNodeEstimatedHeight(node);
        if (node.x < minX) minX = node.x;
        if (node.x + node.width > maxX) maxX = node.x + node.width;
        if (node.y < minY) minY = node.y;
        if (node.y + h > maxY) maxY = node.y + h;
      }
    } else {
      minX = 100;
      maxX = 2380;
      minY = 80;
      maxY = 1800;
    }

    const groupCenterX = (minX + maxX) / 2;
    const groupCenterY = (minY + maxY) / 2;

    const groupW = Math.max(100, maxX - minX);
    const groupH = Math.max(100, maxY - minY);

    // Viewport usable area accounting for top navbar (64px), bottom telemetry bar (44px), and dock controls (60px)
    const availW = Math.max(300, vw - (vw < 640 ? 30 : 120));
    const availH = Math.max(300, vh - (vw < 640 ? 100 : 140));
    const maxFitScale = Math.min(availW / groupW, availH / groupH);

    // Scale default: 0.60 for network tab and research focal gateway, or fitted neatly (capped at 0.48) for other views
    const defaultScale = (preset === 'network' || preset === 'project') ? 0.60 : Math.min(0.48, Number((maxFitScale * 0.94).toFixed(2)));
    const targetDesired = desiredScale !== undefined ? desiredScale : defaultScale;
    const minScaleFloor = vw < 640 ? 0.22 : 0.32;
    const targetScale = Math.min(targetDesired, Math.max(minScaleFloor, Number(maxFitScale.toFixed(2))));

    // Precision viewport center (offsetting 64px top nav and ~44px bottom status: (64 + (vh - 52 - 64)/2) = (vh + 12)/2)
    const viewCenterX = vw / 2;
    const viewCenterY = (vh + 12) / 2;

    const x = Math.round(viewCenterX - groupCenterX * targetScale);
    const y = Math.round(viewCenterY - groupCenterY * targetScale);

    setTransform({ x, y, scale: targetScale });
  }, [getNodeEstimatedHeight]);

  // Fit screen handler
  const handleFitScreen = useCallback(() => {
    centerViewForPreset(activePreset);
  }, [centerViewForPreset, activePreset]);

  // Center strictly ONLY on initial mount and when activePreset explicitly changes (NOT on node drags or zooms)
  useEffect(() => {
    centerViewForPreset(activePreset);
  }, [activePreset, centerViewForPreset]);

  // Debounced window resize auto-centering
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        centerViewForPreset(activePreset);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [activePreset, centerViewForPreset]);

  // Return to cover with smooth, single-pass upward transition (no ricochet)
  const handleReturnToCover = useCallback(() => {
    playSound('close');
    setActiveNavTab('home');
    if (activeViewRef.current !== 'canvas') {
      setActiveView('canvas');
      targetProgressRef.current = 0;
      currentProgressRef.current = 0;
      setScrollProgress(0);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // On canvas view: smoothly scroll window to top in one natural, continuous glide
    isProgrammaticScrollRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Direct scroll wheel zoom on workspace & dedicated upper-tab-bar return to cover
  useEffect(() => {
    const onWindowWheel = (e: WheelEvent) => {
      // Only manage when in canvas view
      if (activeViewRef.current !== 'canvas') return;

      // If a modal dialog is open, allow native scrolling within modal
      if (document.querySelector('[role="dialog"]')) return;

      // Check if user is currently inside the computational node space UI
      const inNodeSpace = activeNavTabRef.current !== 'home' || scrollProgressRef.current >= 0.80;

      if (!inNodeSpace) {
        // User is on cover page or transitioning down into node space:
        // Allow natural window scroll so cover page animation plays smoothly
        return;
      }

      // Inside Node Space UI:
      const target = e.target as HTMLElement | null;
      const isUpperTabBar = e.clientY <= 64 || Boolean(target?.closest('header'));

      if (isUpperTabBar) {
        // Mouse is in the upper tab bar:
        if (e.deltaY < 0) {
          // Scroll up on the tab bar: trigger the smooth scroll animation to cover page!
          e.preventDefault();
          handleReturnToCover();
        } else {
          // Scroll down on upper tab bar when already in node space
          e.preventDefault();
        }
        return;
      }

      // Mouse is inside node space: release any scroll animation lock immediately
      isProgrammaticScrollRef.current = false;

      // Prevent page scrolling so workspace zooms smoothly
      e.preventDefault();
      e.stopPropagation();

      const container = canvasContainerRef.current;
      if (!container) return;

      // Standardize wheel delta across mice, trackpads, and line scrolling
      const rawDelta = e.deltaMode === 1 ? e.deltaY * 20 : (e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY);
      const clampedDelta = Math.max(-120, Math.min(120, rawDelta));
      
      // Temporarily mark wheel zooming active to pause background drift and prevent cache churn
      isWheelZoomingRef.current = true;
      if (wheelZoomTimeoutRef.current) clearTimeout(wheelZoomTimeoutRef.current);
      wheelZoomTimeoutRef.current = setTimeout(() => {
        isWheelZoomingRef.current = false;
      }, 220);

      // 1% step per notch for buttery smooth, continuous fluidity (e.g. 52% -> 53% -> 54%)
      const direction = clampedDelta > 0 ? -1 : 1;
      const deltaPercent = direction * 0.01;

      setTransform((prev) => {
        const nextScale = Math.max(0.25, Math.min(2.20, Math.round((prev.scale + deltaPercent) * 100) / 100));

        if (nextScale === prev.scale) return prev;

        // Tactile detent feedback when stepping each 1% section (52%, 53%, 54%, etc.)
        const newBracket = Math.round(nextScale * 100);
        if (newBracket !== lastZoomBracketRef.current) {
          lastZoomBracketRef.current = newBracket;
          playSound('zoom');
        }

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = Math.round(mouseX - (mouseX - prev.x) * (nextScale / prev.scale));
        const newY = Math.round(mouseY - (mouseY - prev.y) * (nextScale / prev.scale));

        return { x: newX, y: newY, scale: nextScale };
      });
    };

    window.addEventListener('wheel', onWindowWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWindowWheel);
    };
  }, [handleReturnToCover]);

  // Reset Graph
  const handleResetGraph = useCallback(() => {
    playSound('secondaryClick');
    const savedVisitors = loadSavedVisitorNodes();
    setNodesByPreset({
      network: [...ALL_NETWORK_NODES, ...savedVisitors],
      project: [...ALL_RESEARCH_NODES, ...savedVisitors],
    });
    setConnections(ALL_INITIAL_CONNECTIONS);
    const targetPreset = activeNavTabRef.current === 'projects' ? 'project' : 'network';
    setActivePreset(targetPreset);
    setSelectedNodeId(null);
    centerViewForPreset(targetPreset);
  }, [centerViewForPreset]);

  // Smooth single-pass transition down to workspace
  const handleExplore = useCallback(() => {
    playSound('open');
    setActiveNavTab('network');
    setActiveView('canvas');
    setActivePreset('network');
    setSelectedNodeId(null);
    centerViewForPreset('network', 0.60);
    isProgrammaticScrollRef.current = true;
    const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
    window.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }, [centerViewForPreset]);

  // Focus specific node on canvas with smooth centered pan
  const handleFocusNode = useCallback((nodeId: string) => {
    playSound('select');
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    const wasOnTimeline = activeViewRef.current === 'timeline';
    setActiveView('canvas');
    setSelectedNodeId(nodeId);
    isProgrammaticScrollRef.current = true;

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
    const targetScale = viewportWidth < 640 ? 0.55 : 0.65;
    const nodeHalfHeight = nodeId === 'node-project' ? 340 : (nodeId === 'node-clock' ? 260 : 170);

    const viewCenterX = viewportWidth / 2;
    const viewCenterY = (viewportHeight + 12) / 2;

    setTransform({
      x: Math.round(viewCenterX - (target.x + target.width / 2) * targetScale),
      y: Math.round(viewCenterY - (target.y + nodeHalfHeight) * targetScale),
      scale: targetScale,
    });

    if (wasOnTimeline) {
      // Coming from Chronicle - skip scroll animation entirely, land directly in workspace
      targetProgressRef.current = 1;
      currentProgressRef.current = 1;
      setScrollProgress(1);
      const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
      window.scrollTo({ top: maxScroll, behavior: 'instant' });
    } else {
      // Coming from Cover or already on canvas - smooth scroll down
      const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  }, [nodes]);

  // Top Nav Tab Selection - Centered layouts for Network and Research tabs
  const handleSelectNavTab = useCallback((tab: 'home' | 'network' | 'projects' | 'lab' | 'notebook' | 'about') => {
    setActiveNavTab(tab);

    if (tab === 'home') {
      handleReturnToCover();
    } else if (tab === 'network') {
      const wasOnTimeline = activeViewRef.current === 'timeline';
      setActiveView('canvas');
      setActivePreset('network');
      setSelectedNodeId(null);
      centerViewForPreset('network', 0.60);
      isProgrammaticScrollRef.current = true;
      setTimeout(() => { isProgrammaticScrollRef.current = false; }, 500);

      if (wasOnTimeline) {
        // Coming from Chronicle — skip scroll animation, land instantly in workspace
        targetProgressRef.current = 1;
        currentProgressRef.current = 1;
        setScrollProgress(1);
        const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
        window.scrollTo({ top: maxScroll, behavior: 'instant' });
      } else {
        // Coming from Cover or already on canvas — original smooth scroll behavior
        const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      }
    } else if (tab === 'projects') {
      const wasOnTimeline = activeViewRef.current === 'timeline';
      setActiveView('canvas');
      setActivePreset('project');
      setSelectedNodeId(null);
      centerViewForPreset('project', 0.60);
      isProgrammaticScrollRef.current = true;
      setTimeout(() => { isProgrammaticScrollRef.current = false; }, 500);

      if (wasOnTimeline) {
        // Coming from Chronicle — skip scroll animation, land instantly in workspace
        targetProgressRef.current = 1;
        currentProgressRef.current = 1;
        setScrollProgress(1);
        const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
        window.scrollTo({ top: maxScroll, behavior: 'instant' });
      } else {
        // Coming from Cover or already on canvas — original smooth scroll behavior
        const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      }
    } else if (tab === 'lab') {
      const wasOnTimeline = activeViewRef.current === 'timeline';
      setActiveView('canvas');
      isProgrammaticScrollRef.current = true;
      setTimeout(() => { isProgrammaticScrollRef.current = false; }, 500);

      if (wasOnTimeline) {
        targetProgressRef.current = 1;
        currentProgressRef.current = 1;
        setScrollProgress(1);
        const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
        window.scrollTo({ top: maxScroll, behavior: 'instant' });
      } else {
        const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      }
      handleFocusNode('node-controls');
    } else if (tab === 'notebook') {
      setActiveView('timeline');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (tab === 'about') {
      setIsResumeOpen(true);
    }
  }, [centerViewForPreset, handleFocusNode, handleReturnToCover]);
  handleSelectNavTabRef.current = handleSelectNavTab;

  // Preset Selection Handler
  const handleSelectPreset = useCallback((preset: string) => {
    playSound('secondaryClick');
    setActivePreset(preset);
    setSelectedNodeId(null);
    centerViewForPreset(preset);
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
        {activeView === 'timeline' ? (
          /* Editorial Chronicle Journal View */
          <div className="relative w-full min-h-screen z-20 pointer-events-auto">
            <ChronicleView
              onBackToCanvas={() => {
                handleSelectNavTab('network');
              }}
              onFocusNodeOnCanvas={(nodeId) => {
                handleFocusNode(nodeId);
              }}
            />
          </div>
        ) : activeView === 'list' ? (
          /* Inspector Catalog View */
          <div className="relative w-full min-h-screen z-20 pointer-events-auto pt-16">
            <InspectorListView
              nodes={nodes}
              connections={connections}
              onFocusNodeOnCanvas={handleFocusNode}
              onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
              onOpenProjectModal={(proj) => setSelectedProject(proj)}
              onOpenContact={() => setIsContactOpen(true)}
            />
          </div>
        ) : (
          /* SECTION 01 + 02: Canvas Viewport (Cover + Neural Workspace) */
          <div
            ref={scrollContainerRef}
            className="relative w-full h-[220vh]"
          >
            {/* Sticky 100vh Viewport Stage */}
            <div className="sticky top-0 w-full h-screen overflow-hidden">
              {/* SECTION 02: Computational Neural Workspace (Base Layer) */}
              <ArchitecturalReveal scrollProgress={scrollProgress}>
                <div
                  style={{
                    opacity: activeNavTab !== 'home' ? 1 : (scrollProgress >= 0.10 ? Math.min(1, Math.pow((scrollProgress - 0.10) / 0.40, 1.2)) : 0),
                    pointerEvents: (activeNavTab !== 'home' || scrollProgress >= 0.80) ? 'auto' : 'none',
                  }}
                  className="absolute inset-0 w-full h-screen pt-16 transition-opacity duration-150 ease-out z-10"
                >
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
                      className="w-full h-full min-w-[4400px] min-h-[4400px] relative pointer-events-auto overflow-visible"
                    >
                      {/* Spline Connections Layer with Focus/Depth Dimming */}
                      <SplineWires
                        connections={filteredConnections}
                        pinPositions={pinPositions}
                        isSimulating={isSimulating}
                        wireStyle={wireStyle}
                        activeConnectionId={activeConnectionId}
                        selectedNodeId={selectedNodeId}
                        onSelectConnection={handleSelectConnection}
                      />

                      {/* Connected Graph Nodes (#0b0d12 carbon fiber) */}
                      {effectiveNodes.map((effectiveNode) => (
                        <GraphNode
                          key={effectiveNode.id}
                          node={effectiveNode}
                          scale={transform.scale}
                          isSelected={selectedNodeId === effectiveNode.id}
                          isDimmed={selectedNodeId !== null && selectedNodeId !== effectiveNode.id}
                          onSelectNode={handleSelectNode}
                          onNodeDrag={handleNodeDrag}
                          onNodeResize={handleNodeResize}
                          onDragStateChange={handleDragStateChange}
                          onDeleteVisitorNode={handleDeleteVisitorNode}
                          onOpenCertificateModal={handleOpenCertificateModal}
                          onOpenProjectModal={handleOpenProjectModal}
                          onOpenContactModal={handleOpenContactModal}
                          onOpenResumeModal={handleOpenResumeModal}
                          onOpenFocusedNode={handleOpenFocusedNode}
                        />
                      ))}
                    </div>

                    {/* Floating Dock Controls */}
                    <CanvasControlsDock
                      scale={transform.scale}
                      onZoomIn={() => {
                        playSound('zoom');
                        setTransform((p) => {
                          const nextScale = Math.min(2.20, Math.round((p.scale + 0.01) * 100) / 100);
                          lastZoomBracketRef.current = Math.round(nextScale * 100);
                          const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
                          const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                          const newX = Math.round((vw / 2) - ((vw / 2) - p.x) * (nextScale / p.scale));
                          const newY = Math.round(((vh + 12) / 2) - (((vh + 12) / 2) - p.y) * (nextScale / p.scale));
                          return { x: newX, y: newY, scale: nextScale };
                        });
                      }}
                      onZoomOut={() => {
                        playSound('zoom');
                        setTransform((p) => {
                          const nextScale = Math.max(0.25, Math.round((p.scale - 0.01) * 100) / 100);
                          lastZoomBracketRef.current = Math.round(nextScale * 100);
                          const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
                          const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                          const newX = Math.round((vw / 2) - ((vw / 2) - p.x) * (nextScale / p.scale));
                          const newY = Math.round(((vh + 12) / 2) - (((vh + 12) / 2) - p.y) * (nextScale / p.scale));
                          return { x: newX, y: newY, scale: nextScale };
                        });
                      }}
                      onFitScreen={() => {
                        playSound('secondaryClick');
                        handleFitScreen();
                      }}
                      showGrid={showGrid}
                      onToggleGrid={() => {
                        playSound('secondaryClick');
                        setShowGrid(!showGrid);
                      }}
                      wireStyle={wireStyle}
                      onCycleWireStyle={() => {
                        playSound('secondaryClick');
                        const styles: ('glow' | 'minimal' | 'cyber')[] = ['glow', 'minimal', 'cyber'];
                        const next = styles[(styles.indexOf(wireStyle) + 1) % styles.length];
                        setWireStyle(next);
                      }}
                      isSimulating={isSimulating}
                      onToggleSimulate={() => {
                        playSound('connect');
                        setIsSimulating(!isSimulating);
                      }}
                      onReturnToCover={handleReturnToCover}
                      onOpenAddNode={activePreset === 'project' ? () => setIsAddNodeOpen(true) : undefined}
                    />
                  </div>

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
                      <span>&bull;</span>
                      <span className="text-zinc-300 font-medium">Resize edges to adjust node sizes</span>
                    </div>

                    {(() => {
                      const visitorCount = filteredNodes.filter((n) => n.category === 'visitor').length;
                      const officialCount = filteredNodes.length - visitorCount;
                      return (
                        <div className="flex items-center gap-2 text-zinc-300 font-medium text-[11px] shrink-0">
                          <span>{officialCount} RESEARCH NODES</span>
                          {visitorCount > 0 && (
                            <>
                              <span>+</span>
                              <span className="text-rose-400 font-semibold">{visitorCount} VISITOR NOTE{visitorCount > 1 ? 'S' : ''}</span>
                            </>
                          )}
                          <span>/</span>
                          <span>{filteredConnections.length} ACTIVE SPLINES</span>
                          <span>&bull;</span>
                          <span className="text-rose-500 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            LIVE
                          </span>
                        </div>
                      );
                    })()}
                  </footer>
                </div>
              </ArchitecturalReveal>

              {/* SECTION 01: Solid Editorial Portfolio Cover (Surface Layer, sits on top and physically lifts on scroll) */}
              <EditorialCover
                scrollProgress={scrollProgress}
                onExplore={handleExplore}
                onViewWork={() => handleSelectNavTab('projects')}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <FocusedNodeModal
        node={focusedNode}
        originRect={nodeOriginRect}
        connections={connections}
        onDeleteVisitorNode={handleDeleteVisitorNode}
        onClose={() => {
          setFocusedNode(null);
          setNodeOriginRect(null);
        }}
        onFocusNode={handleFocusNode}
        onOpenProjectDetail={(p) => {
          playSound('open');
          setFocusedNode(null);
          setNodeOriginRect(null);
          setSelectedProject(p);
        }}
        onOpenCertificateDetail={(c) => {
          playSound('open');
          setFocusedNode(null);
          setNodeOriginRect(null);
          setSelectedCertificate(c);
        }}
        onOpenContact={() => {
          playSound('open');
          setFocusedNode(null);
          setNodeOriginRect(null);
          setIsContactOpen(true);
        }}
        onOpenResume={() => {
          playSound('open');
          setFocusedNode(null);
          setNodeOriginRect(null);
          setIsResumeOpen(true);
        }}
      />

      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => {
          playSound('close');
          setSelectedCertificate(null);
        }}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => {
          playSound('close');
          setSelectedProject(null);
        }}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => {
          playSound('close');
          setIsContactOpen(false);
        }}
        email="marksrv047@gmail.com"
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => {
          playSound('close');
          setIsResumeOpen(false);
        }}
        nodes={nodes}
      />

      <AddVisitorNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onAddNode={handleAddVisitorNode}
        existingVisitorCount={nodes.filter((n) => n.category === 'visitor').length}
      />
    </div>
  );
}
