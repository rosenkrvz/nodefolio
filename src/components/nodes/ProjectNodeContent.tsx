import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectItem } from '../../types';
import { ArrowUpRight, RotateCcw } from '../icons';
import { getDevicePerformanceTier } from '../../lib/performanceTier';
import { playSound } from '../../lib/sound';

interface ProjectNodeContentProps {
  project: ProjectItem;
  onOpenModal: (project: ProjectItem) => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  cluster: number;
  size: number;
}

// Deterministic pseudo-random number generator (PRNG) for reproducible, stable mathematical structures
const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Generates 3 mathematically distinct manifold topologies:
// 1. UMAP: Continuous curved topological manifold streams with interconnecting bridges
// 2. t-SNE: 4 widely segregated, dense globular cluster islands (heavy-tailed repulsion)
// 3. PCA: Elongated continuous orthogonal scatter aligned with principal component eigenvectors
const generatePointsForMode = (mode: 'umap' | 'tsne' | 'pca', totalPoints: number): Point3D[] => {
  const pts: Point3D[] = [];
  const countPerCluster = Math.max(1, Math.floor(totalPoints / 4));

  if (mode === 'umap') {
    // ─── UMAP: Interconnected, curved topological manifolds ─────────────
    for (let i = 0; i < totalPoints; i++) {
      const cluster = i % 4;
      const t = (Math.floor(i / 4)) / countPerCluster;
      const r1 = pseudoRandom(i * 7 + 1);
      const r2 = pseudoRandom(i * 7 + 2);
      const r3 = pseudoRandom(i * 7 + 3);

      let x = 0;
      let y = 0;
      let z = 0;

      if (cluster === 0) {
        // Curved upper manifold arc
        const angle = -0.35 + t * Math.PI * 1.35;
        x = -32 + Math.cos(angle) * 44 + (r1 - 0.5) * 14;
        y = -22 + Math.sin(angle) * 36 + (r2 - 0.5) * 14;
        z = -18 + t * 48 + (r3 - 0.5) * 14;
      } else if (cluster === 1) {
        // Intersecting wave manifold
        x = 36 + Math.sin(t * Math.PI * 1.5) * 32 + (r1 - 0.5) * 15;
        y = 18 + Math.cos(t * Math.PI * 1.2) * 28 + (r2 - 0.5) * 14;
        z = 24 - t * 52 + (r3 - 0.5) * 16;
      } else if (cluster === 2) {
        // Spiral looping attractor
        const angle = t * Math.PI * 2.2;
        const rad = 14 + t * 16;
        x = -22 + Math.cos(angle) * rad + (r1 - 0.5) * 12;
        y = 38 + Math.sin(angle) * rad + (r2 - 0.5) * 12;
        z = -22 + t * 32 + (r3 - 0.5) * 14;
      } else {
        // Lower connecting filament
        x = 28 + (t - 0.5) * 54 + (r1 - 0.5) * 16;
        y = -44 + (t - 0.5) * 30 + (r2 - 0.5) * 14;
        z = -22 + Math.sin(t * Math.PI * 2) * 24 + (r3 - 0.5) * 16;
      }

      pts.push({ x, y, z, cluster, size: 1.2 + r1 * 1.4 });
    }
  } else if (mode === 'tsne') {
    // ─── t-SNE: 4 widely segregated, dense globular islands (repulsive voids) ─
    const centers = [
      { x: -68, y: -46, z: 24 },
      { x: 68, y: 46, z: -24 },
      { x: -50, y: 56, z: -30 },
      { x: 52, y: -52, z: 38 },
    ];

    for (let i = 0; i < totalPoints; i++) {
      const cluster = i % 4;
      const c = centers[cluster];
      const r1 = pseudoRandom(i * 11 + 1);
      const r2 = pseudoRandom(i * 11 + 2);
      const r3 = pseudoRandom(i * 11 + 3);

      // Spherical Gaussian cluster
      const rad = Math.cbrt(r1) * 16.5;
      const theta = r2 * Math.PI * 2;
      const phi = Math.acos(2 * r3 - 1);

      const x = c.x + rad * Math.sin(phi) * Math.cos(theta);
      const y = c.y + rad * Math.sin(phi) * Math.sin(theta);
      const z = c.z + rad * Math.cos(phi);

      pts.push({ x, y, z, cluster, size: 1.3 + r1 * 1.5 });
    }
  } else {
    // ─── PCA: Continuous orthogonal scatter along principal component eigenvectors ─
    for (let i = 0; i < totalPoints; i++) {
      const cluster = i % 4;
      const r1 = pseudoRandom(i * 19 + 1);
      const r2 = pseudoRandom(i * 19 + 2);
      const r3 = pseudoRandom(i * 19 + 3);

      // Continuous stratified variance along primary PC1
      const pc1Center = (cluster - 1.5) * 46;
      const pc1 = pc1Center + (r1 - 0.5) * 38;
      const pc2 = (r2 - 0.5) * 42;
      const pc3 = (r3 - 0.5) * 18;

      // Linear projection onto eigenvectors
      const x = pc1 * 0.88 + pc2 * (-0.36) + pc3 * 0.30;
      const y = pc1 * 0.40 + pc2 * 0.88 + pc3 * (-0.24);
      const z = pc1 * (-0.26) + pc2 * 0.28 + pc3 * 0.92;

      pts.push({ x, y, z, cluster, size: 1.1 + r1 * 1.3 });
    }
  }

  return pts;
};

