import * as THREE from 'three';

export type ResearchPhaseId =
  | 'phase-01'
  | 'phase-02'
  | 'phase-03'
  | 'phase-04'
  | 'phase-05';

export interface PhaseMetadata {
  id: ResearchPhaseId;
  chronicleId: string; // 'm5', 'm4', 'm3', 'm2', 'm1'
  numeral: string;
  title: string;
  subtitle: string;
  shortName?: string;
  topic: string;
  year: string;
  dimension: string;
  objectType: string;
  topology: string;
  computeBackend: string;
  description: string;
  tags: string[];
}

export interface PhaseArtifactInstance {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
  dispose: () => void;
  defaultCameraPosition: [number, number, number];
  defaultTarget: [number, number, number];
}

export const RESEARCH_PHASES: PhaseMetadata[] = [
  {
    id: 'phase-01',
    chronicleId: 'm5',
    numeral: '01',
    title: 'AUTOGRAD ENGINE',
    subtitle: 'Reverse-Mode Autodiff Tape',
    shortName: 'AUTOGRAD',
    topic: 'Computational DAG & Adjoint Flow',
    year: '2023',
    dimension: 'Directed Acyclic Graph [DAG]',
    objectType: 'Computational Graph & Adjoint Flow',
    topology: 'Discrete Topological Tape',
    computeBackend: 'C++ Tape / Python Extension',
    description:
      'A 3D topological computational graph tracing forward scalar and matrix operations, with continuous animated reverse-mode gradient backpropagation along adjoint edges.',
    tags: ['Computational Graphs', 'Reverse-Mode Autodiff', 'Topological Sort', 'Adjoint Sensitivity'],
  },
  {
    id: 'phase-02',
    chronicleId: 'm4',
    numeral: '02',
    title: 'CONVEX OPTIMIZATION',
    subtitle: 'Objective Landscape & Descent',
    shortName: 'OPTIMIZATION',
    topic: 'Loss Geometry & Gradient Descent',
    year: '2023–24',
    dimension: '2D Parameter Space → ℝ',
    objectType: 'Convex Loss Manifold & Trajectory',
    topology: 'Strictly Convex Paraboloid',
    computeBackend: 'KKT Duality / Lagrangian',
    description:
      'A continuous 3D convex objective loss landscape featuring contour isolines, global minimum stationary point θ*, and an active gradient descent trajectory converging along the steepest descent vector.',
    tags: ['Convex Optimization', 'Loss Landscapes', 'Gradient Descent', 'Stationary Points'],
  },
  {
    id: 'phase-03',
    chronicleId: 'm3',
    numeral: '03',
    title: 'METRIC SPACES',
    subtitle: 'Hyperspherical Uniformity',
    shortName: 'METRIC SPACES',
    topic: 'Non-Euclidean Representation Geometry',
    year: '2024',
    dimension: 'Unit Hypersphere S²',
    objectType: 'Riemannian Metric Manifold & Clusters',
    topology: 'Curved Spherical Metric Space',
    computeBackend: 'InfoNCE / Contrastive',
    description:
      'A 3D non-Euclidean metric space demonstrating contrastive representation dynamics: positive pair alignment tensions, negative repulsion force fields, and geodesic distance paths.',
    tags: ['Metric Spaces', 'Contrastive Learning', 'Hyperspherical Geometry', 'Geodesic Distance'],
  },
  {
    id: 'phase-04',
    chronicleId: 'm2',
    numeral: '04',
    title: 'ATTENTION KERNELS',
    subtitle: 'KV-Cache & Softmax Topology',
    shortName: 'ATTENTION',
    topic: 'Multi-Head Attention & Memory Flow',
    year: '2024–25',
    dimension: 'Query-Key-Value Bilinear Space',
    objectType: 'Attention Routing Graph & Tiling',
    topology: 'Bipartite Softmax Routing',
    computeBackend: 'On-Chip SRAM / Tiled Kernels',
    description:
      'A 3D multi-head self-attention kernel architecture visualizing parallel Query and Key token planes, dynamic softmax attention intensity beams, and fast SRAM tiled routing pulses.',
    tags: ['Attention Mechanisms', 'Tiled Matrix Algebra', 'Softmax Routing', 'Memory Hierarchy'],
  },
  {
    id: 'phase-05',
    chronicleId: 'm1',
    numeral: '05',
    title: 'LATENT MANIFOLDS',
    subtitle: 'Continuous Riemannian Traversal',
    shortName: 'LATENT MANIFOLDS',
    topic: 'Diffusion Geodesics & Curvature',
    year: '2025 — PRESENT',
    dimension: '512-D Latent → 3D Projection',
    objectType: 'Continuous Riemannian Manifold',
    topology: 'Non-Euclidean Metric Sheet M',
    computeBackend: 'CUDA / WebGL Vector ODEs',
    description:
      'The flagship 3D research artifact: an undulating continuous Riemannian manifold surface with embedded semantic clusters, geodesic trajectory paths, and local tangent space frames.',
    tags: ['Riemannian Manifolds', 'Diffusion Geodesics', 'Vector Field ODEs', 'Score Matching'],
  },
];
