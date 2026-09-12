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

// ─── GPU-Optimized Tool Rail Button with Slow Light-Up & Animated Aura ───────
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
        className="relative p-2.5 rounded-xl cursor-pointer group select-none active:scale-95 will-change-transform transform-gpu"
      >
        {/* Layer 1: GPU-Accelerated Outer Bloom Halo (Animated Breathing Pulse) */}
        <span
          aria-hidden="true"
          className={`absolute inset-[-4px] rounded-2xl bg-rose-500/35 blur-md pointer-events-none transform-gpu transition-opacity duration-700 ease-out ${
            active ? 'opacity-100 animate-pulse' : 'opacity-0'
          }`}
        />

        {/* Layer 2: GPU-Accelerated Core Light-Up Illumination Layer (Smooth 600ms Bloom) */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-400 pointer-events-none transform-gpu transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_18px_rgba(244,63,94,0.65),inset_0_1px_1.5px_rgba(255,255,255,0.4)] ring-1 ring-rose-400/60 ${
            active ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />

        {/* Layer 3: Hover Backdrop for Inactive State */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-xl bg-white/[0.08] pointer-events-none transition-opacity duration-300 ${
            !active ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          }`}
        />

        {/* Layer 4: Icon with Photon Drop-Shadow & Subtle Scale Elevation */}
        <span
          className={`relative z-10 block transition-all duration-500 ease-out transform-gpu ${
            active
              ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] scale-105'
              : 'text-zinc-400 group-hover:text-zinc-100 scale-100'
          }`}
        >
          {children}
        </span>
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(false);
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

  // ── Keyboard Shortcuts: R for Reset, Left/Right for Phases, Esc for Exit ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetView();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (showLayersMenu) {
          setShowLayersMenu(false);
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
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (RESEARCH_PHASES[idx]) {
          handleSelectPhase(RESEARCH_PHASES[idx].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhaseId, currentPhaseMeta.chronicleId, onExit]);

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
            setMobileSheetOpen(true);
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

      {/* ───────────────────────────────────────────────────────────────────
          ZONE A: TOP RESEARCH INSTRUMENT HEADER (Cockpit Utility Bar)
         ─────────────────────────────────────────────────────────────────── */}
      {/* ── DESKTOP & TABLET COCKPIT HEADER (≥ md: 768px+) ── */}
      <header
        aria-label="3D Research Canvas Navigation"
        className="hidden md:flex absolute top-0 inset-x-0 z-30 items-center justify-between px-3 sm:px-6 py-3 pointer-events-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        {/* Left: Unified Instrument Metadata Pod */}
        <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-zinc-950/80 backdrop-blur-2xl border border-white/[0.1] shadow-[0_8px_30px_rgba(0,0,0,0.6)] pointer-events-auto select-none">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          </span>
          <span className="font-tech text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-rose-400 uppercase whitespace-nowrap">
            PHASE {currentPhaseMeta.numeral}
          </span>
          <span className="h-3 w-px bg-white/15" />
          <span className="font-display text-xs sm:text-sm font-semibold tracking-wide text-white uppercase truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
            {currentPhaseMeta.title}
          </span>
          <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
            {currentPhaseMeta.dimension}
          </span>

          <span className="h-3.5 w-px bg-white/15 mx-0.5" />

          {/* Relocated Info Button with Magnifying Glass */}
          <button
            type="button"
            onClick={() => {
              playSound('toggle');
              setShowIntroCard((prev) => !prev);
            }}
            title={showIntroCard ? 'Hide Phase Specification' : 'View Phase Specification'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-tech uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
              showIntroCard
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)] font-semibold'
                : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-rose-400" />
            <span>INFO</span>
          </button>
        </div>

        {/* Center: Quality Selector */}
        <div className="hidden md:flex items-center px-1.5 h-10 rounded-xl bg-zinc-950/80 backdrop-blur-2xl border border-white/[0.1] shadow-[0_8px_30px_rgba(0,0,0,0.6)] pointer-events-auto select-none">
          {/* Segmented Quality Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] gap-0.5">
            {(['auto', 'high', 'medium', 'low'] as const).map((tier) => {
              const isSelected = qualityMode === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setQualityMode(tier);
                    const effective = tier === 'auto' ? detectedTierRef.current : tier;
                    switchArtifact(activePhaseId, effective);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {tier === 'medium' ? 'MED' : tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Camera Reset, Sound & Exit Command Cluster */}
        <div className="flex items-center gap-1 px-1.5 h-10 rounded-xl bg-zinc-950/80 backdrop-blur-2xl border border-white/[0.1] shadow-[0_8px_30px_rgba(0,0,0,0.6)] pointer-events-auto select-none">
          {/* Audio Mute / Unmute Toggle */}
          <button
            type="button"
            onClick={() => {
              toggleMute();
            }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <VolumeMax className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>

          <span className="h-3.5 w-px bg-white/10 hidden sm:block" />

          {/* Camera Reset */}
          <button
            type="button"
            onClick={handleResetView}
            title="Reset to Overview Camera (Hotkey: R)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-tech text-xs tracking-wider">RESET</span>
            <kbd className="hidden md:inline px-1 py-0.2 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] font-mono text-zinc-400">
              R
            </kbd>
          </button>

          <span className="h-3.5 w-px bg-white/10 hidden sm:block" />

          {/* Exit Canvas */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onExit(currentPhaseMeta.chronicleId);
            }}
            aria-label="Exit 3D Research Canvas"
            title="Exit 3D Canvas (Hotkey: Esc)"
            className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 hover:border-rose-500/60 text-rose-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_14px_rgba(244,63,94,0.18)] active:scale-95"
          >
            <X className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-colors" />
            <span className="font-tech text-xs font-bold tracking-widest">EXIT</span>
            <kbd className="hidden md:inline px-1 py-0.2 rounded bg-rose-500/20 border border-rose-500/30 text-[9px] font-mono text-rose-300">
              ESC
            </kbd>
          </button>
        </div>
      </header>

      {/* ── PHONE-ONLY COMPACT COCKPIT HEADER (< md: < 768px) ── */}
      <header
        aria-label="Mobile 3D Research Navigation"
        className="md:hidden absolute top-0 inset-x-0 z-30 flex items-center justify-between px-2.5 py-2 pointer-events-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
      >
        {/* Left: Phase Numeral & Full Title */}
        <div className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.7)] pointer-events-auto select-none min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          </span>
          <span className="font-tech text-[10px] font-bold tracking-[0.16em] text-rose-400 uppercase shrink-0">
            PHASE {currentPhaseMeta.numeral}
          </span>
          <span className="h-3 w-px bg-white/15 shrink-0" />
          <span className="font-display text-[11px] min-[360px]:text-xs font-semibold tracking-wide text-white uppercase truncate max-w-[140px] min-[360px]:max-w-[180px]">
            {currentPhaseMeta.title}
          </span>
        </div>

        {/* Right: Info Toggle, Audio & Exit */}
        <div className="flex items-center gap-1 px-1.5 h-9 rounded-xl bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.7)] pointer-events-auto select-none shrink-0 ml-1.5">
          {/* Mobile Info Button (Toggles Bottom Sheet) */}
          <button
            type="button"
            onClick={() => {
              playSound('toggle');
              setMobileSheetOpen((prev) => !prev);
            }}
            aria-label={mobileSheetOpen ? 'Close specification sheet' : 'Open specification sheet'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-tech uppercase tracking-wider transition-all cursor-pointer active:scale-95 min-h-[30px] ${
              mobileSheetOpen
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] font-semibold'
                : 'bg-white/[0.06] text-zinc-300 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Search className="w-3 h-3 text-rose-400" />
            <span>INFO</span>
          </button>

          {/* Audio Mute / Unmute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <VolumeMax className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>

          <span className="h-3 w-px bg-white/15" />

          {/* Exit Canvas */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onExit(currentPhaseMeta.chronicleId);
            }}
            aria-label="Exit 3D Research Canvas"
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────
          ZONE B: LEFT FUNCTIONAL TOOL RAIL & INTRO CARD
         ─────────────────────────────────────────────────────────────────── */}
      {/* Desktop Vertical Tool Rail */}
      <nav
        aria-label="Canvas Exploration Tools"
        className="hidden md:flex flex-col gap-1.5 absolute left-4 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto"
      >
        {/* Tool 1: Cinematic Turntable / Auto-Rotate */}
        <ToolRailButton
          active={isAutoRotate}
          onClick={() => {
            playSound('toggle');
            setIsAutoRotate((prev) => !prev);
          }}
          title={isAutoRotate ? 'Pause Turntable Auto-Rotate' : 'Cinematic Turntable (Auto-Rotate)'}
        >
          <OrbitIcon className="w-4 h-4" />
        </ToolRailButton>

        {/* Tool 2: Phase Overview & Specification Info Card */}
        <ToolRailButton
          active={showIntroCard}
          onClick={() => {
            playSound('toggle');
            setShowIntroCard((prev) => !prev);
          }}
          title={showIntroCard ? 'Hide Phase Specification' : 'Show Phase Specification'}
        >
          <Search className="w-4 h-4" />
        </ToolRailButton>

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
            title="Toggle Visual Layers"
          >
            <Layers className="w-4 h-4" />
          </ToolRailButton>

          {/* Interactive Layers Menu Popover with Smooth Cinematic Animation */}
          <div
            ref={layersMenuRef}
            role="dialog"
            aria-label="Visual Layers Configuration"
            aria-hidden={!showLayersMenu}
            className={`absolute left-full ml-3 top-0 w-52 p-3.5 rounded-2xl bg-black/95 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.75),0_0_16px_rgba(225,29,72,0.15)] z-40 space-y-2.5 text-xs origin-top-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
              showLayersMenu
                ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto'
                : 'opacity-0 scale-90 -translate-x-3 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-tech text-zinc-300 uppercase tracking-widest font-bold">
                  VISUAL LAYERS
                </span>
              </div>
              <span className="font-mono text-[9px] text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
                {Object.values(activeLayers).filter(Boolean).length}/5
              </span>
            </div>

            <div className="space-y-1">
              {(['geometry', 'trajectories', 'clusters', 'grid', 'annotations'] as const).map((layer) => (
                <label
                  key={layer}
                  className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white/[0.06] transition-colors select-none group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor: activeLayers[layer] ? '#f43f5e' : 'rgba(255,255,255,0.2)',
                        boxShadow: activeLayers[layer] ? '0 0 6px #f43f5e' : 'none',
                      }}
                    />
                    <span className="capitalize font-medium text-xs tracking-wide group-hover:text-white">
                      {layer}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeLayers[layer]}
                    onChange={() => handleToggleLayer(layer)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer rounded transition-transform active:scale-90"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tool 4: 3D Annotations */}
        <ToolRailButton
          active={showAnnotations}
          onClick={() => handleToggleLayer('annotations')}
          title="Toggle 3D Coordinate Annotations"
        >
          <Grid className="w-4 h-4" />
        </ToolRailButton>

        <div className="w-full h-px bg-white/10 my-0.5" />

        {/* Tool 5: Reset Camera View */}
        <button
          type="button"
          onClick={handleResetView}
          title="Reset Camera View [R]"
          className="relative p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group active:scale-90 will-change-transform transform-gpu"
        >
          <RotateCcw className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-45" />
        </button>
      </nav>

      {/* 3D Orientation Gizmo (Bottom-Left Corner) */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute left-4 bottom-24 z-20 pointer-events-none select-none"
      >
        <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
          <div
            ref={gizmoElRef}
            className="w-8 h-8 relative transform-gpu"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* X Axis (Red) */}
            <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-rose-500 origin-left" />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-bold text-rose-400 font-mono">X</span>

            {/* Y Axis (Green) */}
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-emerald-500 origin-top -translate-y-4" />
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-400 font-mono">Y</span>

            {/* Z Axis (Blue) */}
            <div
              className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-sky-500 origin-left"
              style={{ transform: 'rotateY(90deg)' }}
            />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          ZONE D: UNIFIED ARTIFACT INSPECTION & CONTEXT STACK (Right Zone)
          (Desktop/Tablet: Immovable right HUD stack; Phone uses contextual Bottom Sheet)
         ─────────────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col gap-3 absolute right-6 top-20 z-30 w-80 max-w-xs pointer-events-none max-h-[calc(100vh-6.5rem)] overflow-y-auto no-scrollbar select-none">
        {/* 1. Immovable Artifact Specification / Component Inspection Panel */}
        <aside
          role="region"
          aria-label="Artifact Inspection Panel"
          className={`w-full p-4 rounded-xl bg-black/90 backdrop-blur-xl border ${
            selectedItem ? 'border-rose-500/60 shadow-[0_16px_48px_rgba(225,29,72,0.2)]' : 'border-white/15 shadow-2xl'
          } text-zinc-300 pointer-events-auto transition-all duration-200 select-none`}
        >
          {/* Immovable Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="font-tech text-[10px] font-bold tracking-[0.2em] text-zinc-300 uppercase">
                {selectedItem ? 'COMPONENT INSPECTION' : 'ARTIFACT SPECIFICATION'}
              </span>
            </div>

            <span className="font-tech text-[10px] font-semibold text-rose-400 uppercase">
              {selectedItem ? selectedItem.type : currentPhaseMeta.year}
            </span>
          </div>

          {/* Dynamic Body: Component Selected vs Global Specification */}
          {selectedItem ? (
            <div className="space-y-3">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase leading-tight">
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-rose-300 font-semibold mt-0.5">{selectedItem.role}</p>
                <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{selectedItem.dimension}</span>
              </div>

              {/* Properties Table */}
              <div className="space-y-1 pt-1 border-t border-white/10 text-xs font-mono">
                {Object.entries(selectedItem.properties).map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-2 py-0.5 border-b border-white/[0.04]">
                    <span className="text-zinc-400 text-[10px] uppercase font-sans">{k}</span>
                    <span className="text-zinc-200 font-semibold text-right truncate max-w-[170px]">{v}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {selectedItem.description}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleFocusCamera(selectedItem.worldPosition)}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(225,29,72,0.35)] cursor-pointer active:scale-95"
                >
                  <span>FOCUS IN 3D</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);
                    activeArtifactRef.current?.onSelectObject?.(null);
                  }}
                  className="py-2 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white font-tech text-xs uppercase cursor-pointer transition-colors active:scale-95"
                >
                  OVERVIEW
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/[0.06]">
                <span className="text-[10px] font-tech text-zinc-400 uppercase font-semibold">TOPOLOGY</span>
                <span className="text-zinc-200 font-medium text-right truncate max-w-[170px]">
                  {currentPhaseMeta.objectType}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-white/[0.06]">
                <span className="text-[10px] font-tech text-zinc-400 uppercase font-semibold">BACKEND</span>
                <span className="text-zinc-200 font-medium text-right truncate max-w-[170px]">
                  {currentPhaseMeta.computeBackend}
                </span>
              </div>

              {currentPhaseMeta.metricsSummary && (
                <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                  {currentPhaseMeta.metricsSummary.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <span className="text-[9px] text-zinc-400 uppercase block font-semibold truncate">{m.label}</span>
                      <span className="text-[11px] text-zinc-100 font-mono font-semibold block mt-0.5 truncate">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* 2. Contextual Introduction Card (Displayed directly BELOW the Artifact Specification section) */}
        {showIntroCard && (
          <aside
            role="region"
            aria-label="Phase Context Introduction"
            className="w-full p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2 duration-300 select-none"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
              <span className="font-tech text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase">
                PHASE {currentPhaseMeta.numeral} // SPECIFICATION
              </span>
              <button
                type="button"
                onClick={() => setShowIntroCard(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Close phase notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="font-display text-sm sm:text-base font-bold text-white uppercase leading-tight mb-0.5">
              {currentPhaseMeta.title}
            </h2>
            <p className="text-[11px] text-rose-300/90 font-semibold mb-2">{currentPhaseMeta.topic}</p>

            <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
              {currentPhaseMeta.description}
            </p>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowIntroCard(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(225,29,72,0.4)] cursor-pointer text-center active:scale-95"
            >
              EXPLORE ARTIFACT
            </button>
          </aside>
        )}
      </div>

      {/* ── PHONE-ONLY FLOATING CONTROLS (< md) ── */}
      <div className="md:hidden absolute right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+74px)] z-20 flex flex-col items-end gap-2 pointer-events-none select-none">
        <button
          type="button"
          onClick={handleResetView}
          aria-label="Reset Camera View to Default"
          title="Reset Camera"
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-xl border border-white/15 text-zinc-200 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.7)] active:scale-95 transition-all text-xs font-tech font-semibold tracking-wider cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>RESET CAM</span>
        </button>
      </div>

      {/* ── PHONE-ONLY CONTEXTUAL BOTTOM SHEET & PEEK HANDLE (< md) ── */}
      {/* 1. Mobile Peek Handle when sheet is closed */}
      {!mobileSheetOpen && (
        <div className="md:hidden absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+74px)] z-20 flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={() => {
              playSound('toggle');
              setMobileSheetOpen(true);
            }}
            aria-label="Open Specification & Metrics Drawer"
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.8)] active:scale-95 transition-all text-[10px] font-mono uppercase tracking-widest cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>{selectedItem ? 'COMPONENT INSPECT' : 'SPEC & METRICS'}</span>
            <ChevronUp className="w-3 h-3 text-rose-400" />
          </button>
        </div>
      )}

      {/* 2. Backdrop Overlay when mobile sheet is open */}
      {mobileSheetOpen && (
        <div
          onClick={() => {
            playSound('toggle');
            setMobileSheetOpen(false);
          }}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Contextual Bottom Sheet Drawer */}
      {mobileSheetOpen && (
        <aside
          role="dialog"
          aria-label="Phase Specification and Inspection Drawer"
          className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-zinc-950/98 backdrop-blur-2xl border-t border-white/15 rounded-t-2xl shadow-[0_-16px_48px_rgba(0,0,0,0.9)] max-h-[72vh] overflow-y-auto no-scrollbar pb-[calc(env(safe-area-inset-bottom,0px)+18px)] animate-in slide-in-from-bottom duration-200 pointer-events-auto select-none font-body"
        >
          {/* Drag Pill Handle */}
          <div className="w-12 h-1 rounded-full bg-white/25 mx-auto mt-2.5 mb-1 cursor-pointer" onClick={() => setMobileSheetOpen(false)} />

          <div className="p-4 space-y-3.5 text-zinc-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span className="font-tech text-xs font-bold tracking-[0.2em] text-rose-400 uppercase">
                  {selectedItem ? 'COMPONENT INSPECTION' : `PHASE ${currentPhaseMeta.numeral} // SPECIFICATION`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Close Specification Drawer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] text-zinc-400 hover:text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If an object in 3D is selected */}
            {selectedItem ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-display text-base font-bold text-white uppercase leading-tight">
                    {selectedItem.name}
                  </h3>
                  <p className="text-xs text-rose-300 font-semibold mt-0.5">{selectedItem.role}</p>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{selectedItem.dimension}</span>
                </div>

                {/* Properties Table */}
                <div className="space-y-1 pt-1 border-t border-white/10 text-xs font-mono">
                  {Object.entries(selectedItem.properties).map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-2 py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400 text-[10px] uppercase font-sans">{k}</span>
                      <span className="text-zinc-100 font-semibold text-right">{v}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {selectedItem.description}
                </p>

                {/* Focus / Clear Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      handleFocusCamera(selectedItem.worldPosition);
                      setMobileSheetOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(225,29,72,0.4)] cursor-pointer active:scale-95"
                  >
                    <span>FOCUS IN 3D</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      activeArtifactRef.current?.onSelectObject?.(null);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white font-tech text-xs uppercase cursor-pointer transition-colors active:scale-95"
                  >
                    OVERVIEW
                  </button>
                </div>
              </div>
            ) : (
              /* Global Phase Specification */
              <div className="space-y-3">
                <div>
                  <h3 className="font-display text-base font-bold text-white uppercase leading-tight">
                    {currentPhaseMeta.title}
                  </h3>
                  <p className="text-xs text-rose-300/90 font-semibold mt-0.5">{currentPhaseMeta.topic}</p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentPhaseMeta.description}
                </p>

                {/* Technical Metadata Rows (No Truncation) */}
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  <div className="flex flex-col gap-0.5 py-1 border-b border-white/[0.06]">
                    <span className="text-[10px] font-tech text-zinc-400 uppercase font-semibold">TOPOLOGY</span>
                    <span className="text-zinc-100 font-medium break-words">
                      {currentPhaseMeta.objectType}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 py-1 border-b border-white/[0.06]">
                    <span className="text-[10px] font-tech text-zinc-400 uppercase font-semibold">COMPUTE BACKEND</span>
                    <span className="text-zinc-100 font-medium break-words">
                      {currentPhaseMeta.computeBackend}
                    </span>
                  </div>
                </div>

                {/* Technical Metric Cards (Mobile Readable Grid) */}
                {currentPhaseMeta.metricsSummary && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    {currentPhaseMeta.metricsSummary.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <span className="text-[9px] text-zinc-400 uppercase block font-semibold truncate">{m.label}</span>
                        <span className="text-xs text-zinc-100 font-mono font-semibold block mt-1">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explore Artifact in 3D Button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setMobileSheetOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(225,29,72,0.4)] cursor-pointer text-center active:scale-[0.98] mt-2"
                >
                  EXPLORE IN 3D
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          ZONE E: 5-PHASE RESEARCH NAVIGATOR (Bottom Zone)
         ─────────────────────────────────────────────────────────────────── */}
      {/* Desktop & Tablet Phase Navigator (≥ md) */}
      <nav
        aria-label="Research Phase Navigator"
        className="hidden md:flex absolute bottom-0 inset-x-0 z-30 justify-center pointer-events-none px-2 sm:px-4"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
          paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 8px)',
          paddingRight: 'calc(env(safe-area-inset-right, 0px) + 8px)',
        }}
      >
        <div className="relative pointer-events-auto max-w-full sm:max-w-fit w-full sm:w-auto">
          {/* Mobile scroll indicator masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#07090e] to-transparent z-10 sm:hidden rounded-l-2xl" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#07090e] to-transparent z-10 sm:hidden rounded-r-2xl" />

          <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.85)] overflow-x-auto scroll-smooth no-scrollbar touch-pan-x">
            {RESEARCH_PHASES.map((phase) => {
              const isActive = phase.id === activePhaseId;
              return (
                <button
                  key={phase.id}
                  ref={(el) => {
                    phaseBtnRefs.current[phase.id] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectPhase(phase.id)}
                  className={`relative min-h-[46px] px-3 sm:px-4 py-1.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 cursor-pointer flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-rose-950/80 border border-rose-500/60 shadow-[0_0_16px_rgba(225,29,72,0.3)]'
                      : 'hover:bg-white/5 border border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  {/* Miniature Vector Preview */}
                  <div className="hidden sm:block">
                    <MiniArtifactPreview phaseId={phase.id} active={isActive} className="w-8 h-6" />
                  </div>

                  {/* Phase Text Info */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-tech text-[10px] font-bold ${isActive ? 'text-rose-400' : 'text-zinc-500'}`}>
                        {phase.numeral}
                      </span>
                      <span className={`font-display text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                        {phase.shortName || phase.title}
                      </span>
                    </div>
                    <span className="hidden md:block text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">
                      {phase.topic}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Phone-Only Phase Navigator (< md) */}
      <nav
        aria-label="Mobile Research Phase Navigator"
        className="md:hidden absolute bottom-0 inset-x-0 z-30 flex items-center justify-center pointer-events-none px-2"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
          paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 4px)',
          paddingRight: 'calc(env(safe-area-inset-right, 0px) + 4px)',
        }}
      >
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.85)] max-w-full">
          {/* Previous Phase Chevron */}
          <button
            type="button"
            onClick={handlePrevPhase}
            aria-label="Previous Research Phase"
            className="w-8 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Phase Track */}
          <div className="flex items-center gap-1 overflow-x-auto scroll-smooth no-scrollbar touch-pan-x py-0.5">
            {RESEARCH_PHASES.map((phase) => {
              const isActive = phase.id === activePhaseId;
              return (
                <button
                  key={phase.id}
                  ref={(el) => {
                    phaseBtnRefs.current[phase.id] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectPhase(phase.id)}
                  className={`min-h-[42px] px-2.5 py-1 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isActive
                      ? 'bg-rose-950/90 border border-rose-500/80 shadow-[0_0_14px_rgba(225,29,72,0.4)] text-white'
                      : 'hover:bg-white/5 border border-transparent text-zinc-400'
                  }`}
                >
                  <span className={`font-tech text-[10px] font-bold ${isActive ? 'text-rose-400' : 'text-zinc-500'}`}>
                    {phase.numeral}
                  </span>
                  <span className={`font-display text-[11px] font-semibold uppercase tracking-wider ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {phase.shortName || phase.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next Phase Chevron */}
          <button
            type="button"
            onClick={handleNextPhase}
            aria-label="Next Research Phase"
            className="w-8 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

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
