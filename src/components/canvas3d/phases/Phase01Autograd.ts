import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem } from '../types';

interface DAGNode {
  id: string;
  name: string;
  symbol: string;
  type: 'scalar' | 'op' | 'loss';
  role: string;
  formula: string;
  sensitivity: string;
  pos: THREE.Vector3;
  color: number;
}

interface DAGEdge {
  from: string;
  to: string;
  curve: THREE.CatmullRomCurve3;
  line: THREE.Line;
  defaultOpacity: number;
}

interface PulseParticle {
  edgeIdx: number;
  progress: number; // 1 to 0 (reverse gradient flow)
  speed: number;
  mesh: THREE.Mesh;
}

export function createPhase01Autograd(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-01-autograd';

  const disposables: { dispose: () => void }[] = [];

  // 1. Nodes definition with complete mathematical telemetry
  const nodes: DAGNode[] = [
    // Inputs / Parameters
    {
      id: 'w1',
      name: 'Weight Parameter w₁',
      symbol: 'w₁',
      type: 'scalar',
      role: 'Learnable Kernel Weight',
      formula: 'v₁ = w₁ · x₁',
      sensitivity: '∂L/∂w₁ = -0.428',
      pos: new THREE.Vector3(-6, 3.2, 1.2),
      color: 0x94a3b8,
    },
    {
      id: 'x1',
      name: 'Input Feature x₁',
      symbol: 'x₁',
      type: 'scalar',
      role: 'Forward Input Activation',
      formula: 'v₁ = w₁ · x₁',
      sensitivity: '∂L/∂x₁ = +0.812',
      pos: new THREE.Vector3(-6, 1.0, -0.8),
      color: 0x94a3b8,
    },
    {
      id: 'w2',
      name: 'Weight Parameter w₂',
      symbol: 'w₂',
      type: 'scalar',
      role: 'Learnable Kernel Weight',
      formula: 'v₂ = w₂ · x₂',
      sensitivity: '∂L/∂w₂ = +0.235',
      pos: new THREE.Vector3(-6, -1.2, 0.8),
      color: 0x94a3b8,
    },
    {
      id: 'x2',
      name: 'Input Feature x₂',
      symbol: 'x₂',
      type: 'scalar',
      role: 'Forward Input Activation',
      formula: 'v₂ = w₂ · x₂',
      sensitivity: '∂L/∂x₂ = -0.194',
      pos: new THREE.Vector3(-6, -3.4, -1.2),
      color: 0x94a3b8,
    },
    // First operation layer (Multipliers)
    {
      id: 'mul1',
      name: 'Multiplication Op ₁',
      symbol: '×',
      type: 'op',
      role: 'Bilinear Product Vertex',
      formula: 'v₁ = w₁ · x₁',
      sensitivity: '∂L/∂v₁ = +0.314',
      pos: new THREE.Vector3(-2.2, 2.1, 0.2),
      color: 0xe11d48,
    },
    {
      id: 'mul2',
      name: 'Multiplication Op ₂',
      symbol: '×',
      type: 'op',
      role: 'Bilinear Product Vertex',
      formula: 'v₂ = w₂ · x₂',
      sensitivity: '∂L/∂v₂ = -0.178',
      pos: new THREE.Vector3(-2.2, -2.3, -0.2),
      color: 0xe11d48,
    },
    // Accumulation & Activation
    {
      id: 'add1',
      name: 'Summation Op',
      symbol: '+',
      type: 'op',
      role: 'Linear Accumulator Vertex',
      formula: 'v₃ = v₁ + v₂',
      sensitivity: '∂L/∂v₃ = +0.485 (Identity Branch)',
      pos: new THREE.Vector3(1.2, 0, 0),
      color: 0xf43f5e,
    },
    {
      id: 'act',
      name: 'Activation Op',
      symbol: 'σ',
      type: 'op',
      role: 'Non-linear Activation (tanh)',
      formula: 'v₄ = tanh(v₃)',
      sensitivity: "∂L/∂v₄ = 1 - tanh²(v₃)",
      pos: new THREE.Vector3(4.2, 0, 0),
      color: 0xfb7185,
    },
    // Final Loss
    {
      id: 'loss',
      name: 'Objective Loss',
      symbol: 'L',
      type: 'loss',
      role: 'Scalar Loss Root',
      formula: 'L = ½(v₄ - y*)²',
      sensitivity: '∂L/∂L = 1.000 (Adjoint Seed)',
      pos: new THREE.Vector3(7.2, 0, 0),
      color: 0xff2d55,
    },
  ];

  const nodeMap = new Map<string, DAGNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Geometries based on quality tier
  const sphereSegments = quality === 'low' ? 14 : 22;
  const sphereGeo = new THREE.SphereGeometry(0.42, sphereSegments, sphereSegments);
  const octaGeo = new THREE.OctahedronGeometry(0.52, 0);
  const lossGeo = new THREE.DodecahedronGeometry(0.65, 0);
  const ringGeo = new THREE.RingGeometry(0.65, 0.72, quality === 'low' ? 18 : 28);
  disposables.push(sphereGeo, octaGeo, lossGeo, ringGeo);

  // Shared Materials
  const scalarMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.35,
    metalness: 0.5,
    emissive: 0x334155,
    emissiveIntensity: 0.3,
  });
  const opMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.35,
    metalness: 0.5,
    emissive: 0x9f1239,
    emissiveIntensity: 0.5,
  });
  const lossMat = new THREE.MeshStandardMaterial({
    color: 0xff2d55,
    roughness: 0.25,
    metalness: 0.6,
    emissive: 0xe11d48,
    emissiveIntensity: 0.8,
  });
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });
  disposables.push(scalarMat, opMat, lossMat, ringMat);

  const nodeMeshes: THREE.Mesh[] = [];
  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [];

  nodes.forEach((node) => {
    let geo: THREE.BufferGeometry = sphereGeo;
    let mat = scalarMat;

    if (node.type === 'op') {
      geo = octaGeo;
      mat = opMat;
    } else if (node.type === 'loss') {
      geo = lossGeo;
      mat = lossMat;
    }

    const mesh = new THREE.Mesh(geo, mat.clone());
    disposables.push(mesh.material as THREE.Material);
    mesh.position.copy(node.pos);
    group.add(mesh);
    nodeMeshes.push(mesh);

    // Wireframe halo ring
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(node.pos);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Register inspectable item
    inspectables.push({
      mesh,
      data: {
        id: node.id,
        name: node.name,
        symbol: node.symbol,
        type: node.type.toUpperCase(),
        role: node.role,
        dimension: 'Scalar ℝ¹ [Adjoint Tape]',
        properties: {
          'Formula': node.formula,
          'Adjoint Sensitivity': node.sensitivity,
          'Graph Depth': node.pos.x < -3 ? 'Layer 0 (Input)' : node.pos.x < 2 ? 'Layer 1 (Bilinear)' : 'Layer 2 (Objective)',
          'Coordinates': `[${node.pos.x.toFixed(1)}, ${node.pos.y.toFixed(1)}, ${node.pos.z.toFixed(1)}]`,
        },
        description: `Topological computational graph component representing ${node.name}. During reverse-mode automatic differentiation, backpropagation propagates adjoint gradient values strictly along the incoming dependency edges.`,
        worldPosition: node.pos.clone(),
      },
    });
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
  const splineSteps = quality === 'low' ? 16 : 28;

  edgeConnections.forEach(([fromId, toId]) => {
    const fromNode = nodeMap.get(fromId);
    const toNode = nodeMap.get(toId);
    if (!fromNode || !toNode) return;

    const midPoint = new THREE.Vector3()
      .addVectors(fromNode.pos, toNode.pos)
      .multiplyScalar(0.5);
    midPoint.z += ((fromId.charCodeAt(0) % 3) - 1) * 0.4;
    midPoint.y += ((toId.charCodeAt(0) % 3) - 1) * 0.3;

    const curve = new THREE.CatmullRomCurve3([
      fromNode.pos.clone(),
      midPoint,
      toNode.pos.clone(),
    ]);

    const points = curve.getPoints(splineSteps);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    disposables.push(lineGeo);

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.38,
    });
    disposables.push(edgeMat);

    const line = new THREE.Line(lineGeo, edgeMat);
    group.add(line);

    edges.push({ from: fromId, to: toId, curve, line, defaultOpacity: 0.38 });
  });

  // 3. Adjoint Backprop Particles (Flowing in REVERSE along edges)
  const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const particleMat = new THREE.MeshBasicMaterial({
    color: 0xff3b5c,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(particleGeo, particleMat);

  const numParticles = quality === 'low' ? 8 : quality === 'medium' ? 14 : 22;
  const pulseParticles: PulseParticle[] = [];

  for (let i = 0; i < numParticles; i++) {
    const pMesh = new THREE.Mesh(particleGeo, particleMat);
    group.add(pMesh);

    pulseParticles.push({
      edgeIdx: i % edges.length,
      progress: (i / numParticles) % 1.0,
      speed: 0.32 + ((i % 5) * 0.04),
      mesh: pMesh,
    });
  }

  // 4. Subtle background computational reference grid
  const gridHelper = new THREE.GridHelper(18, 18, 0x1e293b, 0x0f172a);
  gridHelper.position.y = -4.5;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.25;
  group.add(gridHelper);
  disposables.push(gridHelper.geometry, gridHelper.material as THREE.Material);

  // Interaction handlers
  let selectedNodeId: string | null = null;

  const onSelectObject = (item: InspectableItem | null) => {
    selectedNodeId = item ? item.id : null;

    edges.forEach((edge) => {
      const mat = edge.line.material as THREE.LineBasicMaterial;
      if (!selectedNodeId) {
        mat.color.setHex(0x475569);
        mat.opacity = edge.defaultOpacity;
      } else if (edge.from === selectedNodeId || edge.to === selectedNodeId) {
        mat.color.setHex(0xf43f5e);
        mat.opacity = 0.9;
      } else {
        mat.color.setHex(0x334155);
        mat.opacity = 0.1;
      }
    });

    nodes.forEach((n, idx) => {
      const mesh = nodeMeshes[idx];
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!selectedNodeId) {
        mat.emissiveIntensity = n.type === 'loss' ? 0.8 : n.type === 'op' ? 0.5 : 0.3;
        mesh.scale.set(1, 1, 1);
      } else if (n.id === selectedNodeId) {
        mat.emissiveIntensity = 1.0;
        mesh.scale.set(1.25, 1.25, 1.25);
      } else {
        mat.emissiveIntensity = 0.15;
        mesh.scale.set(0.9, 0.9, 0.9);
      }
    });
  };

  // Pre-allocated scratch vector for zero GC during animation loop
  const scratchPos = new THREE.Vector3();

  // Animation & Update loop
  const update = (time: number, delta: number) => {
    // Gentle node breathing rotation
    nodes.forEach((_, idx) => {
      const mesh = nodeMeshes[idx];
      mesh.rotation.y += delta * 0.35;
      mesh.rotation.x = Math.sin(time * 0.6 + idx) * 0.12;
    });

    // Update reverse-flow gradient adjoint particles
    pulseParticles.forEach((p) => {
      p.progress -= delta * p.speed;
      if (p.progress < 0) {
        p.progress = 1.0;
        p.edgeIdx = (p.edgeIdx + 1) % edges.length;
      }

      const edge = edges[p.edgeIdx];
      if (edge) {
        edge.curve.getPointAt(p.progress, scratchPos);
        p.mesh.position.copy(scratchPos);
        const s = 0.8 + Math.sin(p.progress * Math.PI) * 0.5;
        p.mesh.scale.set(s, s, s);
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
    defaultCameraPosition: [0, 2.5, 14.5],
    defaultTarget: [0, 0, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
  };
}
