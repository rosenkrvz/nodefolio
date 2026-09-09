import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectItem } from '../../types';
import { ArrowUpRight, RotateCcw } from '../icons';
import { getDevicePerformanceTier } from '../../lib/performanceTier';

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

export const ProjectNodeContent: React.FC<ProjectNodeContentProps> = ({
  project,
  onOpenModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projectionMode, setProjectionMode] = useState<'umap' | 'tsne' | 'pca'>('umap');
  const [isRotating, setIsRotating] = useState(true);
  const rotationRef = useRef({ rotX: 0.35, rotY: 0.75 });
  const mousePosRef = useRef({ isDown: false, startX: 0, startY: 0 });

  // Generate deterministic computational clusters (embeddings)
  const pointsRef = useRef<Point3D[]>([]);
  const projectedRef = useRef<Array<{ x: number; y: number; z: number; cluster: number; size: number }>>([]);

  useEffect(() => {
    const tier = getDevicePerformanceTier();
    const countPerCluster = tier === 'low' ? 20 : tier === 'balanced' ? 32 : 44;
    const pts: Point3D[] = [];
    const clusterCenters = [
      { x: -50, y: -30, z: 30, color: 0 },
      { x: 45, y: 40, z: -20, color: 1 },
      { x: -20, y: 55, z: 45, color: 2 },
      { x: 35, y: -45, z: -35, color: 3 },
    ];

    clusterCenters.forEach((c, cIdx) => {
      for (let i = 0; i < countPerCluster; i++) {
        const u = Math.random();
        const v = Math.random();
        const rad = Math.sqrt(-2 * Math.log(u || 0.01)) * 22;
        const theta = 2 * Math.PI * v;
        pts.push({
          x: c.x + rad * Math.cos(theta),
          y: c.y + rad * Math.sin(theta) + (Math.random() - 0.5) * 16,
          z: c.z + (Math.random() - 0.5) * 32,
          cluster: cIdx,
          size: Math.random() * 1.5 + 1.2,
        });
      }
    });
    pointsRef.current = pts;
    projectedRef.current = pts.map(() => ({ x: 0, y: 0, z: 0, cluster: 0, size: 0 }));
  }, []);

  // Canvas render loop with 3D projection and coordinate grid (optimized to pause when offscreen)
  useEffect(() => {
    let animFrame: number;
    let isVisible = true;
    let lastRenderTime = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tier = getDevicePerformanceTier();
    const minFrameInterval = tier === 'high' ? 16 : 32; // 60fps on high, 30fps on balanced/low

    let time = 0;

    const render = (now: number = performance.now()) => {
      if (!isVisible) return;

      if (now - lastRenderTime < minFrameInterval) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = now;

      time += 0.015;
      if (isRotating) {
        rotationRef.current.rotY += 0.006;
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

      // 1. Draw Coordinate Grid & Bounding Axes (Low-opacity subtle technical lines)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;

      const axisLines = [
        [[-80, 0, 0], [80, 0, 0]],
        [[0, -60, 0], [0, 60, 0]],
        [[0, 0, -60], [0, 60, 0]],
      ];

      axisLines.forEach(([p1, p2]) => {
        // Rotate p1
        const x1 = p1[0] * cosY - p1[2] * sinY;
        const z1 = p1[0] * sinY + p1[2] * cosY;
        const y1 = p1[1] * cosX - z1 * sinX;
        const z1p = p1[1] * sinX + z1 * cosX;

        // Rotate p2
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

      // 2. Project clustered points into pre-allocated reusable buffer (zero GC allocation)
      const clusterPalette = [
        '#f43f5e', // rose
        '#fb7185', // light rose
        '#e11d48', // crimson
        '#fda4af', // pink highlight
      ];

      const pts = pointsRef.current;
      const projected = projectedRef.current;
      const numPts = pts.length;

      if (numPts <= 0) {
        ctx.restore();
        animFrame = requestAnimationFrame(render);
        return;
      }

      for (let i = 0; i < numPts; i++) {
        const pt = pts[i];
        const osc = projectionMode === 'umap'
          ? Math.sin(time + pt.cluster) * 2
          : projectionMode === 'tsne'
          ? Math.cos(time * 0.8 + pt.x * 0.05) * 3
          : 0;

        const px = pt.x;
        const py = pt.y + osc;
        const pz = pt.z;

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

      // 3. Draw Manifold curves connecting proximate points
      ctx.lineWidth = 0.8;
      const step = tier === 'low' ? 8 : 6;
      for (let i = 0; i < numPts; i += step) {
        const p1 = projected[i];
        const p2 = projected[(i + 3) % numPts];
        if (p1 && p2) {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 70 && p1.cluster === p2.cluster) {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.16)';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 4. Draw Embedding Points
      for (let i = 0; i < numPts; i++) {
        const pt = projected[i];
        if (pt) {
          ctx.fillStyle = clusterPalette[pt.cluster] || '#f43f5e';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(0.8, pt.size), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animFrame = requestAnimationFrame(render);
    };

    // Pause when browser tab is inactive
    const handleVisibilityChange = () => {
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

    // Pause when canvas is scrolled off viewport
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
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
      cancelAnimationFrame(animFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer?.disconnect();
    };
  }, [isRotating, projectionMode]);

  // Handle interactive manual rotation on canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    mousePosRef.current = { isDown: true, startX: e.clientX, startY: e.clientY };
    setIsRotating(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!mousePosRef.current.isDown) return;
    const dx = e.clientX - mousePosRef.current.startX;
    const dy = e.clientY - mousePosRef.current.startY;
    mousePosRef.current.startX = e.clientX;
    mousePosRef.current.startY = e.clientY;
    rotationRef.current.rotY += dx * 0.01;
    rotationRef.current.rotX = Math.max(-1.2, Math.min(1.2, rotationRef.current.rotX - dy * 0.01));
  };

  const handlePointerUp = () => {
    mousePosRef.current.isDown = false;
  };

  return (
    <div className="space-y-3.5 pt-1 text-zinc-300">
      {/* 3D Manifold Canvas Container */}
      <div 
        className="relative rounded-xl overflow-hidden border border-white/[0.09] bg-[#0c0e12] aspect-[16/10] group cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={250}
          className="w-full h-full object-cover block"
        />

        {/* Real computational telemetry overlay */}
        <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none text-xs font-body text-zinc-300">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-zinc-200 uppercase tracking-wider font-semibold text-[11px]">{projectionMode.toUpperCase()} Proj</span>
          </div>

          <div className="px-2.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/[0.08] text-zinc-300 text-[11px] font-medium">
            512-D → 3-D Manifold
          </div>
        </div>

        {/* Bottom canvas controls */}
        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-0.5 rounded-md border border-white/[0.08] text-xs font-body">
            {(['umap', 'tsne', 'pca'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setProjectionMode(mode)}
                className={`px-2 py-0.5 rounded transition-all uppercase text-[11px] font-semibold ${
                  projectionMode === mode
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded bg-black/70 backdrop-blur-md border border-white/[0.08] text-xs font-body transition-colors ${
              isRotating ? 'text-rose-400 border-rose-500/30' : 'text-zinc-400 hover:text-white'
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