export const ProjectNodeContent: React.FC<ProjectNodeContentProps> = ({
  project,
  onOpenModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projectionMode, setProjectionMode] = useState<'umap' | 'tsne' | 'pca'>('umap');
  const [isRotating, setIsRotating] = useState(true);
  const rotationRef = useRef({ rotX: 0.35, rotY: 0.75 });
  const mousePosRef = useRef({ isDown: false, startX: 0, startY: 0 });

  const totalPointsRef = useRef(128);
  const currentPointsRef = useRef<Point3D[]>([]);
  const targetPointsRef = useRef<Point3D[]>([]);
  const morphStartPointsRef = useRef<Point3D[]>([]);
  const morphStartTimeRef = useRef<number>(0);
  const isMorphingRef = useRef<boolean>(false);
  const projectedRef = useRef<Array<{ x: number; y: number; z: number; cluster: number; size: number }>>([]);

  // Initialize points on mount
  useEffect(() => {
    const tier = getDevicePerformanceTier();
    const countPerCluster = tier === 'low' ? 22 : tier === 'balanced' ? 34 : 46;
    const total = countPerCluster * 4;
    totalPointsRef.current = total;

    const initialPts = generatePointsForMode('umap', total);
    currentPointsRef.current = initialPts.map((p) => ({ ...p }));
    targetPointsRef.current = initialPts.map((p) => ({ ...p }));
    morphStartPointsRef.current = initialPts.map((p) => ({ ...p }));
    projectedRef.current = initialPts.map(() => ({ x: 0, y: 0, z: 0, cluster: 0, size: 0 }));
  }, []);

  // Switch projection mode with fluid morphing transition
  const handleSelectMode = useCallback((mode: 'umap' | 'tsne' | 'pca') => {
    if (mode === projectionMode) return;
    playSound('click');
    setProjectionMode(mode);

    const total = totalPointsRef.current;
    const newTargetPts = generatePointsForMode(mode, total);
    targetPointsRef.current = newTargetPts;
    morphStartPointsRef.current = currentPointsRef.current.map((p) => ({ ...p }));
    morphStartTimeRef.current = performance.now();
    isMorphingRef.current = true;
  }, [projectionMode]);

  // Canvas render loop with 3D projection, dynamic morphing, and coordinates
  useEffect(() => {
    let animFrame: number;
    let disposed = false;
    let isVisible = true;
    let lastRenderTime = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tier = getDevicePerformanceTier();
    const minFrameInterval = tier === 'high' ? 16 : 32;

    let time = 0;

    const render = (now: number = performance.now()) => {
      if (disposed || !isVisible) return;

      if (now - lastRenderTime < minFrameInterval) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = now;

      time += 0.015;
      if (isRotating) {
        rotationRef.current.rotY += 0.007;
      }

      // ── Smooth Morph Interpolation ─────────────────────────────────
      if (isMorphingRef.current) {
        const elapsed = now - morphStartTimeRef.current;
        const duration = 460;
        const progress = Math.min(1, elapsed / duration);
        // Cubic ease-out
        const t = 1 - Math.pow(1 - progress, 3);

        const starts = morphStartPointsRef.current;
        const targets = targetPointsRef.current;
        const current = currentPointsRef.current;

        for (let i = 0; i < current.length; i++) {
          const s = starts[i] || targets[i];
          const trg = targets[i];
          if (s && trg) {
            current[i].x = s.x + (trg.x - s.x) * t;
            current[i].y = s.y + (trg.y - s.y) * t;
            current[i].z = s.z + (trg.z - s.z) * t;
            current[i].size = s.size + (trg.size - s.size) * t;
            current[i].cluster = trg.cluster;
          }
        }

        if (progress >= 1) {
          isMorphingRef.current = false;
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 260;

      const cosY = Math.cos(rotationRef.current.rotY);
      const sinY = Math.sin(rotationRef.current.rotY);
      const cosX = Math.cos(rotationRef.current.rotX);
      const sinX = Math.sin(rotationRef.current.rotX);

      ctx.save();

      // ── 1. Coordinate Grid & Visual Reference Axes ─────────────────
      if (projectionMode === 'pca') {
        // PCA: Dominant Eigenvector principal axes
        const pcaAxes = [
          [[-85, -40, 26], [85, 40, -26]], // PC1 (82% variance)
          [[-36, 84, -26], [36, -84, 26]], // PC2 (12% variance)
          [[-24, 18, 75], [24, -18, -75]],  // PC3 (4% variance)
        ];

        pcaAxes.forEach(([p1, p2], idx) => {
          const x1 = p1[0] * cosY - p1[2] * sinY;
          const z1 = p1[0] * sinY + p1[2] * cosY;
          const y1 = p1[1] * cosX - z1 * sinX;
          const z1p = p1[1] * sinX + z1 * cosX;

          const x2 = p2[0] * cosY - p2[2] * sinY;
          const z2 = p2[0] * sinY + p2[2] * cosY;
          const y2 = p2[1] * cosX - z2 * sinX;
          const z2p = p2[1] * sinX + z2 * cosX;

          const scale1 = fov / (fov + z1p + 140);
          const scale2 = fov / (fov + z2p + 140);

          ctx.strokeStyle = idx === 0 ? 'rgba(244, 63, 94, 0.28)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = idx === 0 ? 1.4 : 1;
          ctx.beginPath();
          ctx.moveTo(cx + x1 * scale1, cy + y1 * scale1);
          ctx.lineTo(cx + x2 * scale2, cy + y2 * scale2);
          ctx.stroke();
        });
      } else if (projectionMode === 'tsne') {
        // t-SNE: Subtle centroid focal indicators
        const centers = [
          [-68, -46, 24],
          [68, 46, -24],
          [-50, 56, -30],
          [52, -52, 38],
        ];

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.14)';
        ctx.lineWidth = 1;
        centers.forEach(([px, py, pz]) => {
          const rx = px * cosY - pz * sinY;
          const rz = px * sinY + pz * cosY;
          const ry = py * cosX - rz * sinX;
          const rzp = py * sinX + rz * cosX;
          const scale = fov / (fov + rzp + 140);

          ctx.beginPath();
          ctx.arc(cx + rx * scale, cy + ry * scale, 18 * scale, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else {
        // UMAP: Subtle 3D Coordinate Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        const axisLines = [
          [[-80, 0, 0], [80, 0, 0]],
          [[0, -60, 0], [0, 60, 0]],
          [[0, 0, -60], [0, 60, 0]],
        ];

        axisLines.forEach(([p1, p2]) => {
          const x1 = p1[0] * cosY - p1[2] * sinY;
          const z1 = p1[0] * sinY + p1[2] * cosY;
          const y1 = p1[1] * cosX - z1 * sinX;
          const z1p = p1[1] * sinX + z1 * cosX;

          const x2 = p2[0] * cosY - p2[2] * sinY;
          const z2 = p2[0] * sinY + p2[2] * cosY;
          const y2 = p2[1] * cosX - z2 * sinX;
          const z2p = p2[1] * sinX + z2 * cosX;

          const scale1 = fov / (fov + z1p + 140);
          const scale2 = fov / (fov + z2p + 140);

          ctx.beginPath();
          ctx.moveTo(cx + x1 * scale1, cy + y1 * scale1);
          ctx.lineTo(cx + x2 * scale2, cy + y2 * scale2);
          ctx.stroke();
        });
      }

      // ── 2. Project Points into 2D screen buffer ────────────────────
      const pts = currentPointsRef.current;
      const projected = projectedRef.current;
      const numPts = pts ? pts.length : 0;

      if (numPts <= 0) {
        ctx.restore();
        if (!disposed) animFrame = requestAnimationFrame(render);
        return;
      }

      for (let i = 0; i < numPts; i++) {
        const pt = pts[i];
        if (!pt || typeof pt.x !== 'number' || !isFinite(pt.x) || typeof pt.y !== 'number' || !isFinite(pt.y)) continue;

        // Subtle procedural oscillation based on topology mode
        const osc = projectionMode === 'umap'
          ? Math.sin(time * 1.5 + pt.cluster * 1.2) * 2.2
          : projectionMode === 'tsne'
          ? Math.cos(time * 1.2 + pt.cluster) * 1.4
          : Math.sin(time + pt.x * 0.03) * 1.1;

        const px = pt.x;
        const py = pt.y + osc;
        const pz = typeof pt.z === 'number' && isFinite(pt.z) ? pt.z : 0;

        const rx1 = px * cosY - pz * sinY;
        const rz1 = px * sinY + pz * cosY;
        const ry2 = py * cosX - rz1 * sinX;
        const rz2 = py * sinX + rz1 * cosX;

        const scale = fov / (fov + rz2 + 140);
        const target = projected[i];
        if (target) {
          target.x = cx + rx1 * scale;
          target.y = cy + ry2 * scale;
          target.z = rz2;
          target.cluster = pt.cluster;
          target.size = pt.size * scale;
        }
      }

      // ── 3. Draw Manifold Lines ─────────────────────────────────────
      ctx.lineWidth = 0.85;
      if (projectionMode === 'umap') {
        // Continuous manifold curves bridging proximate cluster trajectories
        for (let i = 0; i < numPts; i += 4) {
          const p1 = projected[i];
          const p2 = projected[(i + 3) % numPts];
          if (p1 && p2 && isFinite(p1.x) && isFinite(p1.y) && isFinite(p2.x) && isFinite(p2.y)) {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 65 && p1.cluster === p2.cluster) {
              ctx.strokeStyle = 'rgba(244, 63, 94, 0.20)';
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      } else if (projectionMode === 'tsne') {
        // Strict intra-cluster connections (isolated globular islands)
        for (let i = 0; i < numPts; i += 2) {
          const p1 = projected[i];
          const p2 = projected[(i + 2) % numPts];
          if (p1 && p2 && p1.cluster === p2.cluster) {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 32) {
              ctx.strokeStyle = 'rgba(251, 113, 133, 0.22)';
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      } else {
        // PCA: Linear eigenvector variance gradient lines
        for (let i = 0; i < numPts - 4; i += 6) {
          const p1 = projected[i];
          const p2 = projected[i + 4];
          if (p1 && p2) {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 55) {
              ctx.strokeStyle = 'rgba(225, 29, 72, 0.16)';
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // ── 4. Draw Embedding Points ───────────────────────────────────
      const clusterPalette = [
        '#f43f5e', // rose
        '#fb7185', // light rose
        '#e11d48', // crimson
        '#fda4af', // pink highlight
      ];

      for (let i = 0; i < numPts; i++) {
        const pt = projected[i];
        if (pt && isFinite(pt.x) && isFinite(pt.y)) {
          ctx.fillStyle = clusterPalette[pt.cluster] || '#f43f5e';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(0.9, pt.size), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      if (!disposed) animFrame = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (disposed) return;
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animFrame);
      } else {
        isVisible = true;
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (disposed) return;
          const entry = entries && entries[0];
          if (!entry) return;
          if (!entry.isIntersecting) {
            isVisible = false;
            cancelAnimationFrame(animFrame);
          } else {
            isVisible = true;
            cancelAnimationFrame(animFrame);
            animFrame = requestAnimationFrame(render);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer?.disconnect();
    };
  }, [isRotating, projectionMode]);

  // ── Interactive 3D Rotation (Captures Pointer & Blocks Node Drag) ────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Crucial: stop propagation so parent GraphNode never starts dragging the card
    e.stopPropagation();
    if (e.button !== 0) return;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }

    mousePosRef.current = { isDown: true, startX: e.clientX, startY: e.clientY };
    setIsRotating(false);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!mousePosRef.current.isDown) return;
    e.stopPropagation();

    const dx = e.clientX - mousePosRef.current.startX;
    const dy = e.clientY - mousePosRef.current.startY;
    mousePosRef.current.startX = e.clientX;
    mousePosRef.current.startY = e.clientY;

    rotationRef.current.rotY += dx * 0.012;
    rotationRef.current.rotX = Math.max(-1.4, Math.min(1.4, rotationRef.current.rotX - dy * 0.012));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (mousePosRef.current.isDown) {
      e.stopPropagation();
      mousePosRef.current.isDown = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignore
      }
    }
  }, []);

  return (
    <div className="space-y-3.5 pt-1 text-zinc-300">
      {/* 3D Manifold Canvas Container with Explicit Drag Exclusions */}
      <div 
        data-no-node-drag="true"
        data-interactive-canvas="true"
        className="relative rounded-xl overflow-hidden border border-white/[0.09] bg-[#0c0e12] aspect-[16/10] group cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={250}
          className="w-full h-full object-cover block pointer-events-none"
        />

        {/* Real computational telemetry overlay */}
        <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none text-xs font-body text-zinc-300">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-zinc-200 uppercase tracking-wider font-semibold text-[11px]">{projectionMode.toUpperCase()} Proj</span>
          </div>

          <div className="px-2.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/[0.08] text-zinc-300 text-[11px] font-medium">
            {projectionMode === 'umap' ? '512-D → Topological Manifold' : projectionMode === 'tsne' ? '512-D → Clustered Islands' : '512-D → Orthogonal PCs'}
          </div>
        </div>

        {/* Bottom canvas projection mode & rotation controls */}
        <div 
          className="absolute bottom-2 inset-x-3 flex items-center justify-between pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-0.5 rounded-lg border border-white/[0.1] text-xs font-body">
            {(['umap', 'tsne', 'pca'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMode(mode);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className={`px-2 py-0.5 rounded-md transition-all uppercase text-[11px] font-semibold cursor-pointer ${
                  projectionMode === mode
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(225,29,72,0.35)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              setIsRotating(!isRotating);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/[0.1] text-xs font-body transition-all cursor-pointer ${
              isRotating ? 'text-rose-400 border-rose-500/40 shadow-[0_0_8px_rgba(225,29,72,0.25)]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </button>
        </div>
      </div>

      {/* Editorial description with Dongle accent */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-body text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              Computational Artifact
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="font-body text-xs text-zinc-400 font-medium">
              Interactive Latent Space
            </span>
          </div>
          <span className="font-accent text-2xl text-rose-300/80 leading-none lowercase tracking-wide hidden sm:inline">
            manifold
          </span>
        </div>
        <p className="font-body text-sm text-zinc-200 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Metric chips */}
      {Array.isArray(project?.metrics) && project.metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {project.metrics.map((m, idx) => (
            <div
              key={idx}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center"
            >
              <div className="text-[10px] font-body font-semibold text-zinc-400 uppercase tracking-wider">{m.label}</div>
              <div className="text-xs sm:text-[13px] font-display text-white font-semibold truncate mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-xs font-body font-medium text-zinc-300">Latent Traversal Active</span>
        </div>

        <button
          type="button"
          onClick={() => onOpenModal(project)}
          className="group inline-flex items-center gap-1 text-xs font-body font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>Open Case Study</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
