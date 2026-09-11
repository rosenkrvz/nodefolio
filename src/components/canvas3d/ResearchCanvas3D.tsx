import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  ResearchPhaseId,
  RESEARCH_PHASES,
  PhaseArtifactInstance,
  PhaseMetadata,
  QualityTier,
  InspectableItem,
} from './types';
import { createPhase01Autograd } from './phases/Phase01Autograd';
import { createPhase02Optimization } from './phases/Phase02Optimization';
import { createPhase03MetricSpaces } from './phases/Phase03MetricSpaces';
import { createPhase04Attention } from './phases/Phase04Attention';
import { createPhase05LatentManifold } from './phases/Phase05LatentManifold';
import { RotateCcw, Close as X, Layers, Compass, Cpu, Activity, ArrowUpRight } from '../icons';
import { playSound } from '../../lib/sound';

interface ResearchCanvas3DProps {
  initialPhaseId?: string; // e.g. 'm1', 'm2', 'm5' or 'phase-01' ... 'phase-05'
  onExit: (currentPhaseChronicleId: string) => void;
}

// Automatic hardware performance detection
const detectHardwareTier = (): QualityTier => {
  if (typeof window === 'undefined') return 'high';
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = window.innerWidth < 768;
  if (cores <= 2 || isMobile) return 'low';
  if (cores <= 4) return 'medium';
  return 'high';
};

