import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem, LayerType, SpatialAnnotation } from '../types';

export function createPhase03MetricSpaces(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-03-metric-spaces';

  const disposables: { dispose: () => void }[] = [];

  const RADIUS = 4.6;

  // =========================================================================
  // 1. Holographic Unit Hypersphere S² (Obsidian Glass with Fresnel Rim)
  // =========================================================================
  const sphereWidthSegs = quality === 'low' ? 32 : quality === 'medium' ? 48 : 64;
  const sphereHeightSegs = quality === 'low' ? 24 : quality === 'medium' ? 36 : 48;
  const sphereGeo = new THREE.SphereGeometry(RADIUS, sphereWidthSegs, sphereHeightSegs);
  disposables.push(sphereGeo);

  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x0a101d,
    roughness: 0.28,
    metalness: 0.45,
    transparent: true,
    opacity: 0.82,
    emissive: new THREE.Color(0x0f172a),
    emissiveIntensity: 0.45,
  });
  disposables.push(sphereMat);

  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphereMesh);

  // Subtle Wireframe Metric Lattice
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: quality === 'low' ? 0.06 : 0.09,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
  group.add(wireMesh);

  // =========================================================================
  // 2. Metric Grid Parallels (Latitudes) & Meridians (Longitudes)
  // =========================================================================
  const gridGroup = new THREE.Group();
  group.add(gridGroup);

  const gridLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
  });
  disposables.push(gridLineMat);

  const equatorMat = new THREE.LineBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.65,
  });
  disposables.push(equatorMat);

  const circleSteps = quality === 'low' ? 40 : 72;

  // Parallels (Latitudes: -60°, -30°, 0°, +30°, +60°)
  const latitudes = [-Math.PI / 3, -Math.PI / 6, 0, Math.PI / 6, Math.PI / 3];
  latitudes.forEach((lat, idx) => {
    const r = RADIUS * Math.cos(lat);
    const y = RADIUS * Math.sin(lat);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= circleSteps; i++) {
      const theta = (i / circleSteps) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    const cGeo = new THREE.BufferGeometry().setFromPoints(pts);
    disposables.push(cGeo);
    const isEq = idx === 2;
    const line = new THREE.Line(cGeo, isEq ? equatorMat : gridLineMat);
    gridGroup.add(line);
  });

  // Meridians (Great Circles every 45°)
  const meridianCount = 4;
  for (let m = 0; m < meridianCount; m++) {
    const phi = (m / meridianCount) * Math.PI;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= circleSteps; i++) {
      const theta = (i / circleSteps) * Math.PI * 2;
      // Circle on X-Y plane rotated around Y by phi
      const x = RADIUS * Math.cos(theta) * Math.cos(phi);
      const z = RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = RADIUS * Math.sin(theta);
      pts.push(new THREE.Vector3(x, y, z));
    }
    const mGeo = new THREE.BufferGeometry().setFromPoints(pts);
    disposables.push(mGeo);
    const mLine = new THREE.Line(mGeo, gridLineMat);
    gridGroup.add(mLine);
  }

  // Equatorial Celestial Ring with Orientation Ticks
  const ringGeo = new THREE.RingGeometry(RADIUS + 0.05, RADIUS + 0.18, circleSteps);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  disposables.push(ringGeo, ringMat);
  const eqRing = new THREE.Mesh(ringGeo, ringMat);
  eqRing.rotation.x = Math.PI / 2;
  gridGroup.add(eqRing);

  // =========================================================================
  // 3. Multi-Modal Semantic Representation Clusters
  // Vision (Cyan), Language (Purple), Audio (Amber), Multimodal Anchor (Rose)
  // =========================================================================
  const clusterDefinitions = [
    {
      id: 'cluster-multimodal',
      name: 'Joint Multimodal Anchor Cluster',
      symbol: 'z_{anchor}',
      color: 0xf43f5e,
      emissive: 0xe11d48,
      center: new THREE.Vector3(0.55, 0.45, 0.7).normalize().multiplyScalar(RADIUS),
      modality: 'Cross-Modal Latent Anchor',
      desc: 'Normalized contrastive anchor embedding z_i on unit hypersphere S².',
    },
    {
      id: 'cluster-vision',
      name: 'Vision Representation Manifold',
      symbol: 'z_{vision}',
      color: 0x06b6d4,
      emissive: 0x0891b2,
      center: new THREE.Vector3(-0.65, 0.5, 0.55).normalize().multiplyScalar(RADIUS),
      modality: 'Visual Transformer Patch Tokens',
      desc: 'Dense visual patch embeddings mapped under InfoNCE alignment.',
    },
    {
      id: 'cluster-language',
      name: 'Language Representation Subspace',
      symbol: 'z_{text}',
      color: 0xa855f7,
      emissive: 0x9333ea,
      center: new THREE.Vector3(0.2, -0.75, 0.6).normalize().multiplyScalar(RADIUS),
      modality: 'Causal Text Context Vectors',
      desc: 'Self-supervised linguistic embeddings spanning semantic sub-manifolds.',
    },
    {
      id: 'cluster-audio',
      name: 'Acoustic / Symbolic Attractor',
      symbol: 'z_{audio}',
      color: 0xf59e0b,
      emissive: 0xd97706,
      center: new THREE.Vector3(-0.45, -0.45, -0.75).normalize().multiplyScalar(RADIUS),
      modality: 'Spectral Latent Modality',
      desc: 'Harmonic spectrogram representations separated via uniform repulsive loss.',
    },
  ];

  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [];
  const centroidMeshes: THREE.Mesh[] = [];

  // Instanced Feature Embeddings across all clusters
  const ptsPerCluster = quality === 'low' ? 24 : quality === 'medium' ? 36 : 48;
  const totalPts = clusterDefinitions.length * ptsPerCluster;
  const dotGeo = new THREE.SphereGeometry(0.065, 8, 8);
  disposables.push(dotGeo);

  const dotMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
  });
  disposables.push(dotMat);

  const instancedEmbeddings = new THREE.InstancedMesh(dotGeo, dotMat, totalPts);
  const colorBuffer = new Float32Array(totalPts * 3);
  const dummyObj = new THREE.Object3D();

  let pIdx = 0;
  clusterDefinitions.forEach((cDef, cIdx) => {
    const cColor = new THREE.Color(cDef.color);

    // Centroid marker beacon
    const cGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const cMat = new THREE.MeshStandardMaterial({
      color: cDef.color,
      emissive: cDef.emissive,
      emissiveIntensity: 0.9,
      roughness: 0.25,
    });
    disposables.push(cGeo, cMat);
    const centroid = new THREE.Mesh(cGeo, cMat);
    centroid.position.copy(cDef.center.clone().multiplyScalar(1.015));
    group.add(centroid);
    centroidMeshes.push(centroid);

    // Centroid halo
    const haloGeo = new THREE.RingGeometry(0.32, 0.42, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: cDef.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    disposables.push(haloGeo, haloMat);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(cDef.center.clone().multiplyScalar(1.02));
    halo.lookAt(cDef.center.clone().multiplyScalar(2.0));
    group.add(halo);

    // Von Mises-Fisher distribution point cloud around centroid
    for (let p = 0; p < ptsPerCluster; p++) {
      const seed = p * 1.618 + cIdx * 5.24;
      const spread = 0.85;
      const ox = (Math.sin(seed) + Math.cos(seed * 2.3)) * 0.5 * spread;
      const oy = (Math.cos(seed * 1.4) + Math.sin(seed * 3.1)) * 0.5 * spread;
      const oz = (Math.sin(seed * 2.7) + Math.cos(seed * 0.9)) * 0.5 * spread;

      const pt = new THREE.Vector3(cDef.center.x + ox, cDef.center.y + oy, cDef.center.z + oz)
        .normalize()
        .multiplyScalar(RADIUS + 0.05);

      dummyObj.position.copy(pt);
      dummyObj.updateMatrix();
      instancedEmbeddings.setMatrixAt(pIdx, dummyObj.matrix);

      colorBuffer[pIdx * 3] = cColor.r;
      colorBuffer[pIdx * 3 + 1] = cColor.g;
      colorBuffer[pIdx * 3 + 2] = cColor.b;
      pIdx++;
    }

    // Register inspectable cluster
    inspectables.push({
      mesh: centroid,
      data: {
        id: cDef.id,
        name: cDef.name,
        symbol: cDef.symbol,
        type: 'HYPERSPHERICAL CLUSTER',
        role: cDef.modality,
        dimension: 'Dimension d = 512, ||z|| = 1.0',
        properties: {
          'Modality': cDef.modality,
          'Hyperspherical Coordinates': `[${cDef.center.x.toFixed(2)}, ${cDef.center.y.toFixed(2)}, ${cDef.center.z.toFixed(2)}]`,
          'Distribution Model': 'von Mises-Fisher vMF(μ, κ=14.2)',
          'Uniformity Metric': 'Uniform Negative Separation',
          'Status': 'Empirically Clustered',
        },
        description: cDef.desc,
        worldPosition: centroid.position.clone(),
      },
    });
  });

  instancedEmbeddings.instanceMatrix.needsUpdate = true;
  instancedEmbeddings.instanceColor = new THREE.InstancedBufferAttribute(colorBuffer, 3);
  group.add(instancedEmbeddings);
  disposables.push(instancedEmbeddings);

  // =========================================================================
  // 4. Contrastive Triplet Dynamics (Anchor z, Positive z⁺, Negatives {z⁻})
  // =========================================================================
  const anchorCenter = clusterDefinitions[0].center;
  const anchorPos = anchorCenter.clone().multiplyScalar(1.025);

  // Positive Sample in same cluster
  const positivePos = new THREE.Vector3(
    anchorCenter.x + 0.42,
    anchorCenter.y + 0.28,
    anchorCenter.z - 0.22
  ).normalize().multiplyScalar(RADIUS * 1.025);

  // Negative Samples in opposing clusters
  const negativePositions = [
    clusterDefinitions[1].center.clone().multiplyScalar(1.025),
    clusterDefinitions[2].center.clone().multiplyScalar(1.025),
    clusterDefinitions[3].center.clone().multiplyScalar(1.025),
  ];

  // Anchor Mesh: Glowing Dodecahedron with temperature ring
  const anchorGeo = new THREE.DodecahedronGeometry(0.28, 0);
  const anchorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xf43f5e,
    emissiveIntensity: 1.0,
    roughness: 0.15,
  });
  disposables.push(anchorGeo, anchorMat);
  const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
  anchorMesh.position.copy(anchorPos);
  group.add(anchorMesh);

  // Temperature τ horizon disk around anchor
  const tauRingGeo = new THREE.RingGeometry(0.55, 0.65, 32);
  const tauRingMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  disposables.push(tauRingGeo, tauRingMat);
  const tauRing = new THREE.Mesh(tauRingGeo, tauRingMat);
  tauRing.position.copy(anchorPos.clone().multiplyScalar(1.01));
  tauRing.lookAt(anchorPos.clone().multiplyScalar(2.0));
  group.add(tauRing);

  // Positive Sample Mesh (Emerald)
  const posGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const posMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  disposables.push(posGeo, posMat);
  const posMesh = new THREE.Mesh(posGeo, posMat);
  posMesh.position.copy(positivePos);
  group.add(posMesh);

  // Great-Circle Spherical Geodesic Generator on S²
  const createSphericalGeodesic = (p1: THREE.Vector3, p2: THREE.Vector3, color: number, opacity: number, radiusOffset: number = 0.08) => {
    const points: THREE.Vector3[] = [];
    const NUM_SEG = quality === 'low' ? 24 : 44;
    const v1 = p1.clone().normalize();
    const v2 = p2.clone().normalize();

    for (let i = 0; i <= NUM_SEG; i++) {
      const t = i / NUM_SEG;
      const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v1);
      const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v2);
      q1.slerp(q2, t);
      const v = new THREE.Vector3(1, 0, 0).applyQuaternion(q1).multiplyScalar(RADIUS + radiusOffset);
      points.push(v);
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    disposables.push(geo, mat);
    return new THREE.Line(geo, mat);
  };

  // Attractive Arc: Anchor <-> Positive (Alignment Loss L_align)
  const attractiveArc = createSphericalGeodesic(anchorPos, positivePos, 0x10b981, 0.95, 0.1);
  group.add(attractiveArc);

  // Repulsive Arcs: Anchor <-> Negatives (Uniformity Loss L_unif)
  const repulsiveArcs: THREE.Line[] = [];
  negativePositions.forEach((negPos) => {
    const arc = createSphericalGeodesic(anchorPos, negPos, 0xf43f5e, 0.42, 0.08);
    group.add(arc);
    repulsiveArcs.push(arc);
  });

  // Animated Pull Pulse on Alignment Arc
  const pulseGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
  disposables.push(pulseGeo, pulseMat);
  const alignPulse = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(alignPulse);

  // Register Inspectable Objects
  inspectables.push(
    {
      mesh: sphereMesh,
      data: {
        id: 'hypersphere-manifold',
        name: 'Hypersphere Embedding Metric S²',
        symbol: 'S² ⊂ ℝ³',
        type: 'METRIC SPACE',
        role: 'Normalized Unit Sphere',
        dimension: 'Metric: d(u, v) = arccos(u · v)',
        properties: {
          'Geometry': 'Unit Hypersphere ||z|| = 1.0',
          'Metric Space': 'Hyperspherical Riemannian Surface',
          'Contrastive Loss': 'InfoNCE Loss with Softmax Normalizer',
          'Temperature τ': '0.070 (Adaptive Scaling)',
          'Uniformity Loss': 'L_unif = log E[exp(-2||u - v||²)]',
          'Alignment Loss': 'L_align = E[||u - v⁺||²]',
        },
        description: 'Unit hypersphere representation space where contrastive learning optimizes two fundamental geometric properties: alignment of positive feature pairs and hyperspherical uniformity of negative distributions.',
        worldPosition: new THREE.Vector3(0, 0, 0),
      },
    },
    {
      mesh: anchorMesh,
      data: {
        id: 'contrastive-anchor',
        name: 'Contrastive Anchor Embedding z_i',
        symbol: 'z_i',
        type: 'CONTRASTIVE ANCHOR',
        role: 'Query Sample Vector',
        dimension: 'Normalized ||z_i|| = 1.0',
        properties: {
          'Temperature τ': '0.07 (Horizon Ring)',
          'Positive Pair': 'z_i⁺ (Attractive Force)',
          'Negative Repulsion': '3 Distributed Attractors',
          'InfoNCE Prob': 'p_i = exp(z_i · z_i⁺ / τ) / Σ_j exp(z_i · z_j / τ)',
        },
        description: 'Anchor representation vector driving contrastive optimization. Pulls positive augmentations closer along spherical geodesic paths while repelling dissimilar negative representations across the hypersphere.',
        worldPosition: anchorPos.clone(),
      },
    },
    {
      mesh: posMesh,
      data: {
        id: 'positive-embedding',
        name: 'Positive Augmented Pair z_i⁺',
        symbol: 'z_i⁺',
        type: 'POSITIVE REPRESENTATION',
        role: 'Attracted Semantic Counterpart',
        dimension: 'Cosine Similarity: sim(z_i, z_i⁺) = 0.94',
        properties: {
          'Alignment Metric': 'L_align = ||z_i - z_i⁺||²',
          'Geodesic Distance': 'θ = 0.28 rad (16.2°)',
          'Status': 'Converged into Anchor Basin',
        },
        description: 'Semantically identical positive counterpart created via data augmentation. Minimizing geodesic arc distance directly enforces representational invariance.',
        worldPosition: positivePos.clone(),
      },
    }
  );

  // Selection Handler
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      sphereMat.opacity = 0.82;
      anchorMat.emissiveIntensity = 1.0;
      posMat.emissiveIntensity = 0.9;
      repulsiveArcs.forEach((a) => { (a.material as THREE.LineBasicMaterial).opacity = 0.42; });
      return;
    }

    if (item.id === 'contrastive-anchor') {
      anchorMat.emissiveIntensity = 1.5;
      repulsiveArcs.forEach((a) => { (a.material as THREE.LineBasicMaterial).opacity = 0.85; });
    } else if (item.id === 'positive-embedding') {
      posMat.emissiveIntensity = 1.4;
    } else if (item.id.startsWith('cluster-')) {
      centroidMeshes.forEach((c) => {
        (c.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
      });
      const match = centroidMeshes.find((_, idx) => clusterDefinitions[idx].id === item.id);
      if (match) (match.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4;
    }
  };

  // Pre-allocated vectors for slerp pulse in update loop
  const qStart = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), anchorPos.clone().normalize());
  const qEnd = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), positivePos.clone().normalize());
  const qInterp = new THREE.Quaternion();
  const pulseVec = new THREE.Vector3(1, 0, 0);

  let pulseT = 0;
  const update = (time: number, delta: number) => {
    // Elegant slow orbital rotation of hypersphere
    group.rotation.y = time * 0.06;

    // Alignment pulse traveling between Anchor and Positive
    pulseT = (pulseT + delta * 0.45) % 1.0;
    qInterp.copy(qStart).slerp(qEnd, pulseT);
    pulseVec.set(1, 0, 0).applyQuaternion(qInterp).multiplyScalar(RADIUS + 0.1);
    alignPulse.position.copy(pulseVec);

    // Temperature ring breathing
    tauRingMat.opacity = 0.4 + Math.sin(time * 3.0) * 0.15;
  };

  const toggleLayer = (layer: LayerType, visible: boolean) => {
    if (layer === 'geometry') {
      sphereMesh.visible = visible;
      wireMesh.visible = visible;
      gridGroup.visible = visible;
    } else if (layer === 'clusters') {
      centroidMeshes.forEach((m) => { m.visible = visible; });
      instancedEmbeddings.visible = visible;
    } else if (layer === 'trajectories') {
      attractiveArc.visible = visible;
      repulsiveArcs.forEach((a) => { a.visible = visible; });
      alignPulse.visible = visible;
      anchorMesh.visible = visible;
      posMesh.visible = visible;
      tauRing.visible = visible;
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    { id: 'anchor-annot', label: 'Anchor z_i (τ = 0.07)', sublabel: 'Joint Multimodal Core', position: anchorPos.clone().multiplyScalar(1.08) },
    { id: 'align-annot', label: 'Alignment L_align', sublabel: 'Attractive Geodesic Pull', position: new THREE.Vector3().addVectors(anchorPos, positivePos).multiplyScalar(0.55) },
    { id: 'unif-annot', label: 'Uniformity L_unif', sublabel: 'Hyperspherical Dispersion', position: clusterDefinitions[1].center.clone().multiplyScalar(1.08) },
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
    defaultCameraPosition: [0, 2.5, 11.2],
    defaultTarget: [0, 0, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
    toggleLayer,
    getAnnotations,
  };
}
