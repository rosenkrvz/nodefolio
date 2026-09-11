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
import { PrintCVDocument } from './components/cv/PrintCVDocument';
import { AddVisitorNodeModal } from './components/modals/AddVisitorNodeModal';
import { InspectorListView } from './components/InspectorListView';
import { ChronicleView } from './components/ChronicleView';
import { ResearchCanvas3D } from './components/canvas3d/ResearchCanvas3D';
import { playSound } from './lib/sound';
import { useIsMobile } from './hooks/useIsMobile';
import { MobileNodespace } from './components/MobileNodespace';
import { GraphErrorBoundary } from './components/GraphErrorBoundary';
import {
  subscribeToCommunityVisitorNodes,
  saveCommunityVisitorNode,
  deleteCommunityVisitorNode,
} from './lib/firebase';

const VISITOR_STORAGE_KEY = 'nodefolio_visitor_notes';
const VISITOR_STORAGE_VERSION = 'v2';
const VISITOR_VERSION_KEY = 'nodefolio_visitor_version';

const loadSavedVisitorNodes = (): NodeData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!raw) return [];
    const currentVersion = localStorage.getItem(VISITOR_VERSION_KEY);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      let migrated = currentVersion !== VISITOR_STORAGE_VERSION;
      const validNodes: NodeData[] = [];
      parsed.forEach((item: any, idx: number) => {
        if (!item || typeof item !== 'object' || typeof item.id !== 'string') return;
        
        let x = typeof item.x === 'number' && isFinite(item.x) ? item.x : 1450;
        let y = typeof item.y === 'number' && isFinite(item.y) ? item.y : 450;
        
        if (x >= 2000 || x < 100 || y < 100) {
          migrated = true;
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          x = 1450 + col * 290;
          y = 450 + row * 240;
        }

        validNodes.push({
          ...item,
          id: String(item.id),
          title: String(item.title || item.visitorData?.name ? `${item.visitorData.name}'s Note` : 'Research Note'),
          subtitle: String(item.subtitle || 'COMMUNITY NOTE'),
          x,
          y,
          width: typeof item.width === 'number' && isFinite(item.width) ? item.width : 270,
          inputs: Array.isArray(item.inputs) ? item.inputs : [],
          outputs: Array.isArray(item.outputs) ? item.outputs : [],
          category: 'visitor',
        });
      });

      if (migrated || validNodes.length !== parsed.length) {
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(validNodes));
        localStorage.setItem(VISITOR_VERSION_KEY, VISITOR_STORAGE_VERSION);
      }
      return validNodes;
    }
  } catch (e) {
    console.error('Failed to parse saved visitor nodes', e);
  }
  return [];
};

const NODE_DIMENSIONS_KEY = 'nodefolio_node_dimensions';
const NODE_DIMENSIONS_VERSION = 'v1';
const NODE_DIMENSIONS_VER_KEY = 'nodefolio_node_dimensions_ver';

const loadSavedNodeDimensions = (): Record<string, { width: number; x?: number }> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(NODE_DIMENSIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const valid: Record<string, { width: number; x?: number }> = {};
      for (const [id, val] of Object.entries(parsed)) {
        if (val && typeof val === 'object') {
          const w = (val as any).width;
          const x = (val as any).x;
          if (typeof w === 'number' && isFinite(w) && !isNaN(w) && w >= 220 && w <= 700) {
            valid[id] = {
              width: Math.round(w),
              x: typeof x === 'number' && isFinite(x) && !isNaN(x) && x >= -20000 && x <= 20000 ? Math.round(x) : undefined,
            };
          }
        }
      }
      return valid;
    }
  } catch (e) {
    console.error('Failed to load saved node dimensions', e);
  }
  return {};
};

const saveNodeDimension = (nodeId: string, width: number, x?: number) => {
  if (typeof window === 'undefined') return;
  try {
    if (typeof width !== 'number' || !isFinite(width) || isNaN(width) || width < 220 || width > 700) {
      return;
    }
    const current = loadSavedNodeDimensions();
    current[nodeId] = {
      width: Math.round(width),
      x: typeof x === 'number' && isFinite(x) && !isNaN(x) ? Math.round(x) : current[nodeId]?.x,
    };
    localStorage.setItem(NODE_DIMENSIONS_KEY, JSON.stringify(current));
    localStorage.setItem(NODE_DIMENSIONS_VER_KEY, NODE_DIMENSIONS_VERSION);
  } catch (e) {
    console.error('Failed to persist node dimension', e);
  }
};

const applySavedDimensions = (nodeList: NodeData[]): NodeData[] => {
  const saved = loadSavedNodeDimensions();
  return nodeList.map((n) => {
    const dim = saved[n.id];
    if (dim) {
      return {
        ...n,
        width: dim.width,
        x: typeof dim.x === 'number' ? dim.x : n.x,
      };
    }
    return n;
  });
};

const RESEARCH_NODE_IDS = new Set([
  'node-profile',
  'node-models',
  'node-systems',
  'node-project',
]);

