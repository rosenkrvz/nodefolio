import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  ResearchPhaseId,
  RESEARCH_PHASES,
  PhaseArtifactInstance,
  PhaseMetadata,
} from './types';
import { createPhase01Autograd } from './phases/Phase01Autograd';
import { createPhase02Optimization } from './phases/Phase02Optimization';
import { createPhase03MetricSpaces } from './phases/Phase03MetricSpaces';
import { createPhase04Attention } from './phases/Phase04Attention';
import { createPhase05LatentManifold } from './phases/Phase05LatentManifold';
import { RotateCcw, Close as X, Layers, Compass, Cpu, Activity } from '../icons';
import { playSound } from '../../lib/sound';

interface ResearchCanvas3DProps {
  initialPhaseId?: string; // e.g. 'm1', 'm2', 'm5' or 'phase-01' ... 'phase-05'
  onExit: (currentPhaseChronicleId: string) => void;
}

export const ResearchCanvas3D: React.FC<ResearchCanvas3DProps> = ({
  initialPhaseId,
  onExit,
}) => {
  // Resolve initial phase ID (mapping 'm1'..'m5' to 'phase-05'..'phase-01')
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

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const activeArtifactRef = useRef<PhaseArtifactInstance | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const currentPhaseMeta: PhaseMetadata =
    RESEARCH_PHASES.find((p) => p.id === activePhaseId) || RESEARCH_PHASES[4];

  // Helper to switch active artifact inside current scene
  const switchArtifact = useCallback((phaseId: ResearchPhaseId) => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !controls) return;

    setIsLoadingGeometry(true);

    // Dispose old artifact
    if (activeArtifactRef.current) {
      scene.remove(activeArtifactRef.current.group);
      activeArtifactRef.current.dispose();
      activeArtifactRef.current = null;
    }

    // Build new artifact
    let newArtifact: PhaseArtifactInstance;
    switch (phaseId) {
      case 'phase-01':
        newArtifact = createPhase01Autograd();
        break;
      case 'phase-02':
        newArtifact = createPhase02Optimization();
        break;
      case 'phase-03':
        newArtifact = createPhase03MetricSpaces();
        break;
      case 'phase-04':
        newArtifact = createPhase04Attention();
        break;
      case 'phase-05':
      default:
        newArtifact = createPhase05LatentManifold();
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

    // Brief smooth reveal
    setTimeout(() => {
      setIsLoadingGeometry(false);
    }, 120);
  }, []);

  // Initialize WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
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

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Canvas styling
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none'; // prevent native mobile scroll interception
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5.0;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // prevent going completely beneath floor
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // 5. Scientific Laboratory Lighting (Balanced, soft highlights without glare blowout)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(8, 14, 10);
    scene.add(dirLight);

    const crimsonLight = new THREE.PointLight(0xe11d48, 2.4, 35);
    crimsonLight.position.set(-6, 8, -4);
    scene.add(crimsonLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 1.0, 25);
    fillLight.position.set(6, -4, 6);
    scene.add(fillLight);

    // Initial artifact load
    switchArtifact(activePhaseId);

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

    // Animation Render Loop
    let clock = new THREE.Clock();
    let isMounted = true;

    const renderLoop = () => {
      if (!isMounted) return;
      animFrameIdRef.current = requestAnimationFrame(renderLoop);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

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
  }, []);

  // Handle phase change
  const handleSelectPhase = (phaseId: ResearchPhaseId) => {
    if (phaseId === activePhaseId) return;
    playSound('select');
    setActivePhaseId(phaseId);
    switchArtifact(phaseId);
  };

  // Reset Camera to default view of active artifact
  const handleResetCamera = () => {
    playSound('click');
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const artifact = activeArtifactRef.current;
    if (!camera || !controls || !artifact) return;

    const [cx, cy, cz] = artifact.defaultCameraPosition;
    const [tx, ty, tz] = artifact.defaultTarget;
    camera.position.set(cx, cy, cz);
    controls.target.set(tx, ty, tz);
    controls.update();
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

      {/* Subtle background ambient grid & vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(7,9,14,0.7)_100%)]" />

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

        {/* Right: Technical Controls (Reset Camera, Toggle Info, Exit) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Toggle Details Mobile */}
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
          RIGHT / BOTTOM-RIGHT: Technical Telemetry Ledger
         ------------------------------------------------------------------- */}
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
              RESOLVING 3D GEOMETRY // PHASE {currentPhaseMeta.numeral}
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
