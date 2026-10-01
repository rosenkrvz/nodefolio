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
            ? 'bg-rose-600/90 text-white border-rose-400/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
            : 'bg-[#2a2a2a]/80 text-zinc-400 hover:text-white hover:bg-[#383838] border-[#3e3e3e]/80 hover:border-[#555]'
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
  isInitialEntry?: boolean;
}

// ─── Hardware & Performance Diagnostics ──────────────────────────────────────
const detectHardwareTier = (): QualityTier => {
  if (typeof window === 'undefined') return 'medium';
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const memory = typeof navigator !== 'undefined'
    ? (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4
    : 4;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768 ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Low for low-end devices (cores <= 4, memory <= 4, mobile/touch, or reduced motion)
  if (cores <= 4 || memory <= 4 || isMobile || prefersReducedMotion) {
    return 'low';
  }

  // Medium for high-end devices
  return 'medium';
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
  const box = new THREE.Box3().setFromObject(group);
  if (box.isEmpty()) return null;

  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  const radius = Math.max(size.x, size.y, size.z) * 0.5 || 6.0;

  const fovRad = (camera.fov * Math.PI) / 180;
  const aspect = viewportW / viewportH;

  // In portrait/mobile, Three.js fixed vertical FOV narrows horizontal FOV; scale distance outward
  const distanceScalar = isMobile ? Math.max(1.20, 1.04 / Math.sqrt(Math.max(aspect, 0.4))) : 1.24;
  const dist = (radius * distanceScalar) / Math.sin(fovRad / 2);

  // Optical compensation: center target on mobile phone since HUD is contextual; offset left on desktop
  const targetOffset = isMobile ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(-0.35, 0.15, 0);
  const target = center.clone().add(targetOffset);

  // Pitch camera at a pleasing technical isometric angle
  const pitchAngle = isMobile ? 0.36 : 0.44;
  const yawAngle = isMobile ? 0.20 : 0.28;

  const cameraPos = new THREE.Vector3(
    target.x + dist * Math.sin(yawAngle) * Math.cos(pitchAngle),
    target.y + dist * Math.sin(pitchAngle),
    target.z + dist * Math.cos(yawAngle) * Math.cos(pitchAngle)
  );

  return { cameraPos, target, radius };
};

export const ResearchCanvas3D: React.FC<ResearchCanvas3DProps> = ({
  initialPhaseId,
  onExit,
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
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
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
    const dist = camera.position.distanceTo(target) || 12;

    const endPos = target.clone();
    if (axis === 'x') endPos.x += dist;
    if (axis === 'y') endPos.y += dist;
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

  // Discrete Viewport Zoom
  const handleZoom = (direction: 'in' | 'out') => {
    playSound('hover');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const factor = direction === 'in' ? 0.75 : 1.35;
    const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor);
    camera.position.copy(controls.target).add(offset);
    controls.update();
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

  // Orientation Gizmo Ref (direct DOM style update to eliminate 60fps React re-renders)
  const gizmoElRef = useRef<HTMLDivElement | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const activeArtifactRef = useRef<PhaseArtifactInstance | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const phaseBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const layersMenuRef = useRef<HTMLDivElement>(null);
  const layersBtnRef = useRef<HTMLButtonElement>(null);

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

  // ── Auto-close Visual Layers Menu when clicking outside ───────────────────
  useEffect(() => {
    if (!showLayersMenu) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        layersMenuRef.current &&
        !layersMenuRef.current.contains(target) &&
        layersBtnRef.current &&
        !layersBtnRef.current.contains(target)
      ) {
        setShowLayersMenu(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [showLayersMenu]);

  // ── Professional Blender Keyboard Shortcuts (N, T, Z, Space, R, 1, 3, 7, Esc) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetView();
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
        if (showLayersMenu) {
          setShowLayersMenu(false);
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
  }, [activePhaseId, currentPhaseMeta.chronicleId, onExit, showLayersMenu, selectedItem, shadingMode]);

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
        activeArtifactRef.current.dispose();
        activeArtifactRef.current = null;
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

      // Apply initial layer toggles
      Object.entries(activeLayers).forEach(([layer, visible]) => {
        newArtifact.toggleLayer?.(layer as LayerType, visible);
      });

      // 3. Compute optimal dynamic framing
      const vw = containerRef.current?.clientWidth || window.innerWidth;
      const vh = containerRef.current?.clientHeight || window.innerHeight;
      const isMob = vw < 768;

      const framing = computeOptimalFraming(newArtifact.group, camera, vw, vh, isMob);
      if (framing) {
        camera.position.copy(framing.cameraPos);
        controls.target.copy(framing.target);
        controls.update();
      } else {
        camera.position.set(...newArtifact.defaultCameraPosition);
        controls.target.set(...newArtifact.defaultTarget);
        controls.update();
      }

      setLoadProgress(100);
      setTimeout(() => {
        setIsLoadingGeometry(false);
      }, 180);
    },
    [activeLayers]
  );

  // ── WebGL Initialization & Persistent Canvas Lifecycle ────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene setup with depth fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.022);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 3. WebGL Renderer with capped DPR for crisp high-framerate rendering
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
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
    controls.enabled = true;
    controlsRef.current = controls;

    // 5. Lighting Architecture: Scientific key, fill, and rim illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1f2, 1.4);
    keyLight.position.set(12, 18, 14);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbe123c, 0.85);
    fillLight.position.set(-14, -8, -10);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfb7185, 0.7);
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

    // 7. Window Resize Listener
    const onWindowResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onWindowResize);

    // 8. Animation & Render Loop with Camera Slerp
    let lastTime = performance.now();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth camera focusing transition
      const focus = cameraFocusTarget.current;
      if (focus.active) {
        focus.progress += delta * 2.8;
        const t = Math.min(focus.progress, 1);
        const ease = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(focus.startPos, focus.endPos, ease);
        controls.target.lerpVectors(focus.startTarget, focus.endTarget, ease);

        if (t >= 1) {
          focus.active = false;
        }
      }

      controls.update();

      // Update active 3D artifact
      if (activeArtifactRef.current) {
        activeArtifactRef.current.update(now * 0.001, delta);

        // Project 3D spatial annotations to screen coordinates if enabled
        if (showAnnotations && activeArtifactRef.current.getAnnotations) {
          const rawAnnots = activeArtifactRef.current.getAnnotations();
          const proj = rawAnnots.map((a) => {
            const v = a.position.clone();
            v.project(camera);
            const isBehind = v.z > 1.0;
            const screenX = ((v.x + 1) * width) / 2;
            const screenY = ((-v.y + 1) * height) / 2;
            return {
              id: a.id,
              label: a.label,
              sublabel: a.sublabel,
              screenX,
              screenY,
              visible: !isBehind && screenX > 20 && screenX < width - 20 && screenY > 60 && screenY < height - 60,
            };
          });
          setProjectedAnnotations(proj);
        }

        // Calculate 3D orientation gizmo transform matrix directly on ref (zero React state overhead)
        if (gizmoElRef.current) {
          const m = camera.matrixWorldInverse;
          gizmoElRef.current.style.transform = `matrix3d(${m.elements[0]}, ${m.elements[1]}, ${m.elements[2]}, 0, ${m.elements[4]}, ${m.elements[5]}, ${m.elements[6]}, 0, ${m.elements[8]}, ${m.elements[9]}, ${m.elements[10]}, 0, 0, 0, 0, 1)`;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', onWindowResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);

      if (activeArtifactRef.current) {
        activeArtifactRef.current.dispose();
      }
      controls.dispose();
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

  // Smooth camera focus to specific world coordinate
  const handleFocusCamera = (targetWorldPos: THREE.Vector3) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const offsetDir = camera.position.clone().sub(controls.target).normalize();
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
  };

  // Reset view to dynamic optimal framing
  const handleResetView = () => {
    playSound('secondaryClick');
    setSelectedItem(null);
    activeArtifactRef.current?.onSelectObject?.(null);

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const artifact = activeArtifactRef.current;
    if (!camera || !controls || !artifact) return;

    const vw = containerRef.current?.clientWidth || window.innerWidth;
    const vh = containerRef.current?.clientHeight || window.innerHeight;
    const isMob = vw < 768;

    const framing = computeOptimalFraming(artifact.group, camera, vw, vh, isMob);
    const endPos = framing ? framing.cameraPos : new THREE.Vector3(...artifact.defaultCameraPosition);
    const endTarget = framing ? framing.target : new THREE.Vector3(...artifact.defaultTarget);

    cameraFocusTarget.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos,
      startTarget: controls.target.clone(),
      endTarget,
      progress: 0,
    };
  };

  // Toggle individual visual layer
  const handleToggleLayer = (layer: LayerType) => {
    playSound('click');
    const nextState = !activeLayers[layer];
    setActiveLayers((prev) => ({ ...prev, [layer]: nextState }));

    if (layer === 'annotations') {
      setShowAnnotations(nextState);
    } else {
      activeArtifactRef.current?.toggleLayer?.(layer, nextState);
    }
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
      className="fixed inset-0 z-50 w-screen h-screen h-[100dvh] overflow-hidden bg-[#07090e] select-none text-zinc-100 font-body"
      style={{ touchAction: 'none' }}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

        {/* Ambient Vignette & Spatial Atmosphere */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(7,9,14,0.78)_100%)]" />

        {/* ── Technical Minimal Loader (for fast in-canvas phase transitions) ── */}
        {!isInitialEntryLoading && isLoadingGeometry && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#07090e]/75 backdrop-blur-md transition-opacity duration-200 pointer-events-none">
            <div className="px-5 py-4 rounded-xl bg-black/85 border border-white/10 shadow-2xl flex flex-col items-center gap-2 max-w-xs text-center">
              <span className="font-tech text-[10px] tracking-[0.25em] text-rose-400 font-semibold uppercase animate-pulse">
                INITIALIZING RESEARCH ARTIFACT // PHASE {currentPhaseMeta.numeral}
              </span>
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-150 rounded-full"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-400">{currentPhaseMeta.title}</span>
            </div>
          </div>
        )}

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
        className="fixed top-0 inset-x-0 h-9 z-30 bg-[#202020] border-b border-[#353535] text-zinc-300 font-mono text-[11px] px-2 flex items-center justify-between select-none pointer-events-auto shadow-md"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px))' }}
      >
        {/* Left Cluster: Editor Type, Mode Selector, Menus & Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Blender 3D Viewport Icon (Signature Orange Mesh Cube) */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#2a2a2a] border border-[#3e3e3e] text-[#e87d0d]">
            <BlenderBoxIcon className="w-3.5 h-3.5" />
            <span className="font-bold text-[10px] text-zinc-200 hidden sm:inline">3D Viewport</span>
          </div>

          {/* Mode Pill Dropdown: [ Object Mode ▾ ] */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#282828] hover:bg-[#323232] border border-[#3e3e3e] text-zinc-200 cursor-pointer">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_#f43f5e]" />
            <span className="font-semibold text-[10px] uppercase">Object Mode</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>

          {/* Blender Editor Menus (Desktop) */}
          <div className="hidden lg:flex items-center gap-0.5 text-zinc-400 text-[11px]">
            <button type="button" onClick={handleResetView} className="px-1.5 py-0.5 rounded-[2px] hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors">
              View
            </button>
            <button type="button" onClick={() => setSelectedItem(null)} className="px-1.5 py-0.5 rounded-[2px] hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors">
              Select
            </button>
            <button type="button" onClick={() => handleToggleLayer('grid')} className="px-1.5 py-0.5 rounded-[2px] hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors">
              Add
            </button>
            <button type="button" onClick={() => handleSetShadingMode(shadingMode === 'wireframe' ? 'rendered' : 'wireframe')} className="px-1.5 py-0.5 rounded-[2px] hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors">
              Mesh
            </button>
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

          {/* Viewport Overlays Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              ref={layersBtnRef}
              onClick={() => {
                playSound('toggle');
                setShowLayersMenu((prev) => !prev);
              }}
              title="Viewport Overlays Configuration"
              className={`flex items-center gap-1 px-2 py-1 rounded-[2px] border cursor-pointer text-[10px] font-mono transition-all ${
                showLayersMenu
                  ? 'bg-[#383838] border-[#555] text-white'
                  : 'bg-[#282828] border-[#3a3a3a] text-zinc-300 hover:text-white hover:bg-[#323232]'
              }`}
            >
              <Grid className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">Overlays</span>
              <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
            </button>

            {/* Overlays Popover Panel */}
            {showLayersMenu && (
              <div
                ref={layersMenuRef}
                role="dialog"
                aria-label="Viewport Overlays"
                className="absolute right-0 top-full mt-1 w-52 p-2.5 rounded-[2px] bg-[#222222] border border-[#3e3e3e] shadow-2xl z-50 space-y-2 text-xs font-mono select-none"
              >
                <div className="flex items-center justify-between border-b border-[#353535] pb-1.5">
                  <span className="font-bold text-zinc-200 text-[10px] uppercase">Viewport Overlays</span>
                  <span className="text-[9px] text-zinc-400 bg-[#1c1c1c] px-1 py-0.2 rounded-[2px]">
                    {Object.values(activeLayers).filter(Boolean).length}/5
                  </span>
                </div>
                <div className="space-y-1">
                  {(['geometry', 'trajectories', 'clusters', 'grid', 'annotations'] as const).map((layer) => (
                    <label
                      key={layer}
                      className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer py-0.5 px-1 rounded-[2px] hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="capitalize text-[11px]">{layer}</span>
                      <input
                        type="checkbox"
                        checked={activeLayers[layer]}
                        onChange={() => handleToggleLayer(layer)}
                        className="accent-rose-500 w-3 h-3 cursor-pointer rounded-[2px]"
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

      {/* ───────────────────────────────────────────────────────────────────
          BLENDER T-PANEL: LEFT TOOL SHELF (Toggle: T)
         ─────────────────────────────────────────────────────────────────── */}
      <div className="absolute left-2 top-11 z-30 flex items-start gap-1 pointer-events-none select-none">
        {/* Main Tool Column */}
        {tPanelOpen && (
          <aside
            aria-label="Blender 3D Tool Shelf"
            className="pointer-events-auto flex flex-col gap-1 p-1 bg-[#202020]/95 backdrop-blur-md border border-[#383838] rounded-[2px] shadow-2xl animate-in fade-in slide-in-from-left-2 duration-150"
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
              <BlenderBoxIcon className="w-4 h-4 text-zinc-200" />
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
              <CursorTargetIcon className="w-4 h-4 text-amber-400" />
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
                ref={layersBtnRef}
                active={showLayersMenu}
                onClick={() => {
                  playSound('click');
                  setShowLayersMenu((prev) => !prev);
                }}
                ariaExpanded={showLayersMenu}
                ariaHasPopup="dialog"
                title="Viewport Overlays & Layers"
              >
                <Layers className="w-4 h-4 text-zinc-300" />
              </ToolRailButton>

              {/* Blender Layer / Overlays Menu */}
              {showLayersMenu && (
                <div
                  ref={layersMenuRef}
                  role="dialog"
                  aria-label="Visual Layers Configuration"
                  className="absolute left-full ml-2 top-0 w-52 p-2 bg-[#232323] border border-[#3e3e3e] rounded-[2px] shadow-2xl z-40 space-y-2 text-xs select-none"
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

            {/* Tool: 3D Annotations Toggle */}
            <ToolRailButton
              active={showAnnotations}
              onClick={() => handleToggleLayer('annotations')}
              title="Toggle Spatial Annotations"
            >
              <Grid className="w-4 h-4 text-zinc-300" />
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
              <Search className="w-4 h-4 text-zinc-300" />
            </ToolRailButton>
          </aside>
        )}

        {/* Small T-Panel Tab to expand/collapse (Hotkey: T) */}
        <button
          type="button"
          onClick={() => {
            playSound('toggle');
            setTPanelOpen((prev) => !prev);
          }}
          title={`Toggle Toolbar [T] (${tPanelOpen ? 'Collapse' : 'Expand'})`}
          className="pointer-events-auto h-7 px-1 bg-[#202020]/90 hover:bg-[#2e2e2e] border border-[#383838] rounded-[2px] text-zinc-400 hover:text-white flex items-center justify-center text-[9px] font-mono transition-colors cursor-pointer"
        >
          {tPanelOpen ? '◀' : 'T ▶'}
        </button>
      </div>

      {/* Contextual Phase Specification Card (Left Floating, non-blocking) */}
      {showIntroCard && (
        <aside
          role="region"
          aria-label="Phase Context Introduction"
          className="absolute left-14 top-12 z-30 w-80 max-w-[calc(100vw-4rem)] p-3 bg-[#202020]/95 backdrop-blur-xl border border-[#383838] rounded-[2px] shadow-2xl pointer-events-auto text-zinc-300 select-none animate-in fade-in duration-200"
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
        </aside>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          BLENDER TOP-RIGHT NAVIGATION GIZMO & VIEW CONTROLS
          Slides dynamically to stay left of N-Panel when open!
         ─────────────────────────────────────────────────────────────────── */}
      {showGizmo && (
        <div
          className={`hidden sm:flex flex-col items-center gap-1.5 absolute top-11 z-20 pointer-events-none select-none transition-all duration-200 ${
            nPanelOpen ? 'right-[330px]' : 'right-3'
          }`}
        >
          {/* Interactive Orientation Gimbal (Blender Style 3D Cube/Axis Dial) */}
          <div
            aria-label="3D Orientation Gizmo"
            className="relative w-16 h-16 pointer-events-auto rounded-[2px] bg-[#202020]/90 backdrop-blur-md border border-[#383838] flex items-center justify-center shadow-lg group"
          >
            {/* Center Origin Dot */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white z-20 pointer-events-none" />

            {/* 3D Rotating Coordinate Axes linked to OrbitControls */}
            <div
              ref={gizmoElRef}
              className="w-12 h-12 relative transform-gpu flex items-center justify-center pointer-events-none"
              style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 50% 0' }}
            >
              {/* +X (Red) */}
              <div className="absolute top-1/2 left-1/2 w-4 h-[2px] bg-red-500 origin-left" />
              {/* +Y (Green) */}
              <div className="absolute top-1/2 left-1/2 w-[2px] h-4 bg-emerald-500 origin-bottom -translate-y-full" />
              {/* +Z (Blue) */}
              <div
                className="absolute top-1/2 left-1/2 w-4 h-[2px] bg-sky-400 origin-left"
                style={{ transform: 'rotateY(90deg)' }}
              />
            </div>

            {/* Clickable Cardinal View Snap Buttons (Blender Axis Knobs) */}
            <button
              type="button"
              onClick={() => handleSnapAxis('x')}
              title="Snap to Right Ortho (+X)"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-600/90 hover:bg-red-500 text-[8px] font-bold text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-90"
            >
              X
            </button>
            <button
              type="button"
              onClick={() => handleSnapAxis('y')}
              title="Snap to Top Ortho (+Y)"
              className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-[8px] font-bold text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-90"
            >
              Y
            </button>
            <button
              type="button"
              onClick={() => handleSnapAxis('z')}
              title="Snap to Front Ortho (+Z)"
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-sky-600/90 hover:bg-sky-500 text-[8px] font-bold text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-90"
            >
              Z
            </button>
          </div>

          {/* Blender Stacked Viewport Navigation Pills */}
          <div className="pointer-events-auto flex flex-col gap-0.5 p-0.5 bg-[#202020]/90 backdrop-blur-md border border-[#383838] rounded-[2px] shadow-md">
            {/* Zoom In (+) */}
            <button
              type="button"
              onClick={() => handleZoom('in')}
              title="Zoom In [Scroll Up]"
              className="w-6 h-6 flex items-center justify-center rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs font-bold"
            >
              +
            </button>

            {/* Zoom Out (-) */}
            <button
              type="button"
              onClick={() => handleZoom('out')}
              title="Zoom Out [Scroll Down]"
              className="w-6 h-6 flex items-center justify-center rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs font-bold"
            >
              −
            </button>

            {/* Reset Camera */}
            <button
              type="button"
              onClick={handleResetView}
              title="Center View to Artifact [R]"
              className="w-6 h-6 flex items-center justify-center rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          BLENDER N-PANEL: RIGHT PROPERTIES SHELF (Toggle: N)
         ─────────────────────────────────────────────────────────────────── */}
      {/* Collapsed Tab Strip Handle on far right if closed */}
      {!nPanelOpen && (
        <button
          type="button"
          onClick={() => {
            playSound('toggle');
            setNPanelOpen(true);
          }}
          title="Open Properties Sidebar [N]"
          className="hidden md:flex absolute right-0 top-11 z-30 py-2 px-1 bg-[#202020]/90 hover:bg-[#282828] border-l border-y border-[#383838] text-zinc-400 hover:text-white text-[10px] font-mono rounded-l-[2px] shadow-lg cursor-pointer flex-col items-center gap-1.5"
        >
          <span className="text-rose-400">◀</span>
          <span className="[writing-mode:vertical-lr] tracking-widest font-semibold">PROPERTIES</span>
        </button>
      )}

      {/* Expanded N-Panel Sidebar */}
      {nPanelOpen && (
        <aside
          role="region"
          aria-label="Blender 3D Properties Shelf"
          className="fixed top-9 right-0 bottom-14 w-80 max-w-[85vw] bg-[#222222] border-l border-[#383838] z-30 flex flex-col font-sans select-none text-zinc-300 shadow-2xl animate-in slide-in-from-right duration-200"
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
                    <span className="text-[9px] text-zinc-500 font-normal">XYZ Euler</span>
                  </button>

                  {openRollouts.transform && (
                    <div className="p-2 space-y-1.5">
                      {/* Location */}
                      <div>
                        <span className="text-[10px] text-zinc-400 font-sans block mb-0.5">Location</span>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="flex items-center bg-[#141414] border-l-2 border-l-red-500 border border-[#333] px-1 py-0.5 rounded-[2px]">
                            <span className="text-[9px] text-red-400 font-bold mr-1">X</span>
                            <span className="text-[10px] text-zinc-200 truncate">
                              {selectedItem ? (selectedItem.worldPosition?.[0] ?? 0).toFixed(2) : '0.00 m'}
                            </span>
                          </div>
                          <div className="flex items-center bg-[#141414] border-l-2 border-l-emerald-500 border border-[#333] px-1 py-0.5 rounded-[2px]">
                            <span className="text-[9px] text-emerald-400 font-bold mr-1">Y</span>
                            <span className="text-[10px] text-zinc-200 truncate">
                              {selectedItem ? (selectedItem.worldPosition?.[1] ?? 0).toFixed(2) : '0.00 m'}
                            </span>
                          </div>
                          <div className="flex items-center bg-[#141414] border-l-2 border-l-sky-500 border border-[#333] px-1 py-0.5 rounded-[2px]">
                            <span className="text-[9px] text-sky-400 font-bold mr-1">Z</span>
                            <span className="text-[10px] text-zinc-200 truncate">
                              {selectedItem ? (selectedItem.worldPosition?.[2] ?? 0).toFixed(2) : '0.00 m'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scale */}
                      <div>
                        <span className="text-[10px] text-zinc-400 font-sans block mb-0.5">Scale</span>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <div className="flex items-center bg-[#141414] border border-[#333] px-1 py-0.5 rounded-[2px]">
                            <span className="text-zinc-500 mr-1">X</span>
                            <span className="text-zinc-300">1.000</span>
                          </div>
                          <div className="flex items-center bg-[#141414] border border-[#333] px-1 py-0.5 rounded-[2px]">
                            <span className="text-zinc-500 mr-1">Y</span>
                            <span className="text-zinc-300">1.000</span>
                          </div>
                          <div className="flex items-center bg-[#141414] border border-[#333] px-1 py-0.5 rounded-[2px]">
                            <span className="text-zinc-500 mr-1">Z</span>
                            <span className="text-zinc-300">1.000</span>
                          </div>
                        </div>
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
                          <div>
                            <h3 className="font-bold text-white text-xs uppercase leading-tight font-sans">
                              {selectedItem.name}
                            </h3>
                            <p className="text-[10px] text-rose-300 mt-0.5 font-semibold">{selectedItem.role}</p>
                            <span className="text-[9px] text-zinc-400 block">{selectedItem.dimension}</span>
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

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleFocusCamera(selectedItem.worldPosition)}
                              className="flex-1 py-1.5 px-2 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-sans text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>FOCUS IN 3D</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem(null);
                                activeArtifactRef.current?.onSelectObject?.(null);
                              }}
                              className="py-1.5 px-2.5 rounded-[2px] bg-[#2a2a2a] hover:bg-[#383838] text-zinc-300 hover:text-white font-sans text-[11px] uppercase cursor-pointer"
                            >
                              DESELECT
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-3 text-zinc-500 text-[11px] font-sans">
                          Select any node or component in the 3D viewport to inspect its properties.
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
                    <div className="p-2 space-y-1.5">
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
                        <span className="text-rose-400 font-bold">{currentPhaseMeta.chronicleId}</span>
                      </div>

                      {currentPhaseMeta.metricsSummary && (
                        <div className="grid grid-cols-3 gap-1 pt-1.5">
                          {currentPhaseMeta.metricsSummary.map((m, idx) => (
                            <div key={idx} className="p-1 rounded-[2px] bg-[#141414] border border-[#2e2e2e] text-center">
                              <span className="text-[8px] text-zinc-400 uppercase block font-semibold truncate">{m.label}</span>
                              <span className="text-[10px] text-zinc-100 font-bold block mt-0.5 truncate">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
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
                    <span className="text-[9px] text-emerald-400 font-bold">60 FPS</span>
                  </button>

                  {openRollouts.stats && (
                    <div className="p-2 space-y-1 text-[10px]">
                      <div className="flex justify-between py-0.5 border-b border-[#292929]">
                        <span className="text-zinc-400">Shading Mode</span>
                        <span className="text-zinc-200 uppercase font-bold">{shadingMode}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-[#292929]">
                        <span className="text-zinc-400">Turntable Motor</span>
                        <span className={isAutoRotate ? 'text-rose-400 font-bold' : 'text-zinc-500'}>
                          {isAutoRotate ? 'ACTIVE (1.2 rad/s)' : 'IDLE'}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-[#292929]">
                        <span className="text-zinc-400">Quality Tier</span>
                        <span className="text-zinc-200 uppercase font-bold">{activeTier}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-zinc-400">Graphics Context</span>
                        <span className="text-zinc-200">WebGL2 / r128</span>
                      </div>
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
              <div className="border border-[#383838] rounded-[2px] bg-[#1e1e1e] p-2 space-y-2">
                <div className="flex items-center gap-2 border-b border-[#383838] pb-1.5">
                  <span className="font-bold text-white uppercase text-[11px]">View Properties</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between py-0.5 border-b border-[#292929]">
                    <span className="text-zinc-400">Focal Length (FOV)</span>
                    <span className="text-zinc-200">45.0°</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#292929]">
                    <span className="text-zinc-400">Clip Start</span>
                    <span className="text-zinc-200">0.1 m</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#292929]">
                    <span className="text-zinc-400">Clip End</span>
                    <span className="text-zinc-200">1000.0 m</span>
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
            )}
          </div>
        </aside>
      )}

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

          {/* Right: Active Phase Thumbnail & Quick Settings */}
          <div className="flex items-center gap-1.5">
            <div className="hidden lg:block w-7 h-5 overflow-hidden rounded-[1px] border border-[#383838]">
              <MiniArtifactPreview phaseId={activePhaseId} active={true} className="w-full h-full" />
            </div>

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

      {/* ── Dedicated Full-Screen Research Entry System (Section-to-Research) ── */}
      {isInitialEntryLoading && (
        <ResearchEntryLoader
          isSceneReady={isSceneReady}
          phaseTitle={currentPhaseMeta.title}
          phaseNumeral={currentPhaseMeta.numeral}
          minDurationMs={1200}
          error={sceneInitError}
          onRetry={() => {
            setSceneInitError(null);
            setIsSceneReady(false);
            setInitAttempt((prev) => prev + 1);
          }}
          onAbort={() => onExit(currentPhaseMeta.chronicleId)}
          onTransitionComplete={handleEntryTransitionComplete}
        />
      )}
    </div>
  );
};
