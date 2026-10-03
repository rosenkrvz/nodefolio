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
  const SPACING = 2.2;
  const X_OFFSET = -((NUM_TOKENS - 1) * SPACING) / 2;

  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [];

  // =========================================================================
  // 1. QUERY TOKENS LAYER (Top Plane, Y = 2.4) - 100% UNOBSTRUCTED
  // =========================================================================
  const qPositions: THREE.Vector3[] = [];
  const qMeshes: THREE.Mesh[] = [];
  const tokenBoxGeo = new THREE.BoxGeometry(0.85, 0.38, 0.85);
  disposables.push(tokenBoxGeo);

  const tokenLabels = [
    'Q₀: [BOS]',
    'Q₁: "Attention"',
    'Q₂: "Is"',
    'Q₃: "All"',
    'Q₄: "You"',
    'Q₅: "Need"',
  ];

  for (let i = 0; i < NUM_TOKENS; i++) {
    const x = X_OFFSET + i * SPACING;
    const pos = new THREE.Vector3(x, 2.4, 0);
    qPositions.push(pos);

    const qMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.25,
      metalness: 0.55,
      emissive: 0xbe123c,
      emissiveIntensity: 0.65,
    });
    disposables.push(qMat);

    const box = new THREE.Mesh(tokenBoxGeo, qMat);
    box.position.copy(pos);
    group.add(box);
    qMeshes.push(box);

    // Glowing Wireframe Outline
    const wireGeo = new THREE.WireframeGeometry(tokenBoxGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xff4d6d });
    disposables.push(wireGeo, wireMat);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(pos);
    group.add(wire);

    // Orbiting halo collar
    const collarGeo = new THREE.TorusGeometry(0.55, 0.02, 8, 32);
    const collarMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.75 });
    disposables.push(collarGeo, collarMat);
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.copy(pos);
    group.add(collar);

    // Register inspectable Query token
    inspectables.push({
      mesh: box,
      data: {
        id: `query-token-${i}`,
        name: `Query Token ${tokenLabels[i]}`,
        symbol: `Q_{${i}}`,
        type: 'QUERY PROJECTION',
        role: 'Attention Search Vector',
        dimension: 'Bilinear Dimension d_k = 64',
        properties: {
          'Token Index': `i = ${i}`,
          'Projection': 'Q_i = X_i W_Q',
          'Softmax Normalizer': 'Σ_j exp(Q_i · K_j / √d_k)',
          'Top Key Target': i === 1 ? 'K₁ (Self-Salience) & K₃' : `K_{${i}} (Diagonal Focus)`,
          'Memory State': 'Fast On-Chip SRAM Cache Line',
        },
        description: `Query projection vector Q_${i} driving multi-head attention routing. Clicking this token isolates its exact attention distribution over all Key vectors.`,
        worldPosition: pos.clone(),
      },
    });
  }

  // =========================================================================
  // 2. KEY / VALUE TOKENS LAYER (Bottom Plane, Y = -2.4) - 100% UNOBSTRUCTED
  // =========================================================================
  const kPositions: THREE.Vector3[] = [];
  const kMeshes: THREE.Mesh[] = [];

  for (let j = 0; j < NUM_TOKENS; j++) {
    const x = X_OFFSET + j * SPACING;
    const pos = new THREE.Vector3(x, -2.4, 0);
    kPositions.push(pos);

    const kMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.25,
      metalness: 0.55,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6,
    });
    disposables.push(kMat);

    const box = new THREE.Mesh(tokenBoxGeo, kMat);
    box.position.copy(pos);
    group.add(box);
    kMeshes.push(box);

    const wireGeo = new THREE.WireframeGeometry(tokenBoxGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x60a5fa });
    disposables.push(wireGeo, wireMat);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(pos);
    group.add(wire);

    // Orbiting halo collar
    const kCollarGeo = new THREE.TorusGeometry(0.55, 0.02, 8, 32);
    const kCollarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    disposables.push(kCollarGeo, kCollarMat);
    const kCollar = new THREE.Mesh(kCollarGeo, kCollarMat);
    kCollar.rotation.x = Math.PI / 2;
    kCollar.position.copy(pos);
    group.add(kCollar);

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

  // =========================================================================
  // 3. ATTENTION BEAMS BIPARTITE GRAPH MATRIX
  // =========================================================================
  const beams: AttentionBeam[] = [];
  const beamGroup = new THREE.Group();
  group.add(beamGroup);

  for (let q = 0; q < NUM_TOKENS; q++) {
    for (let k = 0; k < NUM_TOKENS; k++) {
      const dist = Math.abs(q - k);
      let weight = Math.exp(-dist * 0.92);
      if (k === 1 && q > 2) weight += 0.44; // Long-range syntactic dependency
      weight = Math.min(weight, 1.0);

      const qPos = qPositions[q];
      const kPos = kPositions[k];

      const curve = new THREE.LineCurve3(qPos, kPos);
      const points = curve.getPoints(quality === 'low' ? 6 : 12);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(lineGeo);

      const isHighAttention = weight > 0.42;
      const lineMat = new THREE.LineBasicMaterial({
        color: isHighAttention ? 0xf43f5e : 0x334155,
        transparent: true,
        opacity: Math.max(weight * 0.8, 0.08),
      });
      disposables.push(lineMat);

      const line = new THREE.Line(lineGeo, lineMat);
      beamGroup.add(line);

      beams.push({ qIdx: q, kIdx: k, weight, line, curve });
    }
  }

  // =========================================================================
  // 4. DYNAMIC ROUTING PULSE PARTICLES ALONG ACTIVE ATTENTION BEAMS
  // =========================================================================
  const activeBeams = beams.filter((b) => b.weight > 0.42);
  const pulseGeo = new THREE.SphereGeometry(0.09, 8, 8);
  disposables.push(pulseGeo);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c });
  disposables.push(pulseMat);

  const pulseCount = quality === 'low' ? Math.min(activeBeams.length, 6) : activeBeams.length * 2;
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

  // =========================================================================
  // 5. ETHEREAL WIREFRAME TILING GUIDES (100% TRANSPARENT - NO SOLID SLABS!)
  // =========================================================================
  const frameGeo = new THREE.BoxGeometry(NUM_TOKENS * SPACING + 1.2, 0.06, 1.8);
  disposables.push(frameGeo);
  const frameMat = new THREE.MeshBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.22,
    wireframe: true,
  });
  disposables.push(frameMat);

  const topFrame = new THREE.Mesh(frameGeo, frameMat);
  topFrame.position.set(0, 3.0, 0);
  group.add(topFrame);

  const botFrame = new THREE.Mesh(frameGeo, frameMat);
  botFrame.position.set(0, -3.0, 0);
  group.add(botFrame);

  // Register Memory Hierarchy guide as inspectable
  inspectables.push({
    mesh: topFrame,
    data: {
      id: 'attention-hierarchy',
      name: 'Multi-Head Attention Hierarchy',
      symbol: 'Attn(Q, K, V)',
      type: 'BIPARTITE ROUTING',
      role: 'Cross-Sequence Dynamic Routing',
      dimension: 'Sequence Length N = 6, Head Dim d = 64',
      properties: {
        'Attention Kernel': 'Softmax(Q K^T / √d_k) V',
        'Computational Complexity': 'O(N²) Standard / O(N) Tiled FlashAttention',
        'Query Head Count': 'H = 8 Parallel Heads',
        'KV Cache State': 'Active Cached Tokens',
      },
      description: 'Bipartite attention projection linking Query search vectors on the top plane to Key/Value contextual memories on the bottom plane via scaled dot-product attention routing.',
      worldPosition: topFrame.position.clone(),
    },
  });

  // =========================================================================
  // INTERACTION: TOKEN ISOLATION & HIGHLIGHTING
  // =========================================================================
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      // Restore all beams
      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        mat.color.setHex(b.weight > 0.42 ? 0xf43f5e : 0x334155);
        mat.opacity = Math.max(b.weight * 0.8, 0.08);
      });
      qMeshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.65;
        m.scale.set(1, 1, 1);
      });
      kMeshes.forEach((m) => {
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
          mat.emissiveIntensity = 1.35;
          m.scale.set(1.22, 1.22, 1.22);
        } else {
          mat.emissiveIntensity = 0.18;
          m.scale.set(0.9, 0.9, 0.9);
        }
      });

      // Isolate beams from this query
      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        if (b.qIdx === qSelected) {
          mat.color.setHex(0xf43f5e);
          mat.opacity = Math.max(b.weight * 1.0, 0.28);
        } else {
          mat.color.setHex(0x1e293b);
          mat.opacity = 0.02;
        }
      });
    } else if (item.id.startsWith('key-token-')) {
      const kSelected = parseInt(item.id.replace('key-token-', ''), 10);

      // Highlight selected key token
      kMeshes.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (idx === kSelected) {
          mat.emissiveIntensity = 1.35;
          m.scale.set(1.22, 1.22, 1.22);
        } else {
          mat.emissiveIntensity = 0.18;
          m.scale.set(0.9, 0.9, 0.9);
        }
      });

      // Isolate beams into this key
      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        if (b.kIdx === kSelected) {
          mat.color.setHex(0x38bdf8);
          mat.opacity = Math.max(b.weight * 1.0, 0.28);
        } else {
          mat.color.setHex(0x1e293b);
          mat.opacity = 0.02;
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
      topFrame.visible = visible;
      botFrame.visible = visible;
    } else if (layer === 'trajectories') {
      beamGroup.visible = visible;
      pulses.forEach((p) => { p.mesh.visible = visible; });
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    {
      id: 'query-1',
      label: 'Query Token Q₁',
      sublabel: 'Attention Search Vector',
      position: qMeshes[1]?.position.clone().add(new THREE.Vector3(0, 0.5, 0)) || new THREE.Vector3(-2.2, 2.9, 0),
    },
    {
      id: 'head-peak',
      label: 'Softmax Affinity Beam',
      sublabel: 'Dynamic Energy Routing',
      position: new THREE.Vector3(0, 0, 0),
    },
    {
      id: 'key-1',
      label: 'Key Token K₁',
      sublabel: 'Target Value Projection',
      position: kMeshes[1]?.position.clone().add(new THREE.Vector3(0, -0.5, 0)) || new THREE.Vector3(-2.2, -2.9, 0),
    },
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
