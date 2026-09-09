import { NodeData, Connection } from '../types';

export const RESEARCH_CORE_COORDINATES: Record<string, { x: number; y: number }> = {
  // Row 1 (Engineering & Systems Architecture)
  'node-models': { x: 480, y: 280 },
  'node-systems': { x: 960, y: 280 },

  // Row 2 (Theory & Interactive Artifact)
  'node-profile': { x: 480, y: 740 },
  'node-project': { x: 960, y: 740 },
};

export const EXPANDED_RESEARCH_NODES: NodeData[] = [];

export const RESEARCH_CONNECTIONS: Connection[] = [
  // Top Stream: Models -> Systems (Horizontal Left-to-Right)
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
  // Left Vertical Stream: Profile -> Models (Vertical Bottom-to-Top)
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
  // Bottom Horizontal Stream: Profile -> Interactive Visualizer (Horizontal Left-to-Right)
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
  // Right Vertical Stream: Systems -> Interactive Visualizer Convergence (Vertical Top-to-Bottom)
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
