import { NodeData, Connection } from '../types';

export const RESEARCH_CORE_COORDINATES: Record<string, { x: number; y: number }> = {
  // Row 1 (Top Tier, Y = 1100): Foundations & Perception
  'node-credentials': { x: 1050, y: 1100 },
  'node-systems': { x: 2510, y: 1100 },

  // Row 2 (Middle Tier, Y = 1680): Core Hub & Hero Artifact
  'node-profile': { x: 1780, y: 1680 },
  'node-project': { x: 2510, y: 1680 },

  // Row 3 (Bottom Tier, Y = 2260): Streaming Features & Runtimes
  'node-models': { x: 1780, y: 2260 },
  'node-clock': { x: 2510, y: 2260 },
};

export const EXPANDED_RESEARCH_NODES: NodeData[] = [
  // -------------------------------------------------------------
  // NODE 01 — COMPUTER VISION (Row 1, Col 2 - Perception Tier)
  // -------------------------------------------------------------
  {
    id: 'node-vision',
    title: 'Computer Vision',
    subtitle: 'Signals, Features & Visual Reps',
    category: 'vision',
    shape: 'square',
    x: 1780,
    y: 1100,
    width: 340,
    inputs: [
      { id: 'pin-vis-in', label: 'mathematical.core', color: 'crimson', type: 'input', nodeId: 'node-vision' },
    ],
    outputs: [
      { id: 'pin-vis-out', label: 'tensor.pipeline', color: 'crimson', type: 'output', nodeId: 'node-vision' },
    ],
    accentColor: '#be123c',
    glowColor: 'rgba(190, 18, 60, 0.2)',
    researchData: {
      domain: 'Perception / Machine Learning',
      method: 'Vision',
      state: 'Active',
      compute: 'GPU-Accelerated',
      overview:
        'Extracts hierarchical semantic features from visual signals through convolutional spatial filters, patch tokenization, and vision transformer (ViT) self-attention.',
      computationalDetails: [
        'Multi-scale feature pyramid networks (FPN) preserving spatial fidelity across receptive fields.',
        'Vision Transformer (ViT) patch extraction (16x16) with 2D learnable positional embeddings.',
        'Self-supervised pre-training via Masked Autoencoders (MAE) with high masking ratios.',
        'Deformable attention layers focusing on semantic object contours.',
      ],
      metrics: [
        { label: 'Backbone', value: 'ViT-Base / Patch16' },
        { label: 'Receptive Field', value: 'Infinite (Global)' },
        { label: 'Attention Heads', value: '12-Head Multi' },
      ],
      tags: ['Image Features', 'Representation Learning', 'Vision Models', 'Spatial Information'],
      relatedNodeIds: ['node-credentials', 'node-systems'],
      visualizationType: 'featuregrid',
    },
  },

  // -------------------------------------------------------------
  // NODE 02 — STATISTICAL INFERENCE (Row 2, Col 1 - Theory Tier)
  // -------------------------------------------------------------
  {
    id: 'node-inference',
    title: 'Statistical Inference',
    subtitle: 'Probability & Decision Systems',
    category: 'statistics',
    shape: 'square',
    x: 1050,
    y: 1680,
    width: 340,
    inputs: [
      { id: 'pin-inf-in', label: 'mathematical.core', color: 'crimson', type: 'input', nodeId: 'node-inference' },
    ],
    outputs: [
      { id: 'pin-inf-out', label: 'inference.hypothesis', color: 'rose', type: 'output', nodeId: 'node-inference' },
    ],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.22)',
    researchData: {
      domain: 'Statistics',
      method: 'Inference',
      state: 'Foundational',
      compute: 'Analytical',
      overview:
        'Formalizes probabilistic reasoning, Bayesian belief updating, and hypothesis testing. Serves as the mathematical bedrock for evaluating confidence intervals and parameter distributions in machine learning.',
      computationalDetails: [
        'Bayesian prior-to-posterior conjugate updating for parametric distributions.',
        'Maximum Likelihood Estimation (MLE) and Maximum A Posteriori (MAP) formulations.',
        'Markov Chain Monte Carlo (MCMC) and Metropolis-Hastings sampling for intractable posteriors.',
        'Hypothesis testing, false discovery rate (FDR) control, and p-value calibration.',
      ],
      metrics: [
        { label: 'Prior Belief', value: 'Conjugate Beta-Binomial' },
        { label: 'Sampling Mode', value: 'Hamiltonian MC' },
        { label: 'Confidence', value: '99.4% Credible' },
      ],
      tags: ['Probability Models', 'Bayesian Reasoning', 'Statistical Estimation', 'Hypothesis Testing'],
      relatedNodeIds: ['node-credentials', 'node-profile'],
      visualizationType: 'distribution',
    },
  },

  // -------------------------------------------------------------
  // NODE 03 — DATA PIPELINE (Row 3, Col 1 - Features Tier)
  // -------------------------------------------------------------
  {
    id: 'node-pipeline',
    title: 'Data Pipeline',
    subtitle: 'From Raw Signals to Features',
    category: 'pipeline',
    shape: 'square',
    x: 1050,
    y: 2260,
    width: 340,
    inputs: [],
    outputs: [
      { id: 'pin-pipe-out', label: 'representation.manifold', color: 'crimson', type: 'output', nodeId: 'node-pipeline' },
    ],
    accentColor: '#be123c',
    glowColor: 'rgba(190, 18, 60, 0.18)',
    researchData: {
      domain: 'Data / Infrastructure',
      method: 'Pipeline',
      state: 'Streaming',
      compute: 'Distributed',
      overview:
        'High-throughput data ingestion, transformation, deduplication, and schema validation translating noisy real-world signals into standardized tensor features.',
      computationalDetails: [
        'Zero-copy columnar memory layouts using Apache Arrow and streaming Parquet partitions.',
        'MinHash LSH for fuzzy text and signal deduplication at scale.',
        'Online feature store materialization with sub-millisecond retrieval guarantees.',
        'Strict schema contracts and distribution anomaly monitoring on feature drift.',
      ],
      metrics: [
        { label: 'Throughput', value: '420 MB/s Stream' },
        { label: 'Encoding', value: 'Arrow Columnar' },
        { label: 'Dedup Ratio', value: '18.4% Redundant' },
      ],
      tags: ['Collection', 'Cleaning', 'Transformation', 'Feature Engineering'],
      relatedNodeIds: ['node-models', 'node-clock'],
      visualizationType: 'pipeline',
    },
  },
];

