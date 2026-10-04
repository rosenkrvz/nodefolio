import { NodeData, Connection } from '../types';

export const RESEARCH_CORE_COORDINATES: Record<string, { x: number; y: number; width?: number }> = {
  // Column 1, Row 1: Identity & Researcher Profile Node
  'node-profile': { x: 100, y: 380, width: 340 },

  // Column 2, Row 1: Generative Architectures
  'node-models': { x: 560, y: 380, width: 340 },

  // Column 3, Row 1: Neural Systems & Data Infrastructure
  'node-systems': { x: 1020, y: 380, width: 340 },

  // Column 4, Row 1: Latent Graph Visualizer (Interactive Exploration Artifact)
  'node-project': { x: 1480, y: 380, width: 440 },
};

export const NETWORK_CORE_COORDINATES: Record<string, { x: number; y: number; width?: number }> = {
  // Column 1, Row 1: Identity & Researcher Profile Node
  'node-profile': { x: 100, y: 380, width: 340 },

  // Column 2, Row 2: Academic & Theoretical Foundation (under Generative Architectures)
  'node-credentials': { x: 560, y: 800, width: 340 },

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
  // 1. Profile -> Models: Representation stream
  {
    id: 'conn-prof-models',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-prof-models',
    toNodeId: 'node-models',
    toPinId: 'pin-in-models',
    color: '#e11d48',
    label: 'representation.manifold',
    animated: true,
  },
  // 2. Horizontal Pipeline: Models -> Systems
  {
    id: 'conn-models-systems',
    fromNodeId: 'node-models',
    fromPinId: 'pin-out-systems',
    toNodeId: 'node-systems',
    toPinId: 'pin-in-systems',
    color: '#be123c',
    label: 'tensor.pipeline',
    animated: true,
  },
  // 3. Convergence Stream: Systems -> Interactive Visualizer
  {
    id: 'conn-systems-project',
    fromNodeId: 'node-systems',
    fromPinId: 'pin-systems-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#f43f5e',
    label: 'latent.projection',
    animated: true,
  },
];

// Backward-compatible alias for existing imports
export const EXPANDED_CONNECTIONS: Connection[] = RESEARCH_CONNECTIONS;
