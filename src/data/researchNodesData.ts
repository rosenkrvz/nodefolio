import { NodeData, Connection } from '../types';

export const RESEARCH_CORE_COORDINATES: Record<string, { x: number; y: number }> = {
  // Row 1 (Top Stream, Y = 1200): Engineering & System Architecture
  'node-models': { x: 1800, y: 1200 },
  'node-systems': { x: 2500, y: 1200 },

  // Row 2 (Bottom Stream, Y = 1850): Mathematical Theory & Interactive Artifact
  'node-profile': { x: 1800, y: 1850 },
  'node-project': { x: 2500, y: 1850 },
};

export const EXPANDED_RESEARCH_NODES: NodeData[] = [
  // -------------------------------------------------------------
  // NODE 01 — DATA PIPELINE (Row 1, Col 1 - Ingestion Tier)
  // -------------------------------------------------------------
  {
    id: 'node-pipeline',
    title: 'Data Pipeline',
    subtitle: 'From Raw Signals to Features',
    category: 'pipeline',
    shape: 'square',
    x: 1100,
    y: 1200,
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
      relatedNodeIds: ['node-models', 'node-systems'],
      visualizationType: 'pipeline',
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
    x: 1100,
    y: 1850,
    width: 340,
    inputs: [],
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
      relatedNodeIds: ['node-profile', 'node-project'],
      visualizationType: 'distribution',
    },
  },
];

export const RESEARCH_CONNECTIONS: Connection[] = [
  // -------------------------------------------------------------
  // Stream 1 (Row 1): Data Pipeline -> Generative Models -> Neural Systems
  // -------------------------------------------------------------
  {
    id: 'conn-pipe-models',
    fromNodeId: 'node-pipeline',
    fromPinId: 'pin-pipe-out',
    toNodeId: 'node-models',
    toPinId: 'pin-in-models',
    color: '#be123c',
    label: 'representation.manifold',
    animated: true,
  },
  {
    id: 'conn-models-systems',
    fromNodeId: 'node-models',
    fromPinId: 'pin-out-systems',
    toNodeId: 'node-systems',
    toPinId: 'pin-in-systems',
    color: '#e11d48',
    label: 'tensor.pipeline',
    animated: true,
  },

  // -------------------------------------------------------------
  // Stream 2 (Row 2): Statistical Inference -> Shubham Sharma -> Latent Graph Visualizer
  // -------------------------------------------------------------
  {
    id: 'conn-inf-profile',
    fromNodeId: 'node-inference',
    fromPinId: 'pin-inf-out',
    toNodeId: 'node-profile',
    toPinId: 'pin-in-profile',
    color: '#f43f5e',
    label: 'inference.hypothesis',
    animated: true,
  },
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
];

// Backward-compatible alias for existing imports
export const EXPANDED_CONNECTIONS: Connection[] = RESEARCH_CONNECTIONS;