export const RESEARCH_CONNECTIONS: Connection[] = [
  // 1. Stream 1 (Row 1): Academic Foundations -> Computer Vision
  {
    id: 'conn-cred-vision',
    fromNodeId: 'node-credentials',
    fromPinId: 'pin-cred-out',
    toNodeId: 'node-vision',
    toPinId: 'pin-vis-in',
    color: '#9f1239',
    label: 'mathematical.core',
    animated: true,
  },
  // 2. Stream 1 (Row 1): Computer Vision -> Neural Systems
  {
    id: 'conn-vision-systems',
    fromNodeId: 'node-vision',
    fromPinId: 'pin-vis-out',
    toNodeId: 'node-systems',
    toPinId: 'pin-in-systems',
    color: '#be123c',
    label: 'tensor.pipeline',
    animated: true,
  },

  // 3. Stream 2 (Row 2): Statistical Inference -> Shubham Sharma (Center Profile)
  {
    id: 'conn-inference-profile',
    fromNodeId: 'node-inference',
    fromPinId: 'pin-inf-out',
    toNodeId: 'node-profile',
    toPinId: 'pin-in-profile',
    color: '#f43f5e',
    label: 'inference.hypothesis',
    animated: true,
  },
  // 4. Stream 2 (Row 2): Shubham Sharma (Center Profile) -> Latent Graph Visualizer
  {
    id: 'conn-profile-project',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-out-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#e11d48',
    label: 'latent.projection',
    animated: true,
  },

  // 5. Stream 3 (Row 3): Data Pipeline -> Generative Models
  {
    id: 'conn-pipeline-models',
    fromNodeId: 'node-pipeline',
    fromPinId: 'pin-pipe-out',
    toNodeId: 'node-models',
    toPinId: 'pin-in-models',
    color: '#be123c',
    label: 'representation.manifold',
    animated: true,
  },
  // 6. Stream 3 (Row 3): Generative Models -> System Chronometer
  {
    id: 'conn-models-clock',
    fromNodeId: 'node-models',
    fromPinId: 'pin-out-clock',
    toNodeId: 'node-clock',
    toPinId: 'pin-in-clock',
    color: '#9f1239',
    label: 'runtime.sync',
    animated: true,
  },
];

// Backward-compatible alias for existing imports
export const EXPANDED_CONNECTIONS: Connection[] = RESEARCH_CONNECTIONS;
