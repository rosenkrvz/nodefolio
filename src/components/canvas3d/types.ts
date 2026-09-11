import * as THREE from 'three';

export type ResearchPhaseId =
  | 'phase-01'
  | 'phase-02'
  | 'phase-03'
  | 'phase-04'
  | 'phase-05';

export type LayerType = 'geometry' | 'trajectories' | 'clusters' | 'grid' | 'annotations';

export interface SpatialAnnotation {
  id: string;
  label: string;
  sublabel?: string;
  position: THREE.Vector3;
}

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
  equation?: string;
  metricsSummary?: { label: string; value: string }[];
  tags: string[];
}

export type QualityTier = 'high' | 'medium' | 'low';

export interface InspectableItem {
  id: string;
  name: string;
  symbol?: string;
  type: string;
  role: string;
  dimension: string;
  properties: Record<string, string | number>;
  description: string;
  worldPosition: THREE.Vector3;
}

export interface PhaseArtifactInstance {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
  dispose: () => void;
  defaultCameraPosition: [number, number, number];
  defaultTarget: [number, number, number];
  getInspectableObjects?: () => { mesh: THREE.Object3D; data: InspectableItem }[];
  onSelectObject?: (item: InspectableItem | null) => void;
  onHoverObject?: (item: InspectableItem | null) => void;
  toggleLayer?: (layer: LayerType, visible: boolean) => void;
  getAnnotations?: () => SpatialAnnotation[];
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
      'Topological computational graph with continuous reverse-mode gradient backpropagation along adjoint edges.',
    equation: 'v_i = \\text{op}(u_j), \\quad \\bar{u}_j = \\sum_{i} \\bar{v}_i \\frac{\\partial v_i}{\\partial u_j}',
    metricsSummary: [
      { label: 'Graph Nodes', value: '10 Nodes' },
      { label: 'Adjoint Edges', value: '11 Directed' },
      { label: 'Backward Pass', value: 'O(|V| + |E|)' },
    ],
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
      'Continuous 3D loss surface with contour isolines and a gradient descent convergence trajectory.',
    equation: 'f(\\theta) = 0.14(x^2 + 1.8z^2), \\quad \\theta_{t+1} = \\theta_t - \\eta \\nabla f(\\theta_t)',
    metricsSummary: [
      { label: 'Condition No.', value: 'κ = 1.80' },
      { label: 'Learning Rate', value: 'η = 0.08' },
      { label: 'Convergence', value: 'Linear / O(1/k)' },
    ],
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
      'Hyperspherical metric space illustrating contrastive alignment and geodesic distance dynamics.',
    equation: '\\mathcal{L}_{InfoNCE} = -\\log \\frac{\\exp(q \\cdot k_+ / \\tau)}{\\sum_i \\exp(q \\cdot k_i / \\tau)}',
    metricsSummary: [
      { label: 'Manifold', value: 'Unit Sphere S²' },
      { label: 'Temperature', value: 'τ = 0.07' },
      { label: 'Alignment', value: 'Geodesic d(x, y)' },
    ],
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
      'Self-attention kernel architecture with parallel Q/K token planes and softmax routing.',
    equation: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    metricsSummary: [
      { label: 'Attention Heads', value: '8 Heads' },
      { label: 'Tile Geometry', value: 'Br × Bc (SRAM)' },
      { label: 'Memory I/O', value: 'O(N) Flash Style' },
    ],
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
      'Continuous Riemannian manifold surface with embedded semantic clusters and geodesic paths.',
    equation: 'g_{ij} = \\left\\langle \\frac{\\partial r}{\\partial u^i}, \\frac{\\partial r}{\\partial u^j} \\right\\rangle, \\quad \\frac{\\mathrm{d}^2 u^k}{\\mathrm{d}s^2} + \\Gamma_{ij}^k \\frac{\\mathrm{d}u^i}{\\mathrm{d}s}\\frac{\\mathrm{d}u^j}{\\mathrm{d}s} = 0',
    metricsSummary: [
      { label: 'Intrinsic Dim.', value: 'd = 3 (Embedded)' },
      { label: 'Metric Tensor', value: 'g_ij (Riemannian)' },
      { label: 'Geodesic ODE', value: 'RK4 Integrator' },
    ],
    tags: ['Riemannian Manifolds', 'Diffusion Geodesics', 'Vector Field ODEs', 'Score Matching'],
  },
];
