import * as THREE from 'three';
import { PhaseArtifactInstance } from '../types';

interface DAGNode {
  id: string;
  name: string;
  type: 'scalar' | 'op' | 'loss';
  pos: THREE.Vector3;
  color: number;
}

interface DAGEdge {
  from: string;
  to: string;
  curve: THREE.CatmullRomCurve3;
  line: THREE.Line;
}

interface PulseParticle {
  edgeIdx: number;
  progress: number; // 1 to 0 (reverse gradient flow)
  speed: number;
  mesh: THREE.Mesh;
}

export function createPhase01Autograd(): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-01-autograd';

  const disposables: { dispose: () => void }[] = [];

  // 1. Nodes definition
  const nodes: DAGNode[] = [
    // Inputs / Parameters
    { id: 'w1', name: 'w₁', type: 'scalar', pos: new THREE.Vector3(-6, 3.2, 1.2), color: 0x94a3b8 },
    { id: 'x1', name: 'x₁', type: 'scalar', pos: new THREE.Vector3(-6, 1.0, -0.8), color: 0x94a3b8 },
    { id: 'w2', name: 'w₂', type: 'scalar', pos: new THREE.Vector3(-6, -1.2, 0.8), color: 0x94a3b8 },
    { id: 'x2', name: 'x₂', type: 'scalar', pos: new THREE.Vector3(-6, -3.4, -1.2), color: 0x94a3b8 },
    // First operation layer (Multipliers)
    { id: 'mul1', name: '×', type: 'op', pos: new THREE.Vector3(-2.2, 2.1, 0.2), color: 0xe11d48 },
    { id: 'mul2', name: '×', type: 'op', pos: new THREE.Vector3(-2.2, -2.3, -0.2), color: 0xe11d48 },
    // Activation / Addition
    { id: 'add1', name: '+', type: 'op', pos: new THREE.Vector3(1.2, 0, 0), color: 0xf43f5e },
    { id: 'act', name: 'σ', type: 'op', pos: new THREE.Vector3(4.2, 0, 0), color: 0xfb7185 },
    // Final Loss
    { id: 'loss', name: 'L', type: 'loss', pos: new THREE.Vector3(7.2, 0, 0), color: 0xff2d55 },
  ];

  const nodeMap = new Map<string, DAGNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Geometries & Materials for nodes
  const sphereGeo = new THREE.SphereGeometry(0.42, 24, 24);
  const octaGeo = new THREE.OctahedronGeometry(0.52, 0);
  const lossGeo = new THREE.DodecahedronGeometry(0.65, 0);
  disposables.push(sphereGeo, octaGeo, lossGeo);

  const nodeMeshes: THREE.Mesh[] = [];

  nodes.forEach((node) => {
    let geo: THREE.BufferGeometry = sphereGeo;
    let emissiveIntensity = 0.4;

    if (node.type === 'op') {
      geo = octaGeo;
      emissiveIntensity = 0.6;
    } else if (node.type === 'loss') {
      geo = lossGeo;
      emissiveIntensity = 0.9;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: node.color,
      roughness: 0.25,
      metalness: 0.8,
      emissive: node.color,
      emissiveIntensity,
    });
    disposables.push(mat);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(node.pos);
    group.add(mesh);
    nodeMeshes.push(mesh);

    // Wireframe halo ring
    const ringGeo = new THREE.RingGeometry(0.65, 0.72, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: node.color,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    disposables.push(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(node.pos);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  });

  // 2. Directed dependency edges
  const edgeConnections: [string, string][] = [
    ['w1', 'mul1'],
    ['x1', 'mul1'],
    ['w2', 'mul2'],
    ['x2', 'mul2'],
    ['mul1', 'add1'],
    ['mul2', 'add1'],
    ['add1', 'act'],
    ['act', 'loss'],
  ];

  const edges: DAGEdge[] = [];
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.4,
  });
  disposables.push(lineMat);

  edgeConnections.forEach(([fromId, toId]) => {
    const fromNode = nodeMap.get(fromId);
    const toNode = nodeMap.get(toId);
    if (!fromNode || !toNode) return;

    // Slight curvature along Z/Y for 3D computational depth
    const midPoint = new THREE.Vector3()
      .addVectors(fromNode.pos, toNode.pos)
      .multiplyScalar(0.5);
    midPoint.z += (Math.random() - 0.5) * 0.8;
    midPoint.y += (Math.random() - 0.5) * 0.4;

    const curve = new THREE.CatmullRomCurve3([
      fromNode.pos.clone(),
      midPoint,
      toNode.pos.clone(),
    ]);

    const points = curve.getPoints(36);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    disposables.push(lineGeo);

    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);

    edges.push({ from: fromId, to: toId, curve, line });
  });

  // 3. Adjoint Backprop Particles (Flowing in REVERSE: from toNode to fromNode)
  const particleGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const particleMat = new THREE.MeshBasicMaterial({
    color: 0xff3b5c,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(particleGeo, particleMat);

  const pulseParticles: PulseParticle[] = [];
  const NUM_PARTICLES = 24;

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const pMesh = new THREE.Mesh(particleGeo, particleMat);
    group.add(pMesh);
    nodeMeshes.push(pMesh);

    pulseParticles.push({
      edgeIdx: i % edges.length,
      progress: (i / NUM_PARTICLES) % 1.0,
      speed: 0.35 + Math.random() * 0.15,
      mesh: pMesh,
    });
  }

  // 4. Subtle background computational reference grid
  const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
  gridHelper.position.y = -4.5;
  group.add(gridHelper);
  disposables.push(gridHelper.geometry, gridHelper.material as THREE.Material);

  // Animation & Update loop
  const update = (time: number, delta: number) => {
    // Gentle node breathing rotation
    nodes.forEach((_, idx) => {
      const mesh = nodeMeshes[idx];
      if (mesh) {
        mesh.rotation.y += delta * 0.4;
        mesh.rotation.x = Math.sin(time * 0.8 + idx) * 0.15;
      }
    });

    // Update reverse-flow gradient adjoint particles
    pulseParticles.forEach((p) => {
      // Flow backwards from 1.0 down to 0.0
      p.progress -= delta * p.speed;
      if (p.progress < 0) {
        p.progress = 1.0;
        // switch edge occasionally to disperse flow
        p.edgeIdx = Math.floor(Math.random() * edges.length);
      }

      const edge = edges[p.edgeIdx];
      if (edge) {
        const pt = edge.curve.getPointAt(p.progress);
        p.mesh.position.copy(pt);
        const scale = 0.8 + Math.sin(p.progress * Math.PI) * 0.6;
        p.mesh.scale.set(scale, scale, scale);
      }
    });
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0, 2.5, 14],
    defaultTarget: [0, 0, 0],
  };
}
