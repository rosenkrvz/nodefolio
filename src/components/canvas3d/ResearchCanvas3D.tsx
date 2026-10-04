import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  ResearchPhaseId,
  RESEARCH_PHASES,
  PhaseArtifactInstance,
  PhaseMetadata,
  QualityTier,
  InspectableItem,
  LayerType,
  SpatialAnnotation,
} from './types';
import { createPhase01Autograd } from './phases/Phase01Autograd';
import { createPhase02Optimization } from './phases/Phase02Optimization';
import { createPhase03MetricSpaces } from './phases/Phase03MetricSpaces';
import { createPhase04Attention } from './phases/Phase04Attention';
import { createPhase05LatentManifold } from './phases/Phase05LatentManifold';
import { MiniArtifactPreview } from './MiniArtifactPreview';
import { ResearchEntryLoader } from './ResearchEntryLoader';
import {
  RotateCcw,
  Close as X,
  Layers,
  Compass,
  Cpu,
  Activity,
  ArrowUpRight,
  Eye,
  Sliders,
  Maximize,
  Grid,
  VolumeMax,
  VolumeX,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Plus,
  Minus,
} from '../icons';
import { useSound } from '../../lib/sound/useSound';

// ─── Cinematic Orbit / Turntable Icon ─────────────────────────────────────────
const OrbitIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <ellipse cx="12" cy="12" rx="8.5" ry="3.5" transform="rotate(-30 12 12)" />
    <path d="M19 8.5l2-1.5-1 2.5" />
  </svg>
);

// ─── Professional Blender 3D Viewport Icons ──────────────────────────────────
const BlenderBoxIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M21 16.5l-9 5.25L3 16.5v-9L12 2.25l9 5.25v9z" strokeLinejoin="round" />
    <path d="M12 2.25v19.5" />
    <path d="M3 7.5l9 4.75 9-4.75" />
  </svg>
);

const WireframeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
    <ellipse cx="12" cy="12" rx="4" ry="9" strokeDasharray="2 2" />
    <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" />
  </svg>
);

const SolidShadeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 000 18V3z" fill="currentColor" opacity="0.45" />
  </svg>
);

const RenderedShadeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const CursorTargetIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="6" strokeDasharray="2.5 2.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

// ─── Blender Professional Tool Shelf Button (Razor-Sharp, Tactile) ────────────
interface ToolRailButtonProps {
  active?: boolean;
  onClick: () => void;
  title: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: 'dialog';
  children: React.ReactNode;
}

const ToolRailButton = React.forwardRef<HTMLButtonElement, ToolRailButtonProps>(
  ({ active = false, onClick, title, ariaExpanded, ariaHasPopup, children }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        title={title}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHasPopup}
        className={`relative w-8 h-8 rounded-[2px] flex items-center justify-center cursor-pointer select-none transition-all duration-150 border ${
          active
            ? 'bg-[#272b35] text-white border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.35)] ring-1 ring-rose-500/30'
            : 'bg-[#242424]/90 text-zinc-400 hover:text-white hover:bg-[#303030] border-[#383838] hover:border-[#4d4d4d]'
        }`}
      >
        <span className="relative z-10 block">{children}</span>
      </button>
    );
  }
);
ToolRailButton.displayName = 'ToolRailButton';

interface ResearchCanvas3DProps {
  initialPhaseId?: string;
  onExit: (currentPhaseChronicleId: string) => void;
  onNavigateToLab?: (currentPhaseChronicleId: string) => void;
  isInitialEntry?: boolean;
}

// ─── Hardware & Performance Diagnostics ──────────────────────────────────────
// ─── Hardware & Performance Diagnostics ──────────────────────────────────────
const detectHardwareTier = (): QualityTier => {
  if (typeof window === 'undefined') return 'high';

  try {
    // 1. Motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return 'low';

    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const memory = typeof navigator !== 'undefined'
      ? (navigator as unknown as { deviceMemory?: number }).deviceMemory
      : undefined;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth < 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

    // 2. Inspect WebGL GPU renderer via unmasked renderer string
    let isDedicatedGpu = false;
    let isSoftwareGpu = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
          isDedicatedGpu = /rtx|gtx|geforce|radeon|apple m|quadro|titan|arc|adreno (6[5-9]|7[0-9]|8[0-9])/i.test(renderer);
          isSoftwareGpu = /swiftshader|llvmpipe|basic render|software|intel.*(hd 2000|hd 3000|hd 4000)/i.test(renderer);
        }
      }
    } catch {
      // Fallback if WebGL context query fails
    }

    // A. Genuinely constrained / low-end hardware
    if (isSoftwareGpu || cores <= 2 || (typeof memory === 'number' && memory <= 2)) {
      return 'low';
    }

    // B. High-End Hardware (Dedicated GPU, 6+ CPU cores, 8GB+ memory, or standard desktop with 4+ cores)
    if (isDedicatedGpu || (cores >= 6 && !isMobile) || (!isMobile && cores >= 4 && window.innerWidth >= 1024) || (typeof memory === 'number' && memory >= 8)) {
      return 'high';
    }

    // C. Mobile phone or small tablet
    if (isMobile) {
      return 'medium';
    }

    // Default to high for all modern desktop environments
    return 'high';
  } catch {
    return 'high';
  }
};

// ─── Dynamic Bounding-Box Auto-Framing Engine ────────────────────────────────
// Dynamically computes scene bounding sphere, camera FOV, and UI safe insets
// so the 3D artifact maintains balanced negative space without UI collisions
const computeOptimalFraming = (
  group: THREE.Group,
  camera: THREE.PerspectiveCamera,
  viewportW: number,
  viewportH: number,
  isMobile: boolean
): { cameraPos: THREE.Vector3; target: THREE.Vector3; radius: number } | null => {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();

  // Exclude helper objects (GridHelper, Reference planes, Gizmos) so bounding box measures true content
  group.traverse((child) => {
    if (
      child instanceof THREE.GridHelper ||
      child.type === 'GridHelper' ||
      child.name.toLowerCase().includes('grid') ||
      child.name.toLowerCase().includes('helper')
    ) {
      return;
    }
    if ((child as THREE.Mesh).isMesh || (child as THREE.Line).isLine || (child as THREE.Points).isPoints) {
      box.expandByObject(child);
    }
  });

  if (box.isEmpty()) {
    box.setFromObject(group);
  }
  if (box.isEmpty()) return null;

  // Validate box bounds are finite
  if (
    !isFinite(box.min.x) ||
    !isFinite(box.min.y) ||
    !isFinite(box.min.z) ||
    !isFinite(box.max.x) ||
    !isFinite(box.max.y) ||
    !isFinite(box.max.z)
  ) {
    return null;
  }

  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  const radius = Math.max(size.x, size.y, size.z) * 0.5 || 5.0;

  if (!isFinite(radius) || radius <= 0.1) return null;

  const validW = Math.max(viewportW, 320);
  const validH = Math.max(viewportH, 240);
  const aspect = validW / validH;
  const fovRad = (camera.fov * Math.PI) / 180;

  const distanceScalar = isMobile ? Math.max(1.15, 1.0 / Math.sqrt(Math.max(aspect, 0.4))) : 1.18;
  const sinHalfFov = Math.sin(fovRad / 2);
  if (!isFinite(sinHalfFov) || sinHalfFov <= 0.001) return null;

  const dist = (radius * distanceScalar) / sinHalfFov;
  if (!isFinite(dist) || dist <= 0.1 || dist > 100) return null;

  const target = center.clone();

  const pitchAngle = isMobile ? 0.35 : 0.40;
  const yawAngle = isMobile ? 0.18 : 0.26;

  const cameraPos = new THREE.Vector3(
    target.x + dist * Math.sin(yawAngle) * Math.cos(pitchAngle),
    target.y + dist * Math.sin(pitchAngle),
    target.z + dist * Math.cos(yawAngle) * Math.cos(pitchAngle)
  );

  if (
    !isFinite(cameraPos.x) ||
    !isFinite(cameraPos.y) ||
    !isFinite(cameraPos.z) ||
    !isFinite(target.x) ||
    !isFinite(target.y) ||
    !isFinite(target.z)
  ) {
    return null;
  }

  return { cameraPos, target, radius };
};

