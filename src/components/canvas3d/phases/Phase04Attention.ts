import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem, LayerType, SpatialAnnotation } from '../types';

interface AttentionBeam {
  qIdx: number;
  kIdx: number;
  weight: number;
  line: THREE.Line;
  curve: THREE.CatmullRomCurve3;
}

export function createPhase04Attention(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-04-flash-attention';

  const disposables: { dispose: () => void }[] = [];

  const NUM_TOKENS = 6;
  const SPACING = 2.2;
  const X_OFFSET = -((NUM_TOKENS - 1) * SPACING) / 2;

  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [];

  // =========================================================================
  // 1. TOP TIER: HIGH BANDWIDTH MEMORY (HBM3e) GLOBAL STORAGE SLAB
  // =========================================================================
  const hbmGroup = new THREE.Group();
  group.add(hbmGroup);

  const slabWidth = NUM_TOKENS * SPACING + 2.4;
  const slabGeo = new THREE.BoxGeometry(slabWidth, 0.22, 3.2);
  disposables.push(slabGeo);

  const siliconMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.25,
    metalness: 0.85,
    emissive: 0x050811,
  });
  disposables.push(siliconMat);

  const topSlab = new THREE.Mesh(slabGeo, siliconMat);
  topSlab.position.set(0, 3.2, 0);
  hbmGroup.add(topSlab);

  // Silicon wafer edge chamfer / gold trace bus
  const waferBusMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
  });
  disposables.push(waferBusMat);

  const topBusPoints = [
    new THREE.Vector3(-slabWidth / 2, 3.32, -1.5),
    new THREE.Vector3(slabWidth / 2, 3.32, -1.5),
    new THREE.Vector3(slabWidth / 2, 3.32, 1.5),
    new THREE.Vector3(-slabWidth / 2, 3.32, 1.5),
    new THREE.Vector3(-slabWidth / 2, 3.32, -1.5),
  ];
  const topBusGeo = new THREE.BufferGeometry().setFromPoints(topBusPoints);
  disposables.push(topBusGeo);
  const topBusLine = new THREE.Line(topBusGeo, waferBusMat);
  hbmGroup.add(topBusLine);

  // Micro-circuit traces across the HBM bus
  const traceGeo = new THREE.BufferGeometry();
  const tracePoints: THREE.Vector3[] = [];
  for (let i = 0; i < NUM_TOKENS; i++) {
    const x = X_OFFSET + i * SPACING;
    tracePoints.push(new THREE.Vector3(x, 3.32, -1.3), new THREE.Vector3(x, 3.32, 1.3));
    tracePoints.push(new THREE.Vector3(x - 0.4, 3.32, 0), new THREE.Vector3(x + 0.4, 3.32, 0));
  }
  traceGeo.setFromPoints(tracePoints);
  disposables.push(traceGeo);
  const traceMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 });
  disposables.push(traceMat);
  const traceLines = new THREE.LineSegments(traceGeo, traceMat);
  hbmGroup.add(traceLines);

  inspectables.push({
    mesh: topSlab,
    data: {
      id: 'hbm-global-memory',
      name: 'HBM3e Global Memory Bus',
      symbol: 'HBM3e 96GB',
      type: 'MEMORY HIERARCHY',
      role: 'Sequence Parameter & Activation Storage',
      dimension: 'Bandwidth: 3.35 TB/s | Capacity: 96 GB',
      properties: {
        'Memory Architecture': 'High Bandwidth Memory 3e (Stacked Silicon)',
        'Standard Attention IO': 'O(N²) High-latency Global Memory Round-trips',
        'FlashAttention Optimization': 'Fused kernel eliminates intermediate N×N materialization',
        'Memory Footprint': 'Linear O(N) IO Traffic to Global SRAM',
      },
      description: 'Global GPU Device Memory holding full contextual tokens and model parameters. Standard self-attention incurs quadratic bottleneck here; FlashAttention streams blocks directly into fast On-Chip SRAM.',
      worldPosition: topSlab.position.clone(),
    },
  });

  // =========================================================================
  // 2. QUERY TOKENS LAYER: Q_i = X_i W_Q (Floating at Y = 2.4)
  // =========================================================================
  const qPositions: THREE.Vector3[] = [];
  const qMeshes: THREE.Mesh[] = [];
  const tokenBoxGeo = new THREE.BoxGeometry(0.88, 0.42, 0.88);
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
    const pos = new THREE.Vector3(x, 2.35, 0);
    qPositions.push(pos);

    const qMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x9f1239,
      emissiveIntensity: 0.65,
    });
    disposables.push(qMat);

    const qMesh = new THREE.Mesh(tokenBoxGeo, qMat);
    qMesh.position.copy(pos);
    group.add(qMesh);
    qMeshes.push(qMesh);

    // Luminous halo collar
    const collarGeo = new THREE.TorusGeometry(0.55, 0.022, 8, 32);
    const collarMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.8 });
    disposables.push(collarGeo, collarMat);
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.copy(pos);
    group.add(collar);

    inspectables.push({
      mesh: qMesh,
      data: {
        id: `query-token-${i}`,
        name: `Query Token ${tokenLabels[i]}`,
        symbol: `Q_{${i}}`,
        type: 'QUERY PROJECTION',
        role: 'Attention Search Probe',
        dimension: 'Bilinear Query Subspace d_k = 64',
        properties: {
          'Token Index': `i = ${i}`,
          'Subspace Mapping': 'Q_i = X_i W_Q',
          'Softmax Normalizer': 'Σ_j exp((Q_i · K_j) / √d_k)',
          'Top Key Target': i === 1 ? 'K₁ (Self-Salience) & K₃' : `K_{${i}} (Diagonal Focus)`,
          'SRAM Block': `Block Row B_r = 64`,
        },
        description: `Query representation Q_${i} driving multi-head attention routing. Interacting isolates its exact attention affinity distribution over the Key context matrix.`,
        worldPosition: pos.clone(),
      },
    });
  }

  // =========================================================================
  // 3. MIDDLE TIER: ON-CHIP SRAM TENSOR CORE DIE & ONLINE SOFTMAX TILING
  // =========================================================================
  const sramGroup = new THREE.Group();
  group.add(sramGroup);

  // Fast SRAM Cache boundary (frosted glowing plane)
  const sramPlatformGeo = new THREE.BoxGeometry(slabWidth - 0.6, 0.1, 2.4);
  disposables.push(sramPlatformGeo);
  const sramPlatformMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.15,
    metalness: 0.9,
    transparent: true,
    opacity: 0.65,
  });
  disposables.push(sramPlatformMat);
  const sramFloor = new THREE.Mesh(sramPlatformGeo, sramPlatformMat);
  sramFloor.position.set(0, 0, 0);
  sramGroup.add(sramFloor);

  // Bounding laser frame representing 192KB On-Chip SRAM boundary
  const sramWireGeo = new THREE.WireframeGeometry(sramPlatformGeo);
  const sramWireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
  disposables.push(sramWireGeo, sramWireMat);
  const sramWire = new THREE.LineSegments(sramWireGeo, sramWireMat);
  sramWire.position.set(0, 0, 0);
  sramGroup.add(sramWire);

  // Online Softmax Running Statistics Register ($m_i$, $l_i$)
  const regGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
  disposables.push(regGeo);
  const regMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x059669,
    emissiveIntensity: 0.6,
  });
  disposables.push(regMat);

  const onlineSoftmaxReg = new THREE.Mesh(regGeo, regMat);
  onlineSoftmaxReg.position.set(0, 0.12, 0);
  sramGroup.add(onlineSoftmaxReg);

  // Orbiting indicator ring around Online Softmax
  const statRingGeo = new THREE.TorusGeometry(0.55, 0.02, 12, 32);
  const statRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.85 });
  disposables.push(statRingGeo, statRingMat);
  const statRing = new THREE.Mesh(statRingGeo, statRingMat);
  statRing.rotation.x = Math.PI / 2;
  statRing.position.set(0, 0.12, 0);
  sramGroup.add(statRing);

  // Micro Tile Matrix Cells ($B_r \times B_c$ GEMM tiles)
  const TILE_ROWS = 4;
  const TILE_COLS = 6;
  const tileGeo = new THREE.PlaneGeometry(0.38, 0.28);
  disposables.push(tileGeo);
  const tileMeshes: THREE.Mesh[] = [];

  for (let r = 0; r < TILE_ROWS; r++) {
    for (let c = 0; c < TILE_COLS; c++) {
      const u = (c - (TILE_COLS - 1) / 2) * 0.58;
      const v = (r - (TILE_ROWS - 1) / 2) * 0.44;
      const tileMat = new THREE.MeshBasicMaterial({
        color: (r + c) % 2 === 0 ? 0x0284c7 : 0xe11d48,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      disposables.push(tileMat);
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(u, 0.06, v);
      sramGroup.add(tile);
      tileMeshes.push(tile);
    }
  }

  inspectables.push({
    mesh: onlineSoftmaxReg,
    data: {
      id: 'sram-online-softmax',
      name: 'On-Chip SRAM Online Softmax Register',
      symbol: 'm_i, l_i (192 KB SRAM)',
      type: 'KERNEL REGISTRY',
      role: 'Incremental Softmax Rescaling Engine',
      dimension: 'SRAM Cache: 192 KB | Rescaling IO: O(1)',
      properties: {
        'Running Max m_i': 'm_i = max(m_i^(old), max_j(S_{ij}))',
        'Running Sum l_i': 'l_i = exp(m_i^(old) - m_i) l_i^(old) + Σ exp(S_{ij} - m_i)',
        'Output Update': 'O_i = diag(l_i)^(-1) [diag(l_i^(old)) O_i^(old) + P_{ij} V_j]',
        'Bandwidth Gain': '4.2× Wall-clock Speedup over Standard Attention',
      },
      description: 'Core FlashAttention innovation: Online Softmax algorithm computes normalizers incrementally in SRAM without ever saving the massive N×N attention matrix to global GPU memory.',
      worldPosition: onlineSoftmaxReg.position.clone(),
    },
  });

  // =========================================================================
  // 4. BOTTOM TIER: KEY / VALUE PROJECTIONS & CACHE (Y = -2.4)
  // =========================================================================
  const kvGroup = new THREE.Group();
  group.add(kvGroup);

  const botSlab = new THREE.Mesh(slabGeo, siliconMat);
  botSlab.position.set(0, -3.2, 0);
  kvGroup.add(botSlab);

  const botBusPoints = [
    new THREE.Vector3(-slabWidth / 2, -3.08, -1.5),
    new THREE.Vector3(slabWidth / 2, -3.08, -1.5),
    new THREE.Vector3(slabWidth / 2, -3.08, 1.5),
    new THREE.Vector3(-slabWidth / 2, -3.08, 1.5),
    new THREE.Vector3(-slabWidth / 2, -3.08, -1.5),
  ];
  const botBusGeo = new THREE.BufferGeometry().setFromPoints(botBusPoints);
  disposables.push(botBusGeo);
  const botBusLine = new THREE.Line(botBusGeo, waferBusMat);
  kvGroup.add(botBusLine);

  const kPositions: THREE.Vector3[] = [];
  const kMeshes: THREE.Mesh[] = [];

  for (let j = 0; j < NUM_TOKENS; j++) {
    const x = X_OFFSET + j * SPACING;
    const pos = new THREE.Vector3(x, -2.35, 0);
    kPositions.push(pos);

    // Split dual-core block: Key (Left/Blue) and Value (Right/Emerald)
    const kMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.55,
    });
    disposables.push(kMat);

    const kMesh = new THREE.Mesh(tokenBoxGeo, kMat);
    kMesh.position.copy(pos);
    group.add(kMesh);
    kMeshes.push(kMesh);

    // KV Cache status indicator halo
    const kCollarGeo = new THREE.TorusGeometry(0.55, 0.022, 8, 32);
    const kCollarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    disposables.push(kCollarGeo, kCollarMat);
    const kCollar = new THREE.Mesh(kCollarGeo, kCollarMat);
    kCollar.rotation.x = Math.PI / 2;
    kCollar.position.copy(pos);
    group.add(kCollar);

    inspectables.push({
      mesh: kMesh,
      data: {
        id: `key-token-${j}`,
        name: `Key / Value Token K_{${j}}`,
        symbol: `[K_{${j}} | V_{${j}}]`,
        type: 'KEY / VALUE PROJECTION',
        role: 'Context Index & Value Carrier',
        dimension: 'KV-Cache Slot d_v = 64',
        properties: {
          'Slot Index': `j = ${j}`,
          'Key Projection': 'K_j = X_j W_K',
          'Value Projection': 'V_j = X_j W_V',
          'KV Cache Status': 'Cached in Fast SRAM Tile (Zero Recompute)',
          'Tiled Block': `Block Column B_c = 128`,
        },
        description: `Key representation K_${j} and Value embedding V_${j} loaded as a block tile into fast SRAM, preventing repetitive DRAM memory latency during generation.`,
        worldPosition: pos.clone(),
      },
    });
  }

  // =========================================================================
  // 5. ATTENTION AFFINITY BEAMS & ENERGY TRANSFER FLUX
  // =========================================================================
  const beams: AttentionBeam[] = [];
  const beamGroup = new THREE.Group();
  group.add(beamGroup);

  for (let q = 0; q < NUM_TOKENS; q++) {
    for (let k = 0; k < NUM_TOKENS; k++) {
      const dist = Math.abs(q - k);
      let weight = Math.exp(-dist * 0.95);
      if (k === 1 && q > 2) weight += 0.46; // Long-range salience attention head
      weight = Math.min(weight, 1.0);

      const qPos = qPositions[q];
      const kPos = kPositions[k];

      // Route smoothly through the SRAM intermediate plane
      const midX = (qPos.x + kPos.x) * 0.5;
      const midZ = Math.sin((q - k) * 0.4) * 0.45;
      const midPoint = new THREE.Vector3(midX, 0, midZ);

      const curve = new THREE.CatmullRomCurve3([qPos, midPoint, kPos]);
      const points = curve.getPoints(quality === 'low' ? 8 : 16);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(lineGeo);

      const isHigh = weight > 0.42;
      const lineMat = new THREE.LineBasicMaterial({
        color: isHigh ? 0xf43f5e : 0x1e293b,
        transparent: true,
        opacity: isHigh ? Math.max(weight * 0.85, 0.25) : 0.06,
      });
      disposables.push(lineMat);

      const line = new THREE.Line(lineGeo, lineMat);
      beamGroup.add(line);

      beams.push({ qIdx: q, kIdx: k, weight, line, curve });
    }
  }

  // =========================================================================
  // 6. FLASHATTENTION DATAFLOW PACKETS (IO BEAMS)
  // =========================================================================
  const activeBeams = beams.filter((b) => b.weight > 0.42);
  const pulseGeo = new THREE.SphereGeometry(0.085, 8, 8);
  disposables.push(pulseGeo);

  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
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
      speed: 0.35 + (i % 3) * 0.08,
      mesh: pMesh,
    });
  }

  // =========================================================================
  // INTERACTION & SELECTION
  // =========================================================================
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        mat.color.setHex(b.weight > 0.42 ? 0xf43f5e : 0x1e293b);
        mat.opacity = b.weight > 0.42 ? Math.max(b.weight * 0.85, 0.25) : 0.06;
      });
      qMeshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.65;
        m.scale.set(1, 1, 1);
      });
      kMeshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.55;
        m.scale.set(1, 1, 1);
      });
      return;
    }

    if (item.id.startsWith('query-token-')) {
      const qSelected = parseInt(item.id.replace('query-token-', ''), 10);

      qMeshes.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (idx === qSelected) {
          mat.emissiveIntensity = 1.4;
          m.scale.set(1.2, 1.2, 1.2);
        } else {
          mat.emissiveIntensity = 0.15;
          m.scale.set(0.9, 0.9, 0.9);
        }
      });

      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        if (b.qIdx === qSelected) {
          mat.color.setHex(0xf43f5e);
          mat.opacity = Math.max(b.weight * 1.0, 0.35);
        } else {
          mat.color.setHex(0x0f172a);
          mat.opacity = 0.02;
        }
      });
    } else if (item.id.startsWith('key-token-')) {
      const kSelected = parseInt(item.id.replace('key-token-', ''), 10);

      kMeshes.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (idx === kSelected) {
          mat.emissiveIntensity = 1.4;
          m.scale.set(1.2, 1.2, 1.2);
        } else {
          mat.emissiveIntensity = 0.15;
          m.scale.set(0.9, 0.9, 0.9);
        }
      });

      beams.forEach((b) => {
        const mat = b.line.material as THREE.LineBasicMaterial;
        if (b.kIdx === kSelected) {
          mat.color.setHex(0x38bdf8);
          mat.opacity = Math.max(b.weight * 1.0, 0.35);
        } else {
          mat.color.setHex(0x0f172a);
          mat.opacity = 0.02;
        }
      });
    }
  };

  // Pre-allocated scratch vector
  const scratchPos = new THREE.Vector3();

  // Animation loop
  const update = (time: number, delta: number) => {
    group.rotation.y = Math.sin(time * 0.22) * 0.12;

    // Subtle rotation of Online Softmax register ring
    statRing.rotation.z = time * 0.8;

    // Animate tile matrix activity
    tileMeshes.forEach((tm, idx) => {
      const mat = tm.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(time * 2.5 + idx * 0.3) * 0.15;
    });

    // Flow particles along attention routes
    pulses.forEach((p) => {
      p.t = (p.t + delta * p.speed) % 1.0;
      p.beam.curve.getPoint(p.t, scratchPos);
      p.mesh.position.copy(scratchPos);
      const s = 0.7 + Math.sin(p.t * Math.PI) * 0.55;
      p.mesh.scale.set(s, s, s);
    });
  };

  const toggleLayer = (layer: LayerType, visible: boolean) => {
    if (layer === 'geometry' || layer === 'clusters') {
      qMeshes.forEach((m) => { m.visible = visible; });
      kMeshes.forEach((m) => { m.visible = visible; });
      hbmGroup.visible = visible;
      kvGroup.visible = visible;
    } else if (layer === 'trajectories') {
      beamGroup.visible = visible;
      pulses.forEach((p) => { p.mesh.visible = visible; });
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    {
      id: 'query-1',
      label: 'Query Vector Q₁',
      sublabel: 'Attention Search Probe',
      position: qMeshes[1]?.position.clone().add(new THREE.Vector3(0, 0.5, 0)) || new THREE.Vector3(-2.2, 2.8, 0),
    },
    {
      id: 'online-softmax',
      label: 'Online Softmax Tiling',
      sublabel: 'SRAM 192KB (O(1) Memory)',
      position: new THREE.Vector3(0, 0.45, 0),
    },
    {
      id: 'key-1',
      label: 'Key / Value Slot K₁',
      sublabel: 'KV-Cache (Zero Recompute)',
      position: kMeshes[1]?.position.clone().add(new THREE.Vector3(0, -0.5, 0)) || new THREE.Vector3(-2.2, -2.8, 0),
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
