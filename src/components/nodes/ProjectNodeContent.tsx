import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectItem } from '../../types';
import { ArrowUpRight, RotateCcw, Activity } from 'lucide-react';

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

  useEffect(() => {
    const pts: Point3D[] = [];
    const clusterCenters = [
      { x: -50, y: -30, z: 30, color: 0 },
      { x: 45, y: 40, z: -20, color: 1 },
      { x: -20, y: 55, z: 45, color: 2 },
      { x: 35, y: -45, z: -35, color: 3 },
    ];

    clusterCenters.forEach((c, cIdx) => {
      for (let i = 0; i < 48; i++) {
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
  }, []);

  // Canvas render loop with 3D projection and coordinate grid
  useEffect(() => {
    let animFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
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
        [[0, 0, -60], [0, 0, 60]],
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

      // 2. Project and sort clustered points
      const clusterPalette = [
        '#f43f5e', // rose
        '#fb7185', // light rose
        '#e11d48', // crimson
        '#fda4af', // pink highlight
      ];

      const projected = pointsRef.current.map((pt) => {
        // Subtle topological oscillation depending on projection mode
        const osc = projectionMode === 'umap' 
          ? Math.sin(time + pt.cluster) * 2 
          : projectionMode === 'tsne' 
          ? Math.cos(time * 0.8 + pt.x * 0.05) * 3 
          : 0;

        const px = pt.x;
        const py = pt.y + osc;
        const pz = pt.z;

        // Rotate Y
        const rx1 = px * cosY - pz * sinY;
        const rz1 = px * sinY + pz * cosY;
        // Rotate X
        const ry2 = py * cosX - rz1 * sinX;
        const rz2 = py * sinX + rz1 * cosX;

        const scale = fov / (fov + rz2 + 140);
        return {
          x: cx + rx1 * scale,
          y: cy + ry2 * scale,
          z: rz2,
          cluster: pt.cluster,
          size: pt.size * scale,
        };
      });

      projected.sort((a, b) => b.z - a.z);

      // 3. Draw Manifold curves connecting proximate points
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i += 6) {
        const p1 = projected[i];
        const p2 = projected[(i + 3) % projected.length];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 70 && p1.cluster === p2.cluster) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.16)';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 4. Draw Embedding Points
      projected.forEach((pt) => {
        ctx.fillStyle = clusterPalette[pt.cluster] || '#f43f5e';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.8, pt.size), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrame);
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
        <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none text-[9px] font-tech text-zinc-400">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-zinc-300 uppercase tracking-wider">{projectionMode.toUpperCase()} Proj</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/[0.06] text-zinc-400">
            512-D → 3-D Manifold
          </div>
        </div>

        {/* Bottom canvas controls */}
        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-0.5 rounded-md border border-white/[0.08] text-[9px] font-tech">
            {(['umap', 'tsne', 'pca'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setProjectionMode(mode)}
                className={`px-1.5 py-0.5 rounded transition-all uppercase ${
                  projectionMode === mode
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40 font-medium'
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
            className={`p-1 rounded bg-black/60 backdrop-blur-md border border-white/[0.08] text-[9px] font-tech transition-colors ${
              isRotating ? 'text-rose-400 border-rose-500/30' : 'text-zinc-400 hover:text-white'
            }`}
            title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
          >
            <RotateCcw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </button>
        </div>
      </div>

      {/* Editorial description */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-tech text-[10px] text-rose-400 uppercase tracking-widest">
            Computational Artifact
          </span>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="font-tech text-[10px] text-zinc-500">
            Interactive Latent Space
          </span>
        </div>
        <p className="font-body text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Metric chips */}
      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
        {project.metrics.map((m, idx) => (
          <div
            key={idx}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-center"
          >
            <div className="text-[9px] font-tech text-zinc-500 uppercase">{m.label}</div>
            <div className="text-[11px] font-tech text-zinc-200 font-medium truncate mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-[10px] font-tech text-zinc-400">Latent Traversal Active</span>
        </div>

        <button
          type="button"
          onClick={() => onOpenModal(project)}
          className="group inline-flex items-center gap-1 text-xs font-body font-medium text-rose-400 hover:text-rose-300 transition-colors"
        >
          <span>Open Case Study</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