const ALL_NETWORK_NODES: NodeData[] = applySavedDimensions([...INITIAL_NODES]);
const ALL_RESEARCH_NODES: NodeData[] = [
  ...INITIAL_NODES
    .filter((n) => RESEARCH_NODE_IDS.has(n.id))
    .map((n) => ({
      ...n,
      ...(RESEARCH_CORE_COORDINATES[n.id] || {}),
    })),
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
  const [activeResearchCanvasPhase, setActiveResearchCanvasPhase] = useState<string | null>(null);
  const [chronicleActivePhaseId, setChronicleActivePhaseId] = useState<string>('m1');

  // Graph Data State:
  // - Network tab contains strictly official portfolio nodes (no visitor notes, no add button)
  // - Research tab contains the comprehensive research ecosystem + community easter egg visitor notes
  const [nodesByPreset, setNodesByPreset] = useState<{
    network: NodeData[];
    project: NodeData[];
  }>(() => {
    const savedVisitors = loadSavedVisitorNodes();
    return {
      network: [...ALL_NETWORK_NODES],
      project: [...ALL_RESEARCH_NODES, ...savedVisitors],
    };
  });

  // Real-time Firestore synchronization for community visitor nodes (Easter egg on Research tab)
  useEffect(() => {
    const unsubscribe = subscribeToCommunityVisitorNodes((firestoreNodes) => {
      if (!Array.isArray(firestoreNodes)) return;
      setNodesByPreset((prev) => {
        const officialResearch = prev.project.filter((n) => n.category !== 'visitor');
        return {
          ...prev,
          project: [...officialResearch, ...firestoreNodes],
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const currentTabKey = activePreset === 'project' || activePreset === 'all' ? 'project' : 'network';
  const currentTabKeyRef = useRef(currentTabKey);
  currentTabKeyRef.current = currentTabKey;

  const nodes = nodesByPreset[currentTabKey] || (currentTabKey === 'project' ? ALL_RESEARCH_NODES : ALL_NETWORK_NODES);
  const setNodes = useCallback(
    (updater: NodeData[] | ((prev: NodeData[]) => NodeData[])) => {
      const activeKey = currentTabKeyRef.current;
      setNodesByPreset((prev) => {
        const currentList = prev[activeKey] || (activeKey === 'project' ? ALL_RESEARCH_NODES : ALL_NETWORK_NODES);
        const next = typeof updater === 'function' ? updater(currentList) : updater;
        return {
          ...prev,
          [activeKey]: Array.isArray(next) ? next : currentList,
        };
      });
    },
    []
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
  const pendingPanRef = useRef<{ x: number; y: number } | null>(null);
  const panRafIdRef = useRef<number | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Mobile detection hook
  const isMobile = useIsMobile();

  // Multi-touch pinch-to-zoom refs
  const pinchStartDistRef = useRef<number>(0);
  const pinchStartTransformRef = useRef<CanvasTransform>({ x: 0, y: 0, scale: 0.6 });
  const pinchMidpointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPinchingRef = useRef<boolean>(false);

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
  const lastZoomSoundTimeRef = useRef<number>(0);
  const isWheelZoomingRef = useRef<boolean>(false);
  const wheelZoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // RAF batching refs for high-frequency pointer moves and resizes
  const pendingDragDeltasRef = useRef<Record<string, { dx: number; dy: number }>>({});
  const dragRafIdRef = useRef<number | null>(null);
  const pendingResizeRef = useRef<Record<string, { width: number; x?: number }>>({});
  const resizeRafIdRef = useRef<number | null>(null);

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

  // Auto-normalize any existing visitor nodes if they were saved at old offscreen coordinates (x >= 2000)
  useEffect(() => {
    setNodesByPreset((prev) => {
      let hasFar = false;
      const normalize = (list: NodeData[]) =>
        list.map((n, idx) => {
          if (n.category === 'visitor' && (n.x >= 2000 || n.x < 100 || n.y < 100)) {
            hasFar = true;
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            return {
              ...n,
              x: 1450 + col * 290,
              y: 450 + row * 240,
            };
          }
          return n;
        });

      const nextNetwork = normalize(prev.network);
      const nextProject = normalize(prev.project);

      if (hasFar) {
        try {
          const visitorOnly = nextProject.filter((n) => n.category === 'visitor');
          localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitorOnly));
        } catch (e) {
          console.error('Failed to sync normalized visitor nodes', e);
        }
        return { network: nextNetwork, project: nextProject };
      }
      return prev;
    });
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
    if (!isSimulating || activeView !== 'canvas') {
      setDriftOffsets({});
      return;
    }

    let animId: number | null = null;
    let disposed = false;
    let isRunning = false;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const requestNextFrame = () => {
      if (disposed || isRunning || document.hidden || activeViewRef.current !== 'canvas') return;
      isRunning = true;
      animId = window.requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      isRunning = false;
      if (animId !== null) {
        window.cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const loop = (timestamp: number) => {
      isRunning = false;
      if (disposed) return;
      if (document.hidden || activeViewRef.current !== 'canvas') {
        return;
      }

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

      requestNextFrame();
    };

    const handleVisibilityChange = () => {
      if (disposed) return;
      if (document.hidden || activeViewRef.current !== 'canvas') {
        stopLoop();
      } else {
        requestNextFrame();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    requestNextFrame();

    return () => {
      disposed = true;
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSimulating, activeView, NODE_DRIFT_PROFILES]);

  // ─── HIGH-PRECISION VELOCITY-AWARE SCROLL ENGINE & MAGNETIC SETTLE ─────────
  const startSettleRef = useRef<((target: 0 | 1, customDuration?: number) => void) | null>(null);
  const cancelSettleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let animId: number | null = null;
    let settleAnimId: number | null = null;
    let settleTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let isTicking = false;
    let isSettling = false;
    let isInteracting = false;
    let interactionTimeoutId: ReturnType<typeof setTimeout> | null = null;

    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let lastScrollTime = performance.now();
    let scrollVelocity = 0; // normalized progress units per second
    let lastTickTime = performance.now();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cancelSettle = () => {
      if (settleAnimId !== null) {
        window.cancelAnimationFrame(settleAnimId);
        settleAnimId = null;
      }
      if (settleTimeoutId !== null) {
        clearTimeout(settleTimeoutId);
        settleTimeoutId = null;
      }
      isSettling = false;
      isProgrammaticScrollRef.current = false;
    };
    cancelSettleRef.current = cancelSettle;

    const startSettle = (target: 0 | 1, customDuration?: number) => {
      if (activeViewRef.current !== 'canvas') return;
      cancelSettle();

      const docEl = document.documentElement;
      const totalHeight = docEl.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      isSettling = true;
      isProgrammaticScrollRef.current = true;

      const startProgress = currentProgressRef.current;
      const distance = Math.abs(target - startProgress);

      // Target 150–320ms based on distance remaining:
      // Small adjustments (e.g. 0.10 distance) settle in ~160ms; full travel takes ~300ms
      const duration = customDuration ?? Math.max(150, Math.min(320, Math.round(150 + distance * 180)));
      const startTime = performance.now();

      const settleStep = (now: number) => {
        if (!isSettling) return;
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);

        // Polished cubic ease-out: starts with gesture momentum and glides into an elegant resting snap
        const easedT = 1 - Math.pow(1 - t, 3);
        const nextProgress = startProgress + (target - startProgress) * easedT;

        currentProgressRef.current = nextProgress;
        targetProgressRef.current = nextProgress;
        setScrollProgress(Math.round(nextProgress * 1000) / 1000);

        const targetScrollY = Math.round(nextProgress * totalHeight);
        window.scrollTo({ top: targetScrollY, behavior: 'instant' });

        if (t < 1) {
          settleAnimId = window.requestAnimationFrame(settleStep);
        } else {
          // Finalize rest state cleanly
          currentProgressRef.current = target;
          targetProgressRef.current = target;
          setScrollProgress(target);
          window.scrollTo({ top: Math.round(target * totalHeight), behavior: 'instant' });

          isSettling = false;
          settleAnimId = null;
          isProgrammaticScrollRef.current = false;

          // Synchronize active navigation tab to the settled state
          if (target === 1 && activeNavTabRef.current === 'home') {
            setActiveNavTab('network');
            setActivePreset('network');
          } else if (target === 0 && activeNavTabRef.current !== 'home') {
            setActiveNavTab('home');
          }
        }
      };

      settleAnimId = window.requestAnimationFrame(settleStep);
    };
    startSettleRef.current = startSettle;

    const checkAndTriggerSettle = () => {
      if (isSettling || isProgrammaticScrollRef.current || activeViewRef.current !== 'canvas') return;
      const docEl = document.documentElement;
      const totalHeight = docEl.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const progress = currentProgressRef.current;
      // Only settle when inside the intermediate transition zone
      if (progress > 0.04 && progress < 0.96) {
        const velocity = scrollVelocity;
        // Project position based on gesture velocity:
        // A strong flick (velocity > 0.6 / -0.6) commits decisively to that direction.
        // A slow or interrupted scroll determines direction based on 0.48 threshold with slight momentum.
        let target: 0 | 1 = 0;
        if (velocity > 0.6) {
          target = 1;
        } else if (velocity < -0.6) {
          target = 0;
        } else {
          const projected = progress + velocity * 0.18;
          target = projected >= 0.48 ? 1 : 0;
        }

        startSettle(target);
      }
    };

    const ensureTicking = () => {
      if (!isTicking && typeof window !== 'undefined') {
        isTicking = true;
        lastTickTime = performance.now();
        animId = window.requestAnimationFrame(tick);
      }
    };

    const updateTargetProgress = () => {
      if (activeViewRef.current !== 'canvas') return;
      const docEl = document.documentElement;
      const totalHeight = docEl.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        targetProgressRef.current = Math.max(0, Math.min(1, window.scrollY / totalHeight));
      } else {
        targetProgressRef.current = 0;
      }
      ensureTicking();
    };

    const onScroll = () => {
      if (isSettling) return;

      const docEl = document.documentElement;
      const totalHeight = docEl.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const currentY = window.scrollY;
      const now = performance.now();
      const dt = now - lastScrollTime;

      // Track physical scroll velocity (progress units per second)
      if (dt > 6) {
        const dy = currentY - lastScrollY;
        const instantV = (dy / totalHeight) / (dt / 1000);
        // Exponential moving average filter for smooth, reliable velocity measurement
        scrollVelocity = scrollVelocity * 0.35 + instantV * 0.65;
        lastScrollY = currentY;
        lastScrollTime = now;
      }

      updateTargetProgress();

      // Clear any pending settle timer while user is actively scrolling
      if (settleTimeoutId) {
        clearTimeout(settleTimeoutId);
        settleTimeoutId = null;
      }

      // Fast magnetic settle: triggered after user finishes gesture (55ms idle debounce)
      if (!isProgrammaticScrollRef.current && activeViewRef.current === 'canvas' && !isInteracting) {
        settleTimeoutId = setTimeout(() => {
          checkAndTriggerSettle();
        }, 55);
      }
    };

    // User gesture listeners for zero-latency cancellation & touch velocity tracking
    const markInteracting = () => {
      isInteracting = true;
      cancelSettle();
      if (interactionTimeoutId) clearTimeout(interactionTimeoutId);
      interactionTimeoutId = setTimeout(() => {
        isInteracting = false;
      }, 70);
    };

    const onWheel = () => {
      markInteracting();
    };

    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      markInteracting();
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
      }
    };

    const onTouchMove = () => {
      markInteracting();
    };

    const onTouchEnd = (e: TouchEvent) => {
      isInteracting = false;
      if (interactionTimeoutId) clearTimeout(interactionTimeoutId);

      // Measure touch flick velocity if available
      if (e.changedTouches.length > 0 && touchStartTime > 0) {
        const touchEndY = e.changedTouches[0].clientY;
        const touchDt = (performance.now() - touchStartTime) / 1000;
        const docEl = document.documentElement;
        const totalH = docEl.scrollHeight - window.innerHeight;
        if (touchDt > 0.03 && touchDt < 0.6 && totalH > 0) {
          // dy > 0 means finger dragged up (scrolled down)
          const dy = touchStartY - touchEndY;
          const touchV = (dy / totalH) / touchDt;
          if (Math.abs(touchV) > 0.4) {
            scrollVelocity = touchV;
          }
        }
      }

      // Trigger immediate settle check on release (micro-delay to register final scroll tick)
      if (activeViewRef.current === 'canvas' && !isProgrammaticScrollRef.current) {
        if (settleTimeoutId) clearTimeout(settleTimeoutId);
        settleTimeoutId = setTimeout(() => {
          checkAndTriggerSettle();
        }, 30);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        markInteracting();
      }
    };

    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        isTicking = false;
        animId = null;
        return;
      }

      if (activeViewRef.current === 'canvas') {
        if (isSettling) {
          isTicking = false;
          animId = null;
          return;
        }

        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTickTime) / 1000));
        lastTickTime = now;

        const target = targetProgressRef.current;
        const current = currentProgressRef.current;
        const diff = target - current;

        let needsAnotherTick = false;

        if (Math.abs(diff) > 0.0005) {
          // Responsive frame-rate independent exponential smoothing (lambda = 32 s^-1)
          // Follows user's touch/wheel immediately with physical smoothness, no floaty lag
          const factor = prefersReducedMotion ? 1 : 1 - Math.exp(-32 * dt);
          const next = current + diff * factor;
          currentProgressRef.current = next;
          setScrollProgress(Math.round(next * 1000) / 1000);
          needsAnotherTick = true;
        } else if (current !== target) {
          currentProgressRef.current = target;
          setScrollProgress(target);
        }

        // Automatically sync active tab indicator to scroll position only when manually scrolling
        if (!isProgrammaticScrollRef.current && !isSettling) {
          if (currentProgressRef.current >= 0.70 && activeNavTabRef.current === 'home') {
            setActiveNavTab('network');
            setActivePreset('network');
          } else if (currentProgressRef.current < 0.30 && activeNavTabRef.current !== 'home') {
            setActiveNavTab('home');
          }
        }

        // Tactile transition audio
        if (currentProgressRef.current >= 0.70 && !hasPlayedCoverTransitionRef.current) {
          hasPlayedCoverTransitionRef.current = true;
          playSound('open');
        } else if (currentProgressRef.current < 0.30 && hasPlayedCoverTransitionRef.current) {
          hasPlayedCoverTransitionRef.current = false;
        }

        if (needsAnotherTick) {
          animId = window.requestAnimationFrame(tick);
          return;
        }
      }

      isTicking = false;
      animId = null;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateTargetProgress, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown, { passive: true });
    
    // Page visibility event to pause/resume RAF cleanly
    const onVisibilityChange = () => {
      if (!document.hidden) {
        updateTargetProgress();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    updateTargetProgress();
    currentProgressRef.current = targetProgressRef.current;
    setScrollProgress(targetProgressRef.current);
    ensureTicking();

    return () => {
      cancelSettle();
      if (animId !== null) window.cancelAnimationFrame(animId);
      if (interactionTimeoutId) clearTimeout(interactionTimeoutId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateTargetProgress);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (dragRafIdRef.current !== null) window.cancelAnimationFrame(dragRafIdRef.current);
      if (resizeRafIdRef.current !== null) window.cancelAnimationFrame(resizeRafIdRef.current);
      if (panRafIdRef.current !== null) window.cancelAnimationFrame(panRafIdRef.current);
    };
  }, []);



  // Pure deterministic pin coordinate calculation directly from nodes and drift offsets
  const pinPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    if (!Array.isArray(nodes)) return map;
    for (const node of nodes) {
      if (!node || typeof node !== 'object' || typeof node.id !== 'string') continue;
      const drift = driftOffsets[node.id];
      const dx = drift && typeof drift.x === 'number' && isFinite(drift.x) ? drift.x : 0;
      const dy = drift && typeof drift.y === 'number' && isFinite(drift.y) ? drift.y : 0;
      const rawX = typeof node.x === 'number' && isFinite(node.x) ? node.x : 0;
      const rawY = typeof node.y === 'number' && isFinite(node.y) ? node.y : 0;
      const currentX = rawX + dx;
      const currentY = rawY + dy;
      const width = typeof node.width === 'number' && isFinite(node.width) && node.width > 0 ? node.width : 340;

      if (Array.isArray(node.inputs)) {
        node.inputs.forEach((pin, i) => {
          if (pin && typeof pin.id === 'string') {
            map[pin.id] = {
              x: currentX + 18,
              y: currentY + 54 + i * 24,
            };
          }
        });
      }
      if (Array.isArray(node.outputs)) {
        node.outputs.forEach((pin, j) => {
          if (pin && typeof pin.id === 'string') {
            map[pin.id] = {
              x: currentX + width - 18,
              y: currentY + 54 + j * 24,
            };
          }
        });
      }
    }
    return map;
  }, [nodes, driftOffsets]);

  // Node Dragging Handler - RAF-throttled batching across full canvas resolution space
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    const cur = pendingDragDeltasRef.current[nodeId] || { dx: 0, dy: 0 };
    pendingDragDeltasRef.current[nodeId] = { dx: cur.dx + deltaX, dy: cur.dy + deltaY };

    if (dragRafIdRef.current === null) {
      dragRafIdRef.current = window.requestAnimationFrame(() => {
        dragRafIdRef.current = null;
        const deltas = pendingDragDeltasRef.current;
        pendingDragDeltasRef.current = {};

        setNodes((prevNodes) => {
          let hasChanges = false;
          const nextNodes = prevNodes.map((n) => {
            const d = deltas[n.id];
            if (!d || (d.dx === 0 && d.dy === 0)) return n;
            const rawX = n.x + d.dx;
            const rawY = n.y + d.dy;
            if (!isFinite(rawX) || isNaN(rawX) || !isFinite(rawY) || isNaN(rawY)) return n;
            hasChanges = true;
            const nextX = Math.round(Math.max(-20000, Math.min(20000, rawX)));
            const nextY = Math.round(Math.max(-20000, Math.min(20000, rawY)));
            return { ...n, x: nextX, y: nextY };
          });
          return hasChanges ? nextNodes : prevNodes;
        });
      });
    }
  }, [setNodes]);

  // Deliberate Node Square Edge & Tablet Two-Finger Pinch Resize Handler - RAF throttled
  const handleNodeResize = useCallback((nodeId: string, newWidth: number, newX?: number) => {
    pendingResizeRef.current[nodeId] = { width: newWidth, x: newX };
    if (resizeRafIdRef.current === null) {
      resizeRafIdRef.current = window.requestAnimationFrame(() => {
        resizeRafIdRef.current = null;
        const resizes = pendingResizeRef.current;
        pendingResizeRef.current = {};
        setNodes((prevNodes) => {
          let hasChanges = false;
          const nextNodes = prevNodes.map((n) => {
            const r = resizes[n.id];
            if (!r) return n;
            const w = r.width;
            if (typeof w !== 'number' || !isFinite(w) || isNaN(w) || w < 200 || w > 1200) return n;
            hasChanges = true;
            const updated = { ...n, width: Math.round(w) };
            if (typeof r.x === 'number' && isFinite(r.x) && !isNaN(r.x)) {
              updated.x = Math.max(-20000, Math.min(20000 - updated.width, Math.round(r.x)));
            }
            return updated;
          });
          return hasChanges ? nextNodes : prevNodes;
        });
      });
    }
  }, [setNodes]);

  // Persist node dimensions on two-finger resize settle
  const handleNodePinchEnd = useCallback((nodeId: string, finalWidth: number, finalX?: number) => {
    saveNodeDimension(nodeId, finalWidth, finalX);
    // If visitor node, keep visitor storage updated as well
    setNodesByPreset((prev) => {
      const visitorOnly = prev.project.filter((n) => n.category === 'visitor');
      if (visitorOnly.length > 0) {
        try {
          localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitorOnly));
        } catch (e) {}
      }
      return prev;
    });
  }, []);

  // Visitor node creation with local persistence, Firestore sync, and auto-focus (Research tab exclusive)
  const handleAddVisitorNode = useCallback((newNode: NodeData) => {
    setNodesByPreset((prev) => {
      const nextProject = [...prev.project.filter((n) => n.id !== newNode.id), newNode];
      return {
        ...prev,
        project: nextProject,
      };
    });

    // Save to Firestore real-time backend & local cache
    saveCommunityVisitorNode(newNode).catch((err) => {
      console.info('[Firestore] Background sync notice:', err);
    });

    // Immediately select and highlight the newly added visitor node
    setSelectedNodeId(newNode.id);

    // Pan camera to ensure the new visitor note is comfortably inside view
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    setTransform((prev) => {
      const s = prev.scale;
      const nodeCenterX = newNode.x + newNode.width / 2;
      const nodeCenterY = newNode.y + 110;
      const screenX = nodeCenterX * s + prev.x;
      const screenY = nodeCenterY * s + prev.y;
      const margin = 100;
      const isComfortablyInside =
        screenX > margin && screenX < vw - margin && screenY > margin && screenY < vh - margin;

      if (isComfortablyInside) {
        return prev;
      }

      return {
        ...prev,
        x: Math.round(vw / 2 - nodeCenterX * s),
        y: Math.round(vh / 2 - nodeCenterY * s),
      };
    });
  }, []);

  // Visitor node removal with Firestore sync
  const handleDeleteVisitorNode = useCallback((nodeId: string) => {
    playSound('close');
    setNodesByPreset((prev) => {
      const nextProject = prev.project.filter((n) => n.id !== nodeId);
      return {
        ...prev,
        project: nextProject,
      };
    });

    deleteCommunityVisitorNode(nodeId).catch((err) => {
      console.info('[Firestore] Background delete notice:', err);
    });
  }, []);

  // Filter nodes & connections based on active preset
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      // Community easter egg visitor notes are kept exclusively for the Research tab
      if (n.category === 'visitor') {
        return activePreset === 'project' || activePreset === 'all';
      }

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
        // Research tab: strictly the 4 canonical research nodes (visitor nodes handled above)
        return RESEARCH_NODE_IDS.has(n.id);
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
    return filteredNodes
      .filter((node): node is NodeData => Boolean(node && typeof node === 'object' && typeof node.id === 'string'))
      .map((node) => {
        const rawX = typeof node.x === 'number' && isFinite(node.x) ? node.x : 0;
        const rawY = typeof node.y === 'number' && isFinite(node.y) ? node.y : 0;
        const drift = driftOffsets[node.id];
        const dx = drift && typeof drift.x === 'number' && isFinite(drift.x) ? drift.x : 0;
        const dy = drift && typeof drift.y === 'number' && isFinite(drift.y) ? drift.y : 0;
        if (dx === 0 && dy === 0 && node.x === rawX && node.y === rawY) return node;
        return {
          ...node,
          x: rawX + dx,
          y: rawY + dy,
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
      target.closest('[id^="graph-node-"]') ||
      target.closest('button') ||
      target.closest('.port-pin') ||
      target.closest('aside')
    ) {
      return;
    }

    isPanningRef.current = true;
    const curX = typeof transform?.x === 'number' && isFinite(transform.x) ? transform.x : 0;
    const curY = typeof transform?.y === 'number' && isFinite(transform.y) ? transform.y : 0;
    panStartRef.current = { x: e.clientX - curX, y: e.clientY - curY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isPanningRef.current) return;
      const start = panStartRef.current || { x: 0, y: 0 };
      pendingPanRef.current = {
        x: Math.round(moveEvent.clientX - start.x),
        y: Math.round(moveEvent.clientY - start.y),
      };
      if (panRafIdRef.current === null) {
        panRafIdRef.current = window.requestAnimationFrame(() => {
          panRafIdRef.current = null;
          const targetPan = pendingPanRef.current;
          if (targetPan && isFinite(targetPan.x) && isFinite(targetPan.y)) {
            setTransform((prev) => ({
              ...(prev || { scale: 0.60 }),
              x: targetPan.x,
              y: targetPan.y,
            }));
          }
        });
      }
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      if (panRafIdRef.current !== null) {
        window.cancelAnimationFrame(panRafIdRef.current);
        panRafIdRef.current = null;
      }
      const targetPan = pendingPanRef.current;
      pendingPanRef.current = null;
      if (targetPan && isFinite(targetPan.x) && isFinite(targetPan.y)) {
        setTransform((prev) => ({
          ...(prev || { scale: 0.60 }),
          x: targetPan.x,
          y: targetPan.y,
        }));
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
  };

  // Mobile touch canvas panning & 2-finger pinch zoom
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.node-card') ||
      target.closest('[id^="graph-node-"]') ||
      target.closest('button') ||
      target.closest('.port-pin') ||
      target.closest('aside') ||
      target.closest('nav')
    ) {
      return;
    }

    if (e.touches.length === 2) {
      // Distinguish NODE RESIZE from CANVAS PINCH-ZOOM:
      // If any active touch on the screen is associated with a node card, suppress canvas zoom so the node resizes instead!
      const isAnyTouchOnNode = Array.from(e.touches).some((t) => {
        const el = document.elementFromPoint(t.clientX, t.clientY);
        return el && (el.closest('.node-card') || el.closest('[id^="graph-node-"]'));
      });

      if (isAnyTouchOnNode) {
        return;
      }

      // 2-finger pinch zoom initiation on empty canvas
      isPanningRef.current = false;
      isPinchingRef.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      if (!t1 || !t2) return;

      pinchStartDistRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchStartTransformRef.current = { ...(transformRef.current || { x: 0, y: 0, scale: 0.60 }) };
      pinchMidpointRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      const handlePinchMove = (moveEvent: TouchEvent) => {
        if (!isPinchingRef.current || moveEvent.touches.length !== 2) return;
        if (moveEvent.cancelable) moveEvent.preventDefault();

        const p1 = moveEvent.touches[0];
        const p2 = moveEvent.touches[1];
        if (!p1 || !p2) return;

        const currentDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
        const factor = currentDist / (pinchStartDistRef.current || 1);
        const init = pinchStartTransformRef.current || { x: 0, y: 0, scale: 0.60 };
        const nextScale = Math.min(2.0, Math.max(0.35, Math.round(init.scale * factor * 100) / 100));
        const mid = pinchMidpointRef.current || { x: 0, y: 0 };
        const initScale = init.scale > 0 ? init.scale : 0.60;
        const nextX = Math.round(mid.x - (mid.x - init.x) * (nextScale / initScale));
        const nextY = Math.round(mid.y - (mid.y - init.y) * (nextScale / initScale));

        if (isFinite(nextX) && isFinite(nextY) && isFinite(nextScale)) {
          setTransform({ x: nextX, y: nextY, scale: nextScale });
        }
      };

      const handlePinchEnd = () => {
        isPinchingRef.current = false;
        window.removeEventListener('touchmove', handlePinchMove);
        window.removeEventListener('touchend', handlePinchEnd);
        window.removeEventListener('touchcancel', handlePinchEnd);
      };

      window.addEventListener('touchmove', handlePinchMove, { passive: false });
      window.addEventListener('touchend', handlePinchEnd);
      window.addEventListener('touchcancel', handlePinchEnd);
      return;
    }

    if (e.touches.length !== 1) return;

    isPinchingRef.current = false;
    isPanningRef.current = true;
    const touch = e.touches[0];
    if (!touch) return;

    const curX = typeof transform?.x === 'number' && isFinite(transform.x) ? transform.x : 0;
    const curY = typeof transform?.y === 'number' && isFinite(transform.y) ? transform.y : 0;
    panStartRef.current = { x: touch.clientX - curX, y: touch.clientY - curY };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      if (!isPanningRef.current || moveEvent.touches.length !== 1) return;

      const t = moveEvent.touches[0];
      if (!t) return;

      const start = panStartRef.current || { x: 0, y: 0 };
      pendingPanRef.current = {
        x: Math.round(t.clientX - start.x),
        y: Math.round(t.clientY - start.y),
      };
      if (panRafIdRef.current === null) {
        panRafIdRef.current = window.requestAnimationFrame(() => {
          panRafIdRef.current = null;
          const targetPan = pendingPanRef.current;
          if (targetPan && isFinite(targetPan.x) && isFinite(targetPan.y)) {
            setTransform((prev) => ({
              ...(prev || { scale: 0.60 }),
              x: targetPan.x,
              y: targetPan.y,
            }));
          }
        });
      }
    };

    const handleTouchEnd = () => {
      isPanningRef.current = false;
      if (panRafIdRef.current !== null) {
        window.cancelAnimationFrame(panRafIdRef.current);
        panRafIdRef.current = null;
      }
      const targetPan = pendingPanRef.current;
      pendingPanRef.current = null;
      if (targetPan && isFinite(targetPan.x) && isFinite(targetPan.y)) {
        setTransform((prev) => ({
          ...(prev || { scale: 0.60 }),
          x: targetPan.x,
          y: targetPan.y,
        }));
      }
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

  // Helper for computing estimated vertical height per node type
  const getNodeEstimatedHeight = useCallback((node: NodeData): number => {
    if (!node || typeof node !== 'object') return 340;
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
    const isMobileViewport = vw < 768;

    // Use canonical baseline nodes for calculating structural center (prevents distortion from dragged cards)
    const baselineNodes = (preset === 'project' || preset === 'all') ? ALL_RESEARCH_NODES : ALL_NETWORK_NODES;
    const targetNodes = baselineNodes.filter((n) => {
      if (!n || typeof n !== 'object') return false;
      if (preset === 'network') {
        return ['node-profile', 'node-models', 'node-credentials', 'node-systems', 'node-project', 'node-clock'].includes(n.id);
      }
      if (preset === 'project') {
        // Research tab: Center symmetrically on the 4 core research nodes
        return ['node-profile', 'node-models', 'node-systems', 'node-project'].includes(n.id);
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

    const validTargetNodes = targetNodes.filter(
      (n): n is NodeData => Boolean(n && typeof n === 'object' && typeof n.x === 'number' && isFinite(n.x) && typeof n.y === 'number' && isFinite(n.y))
    );

    // DEDICATED MOBILE SPATIAL COMPOSITION:
    // Composes a readable 0.74–0.80 scale focal view around the anchor node
    if (isMobileViewport) {
      const mobileScale = desiredScale !== undefined
        ? desiredScale
        : Math.min(0.82, Math.max(0.70, Math.round(((vw - 20) / 440) * 100) / 100));

      const focalNode = validTargetNodes.find((n) => n.id === 'node-profile') || validTargetNodes[0];

      let targetX = 480;
      let targetY = 740;
      let targetW = 340;
      let targetH = 340;

      if (focalNode) {
        targetX = typeof focalNode.x === 'number' && isFinite(focalNode.x) ? focalNode.x : 480;
        targetY = typeof focalNode.y === 'number' && isFinite(focalNode.y) ? focalNode.y : 740;
        targetW = typeof focalNode.width === 'number' && isFinite(focalNode.width) ? focalNode.width : 340;
        targetH = getNodeEstimatedHeight(focalNode);
      }

      const focalCenterX = targetX + targetW / 2;
      const focalCenterY = targetY + targetH / 2;

      // Center in mobile screen accounting for compact top nav (54px) and bottom dock (64px)
      const viewCenterX = vw / 2;
      const viewCenterY = (vh - 10) / 2;

      const x = Math.round(viewCenterX - focalCenterX * mobileScale);
      const y = Math.round(viewCenterY - focalCenterY * mobileScale);

      setTransform({ x, y, scale: mobileScale });
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    if (validTargetNodes.length > 0) {
      for (const node of validTargetNodes) {
        const nx = typeof node.x === 'number' && isFinite(node.x) ? node.x : 0;
        const ny = typeof node.y === 'number' && isFinite(node.y) ? node.y : 0;
        const nw = typeof node.width === 'number' && isFinite(node.width) ? node.width : 340;
        const h = getNodeEstimatedHeight(node);
        if (nx < minX) minX = nx;
        if (nx + nw > maxX) maxX = nx + nw;
        if (ny < minY) minY = ny;
        if (ny + h > maxY) maxY = ny + h;
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
    const availW = Math.max(300, vw - 120);
    const availH = Math.max(300, vh - 140);
    const maxFitScale = Math.min(availW / groupW, availH / groupH);

    // Zoom scale: exactly 0.70 for Research tab matching the reference screenshot, 0.56 for Network tab
    const defaultScale = preset === 'project' ? 0.70 : (preset === 'network' ? 0.56 : 0.60);
    const targetDesired = desiredScale !== undefined ? desiredScale : defaultScale;
    const minScaleFloor = preset === 'project' ? 0.65 : 0.32;
    const targetScale = Math.min(targetDesired, Math.max(minScaleFloor, Number(maxFitScale.toFixed(2))));

    // Precision viewport center
    const viewCenterX = vw / 2;
    const viewCenterY = (vh + 12) / 2;

    const x = Math.round(viewCenterX - groupCenterX * targetScale);
    let y = Math.round(viewCenterY - groupCenterY * targetScale);

    if (preset === 'network') {
      // Anchors row 1 comfortably at ~100px from top (36px below 64px top nav),
      // ensuring bottom cards sit cleanly with ample breathing room above the bottom workspace footer bar
      const desiredRow1ScreenY = Math.max(90, Math.min(130, Math.round(vh * 0.13)));
      y = Math.round(desiredRow1ScreenY - 380 * targetScale);
    } else if (preset === 'project') {
      // Optical compensation for 4-node research architecture
      y -= Math.round(vh * 0.015);
    }

    setTransform({ x, y, scale: targetScale });
  }, [getNodeEstimatedHeight]);

  // Fast mobile / index camera jump to any research node with readable framing
  const handleJumpToNode = useCallback((nodeId: string) => {
    playSound('click');
    setSelectedNodeId(nodeId);
    const targetNode = filteredNodes.find((n) => n && n.id === nodeId);
    if (!targetNode || typeof targetNode.x !== 'number' || !isFinite(targetNode.x) || typeof targetNode.y !== 'number' || !isFinite(targetNode.y)) return;

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobileViewport = vw < 768;
    const tw = typeof targetNode.width === 'number' && isFinite(targetNode.width) ? targetNode.width : 340;

    setTransform((prev) => {
      const prevScale = typeof prev?.scale === 'number' && isFinite(prev.scale) && prev.scale > 0 ? prev.scale : 0.65;
      const s = isMobileViewport ? Math.max(0.74, prevScale) : prevScale;
      const nodeCenterX = targetNode.x + tw / 2;
      const nodeCenterY = targetNode.y + getNodeEstimatedHeight(targetNode) / 2;
      return {
        scale: s,
        x: Math.round(vw / 2 - nodeCenterX * s),
        y: Math.round((vh - (isMobileViewport ? 10 : 0)) / 2 - nodeCenterY * s),
      };
    });
  }, [filteredNodes, getNodeEstimatedHeight]);

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

  // Return to cover with smooth, fast single-pass upward transition (no ricochet)
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

    if (startSettleRef.current) {
      startSettleRef.current(0, 280);
    } else {
      isProgrammaticScrollRef.current = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        const ps = typeof prev?.scale === 'number' && isFinite(prev.scale) && prev.scale > 0 ? prev.scale : 0.65;
        const px = typeof prev?.x === 'number' && isFinite(prev.x) ? prev.x : 0;
        const py = typeof prev?.y === 'number' && isFinite(prev.y) ? prev.y : 0;
        const nextScale = Math.max(0.25, Math.min(2.20, Math.round((ps + deltaPercent) * 100) / 100));

        if (nextScale === ps) return prev;

        // Tactile detent feedback when stepping each 1% section (throttled to 75ms)
        const newBracket = Math.round(nextScale * 100);
        const now = Date.now();
        if (newBracket !== lastZoomBracketRef.current && now - lastZoomSoundTimeRef.current >= 75) {
          lastZoomBracketRef.current = newBracket;
          lastZoomSoundTimeRef.current = now;
          playSound('zoom');
        }

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = Math.round(mouseX - (mouseX - px) * (nextScale / ps));
        const newY = Math.round(mouseY - (mouseY - py) * (nextScale / ps));

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
      network: [...ALL_NETWORK_NODES],
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
    if (startSettleRef.current) {
      startSettleRef.current(1, 280);
    } else {
      isProgrammaticScrollRef.current = true;
      const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1000;
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  }, [centerViewForPreset]);

  // Focus specific node on canvas with smooth centered pan
  const handleFocusNode = useCallback((nodeId: string) => {
    playSound('select');
    const target = nodes.find((n) => n && n.id === nodeId);
    if (!target || typeof target.x !== 'number' || !isFinite(target.x) || typeof target.y !== 'number' || !isFinite(target.y)) return;

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
    const tw = typeof target.width === 'number' && isFinite(target.width) ? target.width : 340;

    const viewCenterX = viewportWidth / 2;
    const viewCenterY = (viewportHeight + 12) / 2;

    setTransform({
      x: Math.round(viewCenterX - (target.x + tw / 2) * targetScale),
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
      centerViewForPreset('network');
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
      centerViewForPreset('project', 0.70);
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
        onOpenResume={handleOpenResumeModal}
        isResumeOpen={isResumeOpen}
        onFocusClock={() => handleFocusNode('node-clock')}
        activeView={activeView}
        onToggleView={setActiveView}
        activeNavTab={activeNavTab}
        onSelectNavTab={handleSelectNavTab}
      />

      {/* CONTINUOUS SCROLL-DRIVEN ARCHITECTURE */}
      <main className="relative w-full max-w-full bg-[#14171c]">
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
              activePhaseId={chronicleActivePhaseId}
              onActivePhaseChange={(phaseId) => {
                setChronicleActivePhaseId(phaseId);
              }}
              onOpenResearchCanvas3D={(phaseId) => {
                setActiveResearchCanvasPhase(phaseId);
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
            className="relative w-full max-w-full h-[220vh] bg-[#14171c]"
          >
            {/* Sticky 100vh/100dvh Viewport Stage */}
            <div className="sticky top-0 w-full max-w-full h-screen h-[100dvh] overflow-hidden bg-[#14171c]">
              {/* SECTION 02: Computational Neural Workspace (Base Layer) */}
              <ArchitecturalReveal scrollProgress={scrollProgress}>
                <div
                  style={{
                    opacity: activeNavTab !== 'home' ? 1 : (scrollProgress >= 0.10 ? Math.min(1, Math.pow((scrollProgress - 0.10) / 0.40, 1.2)) : 0),
                    pointerEvents: (activeNavTab !== 'home' || scrollProgress >= 0.80) ? 'auto' : 'none',
                  }}
                  className="absolute inset-0 w-full max-w-full h-full pt-14 sm:pt-16 z-10"
                >
                  {isMobile ? (
                    <MobileNodespace
                      nodes={filteredNodes}
                      connections={filteredConnections}
                      activePreset={activePreset as 'project' | 'network' | 'all'}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={handleSelectNode}
                      onOpenCertificateModal={handleOpenCertificateModal}
                      onOpenProjectModal={handleOpenProjectModal}
                      onOpenContactModal={handleOpenContactModal}
                      onOpenResumeModal={handleOpenResumeModal}
                      onOpenFocusedNode={handleOpenFocusedNode}
                      onDeleteVisitorNode={handleDeleteVisitorNode}
                      isSimulating={isSimulating}
                      wireStyle={wireStyle}
                      showGrid={showGrid}
                    />
                  ) : (
                    <GraphErrorBoundary onResetGraph={handleResetGraph}>
                      <div
                        id="graph-workspace"
                        aria-label="Interactive computational graph canvas"
                        ref={canvasContainerRef}
                        onMouseDown={handleCanvasMouseDown}
                        onTouchStart={handleCanvasTouchStart}
                        onClick={handleCanvasBackgroundClick}
                        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden touch-none"
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
                            isMobile={false}
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
                              onNodePinchEnd={handleNodePinchEnd}
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

                        {/* Desktop Floating Dock Controls (Hidden on Mobile) */}
                        <CanvasControlsDock
                          scale={transform.scale}
                          onZoomIn={() => {
                            playSound('zoom');
                            setTransform((p) => {
                              const ps = typeof p?.scale === 'number' && isFinite(p.scale) && p.scale > 0 ? p.scale : 0.65;
                              const px = typeof p?.x === 'number' && isFinite(p.x) ? p.x : 0;
                              const py = typeof p?.y === 'number' && isFinite(p.y) ? p.y : 0;
                              const nextScale = Math.min(2.20, Math.round((ps + 0.01) * 100) / 100);
                              lastZoomBracketRef.current = Math.round(nextScale * 100);
                              const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
                              const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                              const newX = Math.round((vw / 2) - ((vw / 2) - px) * (nextScale / ps));
                              const newY = Math.round(((vh + 12) / 2) - (((vh + 12) / 2) - py) * (nextScale / ps));
                              return { x: newX, y: newY, scale: nextScale };
                            });
                          }}
                          onZoomOut={() => {
                            playSound('zoom');
                            setTransform((p) => {
                              const ps = typeof p?.scale === 'number' && isFinite(p.scale) && p.scale > 0 ? p.scale : 0.65;
                              const px = typeof p?.x === 'number' && isFinite(p.x) ? p.x : 0;
                              const py = typeof p?.y === 'number' && isFinite(p.y) ? p.y : 0;
                              const nextScale = Math.max(0.25, Math.round((ps - 0.01) * 100) / 100);
                              lastZoomBracketRef.current = Math.round(nextScale * 100);
                              const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
                              const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                              const newX = Math.round((vw / 2) - ((vw / 2) - px) * (nextScale / ps));
                              const newY = Math.round(((vh + 12) / 2) - (((vh + 12) / 2) - py) * (nextScale / ps));
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
                          onOpenAddNode={
                            (currentTabKey === 'project' || activeNavTab === 'projects' || activePreset === 'project')
                              ? () => setIsAddNodeOpen(true)
                              : undefined
                          }
                        />
                      </div>

                      {/* Desktop Unified Precision Workspace Footer Bar (Hidden on Mobile) */}
                      <footer
                        aria-label="Portfolio coordinates and workspace navigation"
                        className="absolute bottom-3 inset-x-4 sm:inset-x-8 z-20 pointer-events-none hidden md:flex items-center justify-between text-[11px] sm:text-xs font-body text-zinc-400 select-none px-4 py-2 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
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
                              <span>{officialCount} {activePreset === 'project' ? 'RESEARCH' : 'NETWORK'} NODES</span>
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
                    </GraphErrorBoundary>
                  )}
                </div>
              </ArchitecturalReveal>

              {/* SECTION 01: Solid Editorial Portfolio Cover (Surface Layer, sits on top and physically lifts on scroll) */}
              <EditorialCover
                scrollProgress={scrollProgress}
                activeNavTab={activeNavTab}
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
        onOpenResearchCanvas3D={(phaseId) => {
          playSound('open');
          setFocusedNode(null);
          setNodeOriginRect(null);
          setActiveResearchCanvasPhase(phaseId || 'phase-05');
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
        onOpenResearchCanvas3D={(phaseId) => {
          playSound('open');
          setSelectedProject(null);
          setActiveResearchCanvasPhase(phaseId || 'phase-05');
        }}
      />

      {/* Dedicated 3D Research Canvas Subsystem */}
      {activeResearchCanvasPhase && (
        <ResearchCanvas3D
          initialPhaseId={activeResearchCanvasPhase}
          onExit={(savedChronicleId) => {
            setChronicleActivePhaseId(savedChronicleId);
            setActiveResearchCanvasPhase(null);
          }}
        />
      )}

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
        onClose={() => setIsResumeOpen(false)}
        nodes={nodes}
      />

      {/* Production Print A4 CV Document (Hidden on screen, active in @media print) */}
      <PrintCVDocument nodes={nodes} />

      <AddVisitorNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onAddNode={handleAddVisitorNode}
        existingVisitorCount={nodes.filter((n) => n.category === 'visitor').length}
        currentTransform={transform}
      />
    </div>
  );
}