export const ResearchCanvas3D: React.FC<ResearchCanvas3DProps> = ({
  initialPhaseId,
  onExit,
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
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [isLoadingGeometry, setIsLoadingGeometry] = useState<boolean>(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Adaptive Quality System State
  const [qualityMode, setQualityMode] = useState<'auto' | QualityTier>('auto');
  const detectedTierRef = useRef<QualityTier>(detectHardwareTier());
  const activeTier: QualityTier = qualityMode === 'auto' ? detectedTierRef.current : qualityMode;

  // Interaction State
  const [hoveredItem, setHoveredItem] = useState<InspectableItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InspectableItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const activeArtifactRef = useRef<PhaseArtifactInstance | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Smooth camera focusing state
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

  const currentPhaseMeta: PhaseMetadata =
    RESEARCH_PHASES.find((p) => p.id === activePhaseId) || RESEARCH_PHASES[4];

  // Switch active artifact inside current scene
  const switchArtifact = useCallback(
    (phaseId: ResearchPhaseId, tier: QualityTier) => {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!scene || !camera || !controls) return;

      setIsLoadingGeometry(true);
      setSelectedItem(null);
      setHoveredItem(null);

      // Dispose old artifact cleanly
      if (activeArtifactRef.current) {
        scene.remove(activeArtifactRef.current.group);
        activeArtifactRef.current.dispose();
        activeArtifactRef.current = null;
      }

      // Build new artifact with active quality tier
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

      // Reset camera position for this artifact
      const [cx, cy, cz] = newArtifact.defaultCameraPosition;
      const [tx, ty, tz] = newArtifact.defaultTarget;
      camera.position.set(cx, cy, cz);
      controls.target.set(tx, ty, tz);
      controls.update();

      setTimeout(() => {
        setIsLoadingGeometry(false);
      }, 100);
    },
    []
  );

  // Initialize WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.024);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 3. Renderer with Dynamic Pixel Ratio
    const renderer = new THREE.WebGLRenderer({
      antialias: activeTier !== 'low',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    const targetPixelRatio =
      activeTier === 'low'
        ? 1.0
        : activeTier === 'medium'
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(targetPixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4.8;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // 5. Scientific Laboratory Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.25);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.45);
    dirLight.position.set(8, 14, 10);
    scene.add(dirLight);

    const crimsonLight = new THREE.PointLight(0xe11d48, 2.4, 35);
    crimsonLight.position.set(-6, 8, -4);
    scene.add(crimsonLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 1.0, 25);
    fillLight.position.set(6, -4, 6);
    scene.add(fillLight);

    // Initial artifact load
    switchArtifact(activePhaseId, activeTier);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Raycasting & Interaction Setup
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isDragging = false;
    let dragStartPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = false;
      dragStartPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!container || !camera || !activeArtifactRef.current) return;
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (dx > 4 || dy > 4) isDragging = true;

      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const inspectables = activeArtifactRef.current.getInspectableObjects?.() || [];
      if (inspectables.length === 0) {
        setHoveredItem(null);
        container.style.cursor = 'grab';
        return;
      }

      raycaster.setFromCamera(pointer, camera);
      const targetMeshes = inspectables.map((i) => i.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const match = inspectables.find(
          (item) => item.mesh === hit.object || item.mesh.children.includes(hit.object)
        );
        if (match) {
          setHoveredItem(match.data);
          container.style.cursor = 'pointer';
          activeArtifactRef.current.onHoverObject?.(match.data);
          return;
        }
      }

      setHoveredItem(null);
      container.style.cursor = 'grab';
      activeArtifactRef.current.onHoverObject?.(null);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging || !container || !camera || !activeArtifactRef.current) return;
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const inspectables = activeArtifactRef.current.getInspectableObjects?.() || [];
      raycaster.setFromCamera(pointer, camera);
      const targetMeshes = inspectables.map((i) => i.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const match = inspectables.find(
          (item) => item.mesh === hit.object || item.mesh.children.includes(hit.object)
        );
        if (match) {
          playSound('select');
          setSelectedItem(match.data);
          activeArtifactRef.current.onSelectObject?.(match.data);
          return;
        }
      }

      // Clicked on empty canvas -> deselect
      setSelectedItem(null);
      activeArtifactRef.current.onSelectObject?.(null);
    };

    const onDoubleClick = (e: MouseEvent) => {
      if (!camera || !controls || !activeArtifactRef.current) return;
      const inspectables = activeArtifactRef.current.getInspectableObjects?.() || [];
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(inspectables.map((i) => i.mesh), true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const match = inspectables.find(
          (item) => item.mesh === hit.object || item.mesh.children.includes(hit.object)
        );
        if (match) {
          handleFocusCamera(match.data.worldPosition);
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
        activeArtifactRef.current?.onSelectObject?.(null);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('keydown', onKeyDown);

    // Animation Render Loop
    let clock = new THREE.Clock();
    let isMounted = true;

    const renderLoop = () => {
      if (!isMounted) return;
      animFrameIdRef.current = requestAnimationFrame(renderLoop);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera focusing interpolation
      if (cameraFocusTarget.current.active) {
        const ft = cameraFocusTarget.current;
        ft.progress += delta * 2.2;
        if (ft.progress >= 1.0) {
          ft.active = false;
          camera.position.copy(ft.endPos);
          controls.target.copy(ft.endTarget);
        } else {
          camera.position.lerpVectors(ft.startPos, ft.endPos, ft.progress);
          controls.target.lerpVectors(ft.startTarget, ft.endTarget, ft.progress);
        }
      }

      controls.update();

      if (activeArtifactRef.current) {
        activeArtifactRef.current.update(time, delta);
      }

      renderer.render(scene, camera);
    };
    renderLoop();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('dblclick', onDoubleClick);

      if (activeArtifactRef.current) {
        activeArtifactRef.current.dispose();
        activeArtifactRef.current = null;
      }

      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeTier, switchArtifact, activePhaseId]);

  // Smooth camera focus on specific 3D coordinate
  const handleFocusCamera = (targetCoord: THREE.Vector3) => {
    playSound('click');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
    const endPos = targetCoord.clone().addScaledVector(dir, 7.5);

    cameraFocusTarget.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos,
      startTarget: controls.target.clone(),
      endTarget: targetCoord.clone(),
      progress: 0,
    };
  };

  // Handle phase change
  const handleSelectPhase = (phaseId: ResearchPhaseId) => {
    if (phaseId === activePhaseId) return;
    playSound('select');
    setActivePhaseId(phaseId);
    switchArtifact(phaseId, activeTier);
  };

  // Handle quality mode change
  const handleSelectQuality = (mode: 'auto' | QualityTier) => {
    playSound('click');
    setQualityMode(mode);
    const newTier = mode === 'auto' ? detectedTierRef.current : mode;
    switchArtifact(activePhaseId, newTier);
  };

  // Reset Camera
  const handleResetCamera = () => {
    playSound('click');
    setSelectedItem(null);
    activeArtifactRef.current?.onSelectObject?.(null);

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const artifact = activeArtifactRef.current;
    if (!camera || !controls || !artifact) return;

    const [cx, cy, cz] = artifact.defaultCameraPosition;
    const [tx, ty, tz] = artifact.defaultTarget;

    cameraFocusTarget.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos: new THREE.Vector3(cx, cy, cz),
      startTarget: controls.target.clone(),
      endTarget: new THREE.Vector3(tx, ty, tz),
      progress: 0,
    };
  };

  const handleExitCanvas = () => {
    playSound('click');
    onExit(currentPhaseMeta.chronicleId);
  };

  return (
    <div
      id="research-3d-canvas"
      className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#07090e] select-none"
      style={{ touchAction: 'none' }}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Subtle ambient vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,9,14,0.72)_100%)]" />

      {/* -------------------------------------------------------------------
          TOP HUD: Header & Actions
         ------------------------------------------------------------------- */}
      <header className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-start justify-between pointer-events-none z-10">
        {/* Left: Scientific Telemetry Header */}
        <div className="pointer-events-auto max-w-sm sm:max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-body text-[10px] font-bold tracking-[0.25em] text-rose-400 uppercase">
              RESEARCH CANVAS // PHASE {currentPhaseMeta.numeral}
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase">
            {currentPhaseMeta.title}
          </h1>
          <p className="font-body text-xs text-zinc-400 mt-0.5 hidden sm:block">
            {currentPhaseMeta.topic} &bull; {currentPhaseMeta.dimension}
          </p>
        </div>

        {/* Right: Technical Controls & Adaptive Quality Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Adaptive Quality Selector */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-tech text-zinc-400">
            <span className="px-2 font-semibold text-zinc-400 uppercase">PERF:</span>
            {(['auto', 'high', 'medium', 'low'] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSelectQuality(q)}
                className={`px-2 py-1 rounded-lg uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  qualityMode === q
                    ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                    : 'hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                {q === 'auto' ? `AUTO (${activeTier.slice(0, 3)})` : q.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Toggle Specification Panel on Mobile */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setShowTechnicalDetails(!showTechnicalDetails);
            }}
            aria-label="Toggle mathematical details"
            className="md:hidden p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-rose-400" />
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white font-body text-xs tracking-wider uppercase transition-all hover:border-white/20 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">RESET VIEW</span>
          </button>

          {/* Exit 3D Canvas */}
          <button
            type="button"
            onClick={handleExitCanvas}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 backdrop-blur-md text-white font-body font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_16px_rgba(225,29,72,0.4)] active:scale-95 cursor-pointer"
          >
            <span>EXIT CANVAS</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------
          INTERACTIVE HOVER INDICATOR (Floating Bottom-Left)
         ------------------------------------------------------------------- */}
      {hoveredItem && !selectedItem && (
        <div className="absolute left-4 sm:left-6 bottom-24 sm:bottom-24 z-20 pointer-events-none animate-in fade-in duration-150">
          <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-rose-500/40 text-xs font-tech text-white flex items-center gap-2 shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-zinc-400 font-semibold">{hoveredItem.type}:</span>
            <span className="font-bold text-rose-300">{hoveredItem.name}</span>
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider hidden sm:inline">
              [CLICK TO INSPECT]
            </span>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          OBJECT INSPECTION HUD CARD (Appears when an object is selected)
         ------------------------------------------------------------------- */}
      {selectedItem && (
        <aside
          role="region"
          aria-label="Component Inspection Card"
          className="absolute right-4 sm:right-6 top-20 sm:top-24 w-80 sm:w-96 max-h-[75vh] overflow-y-auto p-4 sm:p-5 rounded-2xl bg-[#0b0e14]/90 backdrop-blur-xl border border-rose-500/50 shadow-[0_12px_40px_rgba(0,0,0,0.85)] pointer-events-auto z-20 animate-in fade-in slide-in-from-right-4 duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <span className="font-tech text-[10px] tracking-[0.2em] font-bold text-rose-400 uppercase">
                  {selectedItem.type}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-white leading-tight uppercase">
                {selectedItem.name}
              </h2>
              <span className="font-tech text-[11px] text-zinc-400 block mt-0.5">
                {selectedItem.role}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setSelectedItem(null);
                activeArtifactRef.current?.onSelectObject?.(null);
              }}
              className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/15 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Properties Table */}
          <div className="space-y-2 mb-4 text-xs font-tech">
            {Object.entries(selectedItem.properties).map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 py-1 border-b border-white/[0.04]">
                <span className="text-zinc-400 uppercase tracking-wider text-[10px]">{k}</span>
                <span className="text-zinc-200 font-semibold text-right font-mono truncate max-w-[180px]">{v}</span>
              </div>
            ))}
          </div>

          {/* Contextual Mathematical Explanation */}
          <p className="font-body text-xs text-zinc-300 leading-relaxed mb-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {selectedItem.description}
          </p>

          {/* Actions: Focus Camera & Deselect */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleFocusCamera(selectedItem.worldPosition)}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-body text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(225,29,72,0.35)] cursor-pointer"
            >
              <span>FOCUS CAMERA</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                activeArtifactRef.current?.onSelectObject?.(null);
              }}
              className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white font-tech text-xs uppercase cursor-pointer"
            >
              ESC
            </button>
          </div>
        </aside>
      )}

      {/* -------------------------------------------------------------------
          RIGHT: Phase Specification Panel (Hidden when inspecting object)
         ------------------------------------------------------------------- */}
      {!selectedItem && (
        <aside
          className={`absolute right-4 sm:right-6 bottom-24 sm:bottom-24 max-w-xs p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-zinc-300 pointer-events-auto transition-all duration-300 z-10 ${
            showTechnicalDetails ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <span className="font-body text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-rose-400" />
              <span>ARTIFACT SPECIFICATION</span>
            </span>
            <span className="font-body text-[10px] font-semibold text-rose-400 uppercase">
              {currentPhaseMeta.year}
            </span>
          </div>

          <div className="space-y-2 text-xs font-body">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                OBJECT TYPE
              </span>
              <span className="text-white font-medium">{currentPhaseMeta.objectType}</span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                TOPOLOGY MODE
              </span>
              <span className="text-zinc-200">{currentPhaseMeta.topology}</span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                COMPUTE BACKEND
              </span>
              <span className="text-zinc-200">{currentPhaseMeta.computeBackend}</span>
            </div>

            <div className="pt-1.5 border-t border-white/[0.08]">
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {currentPhaseMeta.description}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* -------------------------------------------------------------------
          BOTTOM: 5-Phase Selector Navigation
         ------------------------------------------------------------------- */}
      <nav
        aria-label="3D Research Phase Selector"
        className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center pointer-events-none z-10 px-3"
      >
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-x-auto max-w-full">
          {RESEARCH_PHASES.map((phase) => {
            const isActive = phase.id === activePhaseId;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => handleSelectPhase(phase.id)}
                className={`relative px-3 sm:px-4 py-2 rounded-xl font-body text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-[0_0_14px_rgba(225,29,72,0.5)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                <span className="opacity-60 text-[10px] mr-1.5 font-bold">
                  {phase.numeral}
                </span>
                <span>{phase.shortName || phase.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Loading Geometry Reticle */}
      {isLoadingGeometry && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-md border border-rose-500/30 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            <span className="font-body text-xs tracking-widest uppercase text-zinc-300 font-semibold">
              RESOLVING 3D GEOMETRY // PHASE {currentPhaseMeta.numeral} [{activeTier.toUpperCase()}]
            </span>
          </div>
        </div>
      )}

      {/* WebGL Fallback Modal if unsupported */}
      {!webGlSupported && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#07090e]/95 p-6">
          <div className="max-w-md p-6 rounded-2xl bg-black/90 border border-white/15 text-center space-y-4">
            <Cpu className="w-8 h-8 text-rose-400 mx-auto" />
            <h2 className="font-display text-lg font-bold text-white uppercase">
              3D Acceleration Unavailable
            </h2>
            <p className="font-body text-xs text-zinc-400 leading-relaxed">
              Your browser or device does not currently have WebGL hardware acceleration enabled.
              The 3D Research Canvas requires WebGL to render mathematical geometries.
            </p>
            <button
              type="button"
              onClick={handleExitCanvas}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs uppercase"
            >
              Return to Chronicle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
