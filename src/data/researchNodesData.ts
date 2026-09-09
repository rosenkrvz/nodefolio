import { NodeData, Connection } from '../types';

export const RESEARCH_CORE_COORDINATES: Record<string, { x: number; y: number }> = {
  // Row 1 (Engineering & Systems Architecture)
  'node-models': { x: 650, y: 450 },
  'node-systems': { x: 1250, y: 450 },

  // Row 2 (Theory & Interactive Artifact)
  'node-profile': { x: 650, y: 1000 },
  'node-project': { x: 1250, y: 1000 },
};

export const EXPANDED_RESEARCH_NODES: NodeData[] = [];

export const RESEARCH_CONNECTIONS: Connection[] = [
  // Top Stream: Models -> Systems
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
  // Vertical Cross-Stream: Profile -> Models
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
  // Bottom Stream: Profile -> Interactive Visualizer
  {
    id: 'conn-profile-project',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-out-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#f43f5e',
    label: 'latent.projection',
    animated: true,
  },
  // Systems -> Interactive Visualizer Convergence
  {
    id: 'conn-systems-project',
    fromNodeId: 'node-systems',
    fromPinId: 'pin-out-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#e11d48',
    label: 'inference.graph',
    animated: true,
  },
];

// Backward-compatible alias for existing imports
export const EXPANDED_CONNECTIONS: Connection[] = RESEARCH_CONNECTIONS;
