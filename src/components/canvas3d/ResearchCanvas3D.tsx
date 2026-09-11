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
  Grip,
  Eye,
  Sliders,
  Maximize,
  Grid,
} from '../icons';
import { playSound } from '../../lib/sound';

interface ResearchCanvas3DProps {
  initialPhaseId?: string;
  onExit: (currentPhaseChronicleId: string) => void;
  isInitialEntry?: boolean;
}

// ─── Hardware & Performance Diagnostics ──────────────────────────────────────
const detectHardwareTier = (): QualityTier => {
  if (typeof window === 'undefined') return 'high';
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = window.innerWidth < 768;
  if (cores <= 2 || isMobile) return 'low';
  if (cores <= 4) return 'medium';
  return 'high';
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
  const distanceScalar = isMobile ? Math.max(1.35, 1.15 / Math.sqrt(Math.max(aspect, 0.4))) : 1.24;
  const dist = (radius * distanceScalar) / Math.sin(fovRad / 2);

  // Optical compensation: offset target slightly left on desktop to balance right-side inspection HUD
  const targetOffset = isMobile ? new THREE.Vector3(0, -0.3, 0) : new THREE.Vector3(-0.35, 0.15, 0);
  const target = center.clone().add(targetOffset);

  // Pitch camera at a pleasing technical isometric angle
  const pitchAngle = isMobile ? 0.38 : 0.44;
  const yawAngle = isMobile ? 0.18 : 0.28;

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
  const [showIntroCard, setShowIntroCard] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<'orbit' | 'inspect' | 'layers'>('orbit');
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(false);
  const [activeLayers, setActiveLayers] = useState<Record<LayerType, boolean>>({
    geometry: true,
    trajectories: true,
    clusters: true,
    grid: true,
    annotations: false,
  });

  // Performance System State
  const [qualityMode, setQualityMode] = useState<'auto' | QualityTier>('auto');
  const detectedTierRef = useRef<QualityTier>(detectHardwareTier());
  const [liveFps, setLiveFps] = useState<number>(60);
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

  // Draggable Specification HUD State
  const [specPos, setSpecPos] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('nodefolio_spec_pos');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number' &&
          parsed.x >= 10 &&
          parsed.x < window.innerWidth - 100 &&
          parsed.y >= 50 &&
          parsed.y < window.innerHeight - 100
        ) {
          return { x: parsed.x, y: parsed.y };
        }
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const [isDraggingSpec, setIsDraggingSpec] = useState<boolean>(false);
  const specPanelRef = useRef<HTMLElement | null>(null);
  const specDragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingSpecRef = useRef<boolean>(false);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const activeArtifactRef = useRef<PhaseArtifactInstance | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const phaseBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) {
        setSpecPos((prev) => {
          if (!prev) return null;
          const panelEl = specPanelRef.current;
          const width = panelEl ? panelEl.offsetWidth : 320;
          const height = panelEl ? panelEl.offsetHeight : 260;
          const maxX = Math.max(16, window.innerWidth - width - 16);
          const maxY = Math.max(72, window.innerHeight - height - 88);
          if (prev.x > maxX || prev.y > maxY) {
            return {
              x: Math.min(prev.x, maxX),
              y: Math.min(prev.y, maxY),
            };
          }
          return prev;
        });
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // ── Keyboard Shortcuts: R for Reset, Left/Right for Phases, Esc for Exit ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetView();
      } else if (e.key === 'Escape') {
        e.preventDefault();
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
    controls.maxDistance = 45;
    controls.minDistance = 3.5;
    controls.enablePan = true;
    controls.panSpeed = 0.9;
    controls.enabled = !isInitialEntryLoading;
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

    // 8. Animation & Render Loop with FPS Diagnostics & Camera Slerp
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsAccumulator = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Live FPS measurement
      frameCount++;
      fpsAccumulator += delta;
      if (fpsAccumulator >= 0.5) {
        const measuredFps = Math.round(frameCount / fpsAccumulator);
        setLiveFps(measuredFps);
        frameCount = 0;
        fpsAccumulator = 0;
      }

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

  // ── Drag Handlers for Specification HUD on Desktop ─────────────────────────
  const handleSpecPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    e.stopPropagation();

    const panel = specPanelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    specDragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    isDraggingSpecRef.current = true;
    setIsDraggingSpec(true);

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!isDraggingSpecRef.current) return;
      moveEv.preventDefault();
      moveEv.stopPropagation();

      const panelEl = specPanelRef.current;
      const width = panelEl ? panelEl.offsetWidth : 320;
      const height = panelEl ? panelEl.offsetHeight : 260;

      const minX = 16;
      const maxX = Math.max(minX, window.innerWidth - width - 16);
      const minY = 72;
      const maxY = Math.max(minY, window.innerHeight - height - 88);

      const targetX = moveEv.clientX - specDragOffsetRef.current.x;
      const targetY = moveEv.clientY - specDragOffsetRef.current.y;

      const clampedX = Math.round(Math.max(minX, Math.min(maxX, targetX)));
      const clampedY = Math.round(Math.max(minY, Math.min(maxY, targetY)));

      setSpecPos({ x: clampedX, y: clampedY });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      if (!isDraggingSpecRef.current) return;
      isDraggingSpecRef.current = false;
      setIsDraggingSpec(false);

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const panelEl = specPanelRef.current;
      const width = panelEl ? panelEl.offsetWidth : 320;
      const height = panelEl ? panelEl.offsetHeight : 260;
      const minX = 16;
      const maxX = Math.max(minX, window.innerWidth - width - 16);
      const minY = 72;
      const maxY = Math.max(minY, window.innerHeight - height - 88);

      const targetX = upEv.clientX - specDragOffsetRef.current.x;
      const targetY = upEv.clientY - specDragOffsetRef.current.y;
      const finalX = Math.round(Math.max(minX, Math.min(maxX, targetX)));
      const finalY = Math.round(Math.max(minY, Math.min(maxY, targetY)));

      const finalPos = { x: finalX, y: finalY };
      setSpecPos(finalPos);
      try {
        localStorage.setItem('nodefolio_spec_pos', JSON.stringify(finalPos));
      } catch {
        // Ignore
      }
      playSound('secondaryClick');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });
  }, []);

  const handleResetSpecPos = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSpecPos(null);
    try {
      localStorage.removeItem('nodefolio_spec_pos');
    } catch {
      // Ignore
    }
    playSound('click');
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
          onTransitionComplete={() => {
            setIsInitialEntryLoading(false);
            if (controlsRef.current) {
              controlsRef.current.enabled = true;
            }
          }}
        />
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
          ZONE A: TOP RESEARCH INSTRUMENT HEADER
         ─────────────────────────────────────────────────────────────────── */}
      <header
        aria-label="3D Research Canvas Navigation"
        className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-3 sm:px-6 py-3 pointer-events-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        {/* Left: Instrument Metadata */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-tech text-[11px] tracking-[0.2em] font-bold text-rose-400 uppercase">
              PHASE {currentPhaseMeta.numeral}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="font-display text-xs sm:text-sm font-semibold tracking-wide text-white uppercase truncate max-w-[160px] sm:max-w-none">
              {currentPhaseMeta.title}
            </span>
          </div>

          <div className="hidden lg:flex items-center px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-400 text-xs font-mono">
            {currentPhaseMeta.dimension}
          </div>
        </div>

        {/* Center: Real-time Diagnostics & Quality Selector */}
        <div className="hidden md:flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 text-xs shadow-lg">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">PERF:</span>
            {(['auto', 'high', 'medium', 'low'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => {
                  playSound('click');
                  setQualityMode(tier);
                  const effective = tier === 'auto' ? detectedTierRef.current : tier;
                  switchArtifact(activePhaseId, effective);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold transition-all cursor-pointer ${
                  qualityMode === tier
                    ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(225,29,72,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tier === 'medium' ? 'MED' : tier}
              </button>
            ))}
            <span className="text-zinc-600 mx-0.5">|</span>
            <span className="font-mono text-[10px] text-zinc-300 font-semibold">{liveFps} FPS</span>
          </div>
        </div>

        {/* Right: Camera Reset & Exit */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleResetView}
            title="Reset to Overview Camera (Hotkey: R)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 text-zinc-300 hover:text-white hover:border-white/30 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET [R]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              onExit(currentPhaseMeta.chronicleId);
            }}
            aria-label="Exit 3D Research Canvas"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_16px_rgba(225,29,72,0.35)] active:scale-95"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">EXIT CANVAS</span>
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
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setActiveTool('orbit');
          }}
          title="Orbit / Rotate View"
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            activeTool === 'orbit'
              ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('click');
            setActiveTool('inspect');
          }}
          title="Inspect / Select Objects"
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            activeTool === 'inspect'
              ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setShowLayersMenu(!showLayersMenu);
            }}
            title="Toggle Visual Layers"
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              showLayersMenu
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Interactive Layers Menu Popover */}
          {showLayersMenu && (
            <div className="absolute left-full ml-3 top-0 w-52 p-3 rounded-xl bg-black/95 backdrop-blur-xl border border-white/15 shadow-2xl z-40 space-y-2 text-xs">
              <div className="text-[10px] font-tech text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/10 pb-1.5">
                VISUAL LAYERS
              </div>
              {(['geometry', 'trajectories', 'clusters', 'grid', 'annotations'] as const).map((layer) => (
                <label
                  key={layer}
                  className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer py-0.5 select-none"
                >
                  <span className="capitalize">{layer}</span>
                  <input
                    type="checkbox"
                    checked={activeLayers[layer]}
                    onChange={() => handleToggleLayer(layer)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleToggleLayer('annotations')}
          title="Toggle 3D Annotations"
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            showAnnotations
              ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-white/10 my-0.5" />

        <button
          type="button"
          onClick={handleResetView}
          title="Reset Camera View [R]"
          className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </nav>

      {/* Contextual Introduction Card (Minimizes on first interaction) */}
      {showIntroCard ? (
        <aside
          role="region"
          aria-label="Phase Context Introduction"
          className="absolute left-4 sm:left-18 top-16 sm:top-20 z-30 max-w-xs sm:max-w-sm p-4 sm:p-5 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto transition-all animate-in fade-in slide-in-from-left-4 duration-300"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="font-tech text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase">
              RESEARCH SPECIFICATION // {currentPhaseMeta.numeral}
            </span>
            <button
              type="button"
              onClick={() => setShowIntroCard(false)}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="font-display text-base sm:text-lg font-bold text-white uppercase leading-tight mb-1">
            {currentPhaseMeta.title}
          </h2>
          <p className="text-xs text-rose-300 font-semibold mb-2">{currentPhaseMeta.topic}</p>

          <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
            {currentPhaseMeta.description}
          </p>

          {currentPhaseMeta.equation && (
            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] font-mono text-[10px] text-zinc-300 mb-3 overflow-x-auto select-all">
              {currentPhaseMeta.equation}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowIntroCard(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(225,29,72,0.4)] cursor-pointer text-center"
            >
              EXPLORE ARTIFACT
            </button>
          </div>
        </aside>
      ) : (
        <button
          type="button"
          onClick={() => setShowIntroCard(true)}
          title="Open Context Introduction"
          className="hidden md:flex items-center gap-1.5 absolute left-18 top-20 z-30 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-zinc-400 hover:text-white text-xs font-tech uppercase tracking-wider transition-all cursor-pointer pointer-events-auto"
        >
          <Compass className="w-3.5 h-3.5 text-rose-400" />
          <span>INFO</span>
        </button>
      )}

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
          ZONE D: UNIFIED ARTIFACT INSPECTION PANEL (Right Zone)
          (Desktop: Draggable anywhere across viewport; Mobile: Responsive Bottom Sheet)
         ─────────────────────────────────────────────────────────────────── */}
      <aside
        ref={specPanelRef}
        role="region"
        aria-label="Artifact Inspection Panel"
        style={
          isDesktop && specPos
            ? {
                left: `${specPos.x}px`,
                top: `${specPos.y}px`,
                right: 'auto',
                bottom: 'auto',
              }
            : undefined
        }
        className={`fixed md:absolute inset-x-3 md:inset-x-auto ${
          isDesktop && specPos ? '' : 'md:right-6 md:top-20'
        } bottom-[calc(env(safe-area-inset-bottom,0px)+78px)] md:bottom-auto md:w-84 md:max-w-sm max-h-[50vh] md:max-h-[76vh] overflow-y-auto no-scrollbar p-4 sm:p-5 rounded-2xl bg-black/90 backdrop-blur-xl border ${
          selectedItem ? 'border-rose-500/60 shadow-[0_16px_48px_rgba(225,29,72,0.2)]' : 'border-white/15 shadow-2xl'
        } text-zinc-300 pointer-events-auto z-30 ${
          isDraggingSpec ? 'transition-none cursor-grabbing ring-1 ring-rose-500/50' : 'transition-all duration-200'
        }`}
      >
        {/* Draggable Header */}
        <div
          onPointerDown={handleSpecPointerDown}
          onDoubleClick={handleResetSpecPos}
          title={isDesktop ? 'Drag to reposition • Double-click to reset' : undefined}
          className={`flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 select-none ${
            isDesktop ? 'cursor-grab active:cursor-grabbing group' : ''
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isDesktop ? (
              <Grip className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
            <span className="font-tech text-[10px] font-bold tracking-[0.2em] text-zinc-300 group-hover:text-white uppercase transition-colors">
              {selectedItem ? 'COMPONENT INSPECTION' : 'ARTIFACT SPECIFICATION'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {specPos && isDesktop && (
              <button
                type="button"
                onClick={handleResetSpecPos}
                title="Reset panel position"
                className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            <span className="font-tech text-[10px] font-semibold text-rose-400 uppercase">
              {selectedItem ? selectedItem.type : currentPhaseMeta.year}
            </span>
          </div>
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
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(225,29,72,0.35)] cursor-pointer"
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
                className="py-2 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white font-tech text-xs uppercase cursor-pointer transition-colors"
              >
                OVERVIEW
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold font-tech">
                OBJECT TOPOLOGY
              </span>
              <span className="text-white font-medium">{currentPhaseMeta.objectType}</span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold font-tech">
                MATHEMATICAL BACKEND
              </span>
              <span className="text-zinc-200">{currentPhaseMeta.computeBackend}</span>
            </div>

            {currentPhaseMeta.metricsSummary && (
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {currentPhaseMeta.metricsSummary.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-center">
                    <span className="text-[9px] text-zinc-400 uppercase block font-semibold truncate">{m.label}</span>
                    <span className="text-[11px] text-zinc-100 font-mono font-semibold block mt-0.5">{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-zinc-300 leading-relaxed pt-1 border-t border-white/10">
              {currentPhaseMeta.description}
            </p>

            <div className="flex flex-wrap gap-1 pt-1">
              {currentPhaseMeta.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] text-zinc-400 font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ───────────────────────────────────────────────────────────────────
          ZONE E: 5-PHASE RESEARCH NAVIGATOR (Bottom Zone)
         ─────────────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Research Phase Navigator"
        className="absolute bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none px-2 sm:px-4"
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
    </div>
  );
};