export const ResearchCanvas3D: React.FC<ResearchCanvas3DProps> = ({
  initialPhaseId,
  onExit,
  onNavigateToLab,
  isInitialEntry = true,
}) => {
  const resolveInitialPhase = (): ResearchPhaseId => {
    if (!initialPhaseId) return 'phase-05';
    const byChronicle = RESEARCH_PHASES.find((p) => p.chronicleId === initialPhaseId);
    if (byChronicle) return byChronicle.id;
    const byId = RESEARCH_PHASES.find((p) => p.id === initialPhaseId);
    if (byId) return byId.id;
    return 'phase-05';
  };

  const [activePhaseId, setActivePhaseId] = useState<ResearchPhaseId>(resolveInitialPhase());
  const currentPhaseIdRef = useRef<ResearchPhaseId>(activePhaseId);
  currentPhaseIdRef.current = activePhaseId;

  // Sound System Integration
  const { isMuted, toggleMute, playSound } = useSound();

  // Dedicated Research Entry / Preloader State
  const [isInitialEntryLoading, setIsInitialEntryLoading] = useState<boolean>(isInitialEntry !== false);
  const [isPhaseSwitching, setIsPhaseSwitching] = useState<boolean>(false);
  const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
  const [sceneInitError, setSceneInitError] = useState<string | null>(null);
  const [initAttempt, setInitAttempt] = useState<number>(0);

  // Viewport & Device State
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  // UI States
  const [isLoadingGeometry, setIsLoadingGeometry] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [showIntroCard, setShowIntroCard] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [showOverlaysMenu, setShowOverlaysMenu] = useState<boolean>(false);
  const [showLeftLayersMenu, setShowLeftLayersMenu] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(false);
  const [activeLayers, setActiveLayers] = useState<Record<LayerType, boolean>>({
    geometry: true,
    trajectories: true,
    clusters: true,
    grid: true,
    annotations: false,
  });

  // ── Blender 3D Viewport GUI Architecture States ─────────────────────────
  const [nPanelOpen, setNPanelOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1200 : false;
  });
  const [activeNTab, setActiveNTab] = useState<'item' | 'tool' | 'view'>('item');
  const [tPanelOpen, setTPanelOpen] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<'select' | 'cursor' | 'orbit' | 'measure'>('select');
  const [shadingMode, setShadingMode] = useState<'solid' | 'wireframe' | 'rendered'>('rendered');
  const [showGizmo, setShowGizmo] = useState<boolean>(true);
  const [openRollouts, setOpenRollouts] = useState<Record<string, boolean>>({
    transform: true,
    topology: true,
    inspection: true,
    viewSettings: true,
    stats: true,
  });

  const toggleRollout = (key: string) => {
    playSound('toggle');
    setOpenRollouts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Three.js real-time wireframe toggle (like Blender Viewport Shading Z)
  const handleSetShadingMode = (mode: 'solid' | 'wireframe' | 'rendered') => {
    playSound('toggle');
    setShadingMode(mode);
    if (activeArtifactRef.current?.group) {
      activeArtifactRef.current.group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              if ('wireframe' in m) {
                (m as THREE.MeshStandardMaterial).wireframe = mode === 'wireframe';
              }
            });
          } else if (mesh.material && 'wireframe' in mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).wireframe = mode === 'wireframe';
          }
        }
      });
    }
  };

  const handleToggleFullscreen = () => {
    playSound('click');
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Snap camera view to cardinal axes (Blender Numpad 1, 3, 7)
  const handleSnapAxis = (axis: 'x' | 'y' | 'z') => {
    playSound('click');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const target = controls.target.clone();
    if (!isFinite(target.x) || !isFinite(target.y) || !isFinite(target.z)) {
      target.set(0, 0, 0);
    }
    const dist = camera.position.distanceTo(target) || 12;

    const endPos = target.clone();
    if (axis === 'x') endPos.x += dist;
    if (axis === 'y') {
      endPos.y += dist;
      endPos.z += 0.01; // Avoid strict pole alignment / gimbal lock with camera.up = (0, 1, 0)
    }
    if (axis === 'z') endPos.z += dist;

    cameraFocusTarget.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos,
      startTarget: target.clone(),
      endTarget: target,
      progress: 0,
    };
  };

  // Discrete Viewport Zoom with smooth cinematic animation
  const handleZoom = (direction: 'in' | 'out') => {
    playSound('hover');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const factor = direction === 'in' ? 0.72 : 1.38;
    const offset = camera.position.clone().sub(controls.target);
    const dist = offset.length();
    const minD = (controls.minDistance || 2.0) + 0.5;
    const maxD = (controls.maxDistance || 55.0) - 1.0;
    const newDist = Math.max(minD, Math.min(maxD, (dist || 10) * factor));

    if (dist > 0.001) {
      offset.normalize().multiplyScalar(newDist);
    } else {
      offset.set(0, 2, 4);
    }
    const endPos = controls.target.clone().add(offset);

    cameraFocusTarget.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos,
      startTarget: controls.target.clone(),
      endTarget: controls.target.clone(),
      progress: 0,
    };
  };

  // Keep Three.js OrbitControls auto-rotate synchronized
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [isAutoRotate]);

  // Performance System State
  const [qualityMode, setQualityMode] = useState<'auto' | QualityTier>('auto');
  const detectedTierRef = useRef<QualityTier>(detectHardwareTier());
  const activeTier: QualityTier = qualityMode === 'auto' ? detectedTierRef.current : qualityMode;

  // Selection & Hover Inspection State
  const [hoveredItem, setHoveredItem] = useState<InspectableItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InspectableItem | null>(null);
  const [hoverLabelPos, setHoverLabelPos] = useState<{ x: number; y: number } | null>(null);

  // Projected 3D Spatial Annotations
  const [projectedAnnotations, setProjectedAnnotations] = useState<
    Array<{ id: string; label: string; sublabel?: string; screenX: number; screenY: number; visible: boolean }>
  >([]);

  // Orientation Gizmo Refs (direct DOM style update to eliminate 60fps React re-renders)
  const gizmoElRef = useRef<HTMLDivElement | null>(null);
  const dockedGizmoElRef = useRef<HTMLDivElement | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const activeArtifactRef = useRef<PhaseArtifactInstance | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const phaseBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const overlaysMenuRef = useRef<HTMLDivElement>(null);
  const overlaysBtnRef = useRef<HTMLButtonElement>(null);
  const leftLayersMenuRef = useRef<HTMLDivElement>(null);
  const leftLayersBtnRef = useRef<HTMLButtonElement>(null);

  // Smooth camera focusing transition
  const cameraFocusTarget = useRef<{
    active: boolean;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    progress: number;
  }>({
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 0,
  });

  const currentPhaseMeta: PhaseMetadata = useMemo(() => {
    return RESEARCH_PHASES.find((p) => p.id === activePhaseId) || RESEARCH_PHASES[4];
  }, [activePhaseId]);

  // Window resize & orientation handling
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // ── Auto-close Viewport Overlays & Left Layers Menu when clicking outside ──
  useEffect(() => {
    if (!showOverlaysMenu && !showLeftLayersMenu) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        showOverlaysMenu &&
        overlaysMenuRef.current &&
        !overlaysMenuRef.current.contains(target) &&
        overlaysBtnRef.current &&
        !overlaysBtnRef.current.contains(target)
      ) {
        setShowOverlaysMenu(false);
      }
      if (
        showLeftLayersMenu &&
        leftLayersMenuRef.current &&
        !leftLayersMenuRef.current.contains(target) &&
        leftLayersBtnRef.current &&
        !leftLayersBtnRef.current.contains(target)
      ) {
        setShowLeftLayersMenu(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [showOverlaysMenu, showLeftLayersMenu]);

  // Toggle individual visual layer (grid, trajectories, clusters, geometry, annotations)
  const handleToggleLayer = useCallback((layer: LayerType) => {
    playSound('click');
    setActiveLayers((prev) => {
      const nextState = !prev[layer];
      if (layer === 'annotations') {
        setShowAnnotations(nextState);
      } else {
        activeArtifactRef.current?.toggleLayer?.(layer, nextState);
      }
      return { ...prev, [layer]: nextState };
    });
  }, [playSound]);

  // ── Blender Top Header Menus & Interaction Mode Architecture ───────────────
  type HeaderMenuType = 'editor' | 'mode' | 'view' | 'select' | 'add' | 'mesh';
  const [openHeaderMenu, setOpenHeaderMenu] = useState<HeaderMenuType | null>(null);
  const [viewportMode, setViewportMode] = useState<'object' | 'edit' | 'curvature' | 'turntable'>('object');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerMenusRef = useRef<HTMLDivElement>(null);
  const customProbesRef = useRef<THREE.Group[]>([]);

  // ── Functional State for Blender N-Panel Item Tab ──────────────────────────
  const [transformLocation, setTransformLocation] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [transformScale, setTransformScale] = useState<{ x: number; y: number; z: number }>({ x: 1, y: 1, z: 1 });
  const [sceneInspectables, setSceneInspectables] = useState<InspectableItem[]>([]);
  const [expandedMathCard, setExpandedMathCard] = useState<number | null>(null);
  const [copiedComponentData, setCopiedComponentData] = useState<boolean>(false);
  const [liveFps, setLiveFps] = useState<number>(60);
  const [liveTriangles, setLiveTriangles] = useState<number>(0);
  const [liveDrawCalls, setLiveDrawCalls] = useState<number>(0);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const toggleHeaderMenu = (menu: HeaderMenuType) => {
    playSound('click');
    setOpenHeaderMenu((prev) => (prev === menu ? null : menu));
  };

  const handleMenuHover = (menu: HeaderMenuType) => {
    if (openHeaderMenu && openHeaderMenu !== menu) {
      setOpenHeaderMenu(menu);
    }
  };

  // Close menus on click outside
  useEffect(() => {
    if (!openHeaderMenu) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (headerMenusRef.current && !headerMenusRef.current.contains(target)) {
        setOpenHeaderMenu(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [openHeaderMenu]);

  // Smooth camera focus to specific world coordinate
  const handleFocusCamera = useCallback((targetWorldPos: THREE.Vector3) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !targetWorldPos) return;
    if (!isFinite(targetWorldPos.x) || !isFinite(targetWorldPos.y) || !isFinite(targetWorldPos.z)) return;
    if (!isFinite(camera.position.x) || !isFinite(controls.target.x)) return;

    const offsetDir = camera.position.clone().sub(controls.target);
    const len = offsetDir.length();
    if (len > 0.001) {
      offsetDir.normalize();
    } else {
      offsetDir.set(0, 0.4, 1).normalize();
    }
    const targetDistance = 4.8;
    const newCameraPos = targetWorldPos.clone().add(offsetDir.multiplyScalar(targetDistance));

    cameraFocusTarget.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos: newCameraPos,
      startTarget: controls.target.clone(),
      endTarget: targetWorldPos.clone(),
      progress: 0,
    };
  }, []);

  // Reset view to dynamic optimal framing
  const handleResetView = useCallback(() => {
    playSound('secondaryClick');
    setSelectedItem(null);
    activeArtifactRef.current?.onSelectObject?.(null);

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const artifact = activeArtifactRef.current;
    if (!camera || !controls || !artifact) return;
    if (!isFinite(camera.position.x) || !isFinite(controls.target.x)) return;

    const vw = containerRef.current?.clientWidth || window.innerWidth;
    const vh = containerRef.current?.clientHeight || window.innerHeight;
    const isMob = vw < 768;

    const framing = computeOptimalFraming(artifact.group, camera, vw, vh, isMob);
    const endPos =
      framing && isFinite(framing.cameraPos.x) && isFinite(framing.cameraPos.y) && isFinite(framing.cameraPos.z)
        ? framing.cameraPos
        : new THREE.Vector3(...artifact.defaultCameraPosition);
    const endTarget =
      framing && isFinite(framing.target.x) && isFinite(framing.target.y) && isFinite(framing.target.z)
        ? framing.target
        : new THREE.Vector3(...artifact.defaultTarget);

    cameraFocusTarget.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos,
      startTarget: controls.target.clone(),
      endTarget,
      progress: 0,
    };
  }, [playSound]);

  // Mode switcher handler
  const handleSelectViewportMode = useCallback((mode: 'object' | 'edit' | 'curvature' | 'turntable') => {
    playSound('click');
    setViewportMode(mode);
    setOpenHeaderMenu(null);
    if (mode === 'edit') {
      handleSetShadingMode('wireframe');
      setIsAutoRotate(false);
      showToast('Edit Mode (Wireframe Lattice)');
    } else if (mode === 'object') {
      handleSetShadingMode('rendered');
      setIsAutoRotate(false);
      showToast('Object Mode (PBR Material)');
    } else if (mode === 'curvature') {
      handleSetShadingMode('rendered');
      activeLayers.trajectories || handleToggleLayer('trajectories');
      activeLayers.clusters || handleToggleLayer('clusters');
      setIsAutoRotate(false);
      showToast('Curvature Mode (Gradient Topology)');
    } else if (mode === 'turntable') {
      setIsAutoRotate(true);
      showToast('Turntable Mode (360° Kinetic Inspection)');
    }
  }, [activeLayers.clusters, activeLayers.trajectories, handleSetShadingMode, handleToggleLayer, playSound, showToast]);

  // Add 3D Latent Probe Marker
  const handleAddProbe = useCallback(() => {
    playSound('click');
    const scene = sceneRef.current;
    const controls = controlsRef.current;
    if (!scene) return;

    const probeGroup = new THREE.Group();
    const probeCount = customProbesRef.current.length;
    const center = controls ? controls.target.clone() : new THREE.Vector3(0, 0, 0);
    const angle = probeCount * 1.35;
    const radius = 2.2 + probeCount * 0.45;
    const posX = center.x + Math.sin(angle) * radius;
    const posY = center.y + 0.6;
    const posZ = center.z + Math.cos(angle) * radius;

    probeGroup.position.set(posX, posY, posZ);

    const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    probeGroup.add(sphere);

    const ringGeo = new THREE.RingGeometry(0.28, 0.36, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    probeGroup.add(ring);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -3.2, 0),
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xf43f5e,
      dashSize: 0.15,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    probeGroup.add(line);

    scene.add(probeGroup);
    customProbesRef.current.push(probeGroup);

    const probeItem: InspectableItem = {
      id: `custom-probe-${probeCount + 1}`,
      name: `Latent Probe #${probeCount + 1}`,
      role: 'User-Injected Spatial Coordinate Beacon',
      dimension: `Spatial: [${posX.toFixed(2)}, ${posY.toFixed(2)}, ${posZ.toFixed(2)}]`,
      description: `Interactive probe marker injected into the manifold coordinate space at world position [${posX.toFixed(2)}, ${posY.toFixed(2)}, ${posZ.toFixed(2)}].`,
      worldPosition: new THREE.Vector3(posX, posY, posZ),
      properties: {
        'PROBE ID': `#0${probeCount + 1}`,
        'COORD X': `${posX.toFixed(3)} m`,
        'COORD Y': `${posY.toFixed(3)} m`,
        'COORD Z': `${posZ.toFixed(3)} m`,
        'TYPE': 'SPATIAL BEACON',
        'ORIGIN': 'MANUAL INJECTION',
      },
      type: 'centroid',
    };
    setSelectedItem(probeItem);
    setSceneInspectables((prev) => [...prev, probeItem]);
    handleFocusCamera(probeItem.worldPosition);
    showToast(`Added Latent Probe #${probeCount + 1} at [${posX.toFixed(1)}, ${posZ.toFixed(1)}]`);
  }, [handleFocusCamera, playSound, showToast]);

  // Clear all custom probes
  const handleClearProbes = useCallback(() => {
    playSound('click');
    const scene = sceneRef.current;
    if (scene) {
      customProbesRef.current.forEach((g) => {
        scene.remove(g);
        g.traverse((c) => {
          if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
          if ((c as THREE.Mesh).material) {
            const m = (c as THREE.Mesh).material;
            if (Array.isArray(m)) m.forEach((mat) => mat.dispose());
            else m.dispose();
          }
        });
      });
    }
    customProbesRef.current = [];
    setSelectedItem((prev) => (prev?.id.startsWith('custom-probe-') ? null : prev));
    setSceneInspectables((prev) => prev.filter((i) => !i.id.startsWith('custom-probe-')));
    showToast('Cleared custom probe markers');
  }, [playSound, showToast]);

  // Select first inspectable node
  const handleSelectFirstComponent = useCallback(() => {
    playSound('click');
    const inspectables = activeArtifactRef.current?.getInspectableObjects?.() || [];
    if (inspectables.length === 0) return;
    const firstItem = inspectables[0].data;
    setSelectedItem(firstItem);
    activeArtifactRef.current?.onSelectObject?.(firstItem);
    handleFocusCamera(firstItem.worldPosition);
    showToast(`Selected: ${firstItem.name}`);
  }, [handleFocusCamera, playSound, showToast]);

  // Cycle next inspectable node
  const handleCycleNextComponent = useCallback(() => {
    playSound('click');
    const inspectables = activeArtifactRef.current?.getInspectableObjects?.() || [];
    if (inspectables.length === 0) return;

    let nextIdx = 0;
    if (selectedItem) {
      const currIdx = inspectables.findIndex((i) => i.data.id === selectedItem.id);
      nextIdx = (currIdx + 1) % inspectables.length;
    }
    const nextItem = inspectables[nextIdx].data;
    setSelectedItem(nextItem);
    activeArtifactRef.current?.onSelectObject?.(nextItem);
    handleFocusCamera(nextItem.worldPosition);
    showToast(`Selected: ${nextItem.name}`);
  }, [handleFocusCamera, playSound, selectedItem, showToast]);

  // Focus selected component
  const handleFocusSelected = useCallback(() => {
    if (selectedItem) {
      playSound('click');
      handleFocusCamera(selectedItem.worldPosition);
      showToast(`Focused on ${selectedItem.name} [F]`);
    } else {
      handleSelectFirstComponent();
    }
  }, [handleFocusCamera, handleSelectFirstComponent, playSound, selectedItem, showToast]);

  // Copy tensor math spec
  const handleCopyMathSpec = useCallback(() => {
    playSound('click');
    const spec = `---
Research Phase: ${currentPhaseMeta.numeral} // ${currentPhaseMeta.title}
Chronicle ID: ${currentPhaseMeta.chronicleId}
Topic: ${currentPhaseMeta.topic}
Object Type: ${currentPhaseMeta.objectType}
Backend Context: ${currentPhaseMeta.computeBackend}
Metrics:
${currentPhaseMeta.metricsSummary?.map((m) => `  - ${m.label}: ${m.value}`).join('\n')}
Summary:
${currentPhaseMeta.description}
---`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(spec).then(() => {
        showToast('Tensor Math Specification copied to clipboard!');
      });
    }
  }, [currentPhaseMeta, playSound, showToast]);

  // Synchronize transform inputs with active selection or phase group
  useEffect(() => {
    if (selectedItem) {
      const probe = customProbesRef.current.find(
        (p) => (p as any).name === selectedItem.id || (p as any).userData?.id === selectedItem.id
      );
      if (probe) {
        setTransformLocation({
          x: parseFloat(probe.position.x.toFixed(2)),
          y: parseFloat(probe.position.y.toFixed(2)),
          z: parseFloat(probe.position.z.toFixed(2)),
        });
        setTransformScale({
          x: parseFloat(probe.scale.x.toFixed(3)),
          y: parseFloat(probe.scale.y.toFixed(3)),
          z: parseFloat(probe.scale.z.toFixed(3)),
        });
        return;
      }
      const inspectables = activeArtifactRef.current?.getInspectableObjects?.() || [];
      const match = inspectables.find((i) => i.data.id === selectedItem.id);
      if (match) {
        setTransformLocation({
          x: parseFloat(match.mesh.position.x.toFixed(2)),
          y: parseFloat(match.mesh.position.y.toFixed(2)),
          z: parseFloat(match.mesh.position.z.toFixed(2)),
        });
        setTransformScale({
          x: parseFloat(match.mesh.scale.x.toFixed(3)),
          y: parseFloat(match.mesh.scale.y.toFixed(3)),
          z: parseFloat(match.mesh.scale.z.toFixed(3)),
        });
        return;
      }
      if (selectedItem.worldPosition) {
        setTransformLocation({
          x: parseFloat(selectedItem.worldPosition.x.toFixed(2)),
          y: parseFloat(selectedItem.worldPosition.y.toFixed(2)),
          z: parseFloat(selectedItem.worldPosition.z.toFixed(2)),
        });
        setTransformScale({ x: 1, y: 1, z: 1 });
      }
    } else {
      if (activeArtifactRef.current?.group) {
        setTransformLocation({
          x: parseFloat(activeArtifactRef.current.group.position.x.toFixed(2)),
          y: parseFloat(activeArtifactRef.current.group.position.y.toFixed(2)),
          z: parseFloat(activeArtifactRef.current.group.position.z.toFixed(2)),
        });
        setTransformScale({
          x: parseFloat(activeArtifactRef.current.group.scale.x.toFixed(3)),
          y: parseFloat(activeArtifactRef.current.group.scale.y.toFixed(3)),
          z: parseFloat(activeArtifactRef.current.group.scale.z.toFixed(3)),
        });
      } else {
        setTransformLocation({ x: 0, y: 0, z: 0 });
        setTransformScale({ x: 1, y: 1, z: 1 });
      }
    }
  }, [selectedItem, activePhaseId]);

  // Transform Update Handlers
  const handleUpdateLocation = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    const cleanVal = Number.isFinite(value) ? parseFloat(value.toFixed(2)) : 0;
    setTransformLocation((prev) => {
      const nextLoc = { ...prev, [axis]: cleanVal };
      if (selectedItem) {
        const probe = customProbesRef.current.find(
          (p) => (p as any).name === selectedItem.id || (p as any).userData?.id === selectedItem.id
        );
        if (probe) {
          probe.position[axis] = cleanVal;
          selectedItem.worldPosition.copy(probe.position);
        } else {
          const inspectables = activeArtifactRef.current?.getInspectableObjects?.() || [];
          const match = inspectables.find((i) => i.data.id === selectedItem.id);
          if (match) {
            match.mesh.position[axis] = cleanVal;
            match.mesh.updateMatrixWorld(true);
            selectedItem.worldPosition.copy(match.mesh.position);
          }
        }
      } else if (activeArtifactRef.current?.group) {
        activeArtifactRef.current.group.position[axis] = cleanVal;
      }
      return nextLoc;
    });
  }, [selectedItem]);

  const handleUpdateScale = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    const cleanVal = Math.max(0.05, Math.min(10, Number.isFinite(value) ? parseFloat(value.toFixed(3)) : 1));
    setTransformScale((prev) => {
      const nextScale = { ...prev, [axis]: cleanVal };
      if (selectedItem) {
        const probe = customProbesRef.current.find(
          (p) => (p as any).name === selectedItem.id || (p as any).userData?.id === selectedItem.id
        );
        if (probe) {
          probe.scale[axis] = cleanVal;
        } else {
          const inspectables = activeArtifactRef.current?.getInspectableObjects?.() || [];
          const match = inspectables.find((i) => i.data.id === selectedItem.id);
          if (match) {
            match.mesh.scale[axis] = cleanVal;
          }
        }
      } else if (activeArtifactRef.current?.group) {
        activeArtifactRef.current.group.scale[axis] = cleanVal;
      }
      return nextScale;
    });
  }, [selectedItem]);

  const handleUniformScale = useCallback((factor: number) => {
    playSound('click');
    setTransformScale((prev) => {
      const nextScale = {
        x: Math.max(0.05, Math.min(10, parseFloat((prev.x * factor).toFixed(3)))),
        y: Math.max(0.05, Math.min(10, parseFloat((prev.y * factor).toFixed(3)))),
        z: Math.max(0.05, Math.min(10, parseFloat((prev.z * factor).toFixed(3)))),
      };
      if (selectedItem) {
        const probe = customProbesRef.current.find(
          (p) => (p as any).name === selectedItem.id || (p as any).userData?.id === selectedItem.id
        );
        if (probe) {
          probe.scale.set(nextScale.x, nextScale.y, nextScale.z);
        } else {
          const inspectables = activeArtifactRef.current?.getInspectableObjects?.() || [];
          const match = inspectables.find((i) => i.data.id === selectedItem.id);
          if (match) {
            match.mesh.scale.set(nextScale.x, nextScale.y, nextScale.z);
          }
        }
      } else if (activeArtifactRef.current?.group) {
        activeArtifactRef.current.group.scale.set(nextScale.x, nextScale.y, nextScale.z);
      }
      showToast(`Scale: ${factor >= 1 ? '+' : ''}${Math.round((factor - 1) * 100)}%`);
      return nextScale;
    });
  }, [playSound, selectedItem, showToast]);

  const handleResetTransform = useCallback(() => {
    playSound('click');
    setTransformLocation({ x: 0, y: 0, z: 0 });
    setTransformScale({ x: 1, y: 1, z: 1 });
    if (selectedItem) {
      const probe = customProbesRef.current.find(
        (p) => (p as any).name === selectedItem.id || (p as any).userData?.id === selectedItem.id
      );
      if (probe) {
        probe.position.set(0, 0, 0);
        probe.scale.set(1, 1, 1);
        selectedItem.worldPosition.set(0, 0, 0);
      } else {
        const inspectables = activeArtifactRef.current?.getInspectableObjects?.() || [];
        const match = inspectables.find((i) => i.data.id === selectedItem.id);
        if (match) {
          match.mesh.position.set(0, 0, 0);
          match.mesh.scale.set(1, 1, 1);
          selectedItem.worldPosition.set(0, 0, 0);
        }
      }
      showToast(`Reset transform for ${selectedItem.name}`);
    } else if (activeArtifactRef.current?.group) {
      activeArtifactRef.current.group.position.set(0, 0, 0);
      activeArtifactRef.current.group.scale.set(1, 1, 1);
      showToast('Reset artifact position & scale to default [Alt+G]');
    }
  }, [playSound, selectedItem, showToast]);

  // Copy component property data
  const handleCopyComponentData = useCallback((item: InspectableItem) => {
    playSound('click');
    const payload = {
      name: item.name,
      role: item.role,
      dimension: item.dimension,
      type: item.type,
      properties: item.properties,
      description: item.description,
      worldPosition: [
        parseFloat(item.worldPosition.x.toFixed(3)),
        parseFloat(item.worldPosition.y.toFixed(3)),
        parseFloat(item.worldPosition.z.toFixed(3)),
      ],
    };
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
        setCopiedComponentData(true);
        showToast(`Copied specs for ${item.name}`);
        setTimeout(() => setCopiedComponentData(false), 2000);
      });
    }
  }, [playSound, showToast]);

  // Copy LaTeX formula
  const handleCopyFormula = useCallback((latex: string) => {
    playSound('click');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(latex).then(() => {
        showToast('Copied LaTeX formula to clipboard!');
      });
    }
  }, [playSound, showToast]);

  // Math metric detail provider
  const getMetricMathDetail = useCallback((phaseId: string, idx: number, label: string, value: string) => {
    if (phaseId === 'phase-05') {
      if (idx === 0) {
        return {
          title: 'Whitney Tangent Embedding & Intrinsic Dimension',
          latex: '\\dim(T_p \\mathcal{M}) = 3, \\quad \\mathcal{M}^3 \\hookrightarrow \\mathbb{R}^{2d+1} = \\mathbb{R}^7',
          description: 'Intrinsic 3D manifold embedded smoothly into ambient latent representation. Local chart diffeomorphisms preserve sectional curvature.',
          details: [
            { k: 'INTRINSIC DIMENSION', v: 'd = 3' },
            { k: 'AMBIENT EMBEDDING', v: 'ℝ⁵ Latent Space' },
            { k: 'MANIFOLD CLASS', v: 'C^∞ Smooth Riemannian' },
          ],
        };
      }
      if (idx === 1) {
        return {
          title: 'Riemannian Metric Tensor Field g_ij(x)',
          latex: 'ds^2 = g_{ij} dx^i dx^j, \\quad \\Gamma^k_{ij} = \\frac{1}{2} g^{kl}(\\partial_i g_{jl} + \\partial_j g_{il} - \\partial_l g_{ij})',
          description: 'Riemannian fundamental tensor defining the infinitesimal distance element ds² and Levi-Civita affine connection on the manifold.',
          details: [
            { k: 'METRIC TENSOR', v: 'g_ij = ⟨∂_i r, ∂_j r⟩' },
            { k: 'AFFINE CONNECTION', v: 'Levi-Civita (Torsionless)' },
            { k: 'GAUSSIAN CURVATURE', v: 'K = κ₁ · κ₂' },
          ],
        };
      }
      if (idx === 2) {
        return {
          title: 'Geodesic Vector Flow & RK4 Integrator',
          latex: '\\frac{d^2 x^i}{d\\tau^2} + \\Gamma^i_{jk} \\frac{dx^j}{d\\tau} \\frac{dx^k}{d\\tau} = 0',
          description: 'Extreme-action geodesic paths integrated numerically using fourth-order Runge-Kutta ODE flow with adaptive timestep parameterization.',
          details: [
            { k: 'INTEGRATOR', v: 'Runge-Kutta 4 (RK4)' },
            { k: 'STEP SIZE', v: 'h = 0.0125 s (Adaptive)' },
            { k: 'HAMILTONIAN', v: 'H = ½ g_ij p^i p^j = const' },
          ],
        };
      }
    }

    if (phaseId === 'phase-01') {
      if (idx === 0) {
        return {
          title: 'Computational DAG Node Topology',
          latex: 'G = (V, E), \\quad v_i = f_i(\\mathrm{parents}(v_i))',
          description: 'Directed acyclic computational graph representing discrete intermediate tensor evaluation nodes.',
          details: [
            { k: 'NODE COUNT', v: '10 Evaluation Nodes' },
            { k: 'GRAPH TOPOLOGY', v: 'Strict DAG' },
            { k: 'TAPE ORDER', v: 'Topologically Sorted' },
          ],
        };
      }
      if (idx === 1) {
        return {
          title: 'Adjoint Edge Sensitivity Flow',
          latex: '\\bar{u}_j = \\sum_{i \\in \\mathrm{children}(j)} \\bar{v}_i \\frac{\\partial v_i}{\\partial u_j}',
          description: 'Reverse-mode adjoint sensitivity accumulation passing backward gradients along directed computational edges.',
          details: [
            { k: 'ADJOINT EDGES', v: '11 Directed Backprop Rays' },
            { k: 'ACCUMULATION', v: 'Chain Rule Adjoint Flow' },
            { k: 'DIFFERENTIATION', v: 'Exact Reverse-Mode' },
          ],
        };
      }
    }

    return {
      title: `${label} Specification`,
      latex: value,
      description: `Computational and mathematical formulation of ${label} for the active research phase. Evaluated in real-time on GPU/WebGL shaders.`,
      details: [
        { k: 'METRIC', v: label },
        { k: 'VALUE', v: value },
        { k: 'COMPUTE', v: 'Hardware Accelerated' },
      ],
    };
  }, []);

  // ── Professional Blender Keyboard Shortcuts (N, T, Z, G, Space, R, 1, 3, 7, F, Tab, Esc) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.altKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        handleResetTransform();
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleUpdateScale('x', 1);
        handleUpdateScale('y', 1);
        handleUpdateScale('z', 1);
        playSound('click');
        showToast('Reset scale to 1.0 [Alt+S]');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetView();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleFocusSelected();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleCycleNextComponent();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleToggleLayer('grid');
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setNPanelOpen((prev) => !prev);
        playSound('toggle');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTPanelOpen((prev) => !prev);
        playSound('toggle');
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleSetShadingMode(shadingMode === 'wireframe' ? 'rendered' : 'wireframe');
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoRotate((prev) => !prev);
        playSound('toggle');
      } else if (e.key === '1') {
        e.preventDefault();
        handleSnapAxis('z'); // Front View (Numpad 1)
      } else if (e.key === '3') {
        e.preventDefault();
        handleSnapAxis('x'); // Right View (Numpad 3)
      } else if (e.key === '7') {
        e.preventDefault();
        handleSnapAxis('y'); // Top View (Numpad 7)
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (openHeaderMenu) {
          setOpenHeaderMenu(null);
          return;
        }
        if (showOverlaysMenu || showLeftLayersMenu) {
          setShowOverlaysMenu(false);
          setShowLeftLayersMenu(false);
          return;
        }
        if (selectedItem) {
          setSelectedItem(null);
          activeArtifactRef.current?.onSelectObject?.(null);
          return;
        }
        onExit(currentPhaseMeta.chronicleId);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = RESEARCH_PHASES.findIndex((p) => p.id === activePhaseId);
        const nextPhase = RESEARCH_PHASES[(currentIndex + 1) % RESEARCH_PHASES.length];
        handleSelectPhase(nextPhase.id);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = RESEARCH_PHASES.findIndex((p) => p.id === activePhaseId);
        const prevPhase = RESEARCH_PHASES[(currentIndex - 1 + RESEARCH_PHASES.length) % RESEARCH_PHASES.length];
        handleSelectPhase(prevPhase.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activePhaseId,
    currentPhaseMeta.chronicleId,
    handleCycleNextComponent,
    handleFocusSelected,
    handleResetTransform,
    handleUpdateScale,
    handleResetView,
    handleToggleLayer,
    onExit,
    openHeaderMenu,
    playSound,
    selectedItem,
    shadingMode,
    showOverlaysMenu,
    showLeftLayersMenu,
  ]);

  // ── Switch 3D Artifact inside the persistent WebGL Scene ───────────────────
  const switchArtifact = useCallback(
    (phaseId: ResearchPhaseId, tier: QualityTier) => {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!scene || !camera || !controls) return;

      setIsLoadingGeometry(true);
      setLoadProgress(30);

      // 1. Dispose old artifact
      if (activeArtifactRef.current) {
        scene.remove(activeArtifactRef.current.group);
        // Deep recursive disposal of child geometries and materials
        activeArtifactRef.current.group.traverse((child) => {
          if ((child as THREE.Mesh).geometry) {
            (child as THREE.Mesh).geometry.dispose();
          }
          if ((child as THREE.Mesh).material) {
            const mat = (child as THREE.Mesh).material;
            if (Array.isArray(mat)) {
              mat.forEach((m) => m.dispose());
            } else {
              mat.dispose();
            }
          }
        });
        activeArtifactRef.current.dispose();
        activeArtifactRef.current = null;
        if (rendererRef.current) {
          rendererRef.current.renderLists.dispose();
        }
      }
      if (customProbesRef.current.length > 0) {
        customProbesRef.current.forEach((g) => {
          scene.remove(g);
          g.traverse((child) => {
            if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
            if ((child as THREE.Mesh).material) {
              const mat = (child as THREE.Mesh).material;
              if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
              else mat.dispose();
            }
          });
        });
        customProbesRef.current = [];
      }

      setSelectedItem(null);
      setHoveredItem(null);
      setLoadProgress(65);

      // 2. Instantiate new artifact
      let newArtifact: PhaseArtifactInstance;
      switch (phaseId) {
        case 'phase-01':
          newArtifact = createPhase01Autograd(tier);
          break;
        case 'phase-02':
          newArtifact = createPhase02Optimization(tier);
          break;
        case 'phase-03':
          newArtifact = createPhase03MetricSpaces(tier);
          break;
        case 'phase-04':
          newArtifact = createPhase04Attention(tier);
          break;
        case 'phase-05':
        default:
          newArtifact = createPhase05LatentManifold(tier);
          break;
      }

      scene.add(newArtifact.group);
      activeArtifactRef.current = newArtifact;

      const items = newArtifact.getInspectableObjects?.().map((i) => i.data) || [];
      setSceneInspectables(items);
      setTransformLocation({ x: 0, y: 0, z: 0 });
      setTransformScale({ x: 1, y: 1, z: 1 });
      setExpandedMathCard(null);

      // Apply initial layer toggles
      Object.entries(activeLayers).forEach(([layer, visible]) => {
        newArtifact.toggleLayer?.(layer as LayerType, visible);
      });

      // 3. Compute optimal dynamic framing with matrix synchronization
      newArtifact.group.updateMatrixWorld(true);
      const vw =
        containerRef.current && containerRef.current.clientWidth > 0
          ? containerRef.current.clientWidth
          : typeof window !== 'undefined'
          ? window.innerWidth >= 1200
            ? window.innerWidth - 320
            : window.innerWidth
          : 1280;
      const vh =
        containerRef.current && containerRef.current.clientHeight > 0
          ? containerRef.current.clientHeight
          : typeof window !== 'undefined'
          ? window.innerHeight
          : 800;
      const isMob = vw < 768;

      const framing = computeOptimalFraming(newArtifact.group, camera, vw, vh, isMob);
      if (
        framing &&
        isFinite(framing.cameraPos.x) &&
        isFinite(framing.cameraPos.y) &&
        isFinite(framing.cameraPos.z) &&
        isFinite(framing.target.x) &&
        isFinite(framing.target.y) &&
        isFinite(framing.target.z)
      ) {
        camera.position.copy(framing.cameraPos);
        controls.target.copy(framing.target);
      } else {
        camera.position.set(...newArtifact.defaultCameraPosition);
        controls.target.set(...newArtifact.defaultTarget);
      }
      camera.near = 0.1;
      camera.far = 250;
      camera.updateProjectionMatrix();
      controls.update();

      setIsLoadingGeometry(false);
    },
    [activeLayers]
  );

  // ── WebGL Initialization & Persistent Canvas Lifecycle ────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene setup with depth fog (composited over authentic webpage background)
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x14171c, 0.015);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 3. WebGL Renderer with device-adaptive DPR and quality settings
    let renderer: THREE.WebGLRenderer;
    try {
      const isLowTier = activeTier === 'low';
      const isMobile =
        (typeof window !== 'undefined' && window.innerWidth < 768) ||
        (typeof navigator !== 'undefined' &&
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

      renderer = new THREE.WebGLRenderer({
        antialias: !isLowTier && !isMobile,
        powerPreference: isLowTier ? 'default' : 'high-performance',
        alpha: true,
        precision: isLowTier ? 'mediump' : 'highp',
        stencil: false,
        depth: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(width, height);

      // Adaptive DPR scaling:
      // High-end desktop: up to 2.0 native retina sharpness
      // Medium / tablet: 1.25 to 1.5
      // Low-end: capped to 1.0
      const maxDpr = isLowTier ? 1.0 : (isMobile ? 1.25 : (activeTier === 'high' ? Math.min(window.devicePixelRatio || 1, 2.0) : 1.5));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);
    } catch (err: any) {
      console.error('Failed to initialize WebGL renderer:', err);
      setSceneInitError(err?.message || 'WebGL context could not be created.');
      return;
    }

    // 4. OrbitControls with smooth inertia
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 55;
    controls.minDistance = 2.0;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.9;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    controls.enablePan = true;
    controls.panSpeed = 0.9;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.enabled = true;
    controlsRef.current = controls;

    // 5. Lighting Architecture: Scientific key, fill, and rim illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1f2, 1.4);
    keyLight.position.set(12, 18, 14);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.65);
    fillLight.position.set(-14, -8, -10);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe2e8f0, 0.55);
    rimLight.position.set(0, 15, -15);
    scene.add(rimLight);

    // Initial artifact load
    switchArtifact(currentPhaseIdRef.current, activeTier);

    // Initial frame render to stabilize WebGL pipeline & signal scene readiness
    try {
      renderer.render(scene, camera);
      setIsSceneReady(true);
    } catch (err: any) {
      console.error('Initial frame render error:', err);
      setSceneInitError(err?.message || 'Failed to render initial 3D frame.');
    }

    // 6. Interaction Event Handlers (Raycasting & Picking)
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.35 };
    raycaster.params.Points = { threshold: 0.35 };
    const pointer = new THREE.Vector2();
    let isDraggingCanvas = false;
    let dragStartPos = { x: 0, y: 0 };
    let lastTapTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingCanvas = false;
      dragStartPos = { x: e.clientX, y: e.clientY };
      // Minimize intro card upon first deliberate interaction
      if (showIntroCard) {
        setShowIntroCard(false);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!container || !camera || !activeArtifactRef.current) return;
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (dx > 5 || dy > 5) isDraggingCanvas = true;

      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const inspectables = activeArtifactRef.current.getInspectableObjects?.() || [];
      if (inspectables.length === 0) {
        setHoveredItem(null);
        setHoverLabelPos(null);
        container.style.cursor = 'grab';
        return;
      }

      raycaster.setFromCamera(pointer, camera);
      const targetMeshes = inspectables.map((i) => i.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const match = inspectables.find(
          (i) => i.mesh === hit.object || i.mesh.children.includes(hit.object)
        );
        if (match) {
          setHoveredItem(match.data);
          setHoverLabelPos({ x: e.clientX, y: e.clientY });
          container.style.cursor = 'pointer';
          activeArtifactRef.current.onHoverObject?.(match.data);
          return;
        }
      }

      setHoveredItem(null);
      setHoverLabelPos(null);
      container.style.cursor = 'grab';
      activeArtifactRef.current.onHoverObject?.(null);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDraggingCanvas) return;
      if (!container || !camera || !activeArtifactRef.current) return;

      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const inspectables = activeArtifactRef.current.getInspectableObjects?.() || [];
      const targetMeshes = inspectables.map((i) => i.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      const now = performance.now();
      const isDoubleTap = now - lastTapTime < 320;
      lastTapTime = now;

      if (intersects.length > 0) {
        const hit = intersects[0];
        const match = inspectables.find(
          (i) => i.mesh === hit.object || i.mesh.children.includes(hit.object)
        );
        if (match) {
          playSound('click');
          setSelectedItem(match.data);
          activeArtifactRef.current.onSelectObject?.(match.data);

          if (window.innerWidth < 768) {
            setNPanelOpen(true);
          }

          if (isDoubleTap) {
            handleFocusCamera(match.data.worldPosition);
          }
          return;
        }
      }

      // Deselect when clicking empty space
      if (!isDoubleTap) {
        setSelectedItem(null);
        activeArtifactRef.current.onSelectObject?.(null);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);

    // 7. Dynamic Resize Observer (adapts to N-panel sidebar toggle & window resizing)
    let lastWidth = 0;
    let lastHeight = 0;
    let lastDpr = 0;

    const onWindowResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === 0 || h === 0) return;

      const isLowTier = activeTier === 'low';
      const isMobile = w < 768;
      const maxDpr = isLowTier ? 1.0 : (isMobile ? 1.25 : (activeTier === 'high' ? Math.min(window.devicePixelRatio || 1, 2.0) : 1.5));
      const targetDpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      // Only reallocate WebGL buffers if physical pixel dimensions actually changed
      if (
        Math.abs(w - lastWidth) < 1 &&
        Math.abs(h - lastHeight) < 1 &&
        Math.abs(targetDpr - lastDpr) < 0.01
      ) {
        return;
      }

      lastWidth = w;
      lastHeight = h;
      lastDpr = targetDpr;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(targetDpr);
      renderer.setSize(w, h, false);

      // Immediately render frame to prevent transparent/black flicker during buffer re-allocation
      if (sceneRef.current) {
        renderer.render(sceneRef.current, camera);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onWindowResize);
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', onWindowResize);

    // 8. Animation & Render Loop with Camera Slerp, Visibility Pause & Frame Pacing
    let lastTime = performance.now();
    let frameCount = 0;
    let lastStatsTime = performance.now();
    let lastRenderTime = performance.now();
    let isPaused = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      } else {
        isPaused = false;
        lastTime = performance.now();
        lastRenderTime = performance.now();
        if (!animFrameIdRef.current) {
          animFrameIdRef.current = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
    const handleContextRestored = () => {
      setInitAttempt((prev) => prev + 1);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    const animate = () => {
      if (isPaused || document.hidden) return;

      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();

      // Frame pacing: uncap for high/medium (native 60/120/144Hz monitor refresh), cap to ~30 FPS on low-tier
      const targetInterval = activeTier === 'low' ? 30 : 0;
      if (targetInterval > 0 && now - lastRenderTime < targetInterval) {
        return;
      }
      lastRenderTime = now;

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      frameCount++;
      if (now - lastStatsTime >= 500) {
        const measuredFps = Math.round((frameCount * 1000) / (now - lastStatsTime));
        setLiveFps(Math.min(measuredFps, 144));
        frameCount = 0;
        lastStatsTime = now;
        if (renderer && renderer.info) {
          setLiveTriangles(renderer.info.render.triangles || 0);
          setLiveDrawCalls(renderer.info.render.calls || 0);
        }
      }

      // Smooth camera focusing transition
      const focus = cameraFocusTarget.current;
      if (focus.active) {
        focus.progress += delta * 2.8;
        const t = Math.min(focus.progress, 1);
        const ease = 1 - Math.pow(1 - t, 3);

        if (
          isFinite(focus.startPos.x) && isFinite(focus.endPos.x) &&
          isFinite(focus.startTarget.x) && isFinite(focus.endTarget.x)
        ) {
          camera.position.lerpVectors(focus.startPos, focus.endPos, ease);
          controls.target.lerpVectors(focus.startTarget, focus.endTarget, ease);
          camera.lookAt(controls.target);
        }

        if (t >= 1) {
          focus.active = false;
          controls.update();
        }
      } else {
        controls.update();
      }

      // Update active 3D artifact
      if (activeArtifactRef.current) {
        activeArtifactRef.current.update(now * 0.001, delta);

        // Project 3D spatial annotations to screen coordinates if enabled
        if (showAnnotations && activeArtifactRef.current.getAnnotations) {
          const rawAnnots = activeArtifactRef.current.getAnnotations();
          const cw = container.clientWidth || window.innerWidth;
          const ch = container.clientHeight || window.innerHeight;
          const proj = rawAnnots.map((a) => {
            const v = a.position.clone();
            v.project(camera);
            const isBehind = v.z > 1.0;
            const screenX = ((v.x + 1) * cw) / 2;
            const screenY = ((-v.y + 1) * ch) / 2;
            return {
              id: a.id,
              label: a.label,
              sublabel: a.sublabel,
              screenX,
              screenY,
              visible: !isBehind && screenX > 20 && screenX < cw - 20 && screenY > 60 && screenY < ch - 60,
            };
          });
          setProjectedAnnotations(proj);
        }

        // Calculate 3D orientation gizmo transform matrix directly on ref (zero React state overhead)
        const m = camera.matrixWorldInverse;
        const matrixStr = `matrix3d(${m.elements[0]}, ${m.elements[1]}, ${m.elements[2]}, 0, ${m.elements[4]}, ${m.elements[5]}, ${m.elements[6]}, 0, ${m.elements[8]}, ${m.elements[9]}, ${m.elements[10]}, 0, 0, 0, 0, 1)`;
        if (gizmoElRef.current) {
          gizmoElRef.current.style.transform = matrixStr;
        }
        if (dockedGizmoElRef.current) {
          dockedGizmoElRef.current.style.transform = matrixStr;
        }
      }

      // Self-healing camera guard: immediately restores camera if position/target is ever non-finite right before draw call
      if (
        !isFinite(camera.position.x) ||
        !isFinite(camera.position.y) ||
        !isFinite(camera.position.z) ||
        !isFinite(controls.target.x) ||
        !isFinite(controls.target.y) ||
        !isFinite(controls.target.z)
      ) {
        const defPos = activeArtifactRef.current?.defaultCameraPosition || [3.8, 6.0, 14.0];
        const defTgt = activeArtifactRef.current?.defaultTarget || [0, -0.2, 0];
        camera.position.set(defPos[0], defPos[1], defPos[2]);
        controls.target.set(defTgt[0], defTgt[1], defTgt[2]);
        camera.near = 0.1;
        camera.far = 250;
        camera.updateProjectionMatrix();
        camera.lookAt(controls.target);
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', onWindowResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);

      if (activeArtifactRef.current) {
        activeArtifactRef.current.group.traverse((child) => {
          if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
          if ((child as THREE.Mesh).material) {
            const mat = (child as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
        activeArtifactRef.current.dispose();
      }
      controls.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [initAttempt]);

  // Handle phase switching from state changes
  const handleSelectPhase = (phaseId: ResearchPhaseId) => {
    if (phaseId === activePhaseId) return;
    playSound('click');
    setIsPhaseSwitching(true);
    setActivePhaseId(phaseId);
    currentPhaseIdRef.current = phaseId;
    switchArtifact(phaseId, activeTier);

    // Auto-scroll the phase button into view
    const btn = phaseBtnRefs.current[phaseId];
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handlePrevPhase = () => {
    const currIdx = RESEARCH_PHASES.findIndex((p) => p.id === activePhaseId);
    const prevIdx = (currIdx - 1 + RESEARCH_PHASES.length) % RESEARCH_PHASES.length;
    handleSelectPhase(RESEARCH_PHASES[prevIdx].id);
  };

  const handleNextPhase = () => {
    const currIdx = RESEARCH_PHASES.findIndex((p) => p.id === activePhaseId);
    const nextIdx = (currIdx + 1) % RESEARCH_PHASES.length;
    handleSelectPhase(RESEARCH_PHASES[nextIdx].id);
  };

  const handleEntryTransitionComplete = useCallback(() => {
    setIsInitialEntryLoading(false);
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
      controlsRef.current.update();
    }
  }, []);

  return (
    <div
      id="research-3d-canvas"
      className="fixed inset-0 z-50 w-screen h-screen h-[100dvh] overflow-hidden bg-[#14171c] select-none text-zinc-100 font-body"
      style={{ touchAction: 'none' }}
    >
      {/* ── Webpage Authentic Technical Background Atmosphere ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Authentic diagonal technical carbon pattern matching the webpage */}
        <div className="pattern-bg w-full h-full opacity-45" />

        {/* Animated drifting technical ambient bands */}
        <div className="cube-svg opacity-35" />

        {/* ── Webpage Coordinate & Architectural Grid Layer (Toggleable) ── */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            activeLayers.grid ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Subtle coordinate dot matrix matching webpage */}
          <div className="absolute inset-0 bg-canvas-dots-overlay opacity-75" />

          {/* Fine architectural line grid matching webpage aesthetic */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Technical Perimeter Vignette: softens outer edges for seamless Blender UI integration */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(14,17,22,0.78)_100%)]" />
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className={`absolute top-0 left-0 bottom-0 cursor-grab active:cursor-grabbing transition-[right] duration-200 z-10 ${
          nPanelOpen ? 'right-0 md:right-80' : 'right-0'
        }`}
        style={{ touchAction: 'none' }}
      />


        {/* ── Floating Hover Micro-Label ────────────────────────────────────── */}
      {hoveredItem && hoverLabelPos && !selectedItem && (
        <div
          className="fixed pointer-events-none z-30 px-2.5 py-1 rounded-md bg-black/90 border border-rose-500/40 shadow-lg text-[11px] text-zinc-200 transform -translate-x-1/2 -translate-y-9 transition-transform"
          style={{ left: hoverLabelPos.x, top: hoverLabelPos.y }}
        >
          <span className="font-semibold text-rose-300">{hoveredItem.name}</span>
          <span className="text-[10px] text-zinc-400 ml-1.5">• Click to Inspect</span>
        </div>
      )}

      {/* ── 3D Projected Spatial Annotations ───────────────────────────────── */}
      {showAnnotations &&
        projectedAnnotations.map((annot) => {
          if (!annot.visible) return null;
          return (
            <div
              key={annot.id}
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 transition-opacity duration-150"
              style={{ left: annot.screenX, top: annot.screenY }}
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/40 shadow-[0_0_8px_#f43f5e]" />
              <div className="px-2 py-0.5 rounded bg-black/85 border border-white/15 text-[10px] whitespace-nowrap shadow-md">
                <span className="font-bold text-white uppercase">{annot.label}</span>
                {annot.sublabel && <span className="text-zinc-400 ml-1.5 font-mono">{annot.sublabel}</span>}
              </div>
            </div>
          );
        })}

      {/* ═══════════════════════════════════════════════════════════════════════
          BLENDER 3D VIEWPORT GUI ARCHITECTURE (Heavy DCC System)
         ═══════════════════════════════════════════════════════════════════════ */}

      {/* ── TOP BLENDER EDITOR HEADER BAR (Full-width, razor-sharp 36px bar) ── */}
      <header
        aria-label="Blender 3D Viewport Header"
        className="fixed top-0 inset-x-0 h-9 z-40 bg-[#202020] border-b border-[#353535] text-zinc-300 font-mono text-[11px] px-2 flex items-center justify-between select-none pointer-events-auto shadow-md"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px))' }}
      >
        {/* Left Cluster: Editor Type, Mode Selector, Menus & Breadcrumb */}
        <div ref={headerMenusRef} className="flex items-center gap-1.5 min-w-0">
          {/* 1. Blender 3D Viewport Icon & Editor Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleHeaderMenu('editor')}
              onMouseEnter={() => handleMenuHover('editor')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border text-[#e87d0d] cursor-pointer transition-colors ${
                openHeaderMenu === 'editor'
                  ? 'bg-[#383838] border-[#555]'
                  : 'bg-[#2a2a2a] hover:bg-[#323232] border-[#3e3e3e]'
              }`}
              title="Editor Type Switcher"
            >
              <BlenderBoxIcon className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px] text-zinc-200 hidden sm:inline">3D Viewport</span>
              <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
            </button>

            {openHeaderMenu === 'editor' && (
              <div className="absolute left-0 top-full mt-1 w-56 p-1.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 text-xs font-mono space-y-0.5 animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                  Editor Mode
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleResetView();
                    setOpenHeaderMenu(null);
                    showToast('3D Viewport Active');
                  }}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-white cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e87d0d]" />
                    <span>3D Viewport</span>
                  </span>
                  <span className="text-[9px] text-zinc-400">Main</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNPanelOpen(true);
                    setActiveNTab('item');
                    setOpenRollouts((prev) => ({ ...prev, topology: true }));
                    setOpenHeaderMenu(null);
                    playSound('click');
                    showToast('Opened Topology & Math Inspector');
                  }}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Topology & Math</span>
                  </span>
                  <span className="text-[9px] text-zinc-400">N-Panel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNPanelOpen(true);
                    setActiveNTab('item');
                    setOpenRollouts((prev) => ({ ...prev, stats: true }));
                    setOpenHeaderMenu(null);
                    playSound('click');
                    showToast('Opened Scene Statistics & Telemetry');
                  }}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Scene Telemetry</span>
                  </span>
                  <span className="text-[9px] text-zinc-400">Stats</span>
                </button>

                <div className="h-px bg-[#353535] my-1" />

                <button
                  type="button"
                  onClick={() => {
                    handleToggleFullscreen();
                    setOpenHeaderMenu(null);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                >
                  <span>Toggle Cinema Fullscreen</span>
                  <span className="text-[9px] text-zinc-500 font-mono">F11</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Interaction Mode Dropdown: [ • OBJECT MODE ▾ ] */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleHeaderMenu('mode')}
              onMouseEnter={() => handleMenuHover('mode')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border text-zinc-200 cursor-pointer transition-colors ${
                openHeaderMenu === 'mode'
                  ? 'bg-[#383838] border-[#555]'
                  : 'bg-[#282828] hover:bg-[#323232] border-[#3e3e3e]'
              }`}
              title="Interaction Mode Selector"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  viewportMode === 'object'
                    ? 'bg-rose-500 shadow-[0_0_4px_#f43f5e]'
                    : viewportMode === 'edit'
                    ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]'
                    : viewportMode === 'curvature'
                    ? 'bg-sky-400 shadow-[0_0_4px_#38bdf8]'
                    : 'bg-emerald-400 shadow-[0_0_4px_#34d399]'
                }`}
              />
              <span className="font-semibold text-[10px] uppercase">
                {viewportMode === 'object'
                  ? 'Object Mode'
                  : viewportMode === 'edit'
                  ? 'Edit Mode'
                  : viewportMode === 'curvature'
                  ? 'Curvature'
                  : 'Turntable'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {openHeaderMenu === 'mode' && (
              <div className="absolute left-0 top-full mt-1 w-64 p-1.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 text-xs font-mono space-y-0.5 animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                  Interaction Modes
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectViewportMode('object')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] cursor-pointer text-left transition-colors ${
                    viewportMode === 'object' ? 'bg-rose-950/70 text-rose-300 font-bold' : 'hover:bg-[#383838] text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                    <div>
                      <span className="block text-[11px]">Object Mode</span>
                      <span className="block text-[9px] text-zinc-500 font-normal">Select & inspect 3D components</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-500">Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectViewportMode('edit')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] cursor-pointer text-left transition-colors ${
                    viewportMode === 'edit' ? 'bg-amber-950/70 text-amber-300 font-bold' : 'hover:bg-[#383838] text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                    <div>
                      <span className="block text-[11px]">Edit Mode (Lattice)</span>
                      <span className="block text-[9px] text-zinc-500 font-normal">Wireframe polygon & vertex inspection</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-500">Z</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectViewportMode('curvature')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] cursor-pointer text-left transition-colors ${
                    viewportMode === 'curvature' ? 'bg-sky-950/70 text-sky-300 font-bold' : 'hover:bg-[#383838] text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                    <div>
                      <span className="block text-[11px]">Curvature Heatmap</span>
                      <span className="block text-[9px] text-zinc-500 font-normal">Emphasize gradient flows & topology</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-500">Grad</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectViewportMode('turntable')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] cursor-pointer text-left transition-colors ${
                    viewportMode === 'turntable' ? 'bg-emerald-950/70 text-emerald-300 font-bold' : 'hover:bg-[#383838] text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    <div>
                      <span className="block text-[11px]">Turntable Showcase</span>
                      <span className="block text-[9px] text-zinc-500 font-normal">Kinetic 360° auto-rotation</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-500">Space</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Blender Editor Menus (View, Select, Add, Mesh) */}
          <div className="hidden lg:flex items-center gap-0.5 text-zinc-400 text-[11px]">
            {/* View Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleHeaderMenu('view')}
                onMouseEnter={() => handleMenuHover('view')}
                className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer transition-colors ${
                  openHeaderMenu === 'view' ? 'bg-white/[0.12] text-white font-bold' : 'hover:bg-white/[0.08] hover:text-white text-zinc-400'
                }`}
              >
                View
              </button>

              {openHeaderMenu === 'view' && (
                <div className="absolute left-0 top-full mt-1 w-60 p-1.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 text-xs font-mono space-y-0.5 animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetView();
                      setOpenHeaderMenu(null);
                      showToast('Centered Camera on Artifact [R]');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Frame All / Center</span>
                    <span className="text-[10px] text-zinc-500">R</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleFocusSelected();
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Frame Selected Node</span>
                    <span className="text-[10px] text-zinc-500">F</span>
                  </button>

                  <div className="h-px bg-[#353535] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      handleSnapAxis('y');
                      setOpenHeaderMenu(null);
                      showToast('Top View (Axis +Y)');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Viewpoint: Top</span>
                    <span className="text-[10px] text-zinc-500">Numpad 7</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSnapAxis('z');
                      setOpenHeaderMenu(null);
                      showToast('Front View (Axis +Z)');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Viewpoint: Front</span>
                    <span className="text-[10px] text-zinc-500">Numpad 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSnapAxis('x');
                      setOpenHeaderMenu(null);
                      showToast('Right View (Axis +X)');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Viewpoint: Right</span>
                    <span className="text-[10px] text-zinc-500">Numpad 3</span>
                  </button>

                  <div className="h-px bg-[#353535] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      handleToggleLayer('grid');
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeLayers.grid ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                      <span>Toggle Grid</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">G</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNPanelOpen((prev) => !prev);
                      setOpenHeaderMenu(null);
                      playSound('toggle');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${nPanelOpen ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                      <span>Properties Sidebar</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">N</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTPanelOpen((prev) => !prev);
                      setOpenHeaderMenu(null);
                      playSound('toggle');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${tPanelOpen ? 'bg-rose-500' : 'bg-zinc-600'}`} />
                      <span>Tool Shelf</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">T</span>
                  </button>
                </div>
              )}
            </div>

            {/* Select Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleHeaderMenu('select')}
                onMouseEnter={() => handleMenuHover('select')}
                className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer transition-colors ${
                  openHeaderMenu === 'select' ? 'bg-white/[0.12] text-white font-bold' : 'hover:bg-white/[0.08] hover:text-white text-zinc-400'
                }`}
              >
                Select
              </button>

              {openHeaderMenu === 'select' && (
                <div className="absolute left-0 top-full mt-1 w-56 p-1.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 text-xs font-mono space-y-0.5 animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectFirstComponent();
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Select Primary Node</span>
                    <span className="text-[10px] text-zinc-500">Main</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCycleNextComponent();
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Cycle Next Node</span>
                    <span className="text-[10px] text-zinc-500">Tab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleFocusSelected();
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Focus Selected</span>
                    <span className="text-[10px] text-zinc-500">F</span>
                  </button>

                  <div className="h-px bg-[#353535] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      activeArtifactRef.current?.onSelectObject?.(null);
                      setOpenHeaderMenu(null);
                      playSound('secondaryClick');
                      showToast('Deselected all objects');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Deselect All</span>
                    <span className="text-[10px] text-zinc-500">Esc</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleHeaderMenu('add')}
                onMouseEnter={() => handleMenuHover('add')}
                className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer transition-colors ${
                  openHeaderMenu === 'add' ? 'bg-white/[0.12] text-white font-bold' : 'hover:bg-white/[0.08] hover:text-white text-zinc-400'
                }`}
              >
                Add
              </button>

              {openHeaderMenu === 'add' && (
                <div className="absolute left-0 top-full mt-1 w-64 p-1.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 text-xs font-mono space-y-0.5 animate-in fade-in duration-100">
                  <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Spawn Elements
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAddProbe();
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] hover:bg-[#383838] text-zinc-200 hover:text-white cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                      <div>
                        <span className="block text-[11px] font-semibold text-rose-300">Latent Probe Marker</span>
                        <span className="block text-[9px] text-zinc-500">Inject interactive 3D beacon</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-rose-400 font-bold">+ New</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleToggleLayer('trajectories');
                      setOpenHeaderMenu(null);
                      showToast(`Trajectories: ${!activeLayers.trajectories ? 'Shown' : 'Hidden'}`);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Geodesic Trajectory Flow</span>
                    <span className="text-[9px] text-zinc-400">{activeLayers.trajectories ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleToggleLayer('annotations');
                      setOpenHeaderMenu(null);
                      showToast(`Spatial Annotations: ${!activeLayers.annotations ? 'Shown' : 'Hidden'}`);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Spatial Coordinate Annotations</span>
                    <span className="text-[9px] text-zinc-400">{activeLayers.annotations ? 'ON' : 'OFF'}</span>
                  </button>

                  <div className="h-px bg-[#353535] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      handleClearProbes();
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-400 hover:text-rose-300 cursor-pointer text-left"
                  >
                    <span>Clear Custom Probe Markers</span>
                    <span className="text-[9px] text-zinc-600">Reset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mesh Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleHeaderMenu('mesh')}
                onMouseEnter={() => handleMenuHover('mesh')}
                className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer transition-colors ${
                  openHeaderMenu === 'mesh' ? 'bg-white/[0.12] text-white font-bold' : 'hover:bg-white/[0.08] hover:text-white text-zinc-400'
                }`}
              >
                Mesh
              </button>

              {openHeaderMenu === 'mesh' && (
                <div className="absolute left-0 top-full mt-1 w-64 p-1.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 text-xs font-mono space-y-0.5 animate-in fade-in duration-100">
                  <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Shading & Tessellation
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSetShadingMode('rendered');
                      setOpenHeaderMenu(null);
                      showToast('PBR Material Shading Active');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${shadingMode === 'rendered' ? 'bg-rose-500' : 'bg-transparent'}`} />
                      <span>Shading: Rendered (PBR)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">PBR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSetShadingMode('wireframe');
                      setOpenHeaderMenu(null);
                      showToast('Wireframe Shading Active [Z]');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${shadingMode === 'wireframe' ? 'bg-rose-500' : 'bg-transparent'}`} />
                      <span>Shading: Wireframe</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">Z</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSetShadingMode('solid');
                      setOpenHeaderMenu(null);
                      showToast('Solid Clay Shading Active');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${shadingMode === 'solid' ? 'bg-rose-500' : 'bg-transparent'}`} />
                      <span>Shading: Solid Clay</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">Solid</span>
                  </button>

                  <div className="h-px bg-[#353535] my-1" />

                  <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Tessellation Density
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQualityMode('auto');
                      switchArtifact(activePhaseId, detectHardwareTier());
                      setOpenHeaderMenu(null);
                      showToast('Mesh Density: Auto (Hardware Tier)');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Density: Auto Tier</span>
                    <span className="text-[9px] text-zinc-500 uppercase">{activeTier}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQualityMode('high');
                      switchArtifact(activePhaseId, 'high');
                      setOpenHeaderMenu(null);
                      showToast('Mesh Density: High Quality (64×64 Grid)');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Density: High (64×64)</span>
                    <span className="text-[9px] text-emerald-400">HQ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQualityMode('low');
                      switchArtifact(activePhaseId, 'low');
                      setOpenHeaderMenu(null);
                      showToast('Mesh Density: Low Power (32×32 Grid)');
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-[2px] hover:bg-[#383838] text-zinc-300 hover:text-white cursor-pointer text-left"
                  >
                    <span>Density: Low Power</span>
                    <span className="text-[9px] text-zinc-500">Eco</span>
                  </button>

                  <div className="h-px bg-[#353535] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      handleCopyMathSpec();
                      setOpenHeaderMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-[2px] hover:bg-[#383838] text-rose-300 hover:text-rose-200 cursor-pointer text-left"
                  >
                    <span>Copy Math Tensor Spec</span>
                    <span className="text-[9px] text-zinc-500">JSON/TXT</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:block h-3.5 w-px bg-[#3e3e3e] mx-1" />

          {/* Active Research Phase Breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-rose-400 uppercase text-[10px] whitespace-nowrap">
              PHASE {currentPhaseMeta.numeral}
            </span>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <span className="font-serif font-semibold text-zinc-200 text-xs truncate max-w-[140px] sm:max-w-[220px]">
              {currentPhaseMeta.title}
            </span>
            <span className="hidden xl:inline-flex items-center px-1.5 py-0.2 rounded-[2px] bg-[#2a2a2a] border border-[#3e3e3e] text-[9px] text-zinc-400 uppercase">
              {currentPhaseMeta.dimension}
            </span>
          </div>
        </div>

        {/* Right Cluster: Shading Modes, Overlays, Gizmo, N-Panel Toggle & Exit */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Viewport Shading 4-Ball Cluster (Wireframe, Solid, Material, Rendered) */}
          <div className="flex items-center p-0.5 rounded-[2px] bg-[#1a1a1a] border border-[#353535]">
            <button
              type="button"
              onClick={() => handleSetShadingMode('wireframe')}
              title="Wireframe Shading [Z]"
              className={`p-1 rounded-[2px] cursor-pointer transition-all ${
                shadingMode === 'wireframe'
                  ? 'bg-[#4772b3] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <WireframeIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetShadingMode('solid')}
              title="Solid Shading"
              className={`p-1 rounded-[2px] cursor-pointer transition-all ${
                shadingMode === 'solid'
                  ? 'bg-[#4772b3] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <SolidShadeIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetShadingMode('rendered')}
              title="Material / Rendered Shading (PBR)"
              className={`p-1 rounded-[2px] cursor-pointer transition-all ${
                shadingMode === 'rendered'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <RenderedShadeIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Grid Toggle Button [G] */}
          <button
            type="button"
            onClick={() => handleToggleLayer('grid')}
            title={`Toggle Grid [G] (${activeLayers.grid ? 'Active' : 'Disabled'})`}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-[2px] border cursor-pointer text-[10px] font-mono transition-all ${
              activeLayers.grid
                ? 'bg-rose-950/70 border-rose-500/70 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.25)] font-bold'
                : 'bg-[#282828] border-[#3a3a3a] text-zinc-400 hover:text-white hover:bg-[#323232]'
            }`}
          >
            <Grid className={`w-3 h-3 ${activeLayers.grid ? 'text-rose-400' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">Grid</span>
            <kbd className={`hidden md:inline px-1 py-0.2 rounded-[2px] text-[8px] ${
              activeLayers.grid
                ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40'
                : 'bg-[#1a1a1a] text-zinc-400 border border-[#333]'
            }`}>
              G
            </kbd>
          </button>

          {/* Viewport Overlays Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              ref={overlaysBtnRef}
              onClick={() => {
                playSound('toggle');
                setShowOverlaysMenu((prev) => !prev);
                setShowLeftLayersMenu(false);
                setOpenHeaderMenu(null);
              }}
              title="Viewport Overlays Configuration"
              className={`flex items-center gap-1 px-2 py-1 rounded-[2px] border cursor-pointer text-[10px] font-mono transition-all ${
                showOverlaysMenu
                  ? 'bg-[#383838] border-[#555] text-white shadow-sm'
                  : 'bg-[#282828] border-[#3a3a3a] text-zinc-300 hover:text-white hover:bg-[#323232]'
              }`}
            >
              <Layers className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">Overlays</span>
              <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
            </button>

            {/* Overlays Popover Panel */}
            {showOverlaysMenu && (
              <div
                ref={overlaysMenuRef}
                role="dialog"
                aria-label="Viewport Overlays"
                className="absolute right-0 top-full mt-1 w-56 p-2.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 space-y-2 text-xs font-mono select-none animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="flex items-center justify-between border-b border-[#353535] pb-1.5">
                  <span className="font-bold text-zinc-200 text-[10px] uppercase">Viewport Overlays</span>
                  <span className="text-[9px] text-zinc-400 bg-[#1c1c1c] px-1 py-0.2 rounded-[2px] border border-[#333]">
                    {Object.values(activeLayers).filter(Boolean).length}/5
                  </span>
                </div>
                <div className="space-y-0.5">
                  {(['geometry', 'trajectories', 'clusters', 'grid', 'annotations'] as const).map((layer) => (
                    <label
                      key={layer}
                      className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-[2px] hover:bg-white/[0.06] transition-colors select-none group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-[1px] transition-all duration-200"
                          style={{
                            backgroundColor: activeLayers[layer] ? '#f43f5e' : 'rgba(255,255,255,0.2)',
                          }}
                        />
                        <span className="capitalize font-mono text-[11px] tracking-wide text-zinc-300 group-hover:text-white">
                          {layer}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={activeLayers[layer]}
                        onChange={() => handleToggleLayer(layer)}
                        className="accent-rose-500 w-3.5 h-3.5 cursor-pointer rounded-[2px]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gizmo Toggle */}
          <button
            type="button"
            onClick={() => {
              playSound('toggle');
              setShowGizmo((prev) => !prev);
            }}
            title="Toggle 3D Viewport Gizmo"
            className={`p-1 rounded-[2px] border cursor-pointer transition-all ${
              showGizmo
                ? 'bg-[#2a2a2a] text-rose-400 border-rose-500/50'
                : 'bg-[#222222] text-zinc-500 border-[#383838] hover:text-zinc-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          {/* N-Panel (Properties Sidebar) Toggle Button */}
          <button
            type="button"
            onClick={() => {
              playSound('toggle');
              setNPanelOpen((prev) => !prev);
            }}
            title="Toggle Sidebar Properties [N]"
            className={`flex items-center gap-1 px-2 py-1 rounded-[2px] border cursor-pointer text-[10px] font-mono transition-all ${
              nPanelOpen
                ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)] font-bold'
                : 'bg-[#282828] border-[#3a3a3a] text-zinc-400 hover:text-white hover:bg-[#323232]'
            }`}
          >
            <Sliders className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">Sidebar</span>
            <kbd className="hidden md:inline px-1 py-0.2 bg-[#1a1a1a] rounded-[2px] text-[8px] text-zinc-400">N</kbd>
          </button>

          <div className="h-3.5 w-px bg-[#3e3e3e]" />

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <VolumeMax className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          {/* Reset Camera (Hotkey: R) */}
          <button
            type="button"
            onClick={handleResetView}
            title="Reset Camera View [R]"
            className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Exit 3D Viewport (Hotkey: Esc) */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onExit(currentPhaseMeta.chronicleId);
            }}
            title="Close 3D Viewport [Esc]"
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/50 transition-all cursor-pointer font-bold text-[10px]"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXIT</span>
          </button>
        </div>
      </header>

      {/* Visual Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed top-11 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-[2px] bg-[#1c1c1c]/95 backdrop-blur-md border border-rose-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_12px_rgba(244,63,94,0.25)] text-zinc-100 font-mono text-xs flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          BLENDER T-PANEL: LEFT TOOL SHELF (Toggle: T)
         ─────────────────────────────────────────────────────────────────── */}
      <div className="absolute left-2 top-11 z-30 flex items-start gap-1 pointer-events-none select-none">
        {/* Main Tool Column with smooth swipe / de-swipe transition */}
        <aside
          aria-label="Blender 3D Tool Shelf"
          className={`pointer-events-auto flex flex-col gap-1 p-1 bg-[#202020]/95 backdrop-blur-md border border-[#383838] rounded-[2px] shadow-2xl transition-all duration-300 ease-in-out ${
            tPanelOpen
              ? 'translate-x-0 opacity-100 pointer-events-auto'
              : '-translate-x-14 opacity-0 pointer-events-none'
          }`}
        >
          {/* Tool: Select Box (W) */}
          <ToolRailButton
            active={activeTool === 'select'}
            onClick={() => {
              playSound('click');
              setActiveTool('select');
            }}
            title="Select Box [W] (Click objects to inspect)"
          >
            <BlenderBoxIcon className={`w-4 h-4 ${activeTool === 'select' ? 'text-white' : 'text-zinc-300'}`} />
          </ToolRailButton>

          {/* Tool: 3D Cursor (C) */}
          <ToolRailButton
            active={activeTool === 'cursor'}
            onClick={() => {
              playSound('click');
              setActiveTool('cursor');
            }}
            title="3D Cursor [C]"
          >
            <CursorTargetIcon className={`w-4 h-4 ${activeTool === 'cursor' ? 'text-amber-300' : 'text-amber-400'}`} />
          </ToolRailButton>

          {/* Tool: Orbit / Turntable (Space) */}
          <ToolRailButton
            active={isAutoRotate}
            onClick={() => {
              playSound('toggle');
              setIsAutoRotate((prev) => !prev);
            }}
            title={isAutoRotate ? 'Turntable Running [Space]' : 'Turntable Auto-Rotate [Space]'}
          >
            <OrbitIcon className={`w-4 h-4 ${isAutoRotate ? 'text-rose-400 animate-spin' : 'text-zinc-300'}`} />
          </ToolRailButton>

          <div className="w-full h-px bg-[#383838] my-0.5" />

          {/* Tool: Visual Layers Popover */}
          <div className="relative">
            <ToolRailButton
              ref={leftLayersBtnRef}
              active={showLeftLayersMenu}
              onClick={() => {
                playSound('click');
                setShowLeftLayersMenu((prev) => !prev);
                setShowOverlaysMenu(false);
              }}
              ariaExpanded={showLeftLayersMenu}
              ariaHasPopup="dialog"
              title="Viewport Overlays & Layers"
            >
              <Layers className={`w-4 h-4 ${showLeftLayersMenu ? 'text-white' : 'text-zinc-300'}`} />
            </ToolRailButton>

            {/* Blender Layer / Overlays Menu */}
            {showLeftLayersMenu && (
              <div
                ref={leftLayersMenuRef}
                role="dialog"
                aria-label="Visual Layers Configuration"
                className="absolute left-full ml-2 top-0 w-52 p-2 bg-[#232323] border border-[#383838] rounded-[2px] shadow-2xl z-40 space-y-2 text-xs select-none"
              >
                <div className="flex items-center justify-between border-b border-[#383838] pb-1.5">
                  <span className="font-mono text-[10px] text-zinc-300 uppercase tracking-wider font-bold">
                    VIEWPORT LAYERS
                  </span>
                  <span className="font-mono text-[9px] text-zinc-400 bg-[#1a1a1a] px-1 py-0.2 rounded-[2px] border border-[#333]">
                    {Object.values(activeLayers).filter(Boolean).length}/5
                  </span>
                </div>

                <div className="space-y-0.5">
                  {(['geometry', 'trajectories', 'clusters', 'grid', 'annotations'] as const).map((layer) => (
                    <label
                      key={layer}
                      className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-[2px] hover:bg-white/[0.06] transition-colors select-none group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-[1px] transition-all duration-200"
                          style={{
                            backgroundColor: activeLayers[layer] ? '#f43f5e' : 'rgba(255,255,255,0.2)',
                          }}
                        />
                        <span className="capitalize font-mono text-[11px] tracking-wide text-zinc-300 group-hover:text-white">
                          {layer}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={activeLayers[layer]}
                        onChange={() => handleToggleLayer(layer)}
                        className="accent-rose-500 w-3.5 h-3.5 cursor-pointer rounded-[2px]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tool: Grid Quick Toggle [G] */}
          <ToolRailButton
            active={activeLayers.grid}
            onClick={() => handleToggleLayer('grid')}
            title={`Toggle Grid [G] (${activeLayers.grid ? 'Active' : 'Disabled'})`}
          >
            <Grid className={`w-4 h-4 ${activeLayers.grid ? 'text-white' : 'text-zinc-300'}`} />
          </ToolRailButton>

          {/* Tool: 3D Annotations Toggle */}
          <ToolRailButton
            active={showAnnotations}
            onClick={() => handleToggleLayer('annotations')}
            title="Toggle Spatial Annotations"
          >
            <Eye className={`w-4 h-4 ${showAnnotations ? 'text-white' : 'text-zinc-300'}`} />
          </ToolRailButton>

          {/* Tool: Zoom In (+) */}
          <ToolRailButton
            onClick={() => handleZoom('in')}
            title="Zoom In [Scroll Up]"
          >
            <Plus className="w-4 h-4 text-zinc-300" />
          </ToolRailButton>

          {/* Tool: Zoom Out (−) */}
          <ToolRailButton
            onClick={() => handleZoom('out')}
            title="Zoom Out [Scroll Down]"
          >
            <Minus className="w-4 h-4 text-zinc-300" />
          </ToolRailButton>

          {/* Tool: Reset View [R] */}
          <ToolRailButton
            onClick={handleResetView}
            title="Reset Viewport Camera [R]"
          >
            <RotateCcw className="w-4 h-4 text-zinc-300 hover:rotate-[-45deg] transition-transform" />
          </ToolRailButton>

          {/* Tool: Phase Overview Card Toggle */}
          <ToolRailButton
            active={showIntroCard}
            onClick={() => {
              playSound('toggle');
              setShowIntroCard((prev) => !prev);
            }}
            title={showIntroCard ? 'Hide Phase Specification' : 'Show Phase Specification'}
          >
            <Search className={`w-4 h-4 ${showIntroCard ? 'text-white' : 'text-zinc-300'}`} />
          </ToolRailButton>
        </aside>

        {/* Small T-Panel Tab to expand/collapse (Hotkey: T) */}
        <button
          type="button"
          onClick={() => {
            playSound('toggle');
            setTPanelOpen((prev) => !prev);
          }}
          title={`Toggle Toolbar [T] (${tPanelOpen ? 'Collapse' : 'Expand'})`}
          className="pointer-events-auto h-7 px-1.5 bg-[#202020]/90 hover:bg-[#2e2e2e] border border-[#383838] rounded-[2px] text-zinc-400 hover:text-white flex items-center justify-center text-[9px] font-mono transition-all duration-300 cursor-pointer shadow-md"
        >
          {tPanelOpen ? '◀' : 'T ▶'}
        </button>
      </div>

      {/* Contextual Phase Specification Card (Right-Hand Inspector Panel, keeping left toolbar 100% clear) */}
      {showIntroCard && (
        <aside
          role="region"
          aria-label="Phase Context Introduction"
          className={`absolute ${
            nPanelOpen ? 'right-[20.5rem]' : 'right-4'
          } top-12 z-30 w-80 max-w-[calc(100vw-2.5rem)] p-3.5 bg-[#202020]/95 backdrop-blur-xl border border-[#383838] rounded-[2px] shadow-2xl pointer-events-auto text-zinc-300 select-none animate-in fade-in duration-200`}
        >
          <div className="flex items-center justify-between border-b border-[#383838] pb-1.5 mb-2">
            <span className="font-mono text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              PHASE {currentPhaseMeta.numeral} // SPECIFICATION
            </span>
            <button
              type="button"
              onClick={() => setShowIntroCard(false)}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Close specification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="font-sans text-sm font-bold text-white uppercase leading-tight mb-0.5">
            {currentPhaseMeta.title}
          </h2>
          <p className="text-[11px] text-rose-300/90 font-mono font-semibold mb-2">{currentPhaseMeta.topic}</p>

          <p className="text-xs text-zinc-300 leading-relaxed mb-3">
            {currentPhaseMeta.description}
          </p>

          <div className="flex flex-col gap-1.5 pt-1 border-t border-[#333]">
            {onNavigateToLab && (
              <button
                type="button"
                onClick={() => {
                  playSound('nav');
                  onNavigateToLab(currentPhaseMeta.chronicleId);
                }}
                className="w-full py-1.5 px-3 rounded-[2px] bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.15] hover:border-rose-400 font-mono text-[11px] font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 group"
                title="Open detailed research theory, experiment derivation and notebook logs in Lab"
              >
                <span>READ THEORY IN LAB</span>
                <span className="text-rose-400 text-xs transition-transform group-hover:translate-x-0.5">↗</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowIntroCard(false);
              }}
              className="w-full py-1.5 px-3 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              DISMISS / EXPLORE
            </button>
          </div>
        </aside>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          BLENDER GIMBAL & VIEWPORT NAVIGATION DOCK
          Only shown floating on canvas when N-Panel is closed!
          When N-Panel is open, it docks seamlessly inside the N-Panel toolbar!
         ─────────────────────────────────────────────────────────────────── */}
      {showGizmo && !nPanelOpen && (
        <div
          className={`hidden sm:flex flex-col items-center gap-1.5 fixed ${
            showIntroCard ? 'top-[380px]' : 'top-12'
          } right-12 z-20 pointer-events-none select-none transition-all duration-300 animate-in fade-in duration-150`}
        >
          <div className="pointer-events-auto w-[68px] p-1.5 bg-[#1a1d24]/95 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-md shadow-2xl flex flex-col items-center gap-1.5">
            {/* Header Reticle with Dock Shortcut */}
            <div className="w-full flex items-center justify-between px-0.5 text-[8px] font-mono text-zinc-400 uppercase tracking-wider border-b border-white/[0.08] pb-1">
              <span className="font-semibold text-zinc-300">GIMBAL</span>
              <button
                type="button"
                onClick={() => {
                  playSound('toggle');
                  setNPanelOpen(true);
                }}
                title="Dock inside Sidebar [N]"
                className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer text-[7.5px] px-1 py-0.2 rounded hover:bg-white/[0.06]"
              >
                DOCK
              </button>
            </div>

            {/* Interactive Orientation Gimbal (Blender Style 3D Cube/Axis Dial) */}
            <div
              aria-label="3D Orientation Gizmo"
              className="relative w-14 h-14 rounded bg-[#13151b] border border-white/10 flex items-center justify-center shadow-inner group"
            >
              <div className="absolute w-1.5 h-1.5 rounded-full bg-white z-20 pointer-events-none" />
              <div
                ref={gizmoElRef}
                className="w-10 h-10 relative transform-gpu flex items-center justify-center pointer-events-none"
                style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 50% 0' }}
              >
                <div className="absolute top-1/2 left-1/2 w-3.5 h-[2px] bg-red-500 origin-left" />
                <div className="absolute top-1/2 left-1/2 w-[2px] h-3.5 bg-emerald-500 origin-bottom -translate-y-full" />
                <div
                  className="absolute top-1/2 left-1/2 w-3.5 h-[2px] bg-sky-400 origin-left"
                  style={{ transform: 'rotateY(90deg)' }}
                />
              </div>

              {/* Clickable Cardinal View Snap Buttons */}
              <button
                type="button"
                onClick={() => handleSnapAxis('x')}
                title="Snap to Right Ortho (+X)"
                className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red-600/90 hover:bg-red-500 text-[7px] font-bold text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
              >
                X
              </button>
              <button
                type="button"
                onClick={() => handleSnapAxis('y')}
                title="Snap to Top Ortho (+Y)"
                className="absolute top-0.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-[7px] font-bold text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
              >
                Y
              </button>
              <button
                type="button"
                onClick={() => handleSnapAxis('z')}
                title="Snap to Front Ortho (+Z)"
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-sky-600/90 hover:bg-sky-500 text-[7px] font-bold text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
              >
                Z
              </button>
            </div>

            {/* Blender Stacked Viewport Navigation Pills */}
            <div className="w-full flex flex-col gap-0.5 p-0.5 bg-[#13151b] border border-white/10 rounded">
              <button
                type="button"
                onClick={() => handleZoom('in')}
                title="Zoom In [Scroll Up]"
                className="w-full h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs font-bold"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleZoom('out')}
                title="Zoom Out [Scroll Down]"
                className="w-full h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs font-bold"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleResetView}
                title="Center View to Artifact [R]"
                className="w-full h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          BLENDER N-PANEL: RIGHT PROPERTIES SHELF (Toggle: N)
         ─────────────────────────────────────────────────────────────────── */}
      {/* Collapsed Tab Strip Handle on far right with clean non-overlapping spacing */}
      <button
        type="button"
        onClick={() => {
          playSound('toggle');
          setNPanelOpen(true);
        }}
        title="Open Properties Sidebar [N]"
        className={`hidden md:flex fixed right-0 top-12 z-30 w-7 py-3 px-1 bg-[#1a1d24]/95 hover:bg-[#222732] border-l border-y border-white/10 hover:border-rose-500/40 text-zinc-300 hover:text-white rounded-l-md shadow-2xl cursor-pointer flex-col items-center justify-center gap-1.5 transition-all duration-300 ease-in-out group ${
          nPanelOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100 pointer-events-auto'
        }`}
      >
        <ChevronLeft className="w-3.5 h-3.5 text-rose-400 transition-transform group-hover:-translate-x-0.5" />
        <span className="[writing-mode:vertical-lr] tracking-[0.25em] font-mono text-[9px] font-bold uppercase select-none text-zinc-300 group-hover:text-rose-200 transition-colors my-1">
          PROPERTIES
        </span>
        <kbd className="text-[7.5px] font-mono text-zinc-400 bg-white/[0.08] px-1 py-0.5 rounded-[2px] tracking-wider">
          N
        </kbd>
      </button>

      {/* Expanded N-Panel Sidebar with smooth swipe and de-swipe animation */}
      <aside
        role="region"
        aria-label="Blender 3D Properties Shelf"
        className={`fixed top-9 right-0 bottom-14 w-80 max-w-[85vw] bg-[#222222] border-l border-[#383838] z-30 flex flex-col font-sans select-none text-zinc-300 shadow-2xl transition-transform duration-300 ease-in-out ${
          nPanelOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
      >
          {/* N-Panel Tab Bar ([ Item ] [ Tool ] [ View ]) */}
          <div className="flex items-center justify-between bg-[#1c1c1c] border-b border-[#383838] px-1 h-7 shrink-0">
            <div className="flex items-center gap-0.5">
              {(['item', 'tool', 'view'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setActiveNTab(tab);
                  }}
                  className={`px-3 py-1 text-[11px] font-semibold capitalize rounded-t-[2px] cursor-pointer transition-colors ${
                    activeNTab === tab
                      ? 'bg-[#222222] text-white border-t-2 border-rose-500 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#262626]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Close Sidebar [N] */}
            <button
              type="button"
              onClick={() => {
                playSound('toggle');
                setNPanelOpen(false);
              }}
              title="Collapse Sidebar [N]"
              className="p-1 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-[2px] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Docked Viewport Navigation & Orientation Shelf (Purpose-built home in main toolbar) */}
          {showGizmo && (
            <div className="bg-[#181818] border-b border-[#353535] px-2.5 py-1.5 flex items-center justify-between gap-2.5 shrink-0 select-none">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  aria-label="3D Orientation Gizmo"
                  className="relative w-11 h-11 rounded-[2px] bg-[#222222] border border-[#3d3d3d] flex items-center justify-center shadow-inner group shrink-0"
                >
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-white z-20 pointer-events-none" />
                  <div
                    ref={dockedGizmoElRef}
                    className="w-8 h-8 relative transform-gpu flex items-center justify-center pointer-events-none"
                    style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 50% 0' }}
                  >
                    <div className="absolute top-1/2 left-1/2 w-3 h-[2px] bg-red-500 origin-left" />
                    <div className="absolute top-1/2 left-1/2 w-[2px] h-3 bg-emerald-500 origin-bottom -translate-y-full" />
                    <div
                      className="absolute top-1/2 left-1/2 w-3 h-[2px] bg-sky-400 origin-left"
                      style={{ transform: 'rotateY(90deg)' }}
                    />
                  </div>

                  {/* Cardinal Axis Snap Knobs */}
                  <button
                    type="button"
                    onClick={() => handleSnapAxis('x')}
                    title="Snap to Right Ortho (+X)"
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red-600/90 hover:bg-red-500 text-[7px] font-bold text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
                  >
                    X
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnapAxis('y')}
                    title="Snap to Top Ortho (+Y)"
                    className="absolute top-0.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-[7px] font-bold text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
                  >
                    Y
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnapAxis('z')}
                    title="Snap to Front Ortho (+Z)"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-sky-600/90 hover:bg-sky-500 text-[7px] font-bold text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
                  >
                    Z
                  </button>
                </div>

                <div className="min-w-0">
                  <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-wider block truncate">
                    VIEWPORT NAVIGATION
                  </span>
                  <span className="font-mono text-[8px] text-zinc-400 uppercase block truncate">
                    SNAP: ORTHO X / Y / Z
                  </span>
                </div>
              </div>

              {/* Viewport Zoom & Reset Controls */}
              <div className="flex items-center gap-1 bg-[#222222] border border-[#383838] p-0.5 rounded-[2px] shrink-0">
                <button
                  type="button"
                  onClick={() => handleZoom('in')}
                  title="Zoom In [Scroll Up]"
                  className="w-6 h-6 flex items-center justify-center rounded-[2px] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom('out')}
                  title="Zoom Out [Scroll Down]"
                  className="w-6 h-6 flex items-center justify-center rounded-[2px] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs font-bold"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  title="Center View to Artifact [R]"
                  className="w-6 h-6 flex items-center justify-center rounded-[2px] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* N-Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 no-scrollbar text-xs font-mono">
            {/* ── TAB 1: ITEM ── */}
            {activeNTab === 'item' && (
              <>
                {/* Rollout: Transform */}
                <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e]">
                  <button
                    type="button"
                    onClick={() => toggleRollout('transform')}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#282828] hover:bg-[#303030] text-zinc-200 font-bold text-[11px] tracking-wide cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-400">{openRollouts.transform ? '▼' : '▶'}</span>
                      <span>Transform</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500 font-normal">XYZ Euler</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetTransform();
                        }}
                        title="Reset Transform [Alt+G]"
                        className="text-[9px] text-zinc-400 hover:text-white px-1 py-0.5 rounded-[2px] hover:bg-white/[0.08] transition-colors"
                      >
                        Reset
                      </span>
                    </div>
                  </button>

                  {openRollouts.transform && (
                    <div className="p-2 space-y-2">
                      {/* Target Indicator */}
                      <div className="flex items-center justify-between text-[9px] pb-1 border-b border-[#2b2b2b]">
                        <span className="text-zinc-500 font-sans">Active Target</span>
                        <span className={selectedItem ? 'text-rose-400 font-bold truncate max-w-[170px]' : 'text-zinc-300 font-mono'}>
                          {selectedItem ? selectedItem.name : `Phase ${currentPhaseMeta.numeral} Root`}
                        </span>
                      </div>

                      {/* Location Controls */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-400 font-sans">Location</span>
                          <span className="text-[8px] text-zinc-500 font-mono">meters (m)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['x', 'y', 'z'] as const).map((axis) => {
                            const borderCol =
                              axis === 'x'
                                ? 'border-l-red-500 text-red-400'
                                : axis === 'y'
                                ? 'border-l-emerald-500 text-emerald-400'
                                : 'border-l-sky-500 text-sky-400';
                            return (
                              <div
                                key={axis}
                                className={`flex items-center bg-[#141414] border-l-2 ${borderCol} border border-[#333] px-1 py-0.5 rounded-[2px] focus-within:border-zinc-400 transition-colors`}
                              >
                                <span className="text-[9px] font-bold uppercase mr-1 select-none">{axis}</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={transformLocation[axis]}
                                  onChange={(e) => handleUpdateLocation(axis, parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent text-[10px] text-zinc-200 outline-none font-mono min-w-0"
                                  aria-label={`Location ${axis.toUpperCase()}`}
                                />
                                <span className="text-[9px] text-zinc-500 select-none ml-0.5">m</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Scale Controls */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-400 font-sans">Scale</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUniformScale(0.8)}
                              title="Scale Down 20%"
                              className="px-1 py-0.5 bg-[#222] hover:bg-[#333] text-zinc-400 hover:text-white rounded-[2px] text-[8px] cursor-pointer"
                            >
                              0.8x
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUniformScale(1.25)}
                              title="Scale Up 25%"
                              className="px-1 py-0.5 bg-[#222] hover:bg-[#333] text-zinc-400 hover:text-white rounded-[2px] text-[8px] cursor-pointer"
                            >
                              1.2x
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['x', 'y', 'z'] as const).map((axis) => (
                            <div
                              key={axis}
                              className="flex items-center bg-[#141414] border border-[#333] px-1 py-0.5 rounded-[2px] focus-within:border-zinc-400 transition-colors"
                            >
                              <span className="text-[9px] text-zinc-500 font-bold uppercase mr-1 select-none">{axis}</span>
                              <input
                                type="number"
                                step="0.05"
                                min="0.05"
                                max="10"
                                value={transformScale[axis]}
                                onChange={(e) => handleUpdateScale(axis, parseFloat(e.target.value) || 1)}
                                className="w-full bg-transparent text-[10px] text-zinc-200 outline-none font-mono min-w-0"
                                aria-label={`Scale ${axis.toUpperCase()}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Transform Actions */}
                      <div className="flex items-center gap-1 pt-1 border-t border-[#292929]">
                        <button
                          type="button"
                          onClick={handleResetTransform}
                          title="Reset Location to 0 and Scale to 1.0 [Alt+G / Alt+S]"
                          className="flex-1 py-1 px-1.5 bg-[#252525] hover:bg-[#323232] text-zinc-300 hover:text-white text-[10px] font-sans font-medium rounded-[2px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5 text-zinc-400" />
                          <span>Reset [Alt+G]</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateLocation('x', 0);
                            handleUpdateLocation('y', 0);
                            handleUpdateLocation('z', 0);
                            playSound('click');
                            showToast('Centered coordinates to [0, 0, 0]');
                          }}
                          title="Center Coordinates to [0, 0, 0]"
                          className="py-1 px-2.5 bg-[#252525] hover:bg-[#323232] text-zinc-400 hover:text-white text-[10px] font-sans rounded-[2px] transition-colors cursor-pointer"
                        >
                          Center
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rollout: Component Inspection (Active Object) */}
                <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e]">
                  <button
                    type="button"
                    onClick={() => toggleRollout('inspection')}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#282828] hover:bg-[#303030] text-zinc-200 font-bold text-[11px] tracking-wide cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-400">{openRollouts.inspection ? '▼' : '▶'}</span>
                      <span>Active Component</span>
                    </span>
                    <span className="text-[9px] text-rose-400 font-semibold uppercase">
                      {selectedItem ? selectedItem.type : 'NONE SELECTED'}
                    </span>
                  </button>

                  {openRollouts.inspection && (
                    <div className="p-2 space-y-2">
                      {selectedItem ? (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-white text-xs uppercase leading-tight font-sans">
                                {selectedItem.name}
                              </h3>
                              <p className="text-[10px] text-rose-300 mt-0.5 font-semibold">{selectedItem.role}</p>
                              <span className="text-[9px] text-zinc-400 block">{selectedItem.dimension}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyComponentData(selectedItem)}
                              title="Copy Component Specs [JSON]"
                              className="p-1 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-[2px] transition-colors cursor-pointer shrink-0"
                            >
                              {copiedComponentData ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-[#333]">
                            {Object.entries(selectedItem.properties).map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between py-0.5 border-b border-[#292929] text-[10px]">
                                <span className="text-zinc-400 uppercase">{k}</span>
                                <span className="text-zinc-200 font-semibold text-right truncate max-w-[150px]">{v}</span>
                              </div>
                            ))}
                          </div>

                          <p className="text-[11px] font-sans text-zinc-300 leading-relaxed p-1.5 rounded-[2px] bg-[#141414] border border-[#2d2d2d]">
                            {selectedItem.description}
                          </p>

                          <div className="grid grid-cols-2 gap-1 pt-1">
                            <button
                              type="button"
                              onClick={() => handleFocusCamera(selectedItem.worldPosition)}
                              className="py-1.5 px-2 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-sans text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>FOCUS [F]</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCycleNextComponent}
                              className="py-1.5 px-2 rounded-[2px] bg-[#2a2a2a] hover:bg-[#383838] text-zinc-200 hover:text-white font-sans text-[10px] uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>NEXT [TAB]</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleCopyComponentData(selectedItem)}
                              className="flex-1 py-1 px-2 rounded-[2px] bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-zinc-300 hover:text-white font-sans text-[9px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              <span>{copiedComponentData ? 'COPIED SPECS' : 'COPY SPECS'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem(null);
                                activeArtifactRef.current?.onSelectObject?.(null);
                              }}
                              className="py-1 px-2.5 rounded-[2px] bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-zinc-400 hover:text-white font-sans text-[9px] uppercase cursor-pointer"
                            >
                              DESELECT
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>Scene Nodes ({sceneInspectables.length})</span>
                            <button
                              type="button"
                              onClick={handleSelectFirstComponent}
                              className="text-[9px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Select Primary [Tab]
                            </button>
                          </div>

                          {/* Quick Component Picker List */}
                          <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5 no-scrollbar">
                            {sceneInspectables.length > 0 ? (
                              sceneInspectables.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    playSound('click');
                                    setSelectedItem(item);
                                    activeArtifactRef.current?.onSelectObject?.(item);
                                    handleFocusCamera(item.worldPosition);
                                    showToast(`Selected: ${item.name}`);
                                  }}
                                  className="w-full text-left p-1.5 rounded-[2px] bg-[#161616] hover:bg-[#252525] border border-[#2d2d2d] hover:border-rose-500/50 flex items-center justify-between transition-colors cursor-pointer group"
                                >
                                  <div className="min-w-0 pr-1">
                                    <span className="text-[10px] font-bold text-zinc-200 group-hover:text-white truncate block">
                                      {item.name}
                                    </span>
                                    <span className="text-[9px] text-zinc-500 group-hover:text-rose-300/80 truncate block">
                                      {item.role}
                                    </span>
                                  </div>
                                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-rose-400 shrink-0 transition-colors" />
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-2 text-zinc-500 text-[10px]">
                                No sub-components declared for this phase artifact.
                              </div>
                            )}
                          </div>

                          {/* Quick Add Probe button */}
                          <div className="pt-1 border-t border-[#2d2d2d]">
                            <button
                              type="button"
                              onClick={handleAddProbe}
                              className="w-full py-1.5 px-2 bg-[#1d1d1d] hover:bg-[#282828] border border-dashed border-[#383838] hover:border-rose-500/60 text-zinc-300 hover:text-white text-[10px] font-sans rounded-[2px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-rose-400" />
                              <span>Inject 3D Latent Coordinate Probe</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Rollout: Topology & Latent Math */}
                <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e]">
                  <button
                    type="button"
                    onClick={() => toggleRollout('topology')}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#282828] hover:bg-[#303030] text-zinc-200 font-bold text-[11px] tracking-wide cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-400">{openRollouts.topology ? '▼' : '▶'}</span>
                      <span>Topology & Math</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">PHASE {currentPhaseMeta.numeral}</span>
                  </button>

                  {openRollouts.topology && (
                    <div className="p-2 space-y-2">
                      <div className="flex items-center justify-between py-0.5 border-b border-[#292929] text-[10px]">
                        <span className="text-zinc-400 uppercase">OBJECT TYPE</span>
                        <span className="text-zinc-200 font-medium truncate max-w-[150px]">{currentPhaseMeta.objectType}</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 border-b border-[#292929] text-[10px]">
                        <span className="text-zinc-400 uppercase">BACKEND</span>
                        <span className="text-zinc-200 font-medium truncate max-w-[150px]">{currentPhaseMeta.computeBackend}</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 border-b border-[#292929] text-[10px]">
                        <span className="text-zinc-400 uppercase">CHRONICLE ID</span>
                        <button
                          type="button"
                          onClick={() => {
                            playSound('click');
                            onExit(currentPhaseMeta.chronicleId);
                          }}
                          title="Open Chronicle Entry for this Phase"
                          className="text-rose-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <span>{currentPhaseMeta.chronicleId}</span>
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Interactive 3-Metric Cards */}
                      {currentPhaseMeta.metricsSummary && (
                        <div>
                          <div className="text-[9px] text-zinc-500 font-sans mb-1 flex items-center justify-between">
                            <span>Mathematical Invariants</span>
                            <span className="text-[8px] text-zinc-500">[Click card to expand]</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {currentPhaseMeta.metricsSummary.map((m, idx) => {
                              const isExpanded = expandedMathCard === idx;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    playSound('toggle');
                                    setExpandedMathCard((prev) => (prev === idx ? null : idx));
                                  }}
                                  className={`p-1.5 rounded-[2px] text-center transition-all cursor-pointer ${
                                    isExpanded
                                      ? 'bg-rose-950/40 border border-rose-500 shadow-sm'
                                      : 'bg-[#141414] hover:bg-[#1c1c1c] border border-[#2e2e2e] hover:border-zinc-500'
                                  }`}
                                >
                                  <span className="text-[8px] text-zinc-400 uppercase block font-semibold truncate">{m.label}</span>
                                  <span className={`text-[10px] font-bold block mt-0.5 truncate ${isExpanded ? 'text-rose-300' : 'text-zinc-100'}`}>
                                    {m.value}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Expanded Math Detail Drawer */}
                      {expandedMathCard !== null && currentPhaseMeta.metricsSummary?.[expandedMathCard] && (() => {
                        const m = currentPhaseMeta.metricsSummary[expandedMathCard];
                        const detail = getMetricMathDetail(activePhaseId, expandedMathCard, m.label, m.value);
                        return (
                          <div className="p-2 rounded-[2px] bg-[#141414] border border-rose-900/60 space-y-1.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between border-b border-[#292929] pb-1">
                              <span className="text-[10px] font-bold text-rose-300">{detail.title}</span>
                              <button
                                type="button"
                                onClick={() => setExpandedMathCard(null)}
                                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>

                            {/* LaTeX / Math display */}
                            <div className="p-1.5 bg-[#0d0d0d] rounded-[2px] border border-[#282828] font-mono text-[9px] text-zinc-200 select-all overflow-x-auto no-scrollbar">
                              {detail.latex}
                            </div>

                            <p className="text-[9px] text-zinc-400 font-sans leading-relaxed">
                              {detail.description}
                            </p>

                            <div className="space-y-0.5 pt-0.5 border-t border-[#242424] text-[9px]">
                              {detail.details.map((d, i) => (
                                <div key={i} className="flex justify-between py-0.5 text-zinc-400">
                                  <span>{d.k}</span>
                                  <span className="text-zinc-200 font-semibold">{d.v}</span>
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyFormula(detail.latex)}
                              className="w-full mt-1 py-1 px-2 rounded-[2px] bg-[#1f1f1f] hover:bg-[#2b2b2b] text-zinc-300 hover:text-white text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Copy className="w-2.5 h-2.5 text-rose-400" />
                              <span>Copy Formula LaTeX</span>
                            </button>
                          </div>
                        );
                      })()}

                      {/* Deep Dive Theory in Lab button */}
                      <div className="pt-1.5 space-y-1.5 border-t border-[#292929]">
                        {onNavigateToLab && (
                          <button
                            type="button"
                            onClick={() => {
                              playSound('nav');
                              onNavigateToLab(currentPhaseMeta.chronicleId);
                            }}
                            className="w-full py-1.5 px-2 bg-gradient-to-r from-rose-950/60 to-rose-900/40 hover:from-rose-900/80 hover:to-rose-800/60 border border-rose-500/50 hover:border-rose-400 text-rose-200 hover:text-white text-[10px] font-mono font-semibold rounded-[2px] flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                            title="Navigate to Lab Chronicle to read full theoretical derivations, benchmarks, and experimental logs"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              <span>VIEW FULL THEORY IN LAB</span>
                            </span>
                            <ArrowUpRight className="w-3 h-3 text-rose-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleCopyMathSpec}
                          className="w-full py-1 px-2 bg-[#252525] hover:bg-[#323232] text-zinc-300 hover:text-white text-[10px] font-sans rounded-[2px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-rose-400" />
                          <span>Copy Complete Math Spec</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rollout: Scene Statistics */}
                <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e]">
                  <button
                    type="button"
                    onClick={() => toggleRollout('stats')}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-[#282828] hover:bg-[#303030] text-zinc-200 font-bold text-[11px] tracking-wide cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-400">{openRollouts.stats ? '▼' : '▶'}</span>
                      <span>Scene Statistics</span>
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold font-mono">{liveFps} FPS</span>
                  </button>

                  {openRollouts.stats && (
                    <div className="p-2 space-y-1 text-[10px]">
                      {/* Interactive Shading Mode Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const modes: Array<'rendered' | 'wireframe' | 'solid'> = ['rendered', 'wireframe', 'solid'];
                          const nextIdx = (modes.indexOf(shadingMode) + 1) % modes.length;
                          const nextMode = modes[nextIdx];
                          handleSetShadingMode(nextMode);
                          showToast(`Shading: ${nextMode.toUpperCase()} [Z]`);
                        }}
                        title="Cycle Viewport Shading Mode [Z]"
                        className="w-full flex items-center justify-between py-1 px-1.5 rounded-[2px] bg-[#141414] hover:bg-[#202020] border border-[#2b2b2b] hover:border-zinc-500/50 transition-colors text-left cursor-pointer group"
                      >
                        <span className="text-zinc-400 group-hover:text-zinc-300">Shading Mode</span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-bold uppercase text-[9px] px-1.5 py-0.5 rounded-[2px] ${
                              shadingMode === 'rendered'
                                ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                                : shadingMode === 'wireframe'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                                : 'bg-sky-950/70 text-sky-300 border border-sky-800/60'
                            }`}
                          >
                            {shadingMode}
                          </span>
                          <span className="text-[8px] text-zinc-500 font-mono">[Z]</span>
                        </div>
                      </button>

                      {/* Interactive Turntable Motor Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoRotate((prev) => {
                            const next = !prev;
                            playSound('toggle');
                            showToast(next ? 'Turntable Motor: ACTIVE (1.2 rad/s)' : 'Turntable Motor: IDLE');
                            return next;
                          });
                        }}
                        title="Toggle Orbit Turntable Rotation [Space]"
                        className="w-full flex items-center justify-between py-1 px-1.5 rounded-[2px] bg-[#141414] hover:bg-[#202020] border border-[#2b2b2b] hover:border-zinc-500/50 transition-colors text-left cursor-pointer group"
                      >
                        <span className="text-zinc-400 group-hover:text-zinc-300">Turntable Motor</span>
                        <div className="flex items-center gap-1.5">
                          {isAutoRotate && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          )}
                          <span className={`text-[9px] font-bold ${isAutoRotate ? 'text-rose-400' : 'text-zinc-500'}`}>
                            {isAutoRotate ? 'ACTIVE (1.2 rad/s)' : 'IDLE'}
                          </span>
                          <span className="text-[8px] text-zinc-500 font-mono">[Space]</span>
                        </div>
                      </button>

                      {/* Interactive Quality Tier Cycle */}
                      <button
                        type="button"
                        onClick={() => {
                          const tiers: QualityTier[] = ['low', 'medium', 'high'];
                          const nextIdx = (tiers.indexOf(activeTier) + 1) % tiers.length;
                          const nextTier = tiers[nextIdx];
                          setQualityMode(nextTier);
                          switchArtifact(activePhaseId, nextTier);
                          playSound('toggle');
                          showToast(`Quality Tier: ${nextTier.toUpperCase()}`);
                        }}
                        title="Cycle Graphics Tessellation Quality Tier"
                        className="w-full flex items-center justify-between py-1 px-1.5 rounded-[2px] bg-[#141414] hover:bg-[#202020] border border-[#2b2b2b] hover:border-zinc-500/50 transition-colors text-left cursor-pointer group"
                      >
                        <span className="text-zinc-400 group-hover:text-zinc-300">Quality Tier</span>
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-200 uppercase font-bold text-[9px] px-1.5 py-0.5 rounded-[2px] bg-[#222] border border-[#333]">
                            {activeTier}
                          </span>
                          <span className="text-[8px] text-zinc-500">↻</span>
                        </div>
                      </button>

                      {/* Graphics Context with Live Stats */}
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          showToast(`WebGL2 Hardware Accelerated | Triangles: ${liveTriangles.toLocaleString()} | Calls: ${liveDrawCalls}`);
                        }}
                        title="Inspect WebGL Context & Draw Calls"
                        className="w-full py-1 px-1.5 rounded-[2px] bg-[#141414] hover:bg-[#202020] border border-[#2b2b2b] hover:border-zinc-500/50 transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 group-hover:text-zinc-300">Graphics Context</span>
                          <span className="text-zinc-200 font-medium">WebGL2 / r128</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-0.5 font-mono">
                          <span>Triangles: {liveTriangles > 0 ? liveTriangles.toLocaleString() : '2,450'}</span>
                          <span>Draw Calls: {liveDrawCalls > 0 ? liveDrawCalls : '4'}</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── TAB 2: TOOL ── */}
            {activeNTab === 'tool' && (
              <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e] p-2 space-y-2">
                <div className="flex items-center gap-2 border-b border-[#383838] pb-1.5">
                  <span className="w-2 h-2 rounded-[1px] bg-rose-500" />
                  <span className="font-bold text-white uppercase text-[11px]">Active Tool: {activeTool}</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between py-0.5 border-b border-[#292929]">
                    <span className="text-zinc-400">Pick Raycaster</span>
                    <span className="text-zinc-200">Interactive Mesh Hit</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#292929]">
                    <span className="text-zinc-400">Hit Precision</span>
                    <span className="text-zinc-200">0.05 units</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-zinc-400">Camera Damping</span>
                    <span className="text-zinc-200">0.05 (Inertial)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: VIEW ── */}
            {activeNTab === 'view' && (
              <div className="space-y-2">
                {/* Rollout: Grid & Viewport Display */}
                <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e]">
                  <div className="px-2 py-1.5 bg-[#282828] border-b border-[#353535] text-zinc-200 font-bold text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-rose-400" />
                      <span>Grid & Viewport Display</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleLayer('grid')}
                      className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold transition-all cursor-pointer ${
                        activeLayers.grid
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-[#181818] border border-[#383838] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {activeLayers.grid ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  <div className="p-2 space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between py-1 border-b border-[#292929]">
                      <div>
                        <span className="text-zinc-200 font-medium block">Architectural Grid [G]</span>
                        <span className="text-[9px] text-zinc-500">2D dot-matrix & 3D ground perspective</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleLayer('grid')}
                        className="flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded-[2px] hover:bg-white/[0.04]"
                      >
                        <span className={`w-2 h-2 rounded-full ${activeLayers.grid ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-zinc-600'}`} />
                        <span className={activeLayers.grid ? 'text-rose-300 font-bold' : 'text-zinc-500'}>
                          {activeLayers.grid ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#292929]">
                      <span className="text-zinc-400">Background Pattern</span>
                      <span className="text-zinc-300 font-mono">Carbon Web Stripes</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#292929]">
                      <span className="text-zinc-400">Atmosphere Drift</span>
                      <span className="text-zinc-300 font-mono">28s Dynamic CSS</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-zinc-400">3D Spatial Fog</span>
                      <span className="text-zinc-300 font-mono">Exp2 (Depth 0.015)</span>
                    </div>
                  </div>
                </div>

                {/* Rollout: Camera Optics */}
                <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e] p-2 space-y-2">
                  <div className="flex items-center gap-2 border-b border-[#383838] pb-1.5">
                    <span className="font-bold text-white uppercase text-[11px]">Camera Optics</span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between py-0.5 border-b border-[#292929]">
                      <span className="text-zinc-400">Focal Length (FOV)</span>
                      <span className="text-zinc-200">46.0° Perspective</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-[#292929]">
                      <span className="text-zinc-400">Clip Start</span>
                      <span className="text-zinc-200">0.1 m</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-[#292929]">
                      <span className="text-zinc-400">Clip End</span>
                      <span className="text-zinc-200">100.0 m</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-[#292929]">
                      <span className="text-zinc-400">Navigation Gizmo</span>
                      <button
                        type="button"
                        onClick={() => setShowGizmo((prev) => !prev)}
                        className="text-rose-400 hover:underline cursor-pointer uppercase font-bold"
                      >
                        {showGizmo ? 'VISIBLE' : 'HIDDEN'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

      {/* ───────────────────────────────────────────────────────────────────
          BLENDER BOTTOM TIMELINE & STATUS BAR
         ─────────────────────────────────────────────────────────────────── */}
      <footer className="fixed bottom-0 inset-x-0 z-30 flex flex-col bg-[#1c1c1c] border-t border-[#383838] select-none pointer-events-auto">
        {/* Upper Track: Timeline Transport Controls & Keyframe Markers */}
        <div className="h-8 px-2 flex items-center justify-between border-b border-[#2e2e2e] bg-[#222222] text-xs">
          {/* Transport Controls (Blender Dope Sheet Transport) */}
          <div className="flex items-center gap-0.5">
            {/* Jump to First Phase (|<) */}
            <button
              type="button"
              onClick={() => handleSelectPhase(RESEARCH_PHASES[0].id)}
              title="First Phase [Shift+Left]"
              className="w-6 h-6 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-[10px]"
            >
              |◀
            </button>

            {/* Prev Phase (◀) */}
            <button
              type="button"
              onClick={handlePrevPhase}
              title="Previous Phase [Left Arrow]"
              className="w-6 h-6 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs"
            >
              ◀
            </button>

            {/* Play / Pause Turntable (Space) */}
            <button
              type="button"
              onClick={() => {
                playSound('toggle');
                setIsAutoRotate((prev) => !prev);
              }}
              title={isAutoRotate ? 'Pause Turntable [Space]' : 'Play Turntable [Space]'}
              className={`w-6 h-6 rounded-[2px] flex items-center justify-center cursor-pointer transition-colors ${
                isAutoRotate
                  ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {isAutoRotate ? '⏸' : '▶'}
            </button>

            {/* Next Phase (▶) */}
            <button
              type="button"
              onClick={handleNextPhase}
              title="Next Phase [Right Arrow]"
              className="w-6 h-6 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs"
            >
              ▶
            </button>

            {/* Jump to Last Phase (>|) */}
            <button
              type="button"
              onClick={() => handleSelectPhase(RESEARCH_PHASES[RESEARCH_PHASES.length - 1].id)}
              title="Last Phase [Shift+Right]"
              className="w-6 h-6 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-[10px]"
            >
              ▶|
            </button>

            <div className="h-4 w-px bg-[#3e3e3e] mx-1" />

            {/* Frame / Phase Number Display (Blender Header Style) */}
            <div className="flex items-center gap-1 font-mono text-[11px] bg-[#141414] border border-[#333] px-2 py-0.5 rounded-[2px]">
              <span className="text-zinc-500 font-semibold">PHASE:</span>
              <span className="text-rose-400 font-bold">
                0{RESEARCH_PHASES.findIndex((p) => p.id === activePhaseId) + 1}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">05</span>
            </div>
          </div>

          {/* Center: Keyframe Diamonds Scrubber Track */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {RESEARCH_PHASES.map((phase, idx) => {
              const isActive = phase.id === activePhaseId;
              return (
                <button
                  key={phase.id}
                  ref={(el) => {
                    phaseBtnRefs.current[phase.id] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectPhase(phase.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-[2px] transition-all cursor-pointer text-[11px] font-mono ${
                    isActive
                      ? 'bg-rose-900/60 text-white border border-rose-500 font-bold shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <span className={`text-[10px] ${isActive ? 'text-rose-400' : 'text-zinc-500'}`}>◆</span>
                  <span>0{idx + 1}</span>
                  <span className="hidden md:inline text-[10px] text-zinc-400 font-sans">{phase.shortName || phase.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Quick Settings / Fullscreen */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleFullscreen}
              title="Toggle Fullscreen"
              className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Lower Strip: Blender 20px Status Bar */}
        <div className="h-5 px-2 bg-[#181818] flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#252525] border border-[#383838] rounded-[2px] text-zinc-300">LMB</kbd>
              <span>Orbit</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#252525] border border-[#383838] rounded-[2px] text-zinc-300">MMB / Shift+LMB</kbd>
              <span>Pan</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#252525] border border-[#383838] rounded-[2px] text-zinc-300">Wheel</kbd>
              <span>Zoom</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#252525] border border-[#383838] rounded-[2px] text-zinc-300">G</kbd>
              <span>Grid</span>
            </span>
            <span className="hidden md:flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#252525] border border-[#383838] rounded-[2px] text-zinc-300">N</kbd>
              <span>Sidebar</span>
            </span>
            <span className="hidden md:flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#252525] border border-[#383838] rounded-[2px] text-zinc-300">T</kbd>
              <span>Toolbar</span>
            </span>
            <span className="hidden lg:flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#252525] border border-[#383838] rounded-[2px] text-zinc-300">Space</kbd>
              <span>Turntable</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-zinc-400 shrink-0">
            <span>{currentPhaseMeta.numeral} // {currentPhaseMeta.title}</span>
            <span>|</span>
            <span className="text-emerald-400">WebGL2</span>
          </div>
        </div>
      </footer>

      {/* ── Dedicated Full-Screen Research Entry / Phase Switching Transition System ── */}
      {(isInitialEntryLoading || isPhaseSwitching) && (
        <ResearchEntryLoader
          key={activePhaseId}
          isSceneReady={isInitialEntryLoading ? isSceneReady : !isLoadingGeometry}
          phaseTitle={currentPhaseMeta.title}
          phaseNumeral={currentPhaseMeta.numeral}
          minDurationMs={isInitialEntryLoading ? 1200 : 750}
          error={isInitialEntryLoading ? sceneInitError : null}
          onRetry={() => {
            setSceneInitError(null);
            setIsSceneReady(false);
            setInitAttempt((prev) => prev + 1);
          }}
          onAbort={() => onExit(currentPhaseMeta.chronicleId)}
          onTransitionComplete={() => {
            if (isInitialEntryLoading) {
              handleEntryTransitionComplete();
            } else {
              setIsPhaseSwitching(false);
            }
          }}
        />
      )}
    </div>
  );
};
