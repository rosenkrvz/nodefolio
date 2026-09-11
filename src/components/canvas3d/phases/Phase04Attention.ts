import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem, LayerType, SpatialAnnotation } from '../types';

interface AttentionBeam {
  qIdx: number;
  kIdx: number;
  weight: number;
  line: THREE.Line;
  curve: THREE.LineCurve3;
}

export function createPhase04Attention(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-04-attention';

  const disposables: { dispose: () => void }[] = [];

  const NUM_TOKENS = 6;
  const SPACING = 2.1;
  const X_OFFSET = -((NUM_TOKENS - 1) * SPACING) / 2;

  // 1. Query Tokens Layer (Top Plane, Y = 2.4)
  const qPositions: THREE.Vector3[] = [];
  const qMeshes: THREE.Mesh[] = [];
  const tokenBoxGeo = new THREE.BoxGeometry(0.8, 0.35, 0.8);
  disposables.push(tokenBoxGeo);

  const qMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0xbe123c,
    emissiveIntensity: 0.6,
  });
  disposables.push(qMat);

  const tokenTokensLabels = [
    'Q₀: [BOS]',
    'Q₁: "Attention"',
    'Q₂: "Is"',
    'Q₃: "All"',
    'Q₄: "You"',
    'Q₅: "Need"',
  ];

  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [];

  for (let i = 0; i < NUM_TOKENS; i++) {
    const x = X_OFFSET + i * SPACING;
    const pos = new THREE.Vector3(x, 2.4, 0);
    qPositions.push(pos);

    const box = new THREE.Mesh(tokenBoxGeo, qMat.clone());
    disposables.push(box.material as THREE.Material);
    box.position.copy(pos);
    group.add(box);
    qMeshes.push(box);

    // Frame outline
    const wireGeo = new THREE.WireframeGeometry(tokenBoxGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xff4d6d });
    disposables.push(wireGeo, wireMat);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(pos);
    group.add(wire);

    // Register inspectable Query token
    inspectables.push({
      mesh: box,
      data: {
        id: `query-token-${i}`,
        name: `Query Token ${tokenTokensLabels[i]}`,
        symbol: `Q_{${i}}`,
        type: 'QUERY PROJECTION',
        role: 'Attention Search Vector',
        dimension: 'Bilinear Dimension d_k = 64',
        properties: {
          'Token Index': `i = ${i}`,
          'Projection': 'Q_i = X_i W_Q',
          'Softmax Normalizer': 'Σ_j exp(Q_i K_j^T / √d_k)',
          'Top Key Target': i === 1 ? 'K₁ (Self-Salience) & K₃' : `K_{${i}} (Diagonal Focus)`,
          'Memory Location': 'On-Chip SRAM Cache Line',
        },
        description: `Query projection vector Q_${i} driving multi-head attention routing. Clicking this token isolates its exact attention distribution over all Key vectors.`,
        worldPosition: pos.clone(),
      },
    });
  }

  // 2. Key / Value Tokens Layer (Bottom Plane, Y = -2.4)
  const kPositions: THREE.Vector3[] = [];
  const kMeshes: THREE.Mesh[] = [];
  const kMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.5,
  });
  disposables.push(kMat);

  for (let j = 0; j < NUM_TOKENS; j++) {
    const x = X_OFFSET + j * SPACING;
    const pos = new THREE.Vector3(x, -2.4, 0);
    kPositions.push(pos);

    const box = new THREE.Mesh(tokenBoxGeo, kMat.clone());
    disposables.push(box.material as THREE.Material);
    box.position.copy(pos);
    group.add(box);
    kMeshes.push(box);

    const wireGeo = new THREE.WireframeGeometry(tokenBoxGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x60a5fa });
    disposables.push(wireGeo, wireMat);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(pos);
    group.add(wire);

    // Register inspectable Key token
    inspectables.push({
      mesh: box,
      data: {
        id: `key-token-${j}`,
        name: `Key Token K_{${j}}`,
        symbol: `K_{${j}}`,
        type: 'KEY / VALUE PROJECTION',
        role: 'Context Index & Value Carrier',
        dimension: 'KV-Cache Slot d_v = 64',
        properties: {
          'Slot Index': `j = ${j}`,
          'Projection': 'K_j = X_j W_K',
          'KV Cache Status': 'Cached (Zero Recomputation)',
          'Memory Residence': 'Tiled Fast SRAM Block',
        },
        description: `Key representation K_${j} storing context embedding in the persistent KV-cache for autoregressive sequence decoding without global HBM round-trips.`,
        worldPosition: pos.clone(),
      },
    });
  }

  // 3. Attention Beams Matrix
  const beams: AttentionBeam[] = [];
  const beamGroup = new THREE.Group();
  group.add(beamGroup);

  const beamLineGeo = new THREE.BufferGeometry();
  disposables.push(beamLineGeo);

  for (let q = 0; q < NUM_TOKENS; q++) {
    for (let k = 0; k < NUM_TOKENS; k++) {
      const dist = Math.abs(q - k);
      let weight = Math.exp(-dist * 0.9);
      if (k === 1 && q > 2) weight += 0.42;
      weight = Math.min(weight, 1.0);

      const qPos = qPositions[q];
      const kPos = kPositions[k];

      const curve = new THREE.LineCurve3(qPos, kPos);
      const points = curve.getPoints(quality === 'low' ? 6 : 12);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(lineGeo);

      const isHighAttention = weight > 0.4;
      const lineMat = new THREE.LineBasicMaterial({
        color: isHighAttention ? 0xf43f5e : 0x334155,
        transparent: true,
        opacity: Math.max(weight * 0.75, 0.08),
      });
      disposables.push(lineMat);

      const line = new THREE.Line(lineGeo, lineMat);
      beamGroup.add(line);

      beams.push({ qIdx: q, kIdx: k, weight, line, curve });
    }
  }

  // 4. Dynamic routing pulse particles along active beams
  const activeBeams = beams.filter((b) => b.weight > 0.45);
  const pulseGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c });
  disposables.push(pulseGeo, pulseMat);

  const pulseCount = quality === 'low' ? Math.min(activeBeams.length, 6) : activeBeams.length;
  const pulses: { beam: AttentionBeam; t: number; speed: number; mesh: THREE.Mesh }[] = [];

  for (let i = 0; i < pulseCount; i++) {
    const beam = activeBeams[i % activeBeams.length];
    const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(pMesh);
    pulses.push({
      beam,
      t: (i / pulseCount) % 1.0,
      speed: 0.38 + (i % 3) * 0.08,
      mesh: pMesh,
    });
  }

  // 5. Tiled SRAM Cache Boundary
  const frameGeo = new THREE.BoxGeometry(NUM_TOKENS * SPACING + 1.2, 0.08, 2.0);
  const frameMat = new THREE.MeshBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.25,
    wireframe: true,
  });
  disposables.push(frameGeo, frameMat);

  const topSram = new THREE.Mesh(frameGeo, frameMat);
  topSram.position.set(0, 3.0, 0);
  group.add(topSram);

  const botSram = new THREE.Mesh(frameGeo, frameMat);
  botSram.position.set(0, -3.0, 0);
  group.add(botSram);

  // Register SRAM cache as inspectable
  inspectables.push({
    mesh: topSram,
    data: {
      id: 'sram-tiling',
      name: 'On-Chip SRAM Tiling Barrier',
      symbol: 'SRAM 192KB',
      type: 'MEMORY HIERARCHY',
      role: 'FlashAttention Tiling Domain',
      dimension: 'On-Chip Fast SRAM Cache',
      properties: {
        'Memory Bandwidth': '1.24 TB/s (Local SRAM)',
        'Global HBM Traffic': '4.2× IO Reduction via Online Softmax',
        'Materialized Matrix': 'O(1) Memory Overhead (Avoids N×N Matrix)',
        'Hardware Utilization': '92.4% Tensor Core Compute Efficiency',
      },
      description: 'Hardware memory boundary representing fused kernel execution on GPU on-chip SRAM. Computes online softmax incrementally in the outer tiled loop to prevent quadratic N x N activation storage in global memory.',
      worldPosition: topSram.position.clone(),
    },
  });

  // Interaction: Highlight beams originating from selected token
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      // Restore all beams
      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        mat.color.setHex(b.weight > 0.4 ? 0xf43f5e : 0x334155);
        mat.opacity = Math.max(b.weight * 0.75, 0.08);
      });
      qMeshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
        m.scale.set(1, 1, 1);
      });
      return;
    }

    if (item.id.startsWith('query-token-')) {
      const qSelected = parseInt(item.id.replace('query-token-', ''), 10);

      // Highlight selected query token
      qMeshes.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (idx === qSelected) {
          mat.emissiveIntensity = 1.2;
          m.scale.set(1.2, 1.2, 1.2);
        } else {
          mat.emissiveIntensity = 0.2;
          m.scale.set(0.9, 0.9, 0.9);
        }
      });

      // Isolate beams
      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        if (b.qIdx === qSelected) {
          mat.color.setHex(0xf43f5e);
          mat.opacity = Math.max(b.weight * 1.0, 0.25);
        } else {
          mat.color.setHex(0x1e293b);
          mat.opacity = 0.03;
        }
      });
    }
  };

  // Pre-allocated scratch vector for zero GC in update loop
  const scratchPulse = new THREE.Vector3();

  // Animation & Update loop
  const update = (time: number, delta: number) => {
    group.rotation.y = Math.sin(time * 0.24) * 0.14;

    // Pulse particles flowing between Query and Key tokens
    pulses.forEach((p) => {
      p.t = (p.t + delta * p.speed) % 1.0;
      p.beam.curve.getPoint(p.t, scratchPulse);
      p.mesh.position.copy(scratchPulse);
      const s = 0.8 + Math.sin(p.t * Math.PI) * 0.5;
      p.mesh.scale.set(s, s, s);
    });
  };

  const toggleLayer = (layer: LayerType, visible: boolean) => {
    if (layer === 'geometry' || layer === 'clusters') {
      qMeshes.forEach((m) => { m.visible = visible; });
      kMeshes.forEach((m) => { m.visible = visible; });
    } else if (layer === 'trajectories') {
      beams.forEach((b) => { b.line.visible = visible; });
      pulses.forEach((p) => { p.mesh.visible = visible; });
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    { id: 'query-1', label: 'Query Token q₁', sublabel: 'Context Embedding', position: qMeshes[0]?.position.clone().add(new THREE.Vector3(0, 0.45, 0)) || new THREE.Vector3(-4.5, 2.5, 0) },
    { id: 'key-1', label: 'Key Token k₁', sublabel: 'Target Value Projection', position: kMeshes[0]?.position.clone().add(new THREE.Vector3(0, -0.45, 0)) || new THREE.Vector3(-4.5, -2.5, 0) },
    { id: 'head-peak', label: 'Softmax Energy Beam', sublabel: 'Affinity weight = 0.88', position: new THREE.Vector3(0, 0, 0) },
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
    defaultCameraPosition: [0, 1.2, 13.5],
    defaultTarget: [0, 0, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
    toggleLayer,
    getAnnotations,
  };
}
