import React from 'react';
import { ResearchPhaseId } from './types';

interface MiniArtifactPreviewProps {
  phaseId: ResearchPhaseId;
  active?: boolean;
  className?: string;
}

export const MiniArtifactPreview: React.FC<MiniArtifactPreviewProps> = ({
  phaseId,
  active = false,
  className = 'w-9 h-7',
}) => {
  const activeColor = active ? '#fb7185' : '#71717a';
  const glowColor = active ? 'rgba(244, 63, 94, 0.4)' : 'transparent';

  switch (phaseId) {
    case 'phase-01':
      // DAG: Computational Graph nodes & directed edges
      return (
        <svg
          viewBox="0 0 36 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ filter: active ? `drop-shadow(0 0 4px ${glowColor})` : 'none' }}
        >
          {/* Edges */}
          <path d="M6 8 L18 14 M6 20 L18 14 M18 14 L30 14" stroke={active ? '#be123c' : '#3f3f46'} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M6 14 L18 14" stroke={active ? '#e11d48' : '#52525b'} strokeWidth="1" strokeDasharray="2 1.5" />
          {/* Input Nodes */}
          <circle cx="6" cy="8" r="2.2" fill={activeColor} />
          <circle cx="6" cy="14" r="2.2" fill={activeColor} />
          <circle cx="6" cy="20" r="2.2" fill={activeColor} />
          {/* Op Node */}
          <rect x="15.8" y="11.8" width="4.4" height="4.4" rx="1" fill={active ? '#f43f5e' : '#a1a1aa'} />
          {/* Output Loss Node */}
          <circle cx="30" cy="14" r="2.6" fill={active ? '#f43f5e' : '#71717a'} stroke={active ? '#ffffff' : '#3f3f46'} strokeWidth="0.8" />
        </svg>
      );

    case 'phase-02':
      // Optimization: Paraboloid Contours & Steepest Descent Path
      return (
        <svg
          viewBox="0 0 36 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ filter: active ? `drop-shadow(0 0 4px ${glowColor})` : 'none' }}
        >
          {/* Concentric elliptical contour isolines */}
          <ellipse cx="18" cy="14" rx="14" ry="9" stroke={active ? '#9f1239' : '#27272a'} strokeWidth="0.8" />
          <ellipse cx="18" cy="14" rx="9.5" ry="6" stroke={active ? '#e11d48' : '#3f3f46'} strokeWidth="1" />
          <ellipse cx="18" cy="14" rx="5" ry="3.2" stroke={active ? '#fb7185' : '#52525b'} strokeWidth="1.1" />
          {/* Global Minimum Center */}
          <circle cx="18" cy="14" r="1.8" fill={active ? '#10b981' : '#71717a'} />
          {/* Descent Trajectory Arrow */}
          <path
            d="M7 6 Q11 11 18 14"
            stroke={active ? '#ffffff' : '#a1a1aa'}
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="7" cy="6" r="1.5" fill={active ? '#ffffff' : '#a1a1aa'} />
        </svg>
      );

    case 'phase-03':
      // Metric Spaces: Unit Hypersphere & Contrastive Pair alignment
      return (
        <svg
          viewBox="0 0 36 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ filter: active ? `drop-shadow(0 0 4px ${glowColor})` : 'none' }}
        >
          {/* Hypersphere circle + latitude line */}
          <circle cx="18" cy="14" r="10" stroke={active ? '#881337' : '#27272a'} strokeWidth="1" />
          <ellipse cx="18" cy="14" rx="10" ry="3.5" stroke={active ? '#be123c' : '#3f3f46'} strokeWidth="0.8" strokeDasharray="2 1.5" />
          {/* Positive Pair alignment tension */}
          <line x1="12" y1="11" x2="24" y2="17" stroke={active ? '#fb7185' : '#71717a'} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
          <circle cx="12" cy="11" r="2.2" fill={active ? '#f43f5e' : '#a1a1aa'} />
          <circle cx="24" cy="17" r="2.2" fill={active ? '#f43f5e' : '#a1a1aa'} />
          {/* Repulsion negative node */}
          <circle cx="21" cy="9" r="1.8" fill={active ? '#38bdf8' : '#52525b'} />
        </svg>
      );

    case 'phase-04':
      // Attention Kernels: Bipartite Query-Key routing beams
      return (
        <svg
          viewBox="0 0 36 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ filter: active ? `drop-shadow(0 0 4px ${glowColor})` : 'none' }}
        >
          {/* Query plane nodes (top) */}
          <circle cx="8" cy="7" r="2" fill={active ? '#fb7185' : '#71717a'} />
          <circle cx="18" cy="7" r="2.2" fill={active ? '#f43f5e' : '#a1a1aa'} />
          <circle cx="28" cy="7" r="2" fill={active ? '#fb7185' : '#71717a'} />
          {/* Key plane nodes (bottom) */}
          <circle cx="8" cy="21" r="2" fill={active ? '#fda4af' : '#52525b'} />
          <circle cx="18" cy="21" r="2" fill={active ? '#fda4af' : '#52525b'} />
          <circle cx="28" cy="21" r="2.2" fill={active ? '#f43f5e' : '#a1a1aa'} />
          {/* Softmax Routing Energy Beams */}
          <line x1="18" y1="7" x2="28" y2="21" stroke={active ? '#f43f5e' : '#71717a'} strokeWidth="1.5" />
          <line x1="18" y1="7" x2="18" y2="21" stroke={active ? '#be123c' : '#3f3f46'} strokeWidth="1" strokeOpacity="0.8" />
          <line x1="8" y1="7" x2="8" y2="21" stroke={active ? '#9f1239' : '#27272a'} strokeWidth="0.8" strokeOpacity="0.6" />
          <line x1="28" y1="7" x2="18" y2="21" stroke={active ? '#9f1239' : '#27272a'} strokeWidth="0.8" strokeOpacity="0.6" />
        </svg>
      );

    case 'phase-05':
      // Latent Manifolds: Undulating Riemannian surface wave & Geodesic curve
      return (
        <svg
          viewBox="0 0 36 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ filter: active ? `drop-shadow(0 0 4px ${glowColor})` : 'none' }}
        >
          {/* Manifold Mesh Wire curves */}
          <path d="M5 20 Q14 8 23 18 T31 10" stroke={active ? '#be123c' : '#3f3f46'} strokeWidth="0.9" fill="none" />
          <path d="M5 16 Q14 4 23 14 T31 7" stroke={active ? '#e11d48' : '#52525b'} strokeWidth="1" fill="none" />
          <path d="M5 24 Q14 12 23 22 T31 14" stroke={active ? '#881337' : '#27272a'} strokeWidth="0.8" fill="none" />
          {/* Active Geodesic Trajectory */}
          <path d="M8 18 C14 7, 20 18, 28 8" stroke={active ? '#ffffff' : '#a1a1aa'} strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="8" r="1.8" fill={active ? '#f43f5e' : '#ffffff'} />
        </svg>
      );

    default:
      return null;
  }
};
