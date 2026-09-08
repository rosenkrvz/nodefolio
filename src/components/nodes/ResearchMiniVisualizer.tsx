import React from 'react';

interface ResearchMiniVisualizerProps {
  type: string;
  accentColor?: string;
}

const ResearchMiniVisualizerComponent: React.FC<ResearchMiniVisualizerProps> = ({
  type,
  accentColor = '#f43f5e',
}) => {
  switch (type) {
    // 1. Statistical Inference: Gaussian Bell Curve with Moving Mean
    case 'distribution':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 40" fill="none">
            {/* Shaded density region */}
            <path
              d="M 5 38 Q 25 38 35 26 Q 50 4 65 26 Q 75 38 95 38 Z"
              fill={accentColor}
              fillOpacity="0.12"
            />
            {/* Bell curve stroke */}
            <path
              d="M 5 38 Q 25 38 35 26 Q 50 4 65 26 Q 75 38 95 38"
              stroke={accentColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Dynamic Credible Interval Line */}
            <line x1="50" y1="4" x2="50" y2="38" stroke="#ffffff" strokeOpacity="0.4" strokeDasharray="2 2" strokeWidth="1" />
            <circle cx="50" cy="4" r="2.5" fill="#ffffff" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-tech text-zinc-500 uppercase tracking-wider">
            N(μ, σ²)
          </span>
        </div>
      );

    // 2. Optimization Engine: Gradient Descent Trajectory on Contours
    case 'trajectory':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 40" fill="none">
            {/* Concentric Loss Landscape Contours */}
            <ellipse cx="65" cy="20" rx="30" ry="16" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <ellipse cx="65" cy="20" rx="20" ry="10" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <ellipse cx="65" cy="20" rx="10" ry="5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            {/* Descent Path Steps */}
            <path
              d="M 12 8 L 30 14 L 46 16 L 58 19 L 65 20"
              stroke={accentColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 1"
            />
            <circle cx="12" cy="8" r="2" fill="#ef4444" />
            <circle cx="65" cy="20" r="2.5" fill="#10b981" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-tech text-zinc-500 uppercase tracking-wider">
            ∇L(θ) → min
          </span>
        </div>
      );

    // 3. Data Pipeline: 3 Sequential Ingestion/Transformation Stages
    case 'pipeline':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] px-3 py-2 flex items-center justify-between overflow-hidden font-tech">
          <div className="flex items-center gap-1.5 w-full justify-between">
            <div className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] text-zinc-400">
              RAW
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-700 via-rose-500 to-zinc-700 relative">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 absolute -top-[2.5px] left-1/2 -translate-x-1/2 shadow-[0_0_6px_#f43f5e]" />
            </div>
            <div className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] text-zinc-300">
              ARROW
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-700 via-rose-500 to-zinc-700" />
            <div className="px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-[9px] text-rose-300 font-bold">
              TENSORS
            </div>
          </div>
          <span className="absolute bottom-0.5 right-2 text-[8px] text-zinc-500 tracking-wider">
            420 MB/S
          </span>
        </div>
      );

    // 4. Model Evaluation: Precision / Recall / Calibration Telemetry Bars
    case 'benchmarks':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2.5 flex flex-col justify-center gap-1.5 overflow-hidden font-tech">
          <div>
            <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
              <span>ROC-AUC</span>
              <span className="text-zinc-200 font-bold">0.984</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '98.4%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5">
              <span>CALIBRATION (ECE)</span>
              <span className="text-emerald-400 font-bold">0.012</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      );

    // 5. Vector Systems: 1536-D Projected Point Cloud
    case 'pointcloud':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 40" fill="none">
            {/* Cluster 1 */}
            <circle cx="30" cy="18" r="1.5" fill="rgba(244,63,94,0.7)" />
            <circle cx="34" cy="12" r="2" fill="rgba(244,63,94,0.9)" />
            <circle cx="28" cy="24" r="1.5" fill="rgba(244,63,94,0.6)" />
            <circle cx="38" cy="20" r="1.8" fill="rgba(244,63,94,0.8)" />
            <line x1="30" y1="18" x2="34" y2="12" stroke="rgba(244,63,94,0.25)" strokeWidth="0.8" />
            <line x1="34" y1="12" x2="38" y2="20" stroke="rgba(244,63,94,0.25)" strokeWidth="0.8" />
            {/* Cluster 2 */}
            <circle cx="72" cy="16" r="2.2" fill="#ffffff" />
            <circle cx="68" cy="26" r="1.5" fill="rgba(255,255,255,0.7)" />
            <circle cx="78" cy="22" r="1.8" fill="rgba(255,255,255,0.8)" />
            <circle cx="82" cy="14" r="1.5" fill="rgba(255,255,255,0.6)" />
            <line x1="72" y1="16" x2="78" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            {/* Query Vector Connection */}
            <line x1="38" y1="20" x2="68" y2="26" stroke="#f43f5e" strokeWidth="1" strokeDasharray="1.5 1.5" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-tech text-zinc-500 uppercase tracking-wider">
            HNSW d=1536
          </span>
        </div>
      );

    // 6. Computer Vision: 4x4 Convolutional Feature Matrix
    case 'featuregrid':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2 flex items-center justify-between px-4 overflow-hidden font-tech">
          <div className="grid grid-cols-4 gap-1">
            {[0.8, 0.2, 0.9, 0.4, 0.1, 0.7, 0.3, 0.95, 0.6, 0.85, 0.2, 0.5, 0.9, 0.3, 0.75, 0.1].map(
              (v, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{
                    backgroundColor: accentColor,
                    opacity: 0.15 + v * 0.85,
                  }}
                />
              )
            )}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-200 font-bold tracking-wider">ViT-B/16</div>
            <div className="text-[8px] text-zinc-500 uppercase tracking-wider">RECEPTIVE FIELD</div>
          </div>
        </div>
      );

    // 7. Generative Systems: Reverse Diffusion Particle Field
    case 'particlefield':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 40" fill="none">
            {/* Diffused particles consolidating */}
            <circle cx="15" cy="10" r="1" fill="rgba(255,255,255,0.3)" />
            <circle cx="25" cy="30" r="1.2" fill="rgba(255,255,255,0.4)" />
            <circle cx="40" cy="14" r="1.5" fill="rgba(244,63,94,0.5)" />
            <circle cx="55" cy="24" r="1.8" fill="rgba(244,63,94,0.7)" />
            <circle cx="70" cy="18" r="2.2" fill="rgba(244,63,94,0.9)" />
            <circle cx="85" cy="20" r="2.8" fill="#ffffff" />
            <path d="M 15 10 Q 50 35 85 20" stroke={accentColor} strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-tech text-zinc-500 uppercase tracking-wider">
            SDE SCORE T=0
          </span>
        </div>
      );

    // 8. Software Systems: Microservice Bus
    case 'architecture':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] px-3 py-2 flex items-center justify-between overflow-hidden font-tech">
          <div className="flex items-center gap-1.5 w-full justify-between">
            <div className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] text-zinc-400">
              GATEWAY
            </div>
            <div className="h-[1px] flex-1 bg-white/20" />
            <div className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] text-zinc-300">
              RUNTIME
            </div>
            <div className="h-[1px] flex-1 bg-white/20" />
            <div className="px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-[9px] text-rose-300 font-bold">
              CUDA ENGINE
            </div>
          </div>
          <span className="absolute bottom-0.5 right-2 text-[8px] text-zinc-500 tracking-wider">
            p99: 14.2ms
          </span>
        </div>
      );

    // 9. Experiment Lab: Continuous Iteration Run Badges
    case 'iterations':
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2 flex items-center justify-between px-3 overflow-hidden font-tech">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-200 font-bold">RUN #142 ACTIVE</span>
            </div>
            <div className="text-[9px] text-zinc-400">19 SURVIVING HYPOTHESES</div>
          </div>
          <div className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] text-rose-400 font-bold">
            STRESS OK
          </div>
        </div>
      );

    // 10. Computational Systems: Latency Clock & Asymptotic Complexity
    case 'latencyclock':
    default:
      return (
        <div className="relative w-full h-16 rounded-lg bg-black/40 border border-white/[0.06] p-2 flex items-center justify-between px-3 overflow-hidden font-tech">
          <div>
            <div className="text-[10px] text-zinc-200 font-bold">ROOFLINE: COMPUTE</div>
            <div className="text-[9px] text-zinc-400">BF16 TENSOR CORES</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-rose-400 font-bold">O(N) ATTN</div>
            <div className="text-[8px] text-zinc-500">LINEAR ADAPT</div>
          </div>
        </div>
      );
  }
};

export const ResearchMiniVisualizer = React.memo(ResearchMiniVisualizerComponent);
