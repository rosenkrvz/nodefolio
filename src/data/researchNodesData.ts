import { NodeData, Connection } from '../types';

export const RESEARCH_CORE_COORDINATES: Record<string, { x: number; y: number }> = {
  // Identity Anchor: Upper-left tier
  'node-profile': { x: 140, y: 140 },

  // Generative Architectures: Center-left, lower tier
  'node-models': { x: 560, y: 480 },

  // Neural Systems & Data: Center-right, lower tier (aligned with models)
  'node-systems': { x: 1020, y: 480 },

  // Latent Graph Visualizer: Right column, vertically spanning
  'node-project': { x: 1480, y: 260 },
};

export const NETWORK_CORE_COORDINATES: Record<string, { x: number; y: number; width?: number }> = {
  // Column 1, Row 1: Identity & Researcher Profile Node
  'node-profile': { x: 100, y: 380, width: 340 },

  // Column 1, Row 2: Academic & Theoretical Foundation (under profile)
  'node-credentials': { x: 100, y: 840, width: 340 },

  // Column 2, Row 1: Generative Architectures
  'node-models': { x: 560, y: 380, width: 340 },

  // Column 3, Row 1: Neural Systems & Data Infrastructure
  'node-systems': { x: 1020, y: 380, width: 340 },

  // Column 4, Row 1: Latent Graph Visualizer (Interactive Exploration Artifact)
  'node-project': { x: 1480, y: 380, width: 440 },

  // Column 5, Row 1: System Chronometer Node (Clock)
  'node-clock': { x: 2040, y: 380, width: 260 },
};

export const EXPANDED_RESEARCH_NODES: NodeData[] = [];

export const RESEARCH_CONNECTIONS: Connection[] = [
  // 1. Horizontal Pipeline: Models -> Systems
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
  // 2. Downward Stream: Profile -> Models
  {
    id: 'conn-prof-models',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-prof-models',
    toNodeId: 'node-models',
    toPinId: 'pin-in-models',
    color: '#be123c',
    label: 'representation.manifold',
    animated: true,
  },
  // 3. Transverse Stream: Profile -> Interactive Visualizer (Upper path)
  {
    id: 'conn-profile-project',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-prof-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#f43f5e',
    label: 'latent.projection',
    animated: true,
  },
  // 4. Convergence Stream: Systems -> Interactive Visualizer (Lower path)
  {
    id: 'conn-systems-project',
    fromNodeId: 'node-systems',
    fromPinId: 'pin-systems-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project-systems',
    color: '#e11d48',
    label: 'inference.graph',
    animated: true,
  },
];

// Backward-compatible alias for existing imports
export const EXPANDED_CONNECTIONS: Connection[] = RESEARCH_CONNECTIONS;
