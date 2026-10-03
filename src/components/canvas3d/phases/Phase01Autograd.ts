import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem, LayerType, SpatialAnnotation } from '../types';

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
  progress: number;
  speed: number;
  isBackward: boolean;
  mesh: THREE.Mesh;
}

export function createPhase01Autograd(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-01-autograd';

  const disposables: { dispose: () => void }[] = [];

  // =========================================================================
  // 1. Nodes definition with complete mathematical telemetry
  // =========================================================================
  const nodes: DAGNode[] = [
    // Layer 0: Inputs / Parameters
    {
      id: 'w1',
      name: 'Weight Parameter w₁',
      symbol: 'w₁',
      type: 'scalar',
      role: 'Learnable Tensor Parameter',
      formula: 'v₁ = w₁ ⊗ x₁',
      sensitivity: '∂L/∂w₁ = -0.428 (Backward Tape)',
      pos: new THREE.Vector3(-6.2, 2.8, 1.0),
      color: 0x94a3b8,
    },
    {
      id: 'x1',
      name: 'Input Feature x₁',
      symbol: 'x₁',
      type: 'scalar',
      role: 'Forward Input Activation',
      formula: 'v₁ = w₁ ⊗ x₁',
      sensitivity: '∂L/∂x₁ = +0.812 (Input Gradient)',
      pos: new THREE.Vector3(-6.2, 0.9, -0.9),
      color: 0x94a3b8,
    },
    {
      id: 'w2',
      name: 'Weight Parameter w₂',
      symbol: 'w₂',
      type: 'scalar',
      role: 'Learnable Tensor Parameter',
      formula: 'v₂ = w₂ ⊗ x₂',
      sensitivity: '∂L/∂w₂ = +0.235 (Backward Tape)',
      pos: new THREE.Vector3(-6.2, -1.1, 0.9),
      color: 0x94a3b8,
    },
    {
      id: 'x2',
      name: 'Input Feature x₂',
      symbol: 'x₂',
      type: 'scalar',
      role: 'Forward Input Activation',
      formula: 'v₂ = w₂ ⊗ x₂',
      sensitivity: '∂L/∂x₂ = -0.194 (Input Gradient)',
      pos: new THREE.Vector3(-6.2, -3.0, -1.0),
      color: 0x94a3b8,
    },
    // Layer 1: Bilinear MatMul Operators
    {
      id: 'mul1',
      name: 'MatMul Operation ₁ (⊗)',
      symbol: '⊗',
      type: 'op',
      role: 'Bilinear Product Vertex',
      formula: 'v₁ = w₁ · x₁',
      sensitivity: '∂L/∂v₁ = +0.314 (Chain Rule)',
      pos: new THREE.Vector3(-2.4, 1.8, 0.1),
      color: 0xe11d48,
    },
    {
      id: 'mul2',
      name: 'MatMul Operation ₂ (⊗)',
      symbol: '⊗',
      type: 'op',
      role: 'Bilinear Product Vertex',
      formula: 'v₂ = w₂ · x₂',
      sensitivity: '∂L/∂v₂ = -0.178 (Chain Rule)',
      pos: new THREE.Vector3(-2.4, -2.0, -0.1),
      color: 0xe11d48,
    },
    // Layer 2: Accumulator (⊕)
    {
      id: 'add1',
      name: 'Accumulator Op (⊕)',
      symbol: '⊕',
      type: 'op',
      role: 'Linear Accumulator Vertex',
      formula: 'v₃ = v₁ + v₂',
      sensitivity: '∂L/∂v₃ = +0.485 (Identity Gradient Flow)',
      pos: new THREE.Vector3(1.2, 0, 0),
      color: 0xf43f5e,
    },
    // Layer 3: Non-linear Activation (σ)
    {
      id: 'act',
      name: 'Non-linear Activation σ',
      symbol: 'σ',
      type: 'op',
      role: 'Hyperbolic Tangent Activation',
      formula: 'v₄ = tanh(v₃)',
      sensitivity: '∂L/∂v₄ = 1 - tanh²(v₃) = 0.652',
      pos: new THREE.Vector3(4.2, 0, 0),
      color: 0xfb7185,
    },
    // Layer 4: Scalar Loss Objective (L)
    {
      id: 'loss',
      name: 'Scalar Objective Loss L',
      symbol: 'L',
      type: 'loss',
      role: 'Scalar Loss Root (Tape Origin)',
      formula: 'L = ½(v₄ - y*)²',
      sensitivity: '∂L/∂L = 1.000 (Adjoint Seed)',
      pos: new THREE.Vector3(7.2, 0, 0),
      color: 0xff2d55,
    },
  ];

  const nodeMap = new Map<string, DAGNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));



  // =========================================================================
  // 3. Node Geometries & Materials
  // =========================================================================
  const sphereSegments = quality === 'low' ? 14 : 22;
  const sphereGeo = new THREE.SphereGeometry(0.42, sphereSegments, sphereSegments);
  const octaGeo = new THREE.OctahedronGeometry(0.52, 0);
  const lossGeo = new THREE.DodecahedronGeometry(0.65, 0);
  const ringGeo = new THREE.RingGeometry(0.65, 0.74, quality === 'low' ? 18 : 28);
  disposables.push(sphereGeo, octaGeo, lossGeo, ringGeo);

  const scalarMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.35,
    metalness: 0.5,
    emissive: 0x334155,
    emissiveIntensity: 0.35,
  });
  const opMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x9f1239,
    emissiveIntensity: 0.55,
  });
  const lossMat = new THREE.MeshStandardMaterial({
    color: 0xff2d55,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 0xe11d48,
    emissiveIntensity: 0.95,
  });
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.3,
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

    // Orbital Halo Ring
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
        dimension: 'Scalar / Tensor Node [DAG Tape Slot]',
        properties: {
          'Formula': node.formula,
          'Adjoint Gradient': node.sensitivity,
          'Topological Stage': node.pos.x < -3 ? 'Stage 00 (Leaf Parameters)' : node.pos.x < 0 ? 'Stage 01 (MatMul Ops)' : node.pos.x < 3 ? 'Stage 02 (Accumulator)' : node.pos.x < 6 ? 'Stage 03 (Non-Linearity)' : 'Stage 04 (Scalar Loss Root)',
          'Memory Lifetime': 'Active Forward Activation -> Freed Post-Backward',
          'Autodiff Mode': 'Reverse-Mode Tape Accumulator',
        },
        description: `Computational graph execution node representing ${node.name}. During automatic differentiation, forward execution evaluates ${node.formula} while the reverse-mode backward pass applies the multivariable chain rule to accumulate adjoint gradients.`,
        worldPosition: node.pos.clone(),
      },
    });
  });

  // =========================================================================
  // 4. Directed Dependency Edges with Flow Tubes
  // =========================================================================
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
      opacity: 0.45,
    });
    disposables.push(edgeMat);

    const line = new THREE.Line(lineGeo, edgeMat);
    group.add(line);

    edges.push({ from: fromId, to: toId, curve, line, defaultOpacity: 0.45 });
  });

  // =========================================================================
  // 5. Dual-Direction Flow Pulses:
  // Forward Pass: Cyan activation pulses traveling 0 -> 1 (w, x -> Loss)
  // Backward Pass: Crimson adjoint pulses traveling 1 -> 0 (Loss -> w, x)
  // =========================================================================
  const fwdParticleGeo = new THREE.SphereGeometry(0.12, 10, 10);
  const fwdParticleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const bwdParticleGeo = new THREE.SphereGeometry(0.13, 10, 10);
  const bwdParticleMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  disposables.push(fwdParticleGeo, fwdParticleMat, bwdParticleGeo, bwdParticleMat);

  const numParticles = quality === 'low' ? 12 : quality === 'medium' ? 20 : 28;
  const pulseParticles: PulseParticle[] = [];

  for (let i = 0; i < numParticles; i++) {
    const isBackward = i % 2 === 1;
    const pMesh = new THREE.Mesh(isBackward ? bwdParticleGeo : fwdParticleGeo, isBackward ? bwdParticleMat : fwdParticleMat);
    group.add(pMesh);

    pulseParticles.push({
      edgeIdx: i % edges.length,
      progress: isBackward ? 1.0 - (i / numParticles) : (i / numParticles),
      speed: 0.35 + (i % 3) * 0.08,
      isBackward,
      mesh: pMesh,
    });
  }

  // Loss Beacon Halo
  const lossNode = nodeMap.get('loss')!;
  const lossBeaconGeo = new THREE.RingGeometry(0.85, 0.98, 32);
  const lossBeaconMat = new THREE.MeshBasicMaterial({
    color: 0xff2d55,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  disposables.push(lossBeaconGeo, lossBeaconMat);
  const lossBeacon = new THREE.Mesh(lossBeaconGeo, lossBeaconMat);
  lossBeacon.position.copy(lossNode.pos);
  lossBeacon.rotation.x = Math.PI / 2;
  group.add(lossBeacon);

  // Selection Handler
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      nodeMeshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.55;
        m.scale.set(1, 1, 1);
      });
      edges.forEach((e) => {
        (e.line.material as THREE.LineBasicMaterial).opacity = e.defaultOpacity;
      });
      return;
    }

    nodeMeshes.forEach((m, idx) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      if (nodes[idx].id === item.id) {
        mat.emissiveIntensity = 1.4;
        m.scale.set(1.3, 1.3, 1.3);
      } else {
        mat.emissiveIntensity = 0.25;
        m.scale.set(0.9, 0.9, 0.9);
      }
    });

    edges.forEach((e) => {
      const isConnected = e.from === item.id || e.to === item.id;
      const mat = e.line.material as THREE.LineBasicMaterial;
      mat.opacity = isConnected ? 1.0 : 0.15;
    });
  };

  const scratchPos = new THREE.Vector3();

  const update = (time: number, delta: number) => {
    // Gentle hovering breath on computational graph
    group.rotation.y = Math.sin(time * 0.15) * 0.06;

    // Loss beacon pulse
    const beaconScale = 1.0 + Math.sin(time * 3.2) * 0.18;
    lossBeacon.scale.set(beaconScale, beaconScale, beaconScale);
    lossBeaconMat.opacity = 0.45 + Math.sin(time * 3.2) * 0.2;

    // Dual-direction pulse particle animation along edges
    for (let i = 0; i < pulseParticles.length; i++) {
      const p = pulseParticles[i];
      const edge = edges[p.edgeIdx];

      if (p.isBackward) {
        // Reverse flow: 1 -> 0
        p.progress -= delta * p.speed;
        if (p.progress <= 0) {
          p.progress = 1.0;
          p.edgeIdx = (p.edgeIdx + 1) % edges.length;
        }
      } else {
        // Forward flow: 0 -> 1
        p.progress += delta * p.speed;
        if (p.progress >= 1.0) {
          p.progress = 0;
          p.edgeIdx = (p.edgeIdx + 1) % edges.length;
        }
      }

      edge.curve.getPointAt(p.progress, scratchPos);
      p.mesh.position.copy(scratchPos);
    }
  };

  const toggleLayer = (layer: LayerType, visible: boolean) => {
    if (layer === 'geometry') {
      nodeMeshes.forEach((m) => { m.visible = visible; });
    } else if (layer === 'trajectories') {
      edges.forEach((e) => { e.line.visible = visible; });
      pulseParticles.forEach((p) => { p.mesh.visible = visible; });
      lossBeacon.visible = visible;
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    { id: 'tape-inputs', label: 'Inputs (W, X)', sublabel: 'Parameters & Activations', position: new THREE.Vector3(-6.2, 3.8, 0) },
    { id: 'tape-ops', label: 'Tape Operations (⊗, ⊕, σ)', sublabel: 'Topological Evaluation', position: new THREE.Vector3(1.2, 1.4, 0) },
    { id: 'tape-loss', label: 'Objective Loss L', sublabel: 'Adjoint Seed ∂L/∂L = 1.0', position: new THREE.Vector3(7.2, 1.4, 0) },
  ];

  const dispose = () => {
    disposables.forEach((d) => {
      try {
        d.dispose();
      } catch {}
    });
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0.5, 3.2, 13.5],
    defaultTarget: [0.5, -0.4, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
    toggleLayer,
    getAnnotations,
  };
}
